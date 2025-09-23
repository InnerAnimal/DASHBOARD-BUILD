// ===== STRIPE/SUPABASE INTEGRATION EXAMPLE =====
// This is an example of how to set up the backend API for payment processing

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// ===== TIER CONFIGURATION =====
const TIER_CONFIG = {
    supporter: {
        name: 'Supporter',
        minAmount: 1,
        maxAmount: 249,
        defaultAmount: 50,
        description: 'Every Dollar Matters'
    },
    champion: {
        name: 'Champion',
        minAmount: 250,
        maxAmount: 999,
        defaultAmount: 500,
        description: 'Powering Training Sessions'
    },
    hero: {
        name: 'Hero',
        minAmount: 1000,
        maxAmount: 2499,
        defaultAmount: 1500,
        description: 'Equipment Game-Changer'
    },
    legend: {
        name: 'Legend',
        minAmount: 2500,
        maxAmount: 4999,
        defaultAmount: 3500,
        description: 'Life-Changing Support'
    },
    visionary: {
        name: 'Visionary',
        minAmount: 5000,
        maxAmount: 9999,
        defaultAmount: 7500,
        description: 'Program Transformation'
    },
    founder: {
        name: 'Founder',
        minAmount: 10000,
        maxAmount: null,
        defaultAmount: 15000,
        description: 'Movement Builder'
    }
};

// ===== CREATE CHECKOUT SESSION =====
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { tier, amount, successUrl, cancelUrl } = req.body;
        
        // Validate tier
        if (!TIER_CONFIG[tier]) {
            return res.status(400).json({ error: 'Invalid tier specified' });
        }
        
        const tierConfig = TIER_CONFIG[tier];
        const donationAmount = amount || tierConfig.defaultAmount;
        
        // Validate amount
        if (donationAmount < tierConfig.minAmount) {
            return res.status(400).json({ 
                error: `Minimum amount for ${tierConfig.name} is $${tierConfig.minAmount}` 
            });
        }
        
        if (tierConfig.maxAmount && donationAmount > tierConfig.maxAmount) {
            return res.status(400).json({ 
                error: `Maximum amount for ${tierConfig.name} is $${tierConfig.maxAmount}` 
            });
        }
        
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${tierConfig.name} Impact Level`,
                            description: tierConfig.description,
                            images: [`${req.protocol}://${req.get('host')}/images/${tier}-tier.jpg`],
                        },
                        unit_amount: donationAmount * 100, // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl || `${req.protocol}://${req.get('host')}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${req.protocol}://${req.get('host')}/cancel`,
            metadata: {
                tier: tier,
                amount: donationAmount.toString(),
                timestamp: new Date().toISOString()
            },
            customer_email: req.body.email, // Optional: pre-fill email
            billing_address_collection: 'required',
            allow_promotion_codes: true,
        });
        
        // Log the donation attempt
        await logDonationAttempt({
            tier: tier,
            amount: donationAmount,
            sessionId: session.id,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        res.json({ sessionId: session.id, url: session.url });
        
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// ===== STRIPE WEBHOOK HANDLER =====
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleSuccessfulPayment(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handleFailedPayment(event.data.object);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// ===== PAYMENT HANDLERS =====
async function handleSuccessfulPayment(session) {
    try {
        const { tier, amount, timestamp } = session.metadata;
        
        // Record successful donation in Supabase
        const { data, error } = await supabase
            .from('donations')
            .insert([
                {
                    stripe_session_id: session.id,
                    tier: tier,
                    amount: parseFloat(amount),
                    currency: 'usd',
                    status: 'completed',
                    donor_email: session.customer_email,
                    donor_name: session.customer_details?.name,
                    created_at: new Date(timestamp).toISOString(),
                    completed_at: new Date().toISOString()
                }
            ]);
        
        if (error) {
            console.error('Error saving donation to Supabase:', error);
            throw error;
        }
        
        // Send confirmation email (optional)
        await sendDonationConfirmation(session);
        
        // Update analytics
        await updateDonationAnalytics(tier, parseFloat(amount));
        
        console.log(`Successful donation recorded: ${tier} - $${amount}`);
        
    } catch (error) {
        console.error('Error handling successful payment:', error);
    }
}

async function handleFailedPayment(paymentIntent) {
    try {
        // Log failed payment
        await supabase
            .from('donation_attempts')
            .insert([
                {
                    stripe_payment_intent_id: paymentIntent.id,
                    status: 'failed',
                    error_message: paymentIntent.last_payment_error?.message,
                    failed_at: new Date().toISOString()
                }
            ]);
        
        console.log(`Failed payment logged: ${paymentIntent.id}`);
        
    } catch (error) {
        console.error('Error handling failed payment:', error);
    }
}

// ===== HELPER FUNCTIONS =====
async function logDonationAttempt(data) {
    try {
        await supabase
            .from('donation_attempts')
            .insert([
                {
                    tier: data.tier,
                    amount: data.amount,
                    stripe_session_id: data.sessionId,
                    ip_address: data.ip,
                    user_agent: data.userAgent,
                    attempted_at: new Date().toISOString()
                }
            ]);
    } catch (error) {
        console.error('Error logging donation attempt:', error);
    }
}

async function sendDonationConfirmation(session) {
    // Implement email sending logic here
    // You can use services like SendGrid, Mailgun, or Supabase Edge Functions
    console.log(`Sending confirmation email to: ${session.customer_email}`);
}

async function updateDonationAnalytics(tier, amount) {
    try {
        // Update daily/monthly donation totals
        const today = new Date().toISOString().split('T')[0];
        
        await supabase
            .from('donation_analytics')
            .upsert([
                {
                    date: today,
                    tier: tier,
                    total_amount: amount,
                    donation_count: 1
                }
            ], {
                onConflict: 'date,tier',
                ignoreDuplicates: false
            });
        
    } catch (error) {
        console.error('Error updating analytics:', error);
    }
}

// ===== GET DONATION STATS =====
app.get('/api/donation-stats', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('donations')
            .select('tier, amount, created_at')
            .eq('status', 'completed')
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days
        
        if (error) {
            throw error;
        }
        
        // Calculate stats
        const stats = {
            totalDonations: data.length,
            totalAmount: data.reduce((sum, donation) => sum + donation.amount, 0),
            tierBreakdown: {},
            recentDonations: data.slice(-10)
        };
        
        // Group by tier
        data.forEach(donation => {
            if (!stats.tierBreakdown[donation.tier]) {
                stats.tierBreakdown[donation.tier] = {
                    count: 0,
                    total: 0
                };
            }
            stats.tierBreakdown[donation.tier].count++;
            stats.tierBreakdown[donation.tier].total += donation.amount;
        });
        
        res.json(stats);
        
    } catch (error) {
        console.error('Error fetching donation stats:', error);
        res.status(500).json({ error: 'Failed to fetch donation stats' });
    }
});

// ===== SUPABASE TABLE SCHEMAS =====
/*
-- donations table
CREATE TABLE donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_session_id TEXT UNIQUE NOT NULL,
    tier TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'pending',
    donor_email TEXT,
    donor_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- donation_attempts table
CREATE TABLE donation_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tier TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    ip_address INET,
    user_agent TEXT,
    status TEXT DEFAULT 'attempted',
    error_message TEXT,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    failed_at TIMESTAMP WITH TIME ZONE
);

-- donation_analytics table
CREATE TABLE donation_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    tier TEXT NOT NULL,
    total_amount DECIMAL(10,2) DEFAULT 0,
    donation_count INTEGER DEFAULT 0,
    UNIQUE(date, tier)
);

-- Create indexes for better performance
CREATE INDEX idx_donations_tier ON donations(tier);
CREATE INDEX idx_donations_created_at ON donations(created_at);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donation_attempts_tier ON donation_attempts(tier);
CREATE INDEX idx_donation_attempts_attempted_at ON donation_attempts(attempted_at);
*/

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;

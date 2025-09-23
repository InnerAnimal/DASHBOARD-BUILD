# 🚀 Meauxbility Payment System Setup Guide

## 📁 **Files Created:**
1. **`meauxbility-payment-config.js`** - Centralized configuration (UPDATE THIS)
2. **`meauxbility-payment-template.html`** - Template for new pages
3. **`MEAUXBILITY-DONATION-PAGE-HERO.html`** - Your main donation page

## 🔑 **Step 1: Update Your Keys**

### **Edit `meauxbility-payment-config.js`:**

```javascript
const MEAUXBILITY_PAYMENT_CONFIG = {
  // Stripe Configuration
  stripe: {
    publishableKey: 'pk_live_YOUR_ACTUAL_LIVE_PUBLISHABLE_KEY_HERE', // ← UPDATE THIS
  },
  
  // API Configuration
  api: {
    baseUrl: 'https://your-production-api-domain.com', // ← UPDATE THIS
    endpoints: {
      donations: '/donations',
      webhooks: '/webhooks/stripe'
    }
  },
  
  // App Configuration
  app: {
    name: 'Meauxbility',
    version: '1.0.0',
    environment: 'production' // or 'development' for testing
  }
};
```

## 🎯 **Step 2: Use in Any HTML File**

### **Method 1: Copy Template**
1. Copy `meauxbility-payment-template.html`
2. Rename to your page (e.g., `about.html`, `contact.html`)
3. Update the content
4. Done! Payment modal works automatically

### **Method 2: Add to Existing HTML**
Add these 3 lines to any HTML file:

```html
<!-- In <head> -->
<script src="https://js.stripe.com/v3/"></script>
<script src="meauxbility-payment-config.js"></script>

<!-- In <body> (anywhere) -->
<button onclick="openMeauxbilityPaymentModal()">Donate Now</button>

<!-- Before </body> -->
<div class="meaux-modal-backdrop" id="paymentModalBackdrop">
  <!-- Copy the entire modal HTML from the template -->
</div>
```

## 🔧 **Step 3: Customize for Different Pages**

### **Preset Donations:**
```html
<!-- DonMichael's Wheelchair Fundraiser -->
<button onclick="openMeauxbilityPaymentModal('donmichael')">Support DonMichael</button>

<!-- Sam's Car Fund -->
<button onclick="openMeauxbilityPaymentModal('samscar')">Support Sam's Car</button>

<!-- General Donation -->
<button onclick="openMeauxbilityPaymentModal()">Donate Now</button>
```

## 🎨 **Step 4: Customize Styling**

### **Add to your CSS:**
```css
/* Override button styles */
.my-custom-donate-btn {
  background: var(--meaux-gradient-primary);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.my-custom-donate-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--meaux-shadow-glow);
}
```

## 🔒 **Step 5: Security Checklist**

### **✅ What's Safe to Expose:**
- ✅ `pk_live_...` (Publishable key) - Goes in HTML
- ✅ API endpoint URL - Goes in HTML

### **❌ What's NEVER Exposed:**
- ❌ `sk_live_...` (Secret key) - Server only
- ❌ `whsec_...` (Webhook secret) - Server only
- ❌ Service role keys - Server only

## 🚀 **Step 6: Deploy**

### **Upload Files:**
1. Upload `meauxbility-payment-config.js` to your server
2. Update the keys in the config file
3. Include the script in any HTML page
4. Test with a $1 donation

### **For Shopify:**
1. Add `meauxbility-payment-config.js` to your theme assets
2. Include in `theme.liquid` or specific pages
3. Add buttons with `onclick="openMeauxbilityPaymentModal()"`

## 🧪 **Step 7: Testing**

### **Test Mode:**
```javascript
// In meauxbility-payment-config.js
stripe: {
  publishableKey: 'pk_test_YOUR_TEST_KEY', // Use test key
},
app: {
  environment: 'development' // Set to development
}
```

### **Live Mode:**
```javascript
// In meauxbility-payment-config.js
stripe: {
  publishableKey: 'pk_live_YOUR_LIVE_KEY', // Use live key
},
app: {
  environment: 'production' // Set to production
}
```

## 📞 **Support**

### **Common Issues:**
1. **"Stripe not loaded"** - Make sure `<script src="https://js.stripe.com/v3/"></script>` is included
2. **"Payment modal not found"** - Make sure modal HTML is included in the page
3. **"API connection failed"** - Check your API endpoint URL

### **Debug Mode:**
Open browser console to see detailed error messages and configuration validation.

## 🎯 **Quick Start Checklist:**

- [ ] Get your live Stripe publishable key
- [ ] Update `meauxbility-payment-config.js` with your keys
- [ ] Upload the config file to your server
- [ ] Test with a $1 donation
- [ ] Add buttons to your pages
- [ ] Deploy to production

**You're ready to collect donations!** 🎉

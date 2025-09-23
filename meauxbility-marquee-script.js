// ===== ENHANCED MARQUEE CAROUSEL WITH PAYMENT INTEGRATION =====

// Global variables
let isMarqueePaused = false;
let currentSpeed = 45; // seconds for full cycle
let stripe = null;

// Initialize Stripe
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Stripe with your publishable key
    stripe = Stripe('pk_test_your_stripe_publishable_key_here'); // Replace with your actual key
    
    initializeMarquee();
    setupEventListeners();
    duplicateCardsForSeamlessLoop();
    setupIntersectionObserver();
});

// ===== MARQUEE FUNCTIONALITY =====

function initializeMarquee() {
    const carousel = document.getElementById('floatingCarousel');
    if (!carousel) return;
    
    // Set initial animation duration
    carousel.style.animationDuration = currentSpeed + 's';
    
    // Add hover pause functionality
    carousel.addEventListener('mouseenter', pauseMarquee);
    carousel.addEventListener('mouseleave', resumeMarquee);
    
    // Add touch support for mobile
    setupTouchControls(carousel);
}

function setupEventListeners() {
    // Pause/Resume button
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', toggleMarquee);
    }
    
    // Speed control
    const speedSlider = document.getElementById('speedSlider');
    if (speedSlider) {
        speedSlider.addEventListener('input', function() {
            adjustSpeed(this.value);
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Card interactions
    setupCardInteractions();
}

function duplicateCardsForSeamlessLoop() {
    const carousel = document.getElementById('floatingCarousel');
    const cardSets = carousel.querySelectorAll('.meaux-card-set');
    
    if (cardSets.length >= 2) {
        // Clone the first set to the second set
        const firstSet = cardSets[0];
        const secondSet = cardSets[1];
        
        // Clear and clone
        secondSet.innerHTML = firstSet.innerHTML;
        
        // Update IDs to avoid conflicts
        const clonedCards = secondSet.querySelectorAll('[id]');
        clonedCards.forEach(card => {
            const originalId = card.id;
            card.id = originalId + '-clone';
            
            // Update aria-labelledby references
            const labelledBy = card.getAttribute('aria-labelledby');
            if (labelledBy) {
                card.setAttribute('aria-labelledby', labelledBy + '-clone');
            }
        });
    }
}

function setupTouchControls(carousel) {
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    
    carousel.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = false;
        pauseMarquee();
    });
    
    carousel.addEventListener('touchmove', function(e) {
        if (!startX || !startY) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = Math.abs(currentX - startX);
        const diffY = Math.abs(currentY - startY);
        
        // Determine if this is a horizontal swipe
        if (diffX > diffY && diffX > 10) {
            isDragging = true;
            e.preventDefault();
        }
    });
    
    carousel.addEventListener('touchend', function(e) {
        if (isDragging) {
            // Resume marquee after a short delay
            setTimeout(resumeMarquee, 1000);
        } else {
            resumeMarquee();
        }
        
        startX = 0;
        startY = 0;
        isDragging = false;
    });
}

function setupCardInteractions() {
    const cards = document.querySelectorAll('.meaux-impact-card');
    
    cards.forEach((card, index) => {
        // Enhanced hover effects
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '20';
            pauseMarquee();
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '';
            resumeMarquee();
        });
        
        // Click tracking
        card.addEventListener('click', function() {
            trackCardInteraction(this, 'click');
        });
        
        // Focus management
        card.addEventListener('focus', function() {
            pauseMarquee();
        });
        
        card.addEventListener('blur', function() {
            resumeMarquee();
        });
    });
}

function setupIntersectionObserver() {
    const cards = document.querySelectorAll('.meaux-impact-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const tierName = card.className.match(/meaux-(\w+)-card/)?.[1] || 'unknown';
                
                // Track card view
                trackCardInteraction(card, 'view');
                
                // Add subtle animation
                card.style.animation = 'cardFloatIn 0.6s ease-out';
            }
        });
    }, { 
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    });
    
    cards.forEach(card => observer.observe(card));
}

// ===== MARQUEE CONTROLS =====

function toggleMarquee() {
    const carousel = document.getElementById('floatingCarousel');
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (!carousel || !pauseBtn) return;
    
    isMarqueePaused = !isMarqueePaused;
    
    if (isMarqueePaused) {
        carousel.classList.add('paused');
        pauseBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
        `;
        pauseBtn.setAttribute('aria-label', 'Resume carousel');
    } else {
        carousel.classList.remove('paused');
        pauseBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
        `;
        pauseBtn.setAttribute('aria-label', 'Pause carousel');
    }
    
    trackUserInteraction('marquee_toggle', { paused: isMarqueePaused });
}

function pauseMarquee() {
    const carousel = document.getElementById('floatingCarousel');
    if (carousel && !isMarqueePaused) {
        carousel.classList.add('paused');
    }
}

function resumeMarquee() {
    const carousel = document.getElementById('floatingCarousel');
    if (carousel && !isMarqueePaused) {
        carousel.classList.remove('paused');
    }
}

function adjustSpeed(value) {
    currentSpeed = parseInt(value);
    const carousel = document.getElementById('floatingCarousel');
    
    if (carousel) {
        carousel.style.animationDuration = currentSpeed + 's';
        
        // Add speed class for additional styling
        carousel.classList.remove('slow', 'fast');
        if (currentSpeed > 60) {
            carousel.classList.add('slow');
        } else if (currentSpeed < 35) {
            carousel.classList.add('fast');
        }
    }
    
    trackUserInteraction('speed_adjust', { speed: currentSpeed });
}

// ===== KEYBOARD NAVIGATION =====

function handleKeyboardNavigation(e) {
    const cards = document.querySelectorAll('.meaux-impact-card');
    const focusedCard = document.activeElement;
    
    if (!focusedCard || !focusedCard.classList.contains('meaux-impact-card')) {
        return;
    }
    
    const currentIndex = Array.from(cards).indexOf(focusedCard);
    
    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            if (currentIndex > 0) {
                cards[currentIndex - 1].focus();
            }
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (currentIndex < cards.length - 1) {
                cards[currentIndex + 1].focus();
            }
            break;
        case 'Enter':
        case ' ':
            e.preventDefault();
            const button = focusedCard.querySelector('.meaux-cta-button');
            if (button) {
                button.click();
            }
            break;
        case 'Escape':
            e.preventDefault();
            closePaymentModal();
            break;
    }
}

// ===== PAYMENT MODAL INTEGRATION =====

async function openDonationModal(tier) {
    const modal = document.getElementById('paymentModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalTierInfo = document.getElementById('modalTierInfo');
    
    if (!modal || !modalTitle || !modalTierInfo) return;
    
    // Track donation initiation
    trackUserInteraction('donation_modal_open', { tier: tier });
    
    // Get tier information
    const tierInfo = getTierInfo(tier);
    
    // Update modal content
    modalTitle.textContent = `Complete Your ${tierInfo.name} Impact`;
    modalTierInfo.innerHTML = `
        <h4>${tierInfo.name} Level</h4>
        <p>${tierInfo.range} - ${tierInfo.impact}</p>
    `;
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Create Stripe checkout session
    try {
        const session = await createCheckoutSession(tier);
        if (session && session.id) {
            // Redirect to Stripe Checkout
            const result = await stripe.redirectToCheckout({ sessionId: session.id });
            
            if (result.error) {
                console.error('Stripe error:', result.error);
                showPaymentError(result.error.message);
            }
        }
    } catch (error) {
        console.error('Payment error:', error);
        showPaymentError('Unable to process payment. Please try again.');
    }
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        trackUserInteraction('donation_modal_close', {});
    }
}

async function createCheckoutSession(tier) {
    try {
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                tier: tier,
                successUrl: window.location.origin + '/success',
                cancelUrl: window.location.origin + '/cancel'
            }),
        });
        
        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw error;
    }
}

function showPaymentError(message) {
    const modalBody = document.querySelector('.meaux-modal-body');
    if (modalBody) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'meaux-error-message';
        errorDiv.style.cssText = `
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 16px;
            border-radius: 8px;
            margin-top: 16px;
            text-align: center;
        `;
        errorDiv.textContent = message;
        
        modalBody.appendChild(errorDiv);
        
        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// ===== TIER INFORMATION =====

function getTierInfo(tier) {
    const tierData = {
        supporter: {
            name: 'Supporter',
            range: '$1 – $249',
            impact: 'Every Dollar Matters',
            minAmount: 1
        },
        champion: {
            name: 'Champion',
            range: '$250 – $999',
            impact: 'Powering Training Sessions',
            minAmount: 250
        },
        hero: {
            name: 'Hero',
            range: '$1,000 – $2,499',
            impact: 'Equipment Game-Changer',
            minAmount: 1000
        },
        legend: {
            name: 'Legend',
            range: '$2,500 – $4,999',
            impact: 'Life-Changing Support',
            minAmount: 2500
        },
        visionary: {
            name: 'Visionary',
            range: '$5,000 – $9,999',
            impact: 'Program Transformation',
            minAmount: 5000
        },
        founder: {
            name: 'Founder',
            range: '$10,000+',
            impact: 'Movement Builder',
            minAmount: 10000
        }
    };
    
    return tierData[tier] || tierData.supporter;
}

// ===== ANALYTICS & TRACKING =====

function trackUserInteraction(action, data = {}) {
    // Google Analytics 4 tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            ...data,
            timestamp: Date.now(),
            page_location: window.location.href
        });
    }
    
    // Custom analytics (you can replace this with your preferred analytics)
    console.log('User Interaction:', action, data);
    
    // Send to your analytics endpoint
    if (window.analyticsEndpoint) {
        fetch(window.analyticsEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                data: data,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href
            })
        }).catch(error => {
            console.warn('Analytics tracking failed:', error);
        });
    }
}

function trackCardInteraction(card, interactionType) {
    const tierName = card.className.match(/meaux-(\w+)-card/)?.[1] || 'unknown';
    const tierInfo = getTierInfo(tierName);
    
    trackUserInteraction('card_interaction', {
        tier: tierName,
        interaction: interactionType,
        tier_value: tierInfo.minAmount,
        card_position: Array.from(card.parentNode.children).indexOf(card)
    });
}

// ===== PERFORMANCE MONITORING =====

function monitorPerformance() {
    if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark('marquee-carousel-loaded');
        
        // Measure animation performance
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'measure') {
                    console.log('Performance:', entry.name, entry.duration + 'ms');
                }
            }
        });
        
        observer.observe({ entryTypes: ['measure'] });
    }
}

// ===== ACCESSIBILITY ENHANCEMENTS =====

function enhanceAccessibility() {
    // Add ARIA labels to dynamic elements
    const carousel = document.getElementById('floatingCarousel');
    if (carousel) {
        carousel.setAttribute('aria-label', 'Impact level donation cards carousel');
        carousel.setAttribute('aria-live', 'polite');
    }
    
    // Announce marquee state changes
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    `;
    document.body.appendChild(announcer);
    
    // Store announcer for later use
    window.marqueeAnnouncer = announcer;
}

function announceMarqueeState(isPaused) {
    if (window.marqueeAnnouncer) {
        window.marqueeAnnouncer.textContent = isPaused ? 
            'Carousel paused. Use arrow keys to navigate or click resume to continue.' :
            'Carousel resumed. Cards are now moving automatically.';
    }
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeMarquee();
    setupEventListeners();
    duplicateCardsForSeamlessLoop();
    setupIntersectionObserver();
    monitorPerformance();
    enhanceAccessibility();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes cardFloatIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    console.log('Meauxbility Impact Levels Marquee initialized successfully!');
});

// ===== ERROR HANDLING =====

window.addEventListener('error', function(e) {
    console.error('Marquee Error:', e.error);
    trackUserInteraction('error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
    });
});

// ===== EXPORT FOR TESTING =====

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleMarquee,
        adjustSpeed,
        openDonationModal,
        closePaymentModal,
        getTierInfo,
        trackUserInteraction
    };
}

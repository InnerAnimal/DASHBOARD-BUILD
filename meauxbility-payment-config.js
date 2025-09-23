// =============== MEAUXBILITY PAYMENT CONFIGURATION =============== //
// Update these values when you get your live keys

const MEAUXBILITY_PAYMENT_CONFIG = {
  // Stripe Configuration
  stripe: {
    publishableKey: 'pk_live_51S4R0SRW56Pm3uYI8EKbysm1ok4peVXSD6G17HtFy8BDuG9Carn8Ry7iPVzulMBtdEFcz5pFvXpE04CIgn8PY6WS00aXOqMYEI', // Your live key
  },
  
  // API Configuration
  api: {
    baseUrl: 'https://shhh-ox7c.onrender.com', // Your live Render API URL
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

// =============== MEAUXBILITY PAYMENT CONTROLLER =============== //
class MeauxbilityPaymentController {
  constructor() {
    this.currentAmount = 500;
    this.frequency = 'one_time';
    this.fund = 'general';
    this.stripe = null;
    this.elements = null;
    this.cardElement = null;
    this.userId = this.generateUserId();
    this.init();
  }

  init() {
    this.initializeStripe();
    this.setupModalSystem();
    this.setupFormValidation();
  }

  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  async initializeStripe() {
    try {
      // Initialize Stripe with configured publishable key
      this.stripe = Stripe(MEAUXBILITY_PAYMENT_CONFIG.stripe.publishableKey);
      
      this.elements = this.stripe.elements();
      
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#ffffff',
            '::placeholder': {
              color: '#173E45',
            },
          },
          invalid: {
            color: '#e74c3c',
          },
        },
      });

      // Mount the card element if it exists
      const cardElementContainer = document.getElementById('card-element');
      if (cardElementContainer) {
        this.cardElement.mount('#card-element');

        this.cardElement.on('change', (event) => {
          const displayError = document.getElementById('cardError');
          if (displayError) {
            if (event.error) {
              displayError.textContent = event.error.message;
              displayError.classList.add('show');
            } else {
              displayError.classList.remove('show');
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      this.showError('Payment system initialization failed. Please refresh the page.');
    }
  }

  setupModalSystem() {
    const modal = document.getElementById('paymentModalBackdrop');
    if (!modal) return;
    
    // Close modal on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  setupFormValidation() {
    const inputs = document.querySelectorAll('.meaux-form-input[required]');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldId = field.id;
    const errorElement = document.getElementById(fieldId + 'Error');
    
    let isValid = true;
    let errorMessage = '';

    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = emailRegex.test(value);
      errorMessage = 'Valid email is required';
    } else if (field.required) {
      isValid = value.length > 0;
      errorMessage = fieldId === 'firstName' ? 'First name is required' : 
                    fieldId === 'lastName' ? 'Last name is required' : 
                    'This field is required';
    }

    if (!isValid) {
      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
      }
      field.style.borderColor = 'var(--meaux-error)';
    } else {
      if (errorElement) {
        errorElement.classList.remove('show');
      }
      field.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }

    return isValid;
  }

  openModal(preset = null) {
    const modal = document.getElementById('paymentModalBackdrop');
    if (!modal) {
      console.error('Payment modal not found. Make sure the modal HTML is included.');
      return;
    }
    
    // Handle presets
    if (preset === 'donmichael') {
      const designationSelect = document.getElementById('donationDesignation');
      if (designationSelect) {
        designationSelect.value = 'donmichael';
      }
      this.fund = 'donmichael';
      this.selectAmount(250);
    } else if (preset === 'equipment') {
      const designationSelect = document.getElementById('donationDesignation');
      if (designationSelect) {
        designationSelect.value = 'equipment';
      }
      this.fund = 'equipment';
      this.selectAmount(500);
    } else if (preset === 'samscar') {
      const designationSelect = document.getElementById('donationDesignation');
      if (designationSelect) {
        designationSelect.value = 'samscar';
      }
      this.fund = 'samscar';
      this.selectAmount(500);
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    const modal = document.getElementById('paymentModalBackdrop');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    this.resetForm();
  }

  setFrequency(type) {
    this.frequency = type;
    document.querySelectorAll('.meaux-frequency-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    if (event && event.target) {
      event.target.classList.add('active');
    }
  }

  selectAmount(amount) {
    this.currentAmount = amount;
    document.querySelectorAll('.meaux-amount-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    if (event && event.target) {
      event.target.classList.add('selected');
    }
    const customAmountInput = document.querySelector('.meaux-custom-amount');
    if (customAmountInput) {
      customAmountInput.value = '';
    }
  }

  selectCustomAmount(value) {
    if (value && value > 0) {
      this.currentAmount = parseFloat(value);
      document.querySelectorAll('.meaux-amount-btn').forEach(btn => {
        btn.classList.remove('selected');
      });
    }
  }

  async processDonation() {
    // Validate form
    const requiredFields = ['firstName', 'lastName', 'email'];
    const isValid = requiredFields.every(fieldId => {
      const field = document.getElementById(fieldId);
      return field ? this.validateField(field) : false;
    });

    if (!isValid) {
      this.showError('Please fill in all required fields.');
      return;
    }

    // Show loading state
    const submitBtn = document.querySelector('.meaux-donate-submit');
    const submitText = document.querySelector('.meaux-submit-text');
    const loading = document.getElementById('donationLoading');
    
    if (submitBtn) {
      submitBtn.disabled = true;
    }
    if (submitText) {
      submitText.style.display = 'none';
    }
    if (loading) {
      loading.classList.add('active');
    }

    try {
      // Create donation intent
      const donationData = {
        userId: this.userId,
        fund: this.fund,
        frequency: this.frequency,
        amount: this.currentAmount,
        currency: 'usd',
        coverFees: false,
        metadata: {
          firstName: document.getElementById('firstName')?.value || '',
          lastName: document.getElementById('lastName')?.value || '',
          email: document.getElementById('email')?.value || '',
          phone: document.getElementById('phone')?.value || ''
        }
      };

      // Create payment intent using configured API URL
      const apiUrl = MEAUXBILITY_PAYMENT_CONFIG.api.baseUrl + MEAUXBILITY_PAYMENT_CONFIG.api.endpoints.donations;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `don_${Date.now()}_${this.userId}`
        },
        body: JSON.stringify(donationData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error('No client secret received from server');
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: `${document.getElementById('firstName')?.value || ''} ${document.getElementById('lastName')?.value || ''}`.trim(),
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || ''
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        this.showSuccess();
      } else {
        throw new Error('Payment was not successful');
      }

    } catch (error) {
      console.error('Donation processing error:', error);
      this.showError(`Payment failed: ${error.message}`);
    } finally {
      // Reset loading state
      if (submitBtn) {
        submitBtn.disabled = false;
      }
      if (submitText) {
        submitText.style.display = 'block';
      }
      if (loading) {
        loading.classList.remove('active');
      }
    }
  }

  showSuccess() {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
      successMessage.classList.add('show');
      setTimeout(() => {
        this.closeModal();
      }, 3000);
    }
  }

  showError(message) {
    // Try to show error in modal first
    const errorElement = document.getElementById('cardError');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    } else {
      // Fallback to alert
      alert(message);
    }
  }

  resetForm() {
    document.querySelectorAll('.meaux-form-input').forEach(input => {
      input.value = '';
      input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    });
    
    document.querySelectorAll('.meaux-error').forEach(error => {
      error.classList.remove('show');
    });

    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
      successMessage.classList.remove('show');
    }
    
    this.currentAmount = 500;
    this.frequency = 'one_time';
    this.fund = 'general';
    
    // Reset UI
    document.querySelectorAll('.meaux-amount-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    const defaultAmountBtn = document.querySelector('.meaux-amount-btn:nth-child(5)');
    if (defaultAmountBtn) {
      defaultAmountBtn.classList.add('selected');
    }
    
    document.querySelectorAll('.meaux-frequency-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const defaultFreqBtn = document.querySelector('.meaux-frequency-btn:first-child');
    if (defaultFreqBtn) {
      defaultFreqBtn.classList.add('active');
    }

    // Clear Stripe elements
    if (this.cardElement) {
      this.cardElement.clear();
    }
  }
}

// =============== GLOBAL FUNCTIONS =============== //
// These functions can be called from HTML onclick handlers

function openMeauxbilityPaymentModal(preset = null) {
  if (window.meauxPaymentController) {
    window.meauxPaymentController.openModal(preset);
  } else {
    console.error('Meauxbility Payment Controller not initialized');
  }
}

function closeMeauxbilityPaymentModal() {
  if (window.meauxPaymentController) {
    window.meauxPaymentController.closeModal();
  }
}

function setMeauxbilityFrequency(type) {
  if (window.meauxPaymentController) {
    window.meauxPaymentController.setFrequency(type);
  }
}

function selectMeauxbilityAmount(amount) {
  if (window.meauxPaymentController) {
    window.meauxPaymentController.selectAmount(amount);
  }
}

function selectMeauxbilityCustomAmount(value) {
  if (window.meauxPaymentController) {
    window.meauxPaymentController.selectCustomAmount(value);
  }
}

function processMeauxbilityDonation() {
  if (window.meauxPaymentController) {
    window.meauxPaymentController.processDonation();
  }
}

// =============== INITIALIZATION =============== //
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if Stripe is loaded
  if (typeof Stripe === 'undefined') {
    console.error('Stripe.js not loaded. Please include: <script src="https://js.stripe.com/v3/"></script>');
    return;
  }

  // Initialize payment controller
  window.meauxPaymentController = new MeauxbilityPaymentController();
  console.log('Meauxbility Payment System initialized successfully');
});

// =============== CONFIGURATION VALIDATION =============== //
// Validate configuration on load
function validateMeauxbilityConfig() {
  const config = MEAUXBILITY_PAYMENT_CONFIG;
  
  if (!config.stripe.publishableKey || config.stripe.publishableKey.includes('YOUR_ACTUAL_LIVE_PUBLISHABLE_KEY_HERE')) {
    console.warn('⚠️ Meauxbility Payment: Please update your Stripe publishable key in meauxbility-payment-config.js');
  }
  
  if (!config.api.baseUrl || config.api.baseUrl.includes('your-production-api-domain.com')) {
    console.warn('⚠️ Meauxbility Payment: Please update your API base URL in meauxbility-payment-config.js');
  }
  
  if (config.stripe.publishableKey.startsWith('pk_live_') && config.app.environment === 'production') {
    console.log('✅ Meauxbility Payment: Live mode configured');
  } else if (config.stripe.publishableKey.startsWith('pk_test_')) {
    console.log('🧪 Meauxbility Payment: Test mode configured');
  }
}

// Run validation
validateMeauxbilityConfig();

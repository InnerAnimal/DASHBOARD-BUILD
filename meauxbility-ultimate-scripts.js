// MEAUXBILITY ULTIMATE DASHBOARD SCRIPTS
const ADMIN_PASSWORD = "Meauxbility";
const SESSION_TIMEOUT = 30;
let sessionTimer;
let lastScrollY = 0;
let currentSlide = 0;
const totalSlides = 5;

// Enhanced AI Tool Guides
const toolGuides = {
    cursor: {
        title: "Cursor AI Mastery Guide",
        content: `
            <div class="step-title"><span class="step-number">1</span>Launch Cursor & Press Cmd+L</div>
            <p>Open Cursor → Press <strong>Cmd+L</strong> (Mac) or <strong>Ctrl+L</strong> (Windows) to open AI chat</p>
            
            <div class="step-title"><span class="step-number">2</span>Use Meauxbility Brand Prompt</div>
            <div class="code-block">Create [type] for Meauxbility. Founded by SCI survivor Sam Primeaux in Lafayette, LA. 
Voice: "Authority over sympathy. Grit over guesswork. Access over obstacles." 
Contact: hey@meauxbility.com, Phone: 337-450-9998. 
Mission: "More Options. More Access. More Life."</div>
            
            <div class="step-title"><span class="step-number">3</span>Replace [type] with:</div>
            <p>• <strong>Email template</strong> - Thank you, welcome, application response<br>
            • <strong>Social media post</strong> - Instagram, Facebook, Twitter content<br>
            • <strong>Grant letter</strong> - Application responses and updates<br>
            • <strong>Website content</strong> - Page copy, blog posts<br>
            • <strong>Press release</strong> - Media announcements</p>
            
            <div class="step-title"><span class="step-number">4</span>Advanced Features</div>
            <p>• Use <strong>Cmd+K</strong> for file search<br>
            • Use <strong>Cmd+Shift+L</strong> for composer mode<br>
            • Type <strong>@</strong> to reference files<br>
            • Use <strong>Tab</strong> to accept suggestions</p>
        `
    },
    chatgpt: {
        title: "ChatGPT Content Mastery",
        content: `
            <div class="step-title"><span class="step-number">1</span>Access ChatGPT</div>
            <p>Go to <strong>chat.openai.com</strong> → Log in to your account</p>
            
            <div class="step-title"><span class="step-number">2</span>Set Meauxbility Context</div>
            <div class="code-block">You are writing for Meauxbility, a nonprofit founded by spinal cord injury survivor Sam Primeaux in Lafayette, LA. 
Our voice: "Authority over sympathy. Grit over guesswork. Access over obstacles." 
We empower SCI survivors through equipment grants ($500-15K), treatments, and community. 
Contact: hey@meauxbility.com, Phone: 337-450-9998. 
Always embody our mission: "More Options. More Access. More Life."</div>
            
            <div class="step-title"><span class="step-number">3</span>Content Types to Generate</div>
            <p>• <strong>Donor thank you emails</strong> - Personalized by donation amount<br>
            • <strong>Welcome email sequences</strong> - 5-part onboarding series<br>
            • <strong>Application responses</strong> - Approval, denial, more info needed<br>
            • <strong>Social media content</strong> - Posts, captions, hashtags<br>
            • <strong>Grant announcements</strong> - Success stories and updates</p>
            
            <div class="step-title"><span class="step-number">4</span>Quality Tips</div>
            <p>• Always include contact info: hey@meauxbility.com<br>
            • Use our tagline: "More Options. More Access. More Life."<br>
            • Maintain voice: Authority over sympathy<br>
            • Include specific impact details when possible</p>
        `
    },
    claude: {
        title: "Claude AI Analysis & Writing",
        content: `
            <div class="step-title"><span class="step-number">1</span>Access Claude</div>
            <p>Go to <strong>claude.ai</strong> → Log in to your account</p>
            
            <div class="step-title"><span class="step-number">2</span>Grant Application Analysis Prompt</div>
            <div class="code-block">Analyze this grant application for Meauxbility. We fund $500-15K for SCI survivors in the US for equipment, therapy, treatments. 
Criteria: medical documentation, financial need, active recovery pursuit. 
Our voice: "Authority over sympathy. Grit over guesswork." 
Founded by Sam Primeaux in Lafayette, LA. Contact: hey@meauxbility.com. 
Provide recommendation and suggested response email.</div>
            
            <div class="step-title"><span class="step-number">3</span>Paste Application & Get Analysis</div>
            <p>Copy the full application text → Paste after your prompt → Claude will provide:<br>
            • <strong>Recommendation</strong> - Approve, deny, or request more info<br>
            • <strong>Risk assessment</strong> - Financial and impact analysis<br>
            • <strong>Response email</strong> - Draft reply in Meauxbility voice<br>
            • <strong>Next steps</strong> - Follow-up actions needed</p>
            
            <div class="step-title"><span class="step-number">4</span>Other Use Cases</div>
            <p>• <strong>Content review</strong> - Analyze AI-generated emails<br>
            • <strong>Strategic planning</strong> - Campaign and program analysis<br>
            • <strong>Data interpretation</strong> - Performance metrics insights<br>
            • <strong>Compliance checking</strong> - Nonprofit regulations</p>
        `
    },
    canva: {
        title: "Canva Pro Graphics Creation",
        content: `
            <div class="step-title"><span class="step-number">1</span>Access Canva Pro</div>
            <p>Go to <strong>canva.com</strong> → Log in to your Pro account</p>
            
            <div class="step-title"><span class="step-number">2</span>Use Meauxbility Brand Colors</div>
            <div class="code-block">Primary Orange: #FF7619
Primary Teal: #1F97A9
Deep Background: #051b1e
Teal Steel: #1a4a52
Success Green: #21c48c
Always include: "More Options. More Access. More Life."
Contact: hey@meauxbility.com</div>
            
            <div class="step-title"><span class="step-number">3</span>Content to Create</div>
            <p>• <strong>Social media posts</strong> - Instagram, Facebook, Twitter<br>
            • <strong>Donation graphics</strong> - Campaign progress, thank you images<br>
            • <strong>Athlete spotlights</strong> - DonMichael campaign visuals<br>
            • <strong>Thank you images</strong> - Donor appreciation graphics<br>
            • <strong>Event flyers</strong> - Fundraising events and meetings<br>
            • <strong>Email headers</strong> - Newsletter and campaign graphics</p>
            
            <div class="step-title"><span class="step-number">4</span>Brand Guidelines</div>
            <p>• Use Inter font family<br>
            • Keep designs clean and accessible<br>
            • Include wheelchair/adaptive sports imagery when relevant<br>
            • Always maintain professional, empowering tone<br>
            • Include QR codes linking to meauxbility.org when appropriate</p>
        `
    },
    meshy: {
        title: "Meshy 3D Asset Generation",
        content: `
            <div class="step-title"><span class="step-number">1</span>Access Meshy</div>
            <p>Go to <strong>meshy.ai</strong> → Log in to your account</p>
            
            <div class="step-title"><span class="step-number">2</span>Create with Meauxbility Brand Prompt</div>
            <div class="code-block">Modern wheelchair in teal (#1F97A9) and orange (#FF7619) colors, adaptive sports equipment, rehabilitation tools. 
Style: professional, inspiring, accessible design. 
Clean, minimalist aesthetic for nonprofit use. 
Suitable for website headers, presentations, social media.</div>
            
            <div class="step-title"><span class="step-number">3</span>Asset Types to Generate</div>
            <p>• <strong>Wheelchairs</strong> - Sports chairs, everyday mobility<br>
            • <strong>Adaptive equipment</strong> - FES bikes, standing frames<br>
            • <strong>Rehabilitation tools</strong> - Therapy equipment<br>
            • <strong>Logo elements</strong> - 3D versions of Meauxbility branding<br>
            • <strong>Presentation graphics</strong> - 3D charts, infographics</p>
            
            <div class="step-title"><span class="step-number">4</span>Download & Usage</div>
            <p>• Download as <strong>.glb</strong> for web use<br>
            • Use in presentations, website headers<br>
            • Social media posts and campaigns<br>
            • Always maintain brand color consistency<br>
            • Test on mobile devices for performance</p>
        `
    }
};

// Authentication System
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('meaux-authenticated') === 'true';
    if (isAuthenticated) {
        showDashboard();
        startSessionTimer();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('dashboard').classList.remove('active');
}

function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.add('active');
    loadDashboardData();
    initializeScrollHandler();
    initDebugAgent();
    initPerformanceMonitor();
}

function startSessionTimer() {
    clearTimeout(sessionTimer);
    sessionTimer = setTimeout(() => {
        logout();
    }, SESSION_TIMEOUT * 60 * 1000);
}

function logout() {
    sessionStorage.removeItem('meaux-authenticated');
    showLogin();
    document.getElementById('password').value = '';
}

// Navigation System
function showSection(sectionId) {
    document.querySelectorAll('#meaux-dashboard .page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    document.querySelectorAll('#meaux-dashboard .nav-item').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
    
    const titles = {
        'overview': 'Meauxbility Overview',
        'automation': 'AI Automation Manager',
        'tools': 'AI Tools Mastery Center',
        'donations': 'Donations Management',
        'applications': 'Grant Applications',
        'volunteers': 'Volunteer Management',
        'emails': 'Email Automation',
        'integrations': 'Complete Integration Hub',
        'tasks': 'Volunteer Task Board',
        'performance': 'Performance Dashboard'
    };
    
    const headerTitle = document.getElementById('headerTitle');
    if (headerTitle) {
        headerTitle.textContent = titles[sectionId] || 'Dashboard';
    }
    
    const headerSubtitle = document.getElementById('headerSubtitle');
    if (headerSubtitle) {
        const subtitles = {
            'overview': 'Ultimate nonprofit automation hub',
            'automation': 'AI content generation and approval workflow',
            'tools': 'Master your AI tools for maximum efficiency',
            'donations': 'Track and manage all donation activity',
            'applications': 'Review and process grant applications',
            'volunteers': 'Coordinate volunteer activities and tasks',
            'emails': 'Monitor email automation performance',
            'integrations': 'Manage all API connections and settings',
            'tasks': 'Assign and track volunteer tasks',
            'performance': 'Real-time KPI monitoring and optimization'
        };
        headerSubtitle.textContent = subtitles[sectionId] || 'Nonprofit automation dashboard';
    }
}

// Sidebar Management
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// Theme System
function setTheme(theme) {
    const dashboard = document.getElementById('meaux-dashboard');
    const darkBtn = document.getElementById('darkBtn');
    const lightBtn = document.getElementById('lightBtn');
    const focusBtn = document.getElementById('focusBtn');
    
    // Reset all theme buttons
    [darkBtn, lightBtn, focusBtn].forEach(btn => btn.classList.remove('active'));
    
    if (theme === 'light') {
        dashboard.setAttribute('data-theme', 'light');
        lightBtn.classList.add('active');
    } else if (theme === 'focus') {
        dashboard.setAttribute('data-theme', 'focus');
        focusBtn.classList.add('active');
    } else {
        dashboard.removeAttribute('data-theme');
        darkBtn.classList.add('active');
    }
    
    localStorage.setItem('meaux-theme', theme);
    console.log(`Theme switched to: ${theme}`);
}

// Auto-hide Header
function initializeScrollHandler() {
    const header = document.getElementById('dashboardHeader');
    if (header) {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                header.classList.add('hidden');
            } else {
                header.classList.remove('hidden');
            }
            
            lastScrollY = currentScrollY;
        });
    }
}

// AI Tool Guides
function showToolGuide(tool) {
    const guide = toolGuides[tool];
    if (guide) {
        document.getElementById('toolGuideTitle').textContent = guide.title;
        document.getElementById('toolGuideContent').innerHTML = guide.content;
        document.getElementById('toolGuideModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Enhanced Carousel
function slideCarousel(direction) {
    const carousel = document.getElementById('toolsCarousel');
    const cardWidth = window.innerWidth <= 768 ? 240 : 280;
    
    currentSlide += direction;
    if (currentSlide < 0) currentSlide = totalSlides - 1;
    if (currentSlide >= totalSlides) currentSlide = 0;
    
    carousel.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
    updateCarouselDots();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    const carousel = document.getElementById('toolsCarousel');
    const cardWidth = window.innerWidth <= 768 ? 240 : 280;
    
    carousel.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
    updateCarouselDots();
}

function updateCarouselDots() {
    document.querySelectorAll('.dot').forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// AI Content Management
function approveAI(aiId) {
    const item = document.querySelector(`[onclick*="${aiId}"]`)?.closest('.ai-item');
    if (item) {
        item.style.background = 'rgba(33,196,140,.2)';
        const actions = item.querySelector('.ai-actions');
        if (actions) {
            actions.innerHTML = '<span style="color:var(--success);font-weight:600;">✓ Approved & Sent</span>';
        }
        
        // Update badge counts
        updateBadgeCount('automationBadge', -1);
        
        console.log(`AI content ${aiId} approved and sent`);
    }
}

function editAI(aiId) {
    const content = prompt('Edit AI content (this would open a full editor in production):');
    if (content) {
        console.log(`AI content ${aiId} edited:`, content);
        alert('AI content updated! In production, this would save to your AUTOMEAUXXX pipeline.');
    }
}

function regenerateAI(aiId) {
    const item = document.querySelector(`[onclick*="${aiId}"]`)?.closest('.ai-item');
    if (item) {
        const previewElement = item.querySelector('.ai-preview');
        if (previewElement) {
            previewElement.textContent = 'Regenerating content...';
            
            setTimeout(() => {
                previewElement.textContent = 'New AI-generated content would appear here with improved messaging and tone.';
            }, 2000);
        }
    }
    console.log(`Regenerating AI content for ${aiId}`);
}

function bulkApprove() {
    const pendingItems = document.querySelectorAll('.ai-item:not(.approved)');
    pendingItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.background = 'rgba(33,196,140,.2)';
            const actions = item.querySelector('.ai-actions');
            if (actions) {
                actions.innerHTML = '<span style="color:var(--success);font-weight:600;">✓ Bulk Approved</span>';
            }
        }, index * 200);
    });
    
    updateBadgeCount('automationBadge', -pendingItems.length);
    console.log(`Bulk approved ${pendingItems.length} AI content items`);
}

function generateNew() {
    alert('Generate New AI Content: This would connect to OpenAI to create new personalized emails based on recent donations, applications, or subscriber activity. Contact: hey@meauxbility.com for setup.');
}

// Volunteer Task Management
function claimTask(taskId) {
    const taskItem = document.querySelector(`[onclick*="${taskId}"]`);
    if (taskItem) {
        taskItem.classList.add('assigned');
        taskItem.style.background = 'rgba(245,158,11,0.1)';
        taskItem.style.borderColor = 'var(--warning)';
        
        const meta = taskItem.querySelector('.task-meta');
        if (meta) {
            meta.textContent = 'Assigned to: You • Just now';
        }
        
        updateBadgeCount('tasksBadge', -1);
        console.log(`Task ${taskId} claimed by current user`);
    }
}

function createTask() {
    const taskTitle = prompt('Task title:');
    const taskDesc = prompt('Task description:');
    
    if (taskTitle && taskDesc) {
        console.log('New task created:', { title: taskTitle, description: taskDesc });
        alert('Task created! In production, this would be added to the volunteer task board.');
        updateBadgeCount('tasksBadge', 1);
    }
}

// Integration Management
async function testConnection(service) {
    const statusElement = document.getElementById(service + 'Status');
    if (!statusElement) return;
    
    statusElement.textContent = 'Testing...';
    statusElement.className = 'status-badge warning';
    
    // Simulate API test with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    statusElement.textContent = 'Connected';
    statusElement.className = 'status-badge connected';
    
    console.log(`${service} connection test completed successfully`);
}

// Setup Functions
function setupPayPal() {
    alert('PayPal Setup:\n1. Go to developer.paypal.com\n2. Create new app\n3. Copy Client ID and Secret\n4. Configure webhook endpoints\n5. Test with small transaction\n\nContact: hey@meauxbility.com for assistance');
}

function setupOpenAI() {
    alert('OpenAI Setup:\n1. Go to platform.openai.com\n2. Create API key\n3. Set monthly limit to $20\n4. Configure for Meauxbility voice\n5. Test content generation\n\nContact: hey@meauxbility.com for assistance');
}

function setupGmail() {
    alert('Gmail API Setup:\n1. Go to console.cloud.google.com\n2. Enable Gmail API\n3. Create OAuth 2.0 credentials\n4. Generate refresh token for hey@meauxbility.com\n5. Test email sending\n\nContact: hey@meauxbility.com for assistance');
}

function setupAnalytics() {
    alert('Google Analytics Setup:\n1. Go to analytics.google.com\n2. Create property for meauxbility.org\n3. Copy tracking ID\n4. Install tracking code\n5. Set up conversion goals\n\nContact: hey@meauxbility.com for assistance');
}

function setupNewsletter() {
    alert('Newsletter Setup:\n1. Choose Mailchimp or ConvertKit\n2. Create account\n3. Get API key\n4. Set up automation sequences\n5. Import existing contacts\n\nContact: hey@meauxbility.com for assistance');
}

function setupSocial() {
    alert('Social Media API Setup:\n1. Meta Business Suite - Create app\n2. Twitter Developer Portal - Get API tokens\n3. Instagram Business API access\n4. Configure auto-posting\n5. Test with sample posts\n\nContact: hey@meauxbility.com for assistance');
}

function setupNotifications() {
    alert('Team Notifications Setup:\n1. Create Slack workspace or Discord server\n2. Generate webhook URLs\n3. Test with sample notification\n4. Connect to dashboard events\n5. Configure alert preferences\n\nContact: hey@meauxbility.com for assistance');
}

function setupMeetings() {
    alert('Meeting Integration Setup:\n1. Zoom Marketplace - Create app\n2. Google Calendar API access\n3. Configure meeting templates\n4. Set up automatic scheduling\n5. Test booking flow\n\nContact: hey@meauxbility.com for assistance');
}

// Data Loading and Animation
async function loadDashboardData() {
    // Animate stat values
    animateValue(document.getElementById('totalDonations'), 0, 35280, 2000);
    animateValue(document.getElementById('aiTasks'), 0, 156, 1800);
    animateValue(document.getElementById('costSavings'), 0, 2340, 2500);
    animateValue(document.getElementById('timeSaved'), 0, 89, 1800);
    animateValue(document.getElementById('aiGenerated'), 0, 156, 2000);
    animateValue(document.getElementById('successRate'), 0, 95, 1500);
    animateValue(document.getElementById('donationsTotal'), 0, 35280, 2000);
    animateValue(document.getElementById('donMichaelProgress'), 0, 7500, 2000);
    animateValue(document.getElementById('donMichaelProgress2'), 0, 7500, 2000);
    animateValue(document.getElementById('apiCosts'), 0, 23, 1000);
    
    // Load donations table
    setTimeout(() => {
        const table = document.getElementById('donationsTable');
        if (table) {
            table.innerHTML = `
                <tr>
                    <td>John Smith</td>
                    <td>$50</td>
                    <td>General Fund</td>
                    <td>Jan 15</td>
                    <td><span class="status-badge success">Completed</span></td>
                    <td><button class="mbx-btn mbx-btn-sm mbx-btn-secondary">View</button></td>
                </tr>
                <tr>
                    <td>Sarah Johnson</td>
                    <td>$100</td>
                    <td>DonMichael</td>
                    <td>Jan 14</td>
                    <td><span class="status-badge success">Completed</span></td>
                    <td><button class="mbx-btn mbx-btn-sm mbx-btn-secondary">View</button></td>
                </tr>
                <tr>
                    <td>Mike Wilson</td>
                    <td>$25</td>
                    <td>Monthly</td>
                    <td>Jan 13</td>
                    <td><span class="status-badge success">Completed</span></td>
                    <td><button class="mbx-btn mbx-btn-sm mbx-btn-secondary">View</button></td>
                </tr>
            `;
        }
    }, 1000);
}

function animateValue(element, start, end, duration) {
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        
        if (element.id.includes('Donation') || element.id.includes('Savings') || element.id.includes('Progress')) {
            element.textContent = '$' + Math.floor(current).toLocaleString();
        } else if (element.id.includes('Rate')) {
            element.textContent = Math.floor(current) + '%';
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Utility Functions
function updateBadgeCount(badgeId, change) {
    const badge = document.getElementById(badgeId);
    if (badge) {
        const currentCount = parseInt(badge.textContent) || 0;
        const newCount = Math.max(0, currentCount + change);
        badge.textContent = newCount.toString();
    }
}

function updateSetting(settingName, value) {
    console.log(`Setting ${settingName} updated to:`, value);
    // In production, this would save to Supabase
}

function exportDonations() {
    alert('Export Donations: This would generate a CSV file with all donation data. Contact: hey@meauxbility.com for implementation.');
}

function downloadAllGuides() {
    alert('Download All Guides: This would create a PDF with all AI tool guides. Contact: hey@meauxbility.com for implementation.');
}

// Debug Agent
let debugAgent = { issues: [], isActive: false };

function initDebugAgent() {
    setInterval(runDiagnostics, 15000);
    window.addEventListener('error', e => 
        showDebugAgent([{
            type: 'error', 
            message: e.message, 
            fix: 'Refresh page or contact hey@meauxbility.com'
        }])
    );
}

function runDiagnostics() {
    const issues = [];
    
    if (window.innerWidth < 320) {
        issues.push({
            type: 'warning',
            message: 'Screen too small for optimal experience',
            fix: 'Use larger device or rotate to landscape'
        });
    }
    
    if (performance.memory && performance.memory.usedJSHeapSize > 50 * 1024 * 1024) {
        issues.push({
            type: 'warning',
            message: 'High memory usage detected',
            fix: 'Refresh page to clear memory'
        });
    }
    
    updateDebugAgent(issues);
}

function updateDebugAgent(issues) {
    if (issues.length === 0 && debugAgent.isActive) {
        hideDebugAgent();
        return;
    }
    
    if (issues.length > 0) {
        showDebugAgent(issues);
    }
}

function showDebugAgent(issues) {
    const agent = document.getElementById('meaux-debug-agent');
    const messages = document.getElementById('debugMessages');
    
    if (!agent || !messages) return;
    
    debugAgent.isActive = true;
    messages.innerHTML = '';
    
    issues.forEach(issue => {
        const item = document.createElement('div');
        item.className = `meaux-debug-item ${issue.type}`;
        item.innerHTML = `<strong>${issue.type.toUpperCase()}:</strong> ${issue.message}<br><em>Fix: ${issue.fix}</em>`;
        messages.appendChild(item);
    });
    
    agent.classList.add('active');
}

function hideDebugAgent() {
    const agent = document.getElementById('meaux-debug-agent');
    if (agent) {
        agent.classList.remove('active');
        debugAgent.isActive = false;
    }
}

function closeDebugAgent() {
    hideDebugAgent();
}

// Performance Monitor
function initPerformanceMonitor() {
    setInterval(updatePerformanceMetrics, 5000);
}

function updatePerformanceMetrics() {
    const cpuUsage = Math.random() * 40 + 10; // 10-50%
    const memoryUsage = Math.random() * 30 + 20; // 20-50%
    
    const cpuElement = document.getElementById('cpuUsage');
    const memoryElement = document.getElementById('memoryUsage');
    
    if (cpuElement) {
        cpuElement.style.width = `${cpuUsage}%`;
        cpuElement.parentElement.nextElementSibling.textContent = `${Math.round(cpuUsage)}%`;
    }
    
    if (memoryElement) {
        memoryElement.style.width = `${memoryUsage}%`;
        memoryElement.parentElement.nextElementSibling.textContent = `${Math.round(memoryUsage)}%`;
    }
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Load saved theme
    const savedTheme = localStorage.getItem('meaux-theme') || 'dark';
    setTheme(savedTheme);
    
    // Initialize authentication
    checkAuth();
    
    // Set up navigation
    document.querySelectorAll('#meaux-dashboard .nav-item').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const sectionId = this.getAttribute('data-section');
            if (sectionId) {
                showSection(sectionId);
            }
            
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
            
            return false;
        }, true);
    });
    
    // Set up sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
        });
    }
    
    // Set up sidebar overlay
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeSidebar();
        });
    }
    
    // Set up modal system
    document.getElementById('toolGuideModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal('toolGuideModal');
        }
    });
    
    // Set up keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('toolGuideModal');
        }
    });
    
    // Set up session management
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
        document.addEventListener(event, startSessionTimer, true);
    });
    
    // Set up responsive handling
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });
    
    // Auto-advance carousel
    setInterval(() => {
        slideCarousel(1);
    }, 8000);
    
    // Login form handler
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('meaux-authenticated', 'true');
            showDashboard();
            startSessionTimer();
            errorDiv.style.display = 'none';
        } else {
            errorDiv.style.display = 'block';
            document.getElementById('password').value = '';
        }
    });
    
    console.log('🚀 Meauxbility Ultimate Dashboard Ready! hey@meauxbility.com | 337-450-9998');
});

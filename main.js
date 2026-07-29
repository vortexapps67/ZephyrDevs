document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme accent color immediately
  applyThemeAccent(localStorage.getItem('zephyr_accent') || 'amber');

  // 1. Initialize Particles Background
  initCanvasBackground();

  // 2. Floating Top Pill-Nav Sliding Indicator
  initTopPillNav();

  // 3. Scroll Reveal Observer
  initScrollReveal();

  // 4. Budget Planner Slide Indicator
  initBudgetSlider();

  // 5. Contact Form Submission & Genie Success modal (with custom Formspree URL)
  initContactForm();

  // 6. FAQ Accordion Collapse/Expand
  initFAQAccordion();

  // 7. Interactive AI Sandbox Terminal Toggles
  initAISandbox();

  // 8. Custom Devreon Interactive Features
  initDevreonBackdrop();

  // 9. Initialize Firebase Proxy & Control Center
  initFirebaseProxy();

  // 10. Bottom Tech Stack Announcement Ticker
  initTechTicker();

  // 11. Interactive Mock Chatbot
  initChatbot();

  // 12. Theme Switcher (Light/Dark Toggle)
  initThemeToggle();

  // 13. Live Website Preview Modal
  initLivePreviewModal();

  // 14. Email Privacy Protection (Obfuscation)
  initEmailObfuscation();
});

/* =========================================================================
   1. Interactive Live Canvas Background & GPU Spotlight Glow
   ========================================================================= */
function initCanvasBackground() {
  const canvas = document.getElementById('background-canvas');
  if (!canvas) return;

  // Disable canvas animation loop on mobile for maximum scroll optimization
  if (window.innerWidth < 768) {
    canvas.style.display = 'none';
    const glow = document.getElementById('flashlight-glow');
    if (glow) glow.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let particles = [];
  let ripples = [];
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  function resolveColor(colorStr) {
    if (!colorStr) return '#ffffff';
    if (colorStr.startsWith('var(')) {
      const varName = colorStr.match(/var\(([^)]+)\)/)[1];
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#ffffff';
    }
    return colorStr;
  }

  // Lean, ultra-optimized particle layers for 60+ FPS performance
  const layers = [
    { count: 6, sizeRange: [4, 6], speedRange: [0.05, 0.1], opacity: 0.25, blur: true, colors: ['#a3e635'] },
    { count: 12, sizeRange: [2, 3], speedRange: [0.1, 0.2], opacity: 0.5, blur: false, colors: ['#ffffff', '#a3e635'] }
  ];

  const mouse = { x: null, y: null, radius: 160 };

  class Particle {
    constructor(layerConfig) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      
      const speed = Math.random() * (layerConfig.speedRange[1] - layerConfig.speedRange[0]) + layerConfig.speedRange[0];
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      
      this.baseRadius = Math.random() * (layerConfig.sizeRange[1] - layerConfig.sizeRange[0]) + layerConfig.sizeRange[0];
      this.radius = this.baseRadius;
      this.opacity = layerConfig.opacity;
      this.blur = layerConfig.blur;
      this.colors = layerConfig.colors;
      this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    update() {
      // Bounce off boundaries
      if (this.x < 0 || this.x > width) this.vx = -this.vx;
      if (this.y < 0 || this.y > height) this.vy = -this.vy;

      this.x += this.vx;
      this.y += this.vy;

      // Mouse proximity interaction (O(N) - single pass)
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.sin(angle) * force * 1.2;
          this.y -= Math.cos(angle) * force * 1.2;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = resolveColor(this.color);
      ctx.fill();
    }
  }

  class Ripple {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.currentRadius = 0;
      this.maxRadius = 200;
      this.speed = 5;
      this.opacity = 0.5;
    }

    update() {
      this.currentRadius += this.speed;
      this.opacity = 1 - (this.currentRadius / this.maxRadius);
    }

    draw() {
      if (this.opacity <= 0) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(163, 230, 53, ' + (this.opacity * 0.4) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function setup() {
    particles = [];
    ripples = [];
    layers.forEach(layerConfig => {
      for (let i = 0; i < layerConfig.count; i++) {
        particles.push(new Particle(layerConfig));
      }
    });
  }

  let isScrolling = false;
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    isScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => { isScrolling = false; }, 150);
  }, { passive: true });

  function animate() {
    // Skip heavy particle canvas re-draws during rapid touch/wheel scrolling for 60fps smooth scrolling
    if (!isScrolling) {
      ctx.clearRect(0, 0, width, height);

      // Mouse-to-particle constellation lines (O(N) linear time complexity)
      if (mouse.x !== null && mouse.y !== null) {
        ctx.strokeStyle = 'rgba(163, 230, 53, 0.2)';
        ctx.lineWidth = 0.8;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          if (Math.hypot(dx, dy) < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // Update and draw ripples
      ripples = ripples.filter(r => r.currentRadius < r.maxRadius);
      ripples.forEach(r => {
        r.update();
        r.draw();
      });

      // Update and draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });
    }

    requestAnimationFrame(animate);
  }

  // Mouse move tracks coordinates & spotlight transform (compositor GPU accelerated)
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    if (glow) {
      glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate3d(-50%, -50%, 0)`;
    }
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Spawn ripple on click
  window.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.nav-pill')) return;
    ripples.push(new Ripple(e.clientX, e.clientY));
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      mouse.x = touchX;
      mouse.y = touchY;
      if (glow) {
        glow.style.transform = `translate3d(${touchX}px, ${touchY}px, 0) translate3d(-50%, -50%, 0)`;
      }
    }
  });

  window.addEventListener('touchend', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Resize throttle
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      setup();
    }, 200);
  });

  setup();
  animate();
}

/* =========================================================================
   2. Floating Top Pill-Nav Sliding Indicator & Drawer Menu
   ========================================================================= */
function initTopPillNav() {
  const navContainer = document.querySelector('.nav-links-container');
  const indicator = document.querySelector('.nav-indicator');
  const navLinks = document.querySelectorAll('.nav-link-item');
  const burger = document.getElementById('nav-burger-btn');
  const drawer = document.getElementById('mobile-drawer-menu');
  const drawerLinks = document.querySelectorAll('.mobile-nav-link');

  if (!navContainer || !indicator) return;

  // Function to move active bubble position
  function updateIndicator(activeLink) {
    indicator.style.width = `${activeLink.offsetWidth}px`;
    indicator.style.transform = `translateX(${activeLink.offsetLeft}px)`;
  }

  // Set initial position matching active page route
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  let activeFound = false;

  navLinks.forEach((link) => {
    const page = link.getAttribute('onclick').match(/'([^']+)'/)[1];
    if (currentPath === page) {
      link.classList.add('active');
      updateIndicator(link);
      activeFound = true;
    } else {
      link.classList.remove('active');
    }
  });

  drawerLinks.forEach((link) => {
    const page = link.getAttribute('onclick').match(/'([^']+)'/)[1];
    if (currentPath === page) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Default to home link if page is not matches
  if (!activeFound && navLinks.length > 0) {
    navLinks[0].classList.add('active');
    updateIndicator(navLinks[0]);
  }

  // Recalculate indicators on resize
  window.addEventListener('resize', () => {
    const activeLink = navContainer.querySelector('.nav-link-item.active');
    if (activeLink) {
      updateIndicator(activeLink);
    }
  });

  // Mobile Hamburger Toggle
  if (burger && drawer) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      drawer.classList.toggle('open');
    });
  }
}

/* =========================================================================
   3. Scroll Reveal Transition Observer
   ========================================================================= */
function initScrollReveal() {
  // Scroll reveal animations disabled per user request
  document.querySelectorAll('.reveal, .bento-reveal, .nav-pill-wrapper').forEach((element) => {
    element.classList.add('active');
  });
}

/* =========================================================================
   4. Budget Range Slider Indicator (INR)
   ========================================================================= */
function initBudgetSlider() {
  const planCards = document.querySelectorAll('.plan-selector-card');
  const addonCards = document.querySelectorAll('.addon-card');
  const totalValueEl = document.getElementById('estimated-total-value');
  if (planCards.length === 0) return;

  const basePrices = {
    starter: 1999,
    pro: 2999,
    enterprise: 4999
  };

  function calculateTotal() {
    let total = 0;
    const activePlan = document.querySelector('.plan-selector-card.active');
    if (activePlan) {
      const planVal = activePlan.dataset.plan;
      total += basePrices[planVal] || 1999;
    }

    addonCards.forEach(card => {
      const checkbox = card.querySelector('.addon-checkbox');
      if (checkbox && checkbox.checked) {
        total += parseInt(card.dataset.price) || 0;
      }
    });

    if (totalValueEl) {
      totalValueEl.textContent = `₹${total.toLocaleString('en-IN')}`;
    }
  }

  planCards.forEach(card => {
    card.addEventListener('click', () => {
      planCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      calculateTotal();
    });
  });

  addonCards.forEach(card => {
    card.addEventListener('click', () => {
      const checkbox = card.querySelector('.addon-checkbox');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        card.classList.toggle('active', checkbox.checked);
        calculateTotal();
      }
    });
  });

  calculateTotal();
}

/* =========================================================================
   5. Contact Form Submission & Formspree (xojovjda)
   ========================================================================= */
function initContactForm() {
  const form = document.getElementById('contact-project-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const company = document.getElementById('contact-company').value;
    const phone = document.getElementById('contact-phone').value;
    const desc = document.getElementById('project-desc').value;
    
    const activeCard = document.querySelector('.plan-selector-card.active');
    const planText = activeCard ? `${activeCard.querySelector('.plan-name').textContent.trim()} (${activeCard.querySelector('.plan-price').textContent.trim()})` : 'Starter (₹1,999/yr)';

    const selectedAddons = [];
    document.querySelectorAll('input[name="addons"]:checked').forEach(cb => {
      const addonCard = cb.closest('.addon-card');
      if (addonCard) {
        selectedAddons.push(addonCard.querySelector('.addon-name').textContent.trim());
      }
    });

    const totalValueEl = document.getElementById('estimated-total-value');
    const totalText = totalValueEl ? totalValueEl.textContent : '₹1,999';

    // Display loading state on submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Sending Brief... <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: loader-spin 1s linear infinite; margin-left: 6px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`;

    // Create payload
    const payload = {
      name: name,
      email: email,
      phone: phone,
      company: company || 'N/A',
      selectedPlan: planText,
      addonsSelected: selectedAddons.join(', ') || 'None',
      estimatedTotal: totalText,
      description: desc
    };

    // Submits directly to your verified Formspree inbox (xojovjda)
    fetch('https://formspree.io/f/xojovjda', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then(response => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
      
      if (response.ok) {
        saveLeadLocally(payload);
        showGenieModal('success-modal', `
          <div class="success-container">
            <div class="success-icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h3>Project Brief Delivered!</h3>
            <p style="color: var(--text-secondary); margin-bottom: 20px;">
              Thanks, <strong>${name}</strong>. Your project brief has been sent to our founders. We will review details and reach out shortly!
            </p>
            <button class="btn btn-primary" onclick="closeGenieModal('success-modal')">Close</button>
          </div>
        `);
        form.reset();
        
        // Reset addon cards UI
        document.querySelectorAll('.addon-card').forEach(card => {
          const cb = card.querySelector('.addon-checkbox');
          if (cb) cb.checked = false;
          card.classList.remove('active');
        });
        
        // Reset plan selector to default (Starter)
        const defaultCard = document.querySelector('.plan-selector-card[data-plan="starter"]');
        if (defaultCard) defaultCard.click();
      } else {
        throw new Error('Formspree response not ok');
      }
    })
    .catch(error => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
      
      saveLeadLocally(payload);

      // Fallback: trigger local client prefilled templates
      const subject = encodeURIComponent(`Project Brief - ${company || name}`);
      const bodyText = encodeURIComponent(
        `Hi ZephyrDevs,\n\n` +
        `My name is ${name}.\n` +
        `Email: ${email}\n` +
        `Phone: ${phone}\n` +
        `Company: ${company || 'N/A'}\n` +
        `Plan Selected: ${planText}\n` +
        `Add-ons Selected: ${selectedAddons.join(', ') || 'None'}\n` +
        `Estimated Total: ${totalText}\n\n` +
        `Project Description:\n${desc}`
      );
      window.location.href = `mailto:zephyrdevsofficial@gmail.com?subject=${subject}&body=${bodyText}`;

      showGenieModal('success-modal', `
        <div class="success-container">
          <div class="success-icon-circle" style="border-color: #ffbd2e; background: rgba(255, 189, 46, 0.1); color: #ffbd2e; box-shadow: 0 0 15px rgba(255, 189, 46, 0.2);">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"></path><path d="m22 9-9.3 5.4a2 2 0 0 1-2.2 0L2 9"></path></svg>
          </div>
          <h3>Email Client Opened</h3>
          <p style="color: var(--text-secondary); margin-bottom: 20px;">
            We prefilled your project details. Please click **Send** inside your email client to deliver the brief directly to **zephyrdevsofficial@gmail.com**!
          </p>
          <button class="btn btn-primary" onclick="closeGenieModal('success-modal')">Close</button>
        </div>
      `);
    });
  });
}

function saveLeadLocally(leadData) {
  if (!dbState.leads) dbState.leads = [];
  
  const newLead = {
    id: 'lead_' + Math.random().toString(36).substring(2, 9),
    date: new Date().toISOString().split('T')[0],
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    company: leadData.company,
    plan: leadData.selectedPlan,
    budget: leadData.estimatedTotal,
    addons: leadData.addonsSelected,
    description: leadData.description,
    status: 'New'
  };

  dbState.leads.unshift(newLead); // Add new inquiries at the top
  localStorage.setItem('zephyr_leads', JSON.stringify(dbState.leads));
  
  // Try sync with Firebase if ready
  firebaseCall('saveLead', newLead).catch(err => console.warn('Firebase saveLead error: ', err));
}

/* =========================================================================
   6. FAQ Accordion Collapse/Expand
   ========================================================================= */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length === 0) return;

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question-btn');
    const answer = item.querySelector('.faq-answer');

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other items
      faqItems.forEach((otherItem) => {
        otherItem.classList.remove('open');
        otherItem.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });
}

/* =========================================================================
   7. Interactive AI Sandbox Terminal
   ========================================================================= */
function initAISandbox() {
  const tabBtns = document.querySelectorAll('.sandbox-tab-btn');
  const actionBtns = document.querySelectorAll('.sandbox-action-btn');
  const consoleOutput = document.getElementById('sandbox-output-text');
  const loader = document.getElementById('sandbox-loader-element');

  if (!consoleOutput || !loader) return;

  let activeAI = 'gemini'; // default

  let activeTypingTimeout = null;

  // Tab switching
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (activeTypingTimeout) clearTimeout(activeTypingTimeout);
      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeAI = btn.dataset.ai;
      
      // Clear console and show welcome text
      consoleOutput.innerHTML = `<span style="color: var(--text-muted);">// System ready. Choose an action below to query ${activeAI === 'gemini' ? 'Google Gemini' : 'Anthropic Claude'}...</span>`;
    });
  });

  const sandboxDatabase = {
    gemini: {
      analyze: `[Google Gemini 1.5 Pro API]
> Analysis Result: Page components successfully loaded.
> Core Speed Index: 99.8% (FCP: 0.62s)
> Structure check: Fully semantic tags utilized. No missing alt tags.
> SEO rating: 100/100. Google bots indexed successfully.`,
      backend: `[Google Gemini 1.5 Pro API]
> Schema check: Firebase Firestore collections resolved.
> Connection State: Connected to Node.js backend.
> Secure Auth: Token verification set to HS256 active.
> Recommendation: Firebase storage cache is optimized for 24h.`,
      prompt: `[Google Gemini 1.5 Pro API]
> Prompt generated: "Contextual system parsing for developer queries."
> Token cost: 18 tokens.
> Response: System connected. Ready to index incoming query details.`,
      tuning: `[Google Gemini 1.5 Pro API]
> Tuning State: Prompt temperature set to 0.4 (low variance).
> Safety settings: Block rate parameters set to strict.
> Model size: Gemini 1.5 Flash activated for quick responses.`
    },
    claude: {
      analyze: `[Anthropic Claude 3.5 Sonnet API]
> Code Analysis: Found connection loop in main.js.
> Optimizing connectable[]: Connected nodes restricted to foreground.
> Performance update: Connection loops complexity reduced by 60%.
> Render speed: Framerate optimized to stable 60fps compositor layers.`,
      backend: `[Anthropic Claude 3.5 Sonnet API]
> Logic audit: Form inputs serialized successfully.
> Forwarding check: Connected to Formspree xojovjda endpoint.
> Security rules: Firebase Firestore rules configured. Write allowed only on valid emails.`,
      prompt: `[Anthropic Claude 3.5 Sonnet API]
> Prompt template: "Act as ZephyrDevs AI Agent. Draft project scope response."
> Input token count: 145 tokens.
> Execution output: Project request processed. Lead forwarded to founders.`,
      tuning: `[Anthropic Claude 3.5 Sonnet API]
> System instructions: Strict technical context output enabled.
> Response speed: Claude 3.5 Haiku activated.
> Token budget: Setup complete with standard rate limit configurations.`
    }
  };

  function typeConsoleOutput(responseText) {
    if (activeTypingTimeout) clearTimeout(activeTypingTimeout);
    consoleOutput.innerHTML = '';

    const lines = responseText.split('\n');
    let currentLineIndex = 0;
    let currentCharIndex = 0;
    let currentLineElement = null;

    const cursor = document.createElement('span');
    cursor.className = 'console-cursor';
    cursor.innerHTML = '&#9608;'; // Block cursor

    function typeNextChar() {
      if (currentLineIndex >= lines.length) {
        cursor.remove();
        return;
      }

      const lineText = lines[currentLineIndex];

      if (currentCharIndex === 0) {
        currentLineElement = document.createElement('div');
        currentLineElement.className = 'console-line';
        
        if (lineText.startsWith('[')) {
          currentLineElement.style.color = 'var(--neon-violet)';
        } else if (lineText.startsWith('>')) {
          currentLineElement.style.color = 'var(--neon-green)';
        } else {
          currentLineElement.style.color = 'var(--text-primary)';
        }

        consoleOutput.appendChild(currentLineElement);
        currentLineElement.appendChild(cursor);
      }

      if (currentCharIndex < lineText.length) {
        const char = lineText[currentCharIndex];
        const textNode = document.createTextNode(char);
        currentLineElement.insertBefore(textNode, cursor);
        currentCharIndex++;
        activeTypingTimeout = setTimeout(typeNextChar, 10);
      } else {
        currentCharIndex = 0;
        currentLineIndex++;
        activeTypingTimeout = setTimeout(typeNextChar, 60);
      }
    }

    typeNextChar();
  }

  // Action clicks
  actionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      
      if (activeTypingTimeout) clearTimeout(activeTypingTimeout);
      consoleOutput.innerHTML = '';
      loader.style.display = 'flex';

      setTimeout(() => {
        loader.style.display = 'none';
        const responseText = sandboxDatabase[activeAI][action];
        typeConsoleOutput(responseText);
      }, 600);
    });
  });
}

/* =========================================================================
   8. Genie-Style Modal Helper Controls & Navigation
   ========================================================================= */
window.showGenieModal = function (modalId, contentHTML) {
  let overlay = document.getElementById(modalId);
  
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box glass-panel">
        <div class="modal-close-btn" onclick="closeGenieModal('${modalId}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </div>
        <div class="modal-body-content"></div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const modalBox = overlay.querySelector('.modal-box');
  const bodyContent = overlay.querySelector('.modal-body-content');
  if (contentHTML) bodyContent.innerHTML = contentHTML;

  overlay.classList.add('active');

  modalBox.classList.remove('genie-close-transition');
  modalBox.classList.add('genie-open-transition');
};

window.closeGenieModal = function (modalId) {
  const overlay = document.getElementById(modalId);
  if (!overlay) return;

  const modalBox = overlay.querySelector('.modal-box');

  modalBox.classList.remove('genie-open-transition');
  modalBox.classList.add('genie-close-transition');

  setTimeout(() => {
    overlay.classList.remove('active');
  }, 480);
};

window.navigateTo = function (page) {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.25s ease';
  
  // Close mobile drawer if open
  const burger = document.getElementById('nav-burger-btn');
  const drawer = document.getElementById('mobile-drawer-menu');
  if (burger && drawer) {
    burger.classList.remove('open');
    drawer.classList.remove('open');
  }

  setTimeout(() => {
    window.location.href = page;
  }, 250);
};

// Handle route pre-fills & cinematic intro gate
function handlePageLoad() {
  const urlParams = new URLSearchParams(window.location.search);
  const selectedPlan = urlParams.get('plan');
  if (selectedPlan) {
    const planName = (selectedPlan === 'free') ? 'starter' : selectedPlan;
    const descTextarea = document.getElementById('project-desc');
    if (descTextarea) {
      descTextarea.value = `I am interested in starting a project using the [${planName.toUpperCase()} Plan]. `;
    }
    const targetPlanCard = document.querySelector(`.plan-selector-card[data-plan="${planName}"]`);
    if (targetPlanCard) {
      targetPlanCard.click();
    }
  }
  
  // --- Cinematic Intro Gate ---
  const gate = document.getElementById('intro-gate');
  const taglineEl = document.getElementById('intro-tagline');
  const progressFill = document.getElementById('intro-progress');
  const counterVal = document.getElementById('intro-counter-val');

  if (gate) {
    if (gate.classList.contains('fast-loader')) {
      // Super fast curtain split transition for other pages
      setTimeout(() => {
        gate.classList.add('lifted');
        document.body.classList.remove('loading-active');
        setTimeout(() => {
          gate.classList.add('done');
        }, 1000);
      }, 150);
    } else if (taglineEl) {
      // Full cinematic loader (only on homepage)
      // Build char-by-char tagline: "redesigned for speed"
      const words = [
        { text: 'redesigned', accent: false },
        { text: ' ', accent: false },
        { text: 'for', accent: false },
        { text: ' ', accent: false },
        { text: 'speed', accent: true }
      ];

      let charIndex = 0;
      words.forEach(word => {
        if (word.text === ' ') {
          taglineEl.appendChild(document.createTextNode('\u00A0'));
          return;
        }
        const wordSpan = document.createElement('span');
        if (word.accent) wordSpan.classList.add('intro-accent');

        word.text.split('').forEach(char => {
          const charSpan = document.createElement('span');
          charSpan.classList.add('intro-char');
          charSpan.textContent = char;
          charSpan.style.animationDelay = `${0.15 + charIndex * 0.035}s`;
          wordSpan.appendChild(charSpan);
          charIndex++;
        });

        taglineEl.appendChild(wordSpan);
      });

      // Animate progress bar & 0-100% counter
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 12 + 4;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
        }
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (counterVal) {
          counterVal.textContent = String(Math.round(progress)).padStart(3, '0');
        }
      }, 120);

      // Lift the curtain after the sequence
      const liftDelay = 2200;
      setTimeout(() => {
        clearInterval(progressInterval);
        if (progressFill) progressFill.style.width = '100%';
        if (counterVal) counterVal.textContent = '100';
        
        setTimeout(() => {
          gate.classList.add('lifted');
          document.body.classList.remove('loading-active');

          // Remove from DOM after transition completes
          setTimeout(() => {
            gate.classList.add('done');
          }, 1000);
        }, 300);
      }, liftDelay);
    } else {
      document.body.classList.remove('loading-active');
    }
  } else {
    // Fallback: just unlock scroll if no gate found
    document.body.classList.remove('loading-active');
  }
  
  document.body.style.opacity = '1';
  document.body.style.transition = 'opacity 0.25s ease';
}

if (document.readyState === 'complete') {
  handlePageLoad();
} else {
  window.addEventListener('load', handlePageLoad);
}


/* =========================================================================
   9. Custom Devreon Interactive Features
   ========================================================================= */
function initDevreonBackdrop() {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');

  // Disable custom cursor and tracking on mobile devices (prevents lag and touch delays)
  if (window.innerWidth < 768) {
    if (dot) dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
    return;
  }

  // Mouse interactive grid spotlight position
  window.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${(e.clientX / window.innerWidth) * 100}%`);
    document.documentElement.style.setProperty('--mouse-y', `${(e.clientY / window.innerHeight) * 100}%`);
  });

  // Custom cursor movement
  if (dot && ring) {
    window.addEventListener('mousemove', (e) => {
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
      
      ring.animate({
        left: `${e.clientX}px`,
        top: `${e.clientY}px`
      }, { duration: 150, fill: "forwards" });
    });

    const hoverables = document.querySelectorAll('a, button, input, textarea, select, .nav-link-item, .faq-question-btn, [onclick], .btn, .social-link');
    hoverables.forEach(item => {
      item.addEventListener('mouseenter', () => {
        ring.classList.add('hot');
      });
      item.addEventListener('mouseleave', () => {
        ring.classList.remove('hot');
      });
    });
  }
}

/* =========================================================================
   10. Firebase Administration & Maintenance Mode
   ========================================================================= */

// Global State
let dbState = {
  maintenance: false,
  announcement: { active: false, text: '' },
  team: {},
  password: 'admin00', // Default fallback
  loadingText: 'We Levlled Up.',
  customConfig: null,
  themeAccent: 'lime',
  activityLogs: [],
  leads: [],
  analytics: {
    visitors: 1248,
    pageviews: 4892,
    weeklyData: [420, 580, 490, 680, 810, 740, 930]
  }
};

let firebaseCallbacks = {};

// Helper to make async calls to our Firebase iframe proxy
window.firebaseCall = function (action, data) {
  return new Promise((resolve, reject) => {
    const id = Math.random().toString(36).substring(2);
    firebaseCallbacks[id] = { resolve, reject };
    
    const iframe = document.getElementById('firebase-api-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ id, action, data }, '*');
    } else {
      resolve(null);
    }
  });
};

// Initialize the Firebase hidden iframe
window.initFirebaseProxy = function () {
  if (document.getElementById('firebase-api-iframe')) return;

  const iframe = document.createElement('iframe');
  iframe.id = 'firebase-api-iframe';
  iframe.src = 'api.html';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  // Setup message receiver for responses and real-time updates
  window.addEventListener('message', (e) => {
    const { id, result, error, type, key, val, config } = e.data || {};

    // 1. Handle firebase ready message
    if (type === 'firebaseReady') {
      window.activeFirebaseConfig = config;
      initializeDefaultDataIfEmpty();
      return;
    }

    // 2. Handle async call callbacks
    if (id && firebaseCallbacks[id]) {
      if (error) {
        firebaseCallbacks[id].reject(new Error(error));
      } else {
        firebaseCallbacks[id].resolve(result);
      }
      delete firebaseCallbacks[id];
      return;
    }

    // 3. Handle real-time DB updates
    if (type === 'dbUpdate') {
      dbState[key] = val;
      
      if (key === 'maintenance') {
        handleMaintenanceUpdate(val);
      } else if (key === 'announcement') {
        handleAnnouncementUpdate(val);
      } else if (key === 'team') {
        handleTeamUpdate(val);
      } else if (key === 'themeAccent') {
        applyThemeAccent(val);
      } else if (key === 'activityLogs') {
        renderActivityLogs(val);
      } else if (key === 'loadingText') {
        handleLoadingTextUpdate(val);
      } else if (key === 'customConfig') {
        // If Firebase active config is not ready yet, ignore initial load updates
        if (!window.activeFirebaseConfig) {
          return;
        }

        const active = window.activeFirebaseConfig;
        const newConfig = val;

        const normalizeUrl = (url) => {
          if (!url) return '';
          return url.replace(/\/+$/, '').toLowerCase();
        };

        const activeUrl = normalizeUrl(active ? active.databaseURL : '');
        const newUrl = normalizeUrl(newConfig ? newConfig.databaseURL : '');
        const activeApiKey = active ? active.apiKey : '';
        const newApiKey = newConfig ? newConfig.apiKey : '';

        // 1. If we have a new custom config, and it doesn't match our active config:
        if (newConfig && (newUrl !== activeUrl || newApiKey !== activeApiKey)) {
          console.log("Firebase sync credentials updated. Reconnecting...");
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
        // 2. If the custom config was removed (val is null), but our active database is NOT the default database:
        else if (!newConfig && activeUrl && activeUrl !== normalizeUrl("https://zephyrdevs-905b9-default-rtdb.firebaseio.com")) {
          console.log("Firebase config reset to default. Reconnecting...");
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }
    }
  });

  // Inject the Admin panel modals when iframe has loaded
  iframe.onload = () => {
    injectAdminModals();
  };
};

// Default co-founders data to initialize Firebase DB if empty
const defaultDbData = {
  maintenance: false,
  announcement: {
    active: false,
    text: "Welcome to ZephyrDevs! We are now booking new projects."
  },
  password: "admin00",
  themeAccent: "lime",
  team: {
    "founder_akshansh": {
      name: "Akshansh Sinha",
      role: "Co-Founder & Tech Architect",
      bio: "Specializes in backend architecture, Google Gemini model tuning, and cloud-native solutions with Node.js and Firebase.",
      instagram: "akshansh_6969",
      initials: "AS",
      gradient: "linear-gradient(135deg, rgba(0, 230, 118, 0.2) 0%, rgba(0, 176, 255, 0.2) 100%)",
      pfp: "https://i.ibb.co/ZpbWz2g9/aksansh.jpg"
    },
    "founder_aarav": {
      name: "Aarav Sharma",
      role: "Co-Founder & Creative Lead",
      bio: "Designs premium glassmorphic UI interfaces, creates fluid custom animations, and manages Claude AI API pipelines.",
      instagram: "aarav_sharma_sui",
      initials: "AS",
      gradient: "linear-gradient(135deg, rgba(0, 176, 255, 0.2) 0%, rgba(200, 0, 255, 0.2) 100%)"
    },
    "founder_arshh": {
      name: "Arshh",
      role: "Co-Founder & Lead AI Engineer",
      bio: "Focuses on advanced Claude AI workflows, neural-network integrations, and high-performance server logic.",
      instagram: "arshhispro_",
      initials: "AR",
      gradient: "linear-gradient(135deg, rgba(200, 0, 255, 0.2) 0%, rgba(0, 230, 118, 0.2) 100%)"
    }
  }
};

async function initializeDefaultDataIfEmpty() {
  try {
    await firebaseCall('initializeDefaultData', defaultDbData);
  } catch (err) {
    console.error('Failed to initialize default DB data:', err);
  }
}

// ---------------------- Loading Text Update ----------------------
function handleLoadingTextUpdate(val) {
  const loadingTextEl = document.querySelector('.intro-loading-text');
  if (loadingTextEl) {
    loadingTextEl.innerText = val || 'We Levlled Up.';
  }
}

// ---------------------- Maintenance Mode ----------------------
function handleMaintenanceUpdate(active) {
  let screen = document.getElementById('maintenance-screen');
  const isAdmin = sessionStorage.getItem('zephyr_admin') === 'true';

  if (active && !isAdmin) {
    if (!screen) {
      screen = document.createElement('div');
      screen.id = 'maintenance-screen';
      screen.className = 'maintenance-screen';
      screen.innerHTML = `
        <div class="maintenance-content">
          <svg class="maintenance-icon" viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h2 class="maintenance-title">system maintenance</h2>
          <p class="maintenance-desc">zephyrdevs is currently performing scheduled upgrades. we will be online shortly.</p>
          <span class="maintenance-logo-label">zephyrdevs — 2026</span>
        </div>
        <button class="maintenance-admin-link" onclick="openAdminPanel(event)">[Admin Login]</button>
      `;
      document.body.appendChild(screen);
      document.body.classList.add('loading-active'); // Locks scrolling
    }
  } else {
    if (screen) {
      screen.remove();
      if (!document.body.classList.contains('preloading')) {
        document.body.classList.remove('loading-active'); // Unlocks scrolling
      }
    }
  }
}

// ---------------------- Announcement Bar ----------------------
function handleAnnouncementUpdate(announcement) {
  let bar = document.getElementById('announcement-bar');
  
  if (announcement && announcement.active && announcement.text) {
    document.body.classList.add('has-announcement');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'announcement-bar';
      bar.className = 'announcement-bar';
      document.body.insertBefore(bar, document.body.firstChild);
    }
    bar.innerHTML = `<span class="announcement-dot"></span> <span>${announcement.text}</span>`;
    bar.style.display = 'flex';
  } else {
    document.body.classList.remove('has-announcement');
    if (bar) {
      bar.style.display = 'none';
    }
  }
}

// ---------------------- Team Roster Update ----------------------
function handleTeamUpdate(teamData) {
  const grid = document.querySelector('.founders-grid');
  if (!grid) return; // Only index.html has co-founders grid

  grid.innerHTML = '';
  if (!teamData) return;

  Object.keys(teamData).forEach(key => {
    const m = teamData[key];
    const card = document.createElement('div');
    card.className = 'founder-card glass-panel reveal reveal-scale in'; // instantly reveal
    card.style.opacity = '1';
    card.style.transform = 'translateY(0) scale(1)';
    let avatarStyle = '';
    let avatarContent = '';
    if (m.pfp) {
      avatarStyle = `background-image: url('${m.pfp}'); background-size: cover; background-position: center;`;
    } else {
      avatarStyle = `background: ${m.gradient || 'linear-gradient(135deg, var(--neon-green) 0%, var(--neon-cyan) 100%)'};`;
      avatarContent = m.initials || m.name.split(' ').map(n => n[0]).join('');
    }

    card.innerHTML = `
      <div class="founder-avatar-wrapper">
        <div class="founder-avatar" style="${avatarStyle}">
          ${avatarContent}
        </div>
      </div>
      <span class="founder-role">${m.role}</span>
      <h3 class="founder-name">${m.name}</h3>
      <p class="founder-bio">${m.bio}</p>
      <div class="founder-socials">
        <a href="https://instagram.com/${m.instagram}" target="_blank" rel="noopener" class="social-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          @${m.instagram}
        </a>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ---------------------- Admin Panel Controls & Modals ----------------------
function injectAdminModals() {
  if (document.getElementById('admin-pw-modal')) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <!-- Password Modal -->
    <div id="admin-pw-modal" class="admin-modal-overlay">
      <div class="admin-modal-box admin-pw-box">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title" style="font-family: var(--font-mono); text-transform: uppercase; font-size: 1.15rem; letter-spacing: 0.08em;">admin authorization</h3>
          <button class="admin-modal-close" onclick="closeAdminPasswordModal()">&times;</button>
        </div>
        <p class="admin-pw-desc">enter password to access control centre</p>
        <div class="admin-form-group">
          <div style="position: relative; max-width: 260px; margin: 0 auto;">
            <input type="password" id="admin-pw-input" class="admin-input" placeholder="••••••••" style="text-align: center; width: 100%; padding-right: 40px;">
            <button id="admin-pw-toggle-btn" onclick="togglePasscodeVisibility()" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; padding: 4px;">
              <svg class="eye-open-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <svg class="eye-closed-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            </button>
          </div>
          <div id="admin-pw-error" class="admin-pw-error">incorrect security code</div>
        </div>
        <div style="text-align: center; display: flex; gap: 10px; justify-content: center;">
          <button class="admin-btn admin-btn-secondary" onclick="closeAdminPasswordModal()">cancel</button>
          <button class="admin-btn" onclick="submitAdminPassword()">authorize</button>
        </div>
      </div>
    </div>

    <!-- Dashboard Modal -->
    <div id="admin-dashboard-modal" class="admin-modal-overlay">
      <div class="admin-modal-box dashboard-large">
        <!-- Left Sidebar Navigation -->
        <div class="admin-sidebar">
          <div class="admin-sidebar-top">
            <div class="admin-sidebar-brand">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 4px var(--neon-cyan-glow));"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Zephyr Devs</span>
            </div>
            
            <div class="admin-sidebar-menu">
              <button class="admin-sidebar-btn active" id="sidebar-btn-analytics" onclick="switchAdminTab('tab-analytics')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                Metrics
              </button>
              <button class="admin-sidebar-btn" id="sidebar-btn-leads" onclick="switchAdminTab('tab-leads')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Inquiries
              </button>
              <button class="admin-sidebar-btn" id="sidebar-btn-settings" onclick="switchAdminTab('tab-settings')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Config
              </button>
              <button class="admin-sidebar-btn" id="sidebar-btn-team" onclick="switchAdminTab('tab-team')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Roster
              </button>
            </div>
          </div>
          
          <div class="admin-sidebar-footer">
            <div class="server-status-wrap">
              <span class="live-pulse-dot"></span>
              <span>API Server Connected</span>
            </div>
          </div>
        </div>

        <!-- Right Content Area -->
        <div class="admin-content-area">
          <div class="admin-content-header">
            <div>
              <h3 style="font-family: var(--font-mono); text-transform: uppercase; font-size: 1.15rem; letter-spacing: 0.1em; color: var(--neon-cyan); margin-bottom: 2px;">Control Centre</h3>
              <span style="font-size: 0.72rem; color: var(--text-secondary); font-family: var(--font-mono);" id="admin-date-stamp">Zephyr Control Panel</span>
            </div>
            <button class="admin-modal-close" onclick="closeAdminDashboard()">&times;</button>
          </div>

          <!-- Tab: Traffic Analytics -->
          <div id="tab-analytics" class="admin-tab-content active">
            <div class="admin-analytics-grid">
              <div class="admin-stat-card">
                <div class="admin-stat-label">unique visitors</div>
                <div class="admin-stat-num" id="stat-visitors">0</div>
                <div class="admin-stat-trend trend-up">↑ 18.2% vs last wk</div>
              </div>
              <div class="admin-stat-card">
                <div class="admin-stat-label">total pageviews</div>
                <div class="admin-stat-num" id="stat-pageviews">0</div>
                <div class="admin-stat-trend trend-up">↑ 22.4% vs last wk</div>
              </div>
              <div class="admin-stat-card">
                <div class="admin-stat-label">inquiries / leads</div>
                <div class="admin-stat-num" id="stat-leads-count">0</div>
                <div class="admin-stat-trend trend-up">↑ 8.3% vs last wk</div>
              </div>
              <div class="admin-stat-card">
                <div class="admin-stat-label">conversion rate</div>
                <div class="admin-stat-num" id="stat-conversion">0.0%</div>
                <div class="admin-stat-trend trend-up">↑ 1.2% conv</div>
              </div>
            </div>

            <div class="admin-chart-container">
              <div class="admin-chart-title">Weekly Traffic Graph (Page Views)</div>
              <div id="admin-chart-svg-wrap" style="position: relative; width: 100%; height: 180px;">
                <!-- SVG chart dynamically drawn -->
              </div>
            </div>
          </div>

          <!-- Tab: System Settings -->
          <div id="tab-settings" class="admin-tab-content">
            <div class="admin-form-group admin-checkbox-group" style="background: rgba(255,255,255,0.02); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
              <input type="checkbox" id="admin-maintenance-cb" class="admin-checkbox" onchange="toggleMaintenanceMode(this.checked)">
              <label for="admin-maintenance-cb" style="margin-bottom:0; cursor:pointer; font-weight: 500;">Enable Maintenance Mode (Site Lock)</label>
            </div>
            
            <div style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); margin: 20px 0;">
              <div class="admin-form-group admin-checkbox-group" style="margin-bottom: 15px;">
                <input type="checkbox" id="admin-announcement-cb" class="admin-checkbox">
                <label for="admin-announcement-cb" style="margin-bottom:0; cursor:pointer; font-weight: 500;">Enable Top Announcement Banner</label>
              </div>
              <div class="admin-form-group">
                <label for="admin-announcement-text">Announcement Banner Text</label>
                <textarea id="admin-announcement-text" class="admin-textarea" rows="2" placeholder="e.g. Now booking projects for Q3 2026!"></textarea>
              </div>
              <button class="admin-btn" style="padding: 8px 16px; font-size: 0.8rem;" onclick="saveAnnouncementSettings()">Save Banner Config</button>
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 20px;">
              <div class="admin-form-group">
                <label for="admin-loading-text">Cinematic Loading Text</label>
                <input type="text" id="admin-loading-text" class="admin-input" placeholder="e.g. We Levlled Up.">
              </div>
              <button class="admin-btn" style="padding: 8px 16px; font-size: 0.8rem;" onclick="saveLoadingTextSettings()">Save Loading Text</button>
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 20px;">
              <h4 style="color:#fff; margin-bottom:15px; font-size:0.9rem; font-family:var(--font-mono); text-transform:uppercase;">security credentials</h4>
              <div class="admin-form-group">
                <label for="admin-new-pw-input">Change Admin Password</label>
                <input type="password" id="admin-new-pw-input" class="admin-input" placeholder="Enter new admin password...">
              </div>
              <button class="admin-btn" style="padding: 8px 16px; font-size: 0.8rem;" onclick="savePasswordSettings()">Save Password</button>
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 20px;">
              <h4 style="color:#fff; margin-bottom:15px; font-size:0.9rem; font-family:var(--font-mono); text-transform:uppercase; color: var(--neon-cyan);">global theme styling</h4>
              <label style="display:block; margin-bottom:8px; font-family:var(--font-mono); font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary);">Accent Color Theme</label>
              <div class="accent-colors-grid">
                <button class="accent-color-btn" data-accent="amber" onclick="updateThemeSettings('amber')">
                  <span class="color-dot-indicator" style="background: #f59e0b;"></span>
                  Amber
                </button>
                <button class="accent-color-btn" data-accent="lime" onclick="updateThemeSettings('lime')">
                  <span class="color-dot-indicator" style="background: #10b981;"></span>
                  Emerald
                </button>
                <button class="accent-color-btn" data-accent="violet" onclick="updateThemeSettings('violet')">
                  <span class="color-dot-indicator" style="background: #f97316;"></span>
                  Orange
                </button>
                <button class="accent-color-btn" data-accent="cyan" onclick="updateThemeSettings('cyan')">
                  <span class="color-dot-indicator" style="background: #3b82f6;"></span>
                  Blue
                </button>
              </div>
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 20px;">
              <h4 style="color:#fff; margin-bottom:15px; font-size:0.9rem; font-family:var(--font-mono); text-transform:uppercase; color: var(--neon-cyan);">system activity log</h4>
              <div id="admin-activity-logs" style="font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.4; color: var(--text-secondary);">
                <!-- Dynamically populated -->
              </div>
            </div>
          </div>

          <!-- Tab: Inquiries & Leads -->
          <div id="tab-leads" class="admin-tab-content">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap: wrap; gap: 10px;">
              <div>
                <h4 style="color:#fff; font-size:0.95rem; font-family: var(--font-mono); text-transform: uppercase;">project planner inquiries</h4>
                <span style="font-size:0.75rem; color:var(--text-secondary); font-family:var(--font-mono);" id="admin-leads-count-text">0 inquiries found</span>
              </div>
              <button class="admin-btn" style="padding: 6px 14px; font-size: 0.75rem;" onclick="toggleAddLeadForm(true)">+ Add Lead</button>
            </div>

            <!-- Manual Add Lead Overlay Form -->
            <div id="admin-add-lead-overlay" class="admin-lead-form-overlay" style="display: none;">
              <h4 style="color: #fff; margin-bottom: 15px; font-family: var(--font-mono); text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">Add Lead Manually</h4>
              <div class="admin-lead-form-grid">
                <div class="admin-form-group">
                  <label>Client Name *</label>
                  <input type="text" id="lead-form-name" class="admin-input" placeholder="e.g. Rahul Kumar">
                </div>
                <div class="admin-form-group">
                  <label>Email Address *</label>
                  <input type="email" id="lead-form-email" class="admin-input" placeholder="e.g. rahul@example.com">
                </div>
                <div class="admin-form-group">
                  <label>Phone Number *</label>
                  <input type="tel" id="lead-form-phone" class="admin-input" placeholder="e.g. +91 95078 59444">
                </div>
                <div class="admin-form-group">
                  <label>Company / Brand Name</label>
                  <input type="text" id="lead-form-company" class="admin-input" placeholder="e.g. Patna Tech Corp">
                </div>
                <div class="admin-form-group">
                  <label>Subscription Plan *</label>
                  <select id="lead-form-plan" class="admin-input" style="background:#000; color:#fff;" onchange="calculateFormBudget()">
                    <option value="Starter (₹1,999/yr)">Starter Sub (₹1,999/yr)</option>
                    <option value="Growth (₹3,999/yr)">Growth Sub (₹3,999/yr)</option>
                    <option value="Enterprise (Custom)">Enterprise (Custom)</option>
                  </select>
                </div>
                <div class="admin-form-group">
                  <label>Add-ons (Check to add)</label>
                  <div style="display:flex; flex-direction:column; gap:6px; background:rgba(0,0,0,0.2); padding:10px; border-radius:6px; max-height:80px; overflow-y:auto;">
                    <label style="display:flex; align-items:center; gap:8px; margin-bottom:0; font-family:var(--font-body); text-transform:none; font-size:0.8rem; cursor:pointer;">
                      <input type="checkbox" name="lead-form-addons" value="SEO" onchange="calculateFormBudget()"> Advanced SEO Setup
                    </label>
                    <label style="display:flex; align-items:center; gap:8px; margin-bottom:0; font-family:var(--font-body); text-transform:none; font-size:0.8rem; cursor:pointer;">
                      <input type="checkbox" name="lead-form-addons" value="Chatbot" onchange="calculateFormBudget()"> AI Chatbot Integration
                    </label>
                    <label style="display:flex; align-items:center; gap:8px; margin-bottom:0; font-family:var(--font-body); text-transform:none; font-size:0.8rem; cursor:pointer;">
                      <input type="checkbox" name="lead-form-addons" value="Branding" onchange="calculateFormBudget()"> Brand Identity Kit
                    </label>
                  </div>
                </div>
              </div>
              <div class="admin-form-group">
                <label>Estimated Budget Estimate *</label>
                <input type="text" id="lead-form-budget" class="admin-input" placeholder="e.g. ₹1,999">
              </div>
              <div class="admin-form-group">
                <label>Project Brief Summary</label>
                <textarea id="lead-form-desc" class="admin-textarea" rows="2" placeholder="Explain project specifications..."></textarea>
              </div>
              <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button class="admin-btn admin-btn-secondary" onclick="toggleAddLeadForm(false)">Cancel</button>
                <button class="admin-btn" onclick="saveManualLead()">Save Inquiry</button>
              </div>
            </div>
            
            <div class="admin-leads-wrapper">
              <table class="admin-leads-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client Details</th>
                    <th>Project Plan</th>
                    <th>Budget Estimate</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="admin-leads-table-body">
                  <!-- Leads dynamically populated -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab: Team Management -->
          <div id="tab-team" class="admin-tab-content">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px;">
              <h4 style="color:#fff; font-size:0.95rem; font-family: var(--font-mono); text-transform: uppercase;">team members</h4>
              <button class="admin-btn" style="padding: 6px 14px; font-size: 0.75rem;" onclick="showAddTeamMemberForm()">+ add member</button>
            </div>
            
            <div id="admin-team-list" class="admin-team-list">
              <!-- Dynamically populated -->
            </div>

            <!-- Add/Edit Member Form Overlay inside Dashboard -->
            <div id="admin-team-form" style="display:none; background: rgba(5,6,8,0.95); border: 1px solid rgba(255,255,255,0.08); padding:20px; border-radius:12px; margin-top:20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              <h4 id="team-form-title" style="color:#fff; margin-bottom:15px; font-size:0.95rem; font-family: var(--font-mono); text-transform: uppercase; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">add team member</h4>
              <input type="hidden" id="team-member-key">
              
              <div class="admin-form-group">
                <label>full name</label>
                <input type="text" id="team-member-name" class="admin-input" placeholder="e.g. Akshansh Sinha">
              </div>
              <div class="admin-form-group">
                <label>role / title</label>
                <input type="text" id="team-member-role" class="admin-input" placeholder="e.g. Co-Founder & Tech Architect">
              </div>
              <div class="admin-form-group">
                <label>bio description</label>
                <textarea id="team-member-bio" class="admin-textarea" rows="2" placeholder="describe the role and skills..."></textarea>
              </div>
              <div class="admin-form-group">
                <label>instagram username (without @)</label>
                <input type="text" id="team-member-insta" class="admin-input" placeholder="e.g. akshansh_6969">
              </div>
              <div class="admin-form-group">
                <label>profile picture URL</label>
                <input type="text" id="team-member-pfp" class="admin-input" placeholder="e.g. https://i.ibb.co/ZpbWz2g9/aksansh.jpg">
              </div>
              <div style="display:flex; justify-content:flex-end; gap: 10px;">
                <button class="admin-btn admin-btn-secondary" onclick="hideTeamMemberForm()">cancel</button>
                <button class="admin-btn" onclick="saveTeamMember()">save member</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(wrapper);

  // Bind Enter key to password submit
  const pwInput = document.getElementById('admin-pw-input');
  if (pwInput) {
    pwInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        submitAdminPassword();
      }
    });
  }
}

// ---------------------- Leads Management Database & Renderers ----------------------
// Load leads from LocalStorage or seed with premium mock templates
(function initLeadsDatabase() {
  const savedLeads = localStorage.getItem('zephyr_leads');
  if (savedLeads) {
    dbState.leads = JSON.parse(savedLeads);
  } else {
    dbState.leads = [
      {
        id: 'lead_1',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        name: 'Aditya Raj',
        email: 'aditya.raj@rajdarbar.com',
        phone: '+91 95078 59444',
        company: 'Rajdarbar Group',
        plan: 'Growth Sub (₹3,999/yr)',
        budget: '₹3,999',
        addons: 'Advanced SEO Setup, AI Chatbot Integrations',
        description: 'Need to build a conversion-focused landing page for our new luxury apartment towers in Patna. Clean and blazing fast.',
        status: 'Won'
      },
      {
        id: 'lead_2',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        name: 'Vikram Singh',
        email: 'contact@havelirestaurants.in',
        phone: '+91 98765 12345',
        company: 'Haveli Foods',
        plan: 'Starter Sub (₹1,999/yr)',
        budget: '₹1,999',
        addons: 'None',
        description: 'Need a digital menu listing website for our restaurant branches.',
        status: 'Contacted'
      }
    ];
    localStorage.setItem('zephyr_leads', JSON.stringify(dbState.leads));
  }
})();

window.renderAdminLeadsList = function () {
  const tbody = document.getElementById('admin-leads-table-body');
  const countText = document.getElementById('admin-leads-count-text');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  const leads = dbState.leads || [];
  
  if (countText) {
    countText.textContent = `${leads.length} inquir${leads.length === 1 ? 'y' : 'ies'} found`;
  }
  
  if (leads.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-tertiary); font-family: var(--font-mono); padding: 40px 10px;">
          No inquiries found. Submit the budget planner on the contact page to test!
        </td>
      </tr>
    `;
    return;
  }
  
  leads.forEach(lead => {
    const tr = document.createElement('tr');
    const dateStr = lead.date || 'N/A';
    
    let statusClass = 'status-new';
    if (lead.status === 'Contacted') statusClass = 'status-contacted';
    if (lead.status === 'In Progress') statusClass = 'status-in-progress';
    if (lead.status === 'Won') statusClass = 'status-won';
    if (lead.status === 'Lost') statusClass = 'status-lost';
    
    tr.innerHTML = `
      <td style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap;">${dateStr}</td>
      <td>
        <div style="font-weight: 600; color: #fff;">${lead.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary);">${lead.email} | ${lead.phone}</div>
        <div style="font-size: 0.7rem; color: var(--text-tertiary); font-style: italic; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 4px;" title="${lead.description || ''}">
          "${lead.description || 'No description'}"
        </div>
      </td>
      <td>
        <div style="font-weight: 500; color: #fff;">${lead.plan}</div>
        <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">Add-ons: ${lead.addons || 'None'}</div>
      </td>
      <td style="font-family: var(--font-mono); font-weight: bold; color: var(--neon-cyan);">${lead.budget}</td>
      <td>
        <span class="status-badge ${statusClass}">${lead.status || 'New'}</span>
      </td>
      <td>
        <div style="display: flex; gap: 8px; align-items: center;">
          <select class="lead-action-select" onchange="updateLeadStatus('${lead.id}', this.value)">
            <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New</option>
            <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
            <option value="In Progress" ${lead.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Won" ${lead.status === 'Won' ? 'selected' : ''}>Won</option>
            <option value="Lost" ${lead.status === 'Lost' ? 'selected' : ''}>Lost</option>
          </select>
          <button class="admin-btn-danger" style="padding: 4px 8px; font-size: 0.7rem; border-radius: 4px; border: none; cursor: pointer;" onclick="deleteLead('${lead.id}')">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.updateLeadStatus = function(leadId, newStatus) {
  const leadIndex = dbState.leads.findIndex(l => l.id === leadId);
  if (leadIndex !== -1) {
    dbState.leads[leadIndex].status = newStatus;
    localStorage.setItem('zephyr_leads', JSON.stringify(dbState.leads));
    renderAdminLeadsList();
    firebaseCall('updateLeadStatus', { id: leadId, status: newStatus }).catch(err => console.warn(err));
  }
};

window.deleteLead = function(leadId) {
  if (confirm('Are you sure you want to delete this inquiry?')) {
    dbState.leads = dbState.leads.filter(l => l.id !== leadId);
    localStorage.setItem('zephyr_leads', JSON.stringify(dbState.leads));
    renderAdminLeadsList();
    firebaseCall('deleteLead', leadId).catch(err => console.warn(err));
  }
};

window.renderAdminAnalytics = function() {
  const visitorsVal = dbState.analytics.visitors;
  const pageviewsVal = dbState.analytics.pageviews;
  const leadsVal = dbState.leads.length;
  
  let conversionVal = '0.0%';
  if (visitorsVal > 0) {
    conversionVal = ((leadsVal / visitorsVal) * 100).toFixed(1) + '%';
  }
  
  const visEl = document.getElementById('stat-visitors');
  if (visEl) visEl.textContent = visitorsVal.toLocaleString();
  const pvEl = document.getElementById('stat-pageviews');
  if (pvEl) pvEl.textContent = pageviewsVal.toLocaleString();
  const ldEl = document.getElementById('stat-leads-count');
  if (ldEl) ldEl.textContent = leadsVal.toLocaleString();
  const convEl = document.getElementById('stat-conversion');
  if (convEl) convEl.textContent = conversionVal;
  
  const svgWrap = document.getElementById('admin-chart-svg-wrap');
  if (!svgWrap) return;
  
  const data = dbState.analytics.weeklyData;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxVal = Math.max(...data) || 1000;
  
  const width = svgWrap.clientWidth || 740;
  const height = 150;
  const paddingX = 40;
  const paddingY = 20;
  
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  
  const points = data.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - (val / maxVal) * chartHeight;
    return { x, y, val };
  });
  
  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`;
  
  let gridLines = '';
  for (let i = 0; i <= 3; i++) {
    const y = paddingY + (i / 3) * chartHeight;
    const val = Math.round(maxVal - (i / 3) * maxVal);
    gridLines += `
      <line x1="${paddingX}" y1="${y}" x2="${width - paddingX}" y2="${y}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="3,3" />
      <text x="${paddingX - 10}" y="${y + 4}" fill="var(--text-tertiary)" font-family="var(--font-mono)" font-size="9" text-anchor="end">${val}</text>
    `;
  }
  
  let markers = '';
  points.forEach((p, idx) => {
    markers += `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--neon-cyan)" />
      <text x="${p.x}" y="${paddingY + chartHeight + 15}" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="9" text-anchor="middle">${days[idx]}</text>
      <text x="${p.x}" y="${p.y - 8}" fill="#ffffff" font-family="var(--font-mono)" font-size="9" font-weight="bold" text-anchor="middle">${p.val}</text>
    `;
  });
  
  svgWrap.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--neon-cyan)" stop-opacity="0.15" />
          <stop offset="100%" stop-color="var(--neon-cyan)" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${areaPath}" fill="url(#chartGradient)" />
      <path d="${linePath}" fill="none" stroke="var(--neon-cyan)" stroke-width="2.5" />
      ${markers}
    </svg>
  `;
}

window.openAdminPanel = function (e) {
  if (e) e.preventDefault();
  
  if (sessionStorage.getItem('zephyr_admin') === 'true') {
    showAdminDashboard();
  } else {
    showAdminPasswordModal();
  }
};

function showAdminPasswordModal() {
  const modal = document.getElementById('admin-pw-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('loading-active');
    const input = document.getElementById('admin-pw-input');
    if (input) {
      input.value = '';
      input.type = 'password';
      input.focus();
    }
    const btn = document.getElementById('admin-pw-toggle-btn');
    if (btn) {
      const openIcon = btn.querySelector('.eye-open-icon');
      const closedIcon = btn.querySelector('.eye-closed-icon');
      if (openIcon) openIcon.style.display = 'block';
      if (closedIcon) closedIcon.style.display = 'none';
    }
    const err = document.getElementById('admin-pw-error');
    if (err) err.style.display = 'none';
  }
}

window.closeAdminPasswordModal = function () {
  const modal = document.getElementById('admin-pw-modal');
  if (modal) {
    modal.classList.remove('active');
    if (!document.getElementById('maintenance-screen') && !document.body.classList.contains('preloading')) {
      document.body.classList.remove('loading-active');
    }
  }
};

window.submitAdminPassword = function () {
  const input = document.getElementById('admin-pw-input');
  const err = document.getElementById('admin-pw-error');
  const pass = input ? input.value : '';

  // Auth check using database password (or fallback)
  const actualPassword = dbState.password || 'admin00';
  
  if (pass === actualPassword) {
    sessionStorage.setItem('zephyr_admin', 'true');
    closeAdminPasswordModal();
    showAdminDashboard();
  } else {
    if (err) err.style.display = 'block';
  }
};

function showAdminDashboard() {
  const dashboard = document.getElementById('admin-dashboard-modal');
  if (dashboard) {
    dashboard.classList.add('active');
    document.body.classList.add('loading-active');
    
    // Sync current values with UI
    const mCB = document.getElementById('admin-maintenance-cb');
    if (mCB) mCB.checked = dbState.maintenance || false;
    
    const aCB = document.getElementById('admin-announcement-cb');
    if (aCB) aCB.checked = dbState.announcement ? dbState.announcement.active : false;
    
    const aText = document.getElementById('admin-announcement-text');
    if (aText) aText.value = dbState.announcement ? dbState.announcement.text : '';

    const lText = document.getElementById('admin-loading-text');
    if (lText) lText.value = dbState.loadingText || '';

    const newPwInput = document.getElementById('admin-new-pw-input');
    if (newPwInput) newPwInput.value = '';

    // Set active visual color accent button states
    const activeAccent = localStorage.getItem('zephyr_accent') || 'amber';
    document.querySelectorAll('.accent-color-btn').forEach(btn => {
      if (btn.getAttribute('data-accent') === activeAccent) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Populate active database configurations
    const active = window.activeFirebaseConfig || {};
    const apiKeyField = document.getElementById('admin-config-apikey');
    if (apiKeyField) apiKeyField.value = active.apiKey || '';
    const dbUrlField = document.getElementById('admin-config-dburl');
    if (dbUrlField) dbUrlField.value = active.databaseURL || '';
    const projIdField = document.getElementById('admin-config-projectid');
    if (projIdField) projIdField.value = active.projectId || '';
    const appIdField = document.getElementById('admin-config-appid');
    if (appIdField) appIdField.value = active.appId || '';

    // Set modern header date stamp
    const stamp = document.getElementById('admin-date-stamp');
    if (stamp) {
      const now = new Date();
      stamp.textContent = 'Control Panel - ' + now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    renderAdminTeamList();
    renderActivityLogs(dbState.activityLogs);
    switchAdminTab('tab-analytics'); // Default to Analytics tab!
    startLiveAnalyticsSimulation(); // Start simulation ticks!
  }
}

window.closeAdminDashboard = function () {
  const dashboard = document.getElementById('admin-dashboard-modal');
  if (dashboard) {
    dashboard.classList.remove('active');
    
    // Clear admin auth state so it asks for password next time
    sessionStorage.removeItem('zephyr_admin');
    
    // Clear simulation ticks
    if (window.liveAnalyticsInterval) {
      clearInterval(window.liveAnalyticsInterval);
    }
    
    // Re-evaluate maintenance mode view (locks screen if active)
    handleMaintenanceUpdate(dbState.maintenance || false);
  }
};

window.switchAdminTab = function (tabId) {
  // Hide all tab contents
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
  // Deactivate all sidebar buttons
  document.querySelectorAll('.admin-sidebar-btn').forEach(b => b.classList.remove('active'));

  // Show selected tab content and active button
  const tabContent = document.getElementById(tabId);
  if (tabContent) tabContent.classList.add('active');

  const btnId = 'sidebar-btn-' + tabId.replace('tab-', '');
  const btn = document.getElementById(btnId);
  if (btn) btn.classList.add('active');
  
  hideTeamMemberForm();
  toggleAddLeadForm(false); // Close add lead overlay on tab switch

  if (tabId === 'tab-leads') {
    renderAdminLeadsList();
  } else if (tabId === 'tab-analytics') {
    renderAdminAnalytics();
  }
};

// ---------------------- DB Update Handlers ----------------------
window.toggleMaintenanceMode = async function (checked) {
  try {
    await firebaseCall('updateMaintenance', checked);
  } catch (err) {
    console.error('Failed to toggle maintenance mode:', err);
  }
};

window.saveAnnouncementSettings = async function () {
  const active = document.getElementById('admin-announcement-cb').checked;
  const text = document.getElementById('admin-announcement-text').value;

  try {
    await firebaseCall('updateAnnouncement', { active, text });
    alert('Announcement settings updated.');
  } catch (err) {
    console.error('Failed to update announcement:', err);
    alert('Failed to update announcement: ' + err.message);
  }
};

window.saveLoadingTextSettings = async function () {
  const text = document.getElementById('admin-loading-text').value.trim();
  try {
    await firebaseCall('updateLoadingText', text);
    alert('Loading text updated.');
  } catch (err) {
    console.error('Failed to update loading text:', err);
    alert('Failed to update loading text: ' + err.message);
  }
};

window.savePasswordSettings = async function () {
  const newPwInput = document.getElementById('admin-new-pw-input');
  const newPw = newPwInput ? newPwInput.value : '';

  if (!newPw) {
    alert('Password cannot be empty.');
    return;
  }

  try {
    await firebaseCall('updatePassword', newPw);
    alert('Security password updated successfully across all devices.');
    if (newPwInput) newPwInput.value = '';
  } catch (err) {
    console.error('Failed to update password:', err);
    alert('Failed to update password: ' + err.message);
  }
};

window.saveCustomConfig = async function () {
  const apiKey = document.getElementById('admin-config-apikey').value.trim();
  const databaseURL = document.getElementById('admin-config-dburl').value.trim();
  const projectId = document.getElementById('admin-config-projectid').value.trim();
  const appId = document.getElementById('admin-config-appid').value.trim();

  if (!apiKey || !databaseURL || !projectId || !appId) {
    alert('Please fill out all 4 core Firebase config fields.');
    return;
  }

  const customConfig = {
    apiKey,
    databaseURL,
    projectId,
    appId,
    authDomain: `${projectId}.firebaseapp.com`,
    storageBucket: `${projectId}.firebasestorage.app`
  };

  if (!confirm('Are you sure you want to change the database config? This will sync to all devices.')) return;

  try {
    await firebaseCall('updateCustomConfig', customConfig);
    alert('Firebase configuration updated and registry synced successfully! Reloading...');
  } catch (err) {
    console.error('Failed to update custom config:', err);
    alert('Failed to update configuration: ' + err.message);
  }
};

window.resetCustomConfig = async function () {
  if (!confirm('Reset Firebase configuration to default? This will sync to all devices.')) return;

  try {
    await firebaseCall('resetCustomConfig');
    alert('Firebase configuration reset to default registry config! Reloading...');
  } catch (err) {
    console.error('Failed to reset config:', err);
    alert('Failed to reset config: ' + err.message);
  }
};

// ---------------------- Admin Team List Roster Controls ----------------------
function renderAdminTeamList() {
  const container = document.getElementById('admin-team-list');
  if (!container) return;

  container.innerHTML = '';
  const team = dbState.team || {};

  if (Object.keys(team).length === 0) {
    container.innerHTML = '<div style="color: var(--text-tertiary); font-size:0.85rem; font-family: var(--font-mono);">No team members in roster.</div>';
    return;
  }

  Object.keys(team).forEach(key => {
    const m = team[key];
    const div = document.createElement('div');
    div.className = 'admin-team-item';
    div.innerHTML = `
      <div class="admin-team-info">
        <h4>${m.name}</h4>
        <p>${m.role} (@${m.instagram})${m.pfp ? ' [has pfp]' : ''}</p>
      </div>
      <div class="admin-team-actions">
        <button class="edit" onclick="showEditTeamMemberForm('${key}')">Edit</button>
        <button class="delete" onclick="deleteTeamMember('${key}')">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderActivityLogs(logs) {
  const container = document.getElementById('admin-activity-logs');
  if (!container) return;

  container.innerHTML = '';
  const logArray = logs || dbState.activityLogs || [];

  if (logArray.length === 0) {
    container.innerHTML = '<div style="color: var(--text-tertiary); font-size:0.8rem; font-family: var(--font-mono);">No recent activities logged.</div>';
    return;
  }

  logArray.forEach(log => {
    const div = document.createElement('div');
    div.style.marginBottom = '6px';
    div.style.borderBottom = '1px solid rgba(255,255,255,0.02)';
    div.style.paddingBottom = '4px';
    div.innerHTML = `<span style="color: var(--neon-green); margin-right: 8px;">[${log.timestamp || ''}]</span> <span>${log.text || ''}</span>`;
    container.appendChild(div);
  });
}

window.showAddTeamMemberForm = function () {
  const form = document.getElementById('admin-team-form');
  const title = document.getElementById('team-form-title');
  if (form && title) {
    title.textContent = 'add team member';
    document.getElementById('team-member-key').value = '';
    document.getElementById('team-member-name').value = '';
    document.getElementById('team-member-role').value = '';
    document.getElementById('team-member-bio').value = '';
    document.getElementById('team-member-insta').value = '';
    document.getElementById('team-member-pfp').value = '';
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
  }
};

window.showEditTeamMemberForm = function (key) {
  const form = document.getElementById('admin-team-form');
  const title = document.getElementById('team-form-title');
  const m = dbState.team[key];

  if (form && title && m) {
    title.textContent = 'edit team member';
    document.getElementById('team-member-key').value = key;
    document.getElementById('team-member-name').value = m.name || '';
    document.getElementById('team-member-role').value = m.role || '';
    document.getElementById('team-member-bio').value = m.bio || '';
    document.getElementById('team-member-insta').value = m.instagram || '';
    document.getElementById('team-member-pfp').value = m.pfp || '';
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
  }
};

window.hideTeamMemberForm = function () {
  const form = document.getElementById('admin-team-form');
  if (form) form.style.display = 'none';
};

window.saveTeamMember = async function () {
  const keyInput = document.getElementById('team-member-key').value;
  const name = document.getElementById('team-member-name').value;
  const role = document.getElementById('team-member-role').value;
  const bio = document.getElementById('team-member-bio').value;
  const instagram = document.getElementById('team-member-insta').value;
  const pfp = document.getElementById('team-member-pfp').value.trim();

  if (!name || !role) {
    alert('Name and Role are required.');
    return;
  }

  // Generate safe key if new
  const key = keyInput || 'member_' + Date.now();

  // Generate initials and gradient dynamically
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const gradients = [
    "linear-gradient(135deg, rgba(0, 230, 118, 0.2) 0%, rgba(0, 176, 255, 0.2) 100%)",
    "linear-gradient(135deg, rgba(0, 176, 255, 0.2) 0%, rgba(200, 0, 255, 0.2) 100%)",
    "linear-gradient(135deg, rgba(200, 0, 255, 0.2) 0%, rgba(0, 230, 118, 0.2) 100%)"
  ];
  let code = 0;
  for (let i = 0; i < name.length; i++) {
    code += name.charCodeAt(i);
  }
  const gradient = gradients[code % gradients.length];

  const member = { name, role, bio, instagram, initials, gradient, pfp };

  try {
    await firebaseCall('setTeamMember', { key, member });
    hideTeamMemberForm();
  } catch (err) {
    console.error('Failed to save team member:', err);
    alert('Failed to save member: ' + err.message);
  }
};

window.deleteTeamMember = async function (key) {
  if (!confirm('Are you sure you want to delete this team member?')) return;

  try {
    await firebaseCall('deleteTeamMember', key);
  } catch (err) {
    console.error('Failed to delete team member:', err);
    alert('Failed to delete member: ' + err.message);
  }
};

// ---------------------- Password Eye Toggle ----------------------
window.togglePasscodeVisibility = function () {
  const input = document.getElementById('admin-pw-input');
  const btn = document.getElementById('admin-pw-toggle-btn');
  if (!input || !btn) return;

  const openIcon = btn.querySelector('.eye-open-icon');
  const closedIcon = btn.querySelector('.eye-closed-icon');

  if (input.type === 'password') {
    input.type = 'text';
    if (openIcon) openIcon.style.display = 'none';
    if (closedIcon) closedIcon.style.display = 'block';
  } else {
    input.type = 'password';
    if (openIcon) openIcon.style.display = 'block';
    if (closedIcon) closedIcon.style.display = 'none';
  }
};

window.updateThemeSettings = async function (themeValue) {
  applyThemeAccent(themeValue);
  try {
    await firebaseCall('updateThemeAccent', themeValue);
  } catch (err) {
    console.error('Failed to update theme settings:', err);
  }
};

function applyThemeAccent(theme) {
  const root = document.documentElement;
  
  const themes = {
    amber: {
      cyan: '#f59e0b',
      cyanGlow: 'rgba(245, 158, 11, 0.18)',
      violet: '#f97316',
      violetGlow: 'rgba(249, 115, 22, 0.15)',
      green: '#10b981',
      greenGlow: 'rgba(16, 185, 129, 0.15)'
    },
    lime: {
      cyan: '#10b981',
      cyanGlow: 'rgba(16, 185, 129, 0.18)',
      violet: '#84cc16',
      violetGlow: 'rgba(132, 204, 22, 0.15)',
      green: '#06b6d4',
      greenGlow: 'rgba(6, 182, 212, 0.15)'
    },
    violet: {
      cyan: '#8b5cf6',
      cyanGlow: 'rgba(139, 92, 246, 0.18)',
      violet: '#ec4899',
      violetGlow: 'rgba(236, 72, 153, 0.15)',
      green: '#f43f5e',
      greenGlow: 'rgba(244, 63, 94, 0.15)'
    },
    cyan: {
      cyan: '#3b82f6',
      cyanGlow: 'rgba(59, 130, 246, 0.18)',
      violet: '#0ea5e9',
      violetGlow: 'rgba(14, 165, 233, 0.15)',
      green: '#10b981',
      greenGlow: 'rgba(16, 185, 129, 0.15)'
    }
  };

  const selected = themes[theme] || themes.amber;
  root.style.setProperty('--neon-cyan', selected.cyan);
  root.style.setProperty('--neon-cyan-glow', selected.cyanGlow);
  root.style.setProperty('--neon-violet', selected.violet);
  root.style.setProperty('--neon-violet-glow', selected.violetGlow);
  root.style.setProperty('--neon-green', selected.green);
  root.style.setProperty('--neon-green-glow', selected.greenGlow);
  
  localStorage.setItem('zephyr_accent', theme);
  dbState.themeAccent = theme;

  document.querySelectorAll('.accent-color-btn').forEach(btn => {
    if (btn.getAttribute('data-accent') === theme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/* =========================================================================
   UI Redesign Interactions (Bento, Magnetic, Nav)
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Bento Panel Mouse Tracking
  const updateBentoMouse = (e) => {
    document.querySelectorAll('.bento-panel').forEach(panel => {
      const rect = panel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      panel.style.setProperty('--mouse-x', `${x}px`);
      panel.style.setProperty('--mouse-y', `${y}px`);
    });
  };
  window.addEventListener('mousemove', updateBentoMouse);

  // Magnetic Buttons
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate(0px, 0px)`;
    });
  });

  // Staggered Reveal Observer
  const bentoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('active');
        }, index * 100);
        bentoObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.bento-reveal').forEach(el => bentoObserver.observe(el));

  // Dynamic Floating Navbar
  const navPill = document.querySelector('.nav-pill');
  if (navPill) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navPill.style.padding = '10px 20px';
        navPill.style.background = 'rgba(10, 11, 28, 0.85)';
        navPill.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
      } else {
        navPill.style.padding = '14px 24px';
        navPill.style.background = 'rgba(10, 11, 28, 0.65)';
        navPill.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
      }
    });
  }
});

/* =========================================================================
   11. Tech Stack Announcement Ticker
   ========================================================================= */
function initTechTicker() {
  const tickerWrap = document.createElement('div');
  tickerWrap.className = 'tech-ticker-wrap';

  const techs = [
    { name: 'HTML5', logo: '<svg viewBox="0 0 24 24"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"/></svg>' },
    { name: 'CSS3', logo: '<svg viewBox="0 0 24 24"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z"/></svg>' },
    { name: 'JavaScript', logo: '<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/></svg>' },
    { name: 'Node.js', logo: '<svg viewBox="0 0 24 24"><path d="M12 24c-.3 0-.6-.1-.9-.2l-2.9-1.7c-.4-.2-.2-.3-.1-.4.6-.2.7-.3 1.3-.6.1 0 .2 0 .2.1l2.3 1.3c.1 0 .2 0 .3 0l8.8-5.1c.1-.1.1-.1.1-.2V6.9c0-.1-.1-.2-.1-.2L12.2 1.6c-.1 0-.2 0-.3 0L3.1 6.7c-.1 0-.2.1-.2.2v10.2c0 .1.1.2.1.2l2.4 1.4c1.3.7 2.1-.1 2.1-.9V7.8c0-.1.1-.3.3-.3h1.1c.1 0 .3.1.3.3v10c0 1.7-1 2.7-2.6 2.7-.5 0-.9 0-2-.6L2.3 18.7c-.6-.3-.9-1-.9-1.6V6.9c0-.7.4-1.3.9-1.6l8.8-5.1c.6-.3 1.3-.3 1.8 0l8.8 5.1c.6.3.9 1 .9 1.6v10.2c0 .7-.4 1.3-.9 1.6l-8.8 5.1c-.2.1-.5.2-.8.2z"/></svg>' },
    { name: 'Firebase', logo: '<svg viewBox="0 0 24 24"><path d="M3.9 15.8L2.1 5.4c-.1-.3.2-.5.5-.3l2 1.8 2.9 2.8-3.6 6.1zM21.2 12.3l-2.1-4.2-1.2-2.4c-.1-.3-.6-.3-.7 0L12.5 14.9 9.2 8.7c-.1-.3-.6-.3-.7 0L3.4 18.3c-.1.2 0 .5.3.4l13.8-1.5 3.7-4.4c.2-.2.2-.4 0-.5z"/></svg>' },
    { name: 'Gemini AI', logo: '<svg viewBox="0 0 24 24"><path d="M11 19.3Q12 21.5 12 24q0-2.5 1-4.7 1-2.2 2.6-3.8 1.6-1.6 3.8-2.6Q21.5 12 24 12q-2.5 0-4.7-1a12.3 12.3 0 0 1-3.8-2.6 12.3 12.3 0 0 1-2.6-3.8Q12 2.5 12 0q0 2.5-1 4.7-1 2.2-2.6 3.8a12.3 12.3 0 0 1-3.8 2.6Q2.5 12 0 12q2.5 0 4.7 1 2.2 1 3.8 2.6t2.6 3.8"/></svg>' },
    { name: 'Claude', logo: '<svg viewBox="0 0 24 24"><path d="M17.3 3.5h-3.7l6.7 16.9H24Zm-10.6 0L0 20.5h3.7l1.4-3.6h7l1.4 3.6h3.7L10.5 3.5ZM6.2 13.7l2.3-5.9 2.3 5.9Z"/></svg>' },
    { name: 'OpenAI', logo: '<svg viewBox="0 0 24 24"><path d="M22.2 10.8c-.1-1.1-.5-2.1-1.1-3.1a5.3 5.3 0 0 0-3.3-2.1 5.3 5.3 0 0 0-4.6 1.4L12 9.1l-1.2-2c-.9-1.5-2.4-2.4-4-2.4-.2 0-.4 0-.6.1a5.3 5.3 0 0 0-3.3 2.1c-.9 1-1.3 2.1-1.1 3.1a5.3 5.3 0 0 0 1.5 3.9L5.4 16.3l1.2 2a5.2 5.2 0 0 0 3.9 1.6c.2 0 .4 0 .6-.1a5.3 5.3 0 0 0 3.3-2.1c.9-1 1.3-2.1 1.1-3.1a5.3 5.3 0 0 0-1.5-3.9l-2-1.2-1.2-2c0-.1-.1-.1-.2-.2a.4.4 0 0 0-.4 0c0 .1-.1.1-.2.2L12 7l-1.2 2a.4.4 0 0 0 0 .4c0 .1.1.1.2.2a.4.4 0 0 0 .4 0c.1 0 .1-.1.2-.2l1.2-2 2 1.2a5.3 5.3 0 0 0 1.6 3.9 5.3 5.3 0 0 0-1.1 3.2 5.3 5.3 0 0 0-3.3 2.1c-.2.1-.4.1-.6.1a5.2 5.2 0 0 0-3.9-1.6l-1.2-2-2-1.2a5.3 5.3 0 0 0-1.6-3.9c.2 1 .6 2.1 1.1 3.1a5.3 5.3 0 0 0 3.3 2.1c.2 0 .4.1.6.1a5.2 5.2 0 0 0 3.9-1.6l1.2-2 1.2-2a5.2 5.2 0 0 0 3.9 1.6c.2 0 .4 0 .6-.1a5.3 5.3 0 0 0 3.3-2.1c.9-1 1.3-2.1 1.1-3.1a5.3 5.3 0 0 0-1.5-3.9l-2-1.2-1.2-2a5.2 5.2 0 0 0-3.9-1.6c-.2 0-.4 0-.6.1a5.3 5.3 0 0 0-3.3 2.1c-.9 1-1.3 2.1-1.1 3.1a5.3 5.3 0 0 0 1.5 3.9l2 1.2z"/></svg>' },
    { name: 'Vercel', logo: '<svg viewBox="0 0 24 24"><path d="M24 22.5H0L12 1.5l12 21z"/></svg>' },
    { name: 'Tailwind CSS', logo: '<svg viewBox="0 0 24 24"><path d="M12 6.036c-2.402 0-3.602 1.201-3.602 3.602 0 2.402 1.2 3.602 3.602 3.602 2.4 0 3.6-1.2 3.6-3.602 0-2.401-1.2-3.602-3.6-3.602zM6 12.036c-2.4 0-3.6 1.201-3.6 3.602 0 2.402 1.2 3.602 3.602 3.602 2.4 0 3.6-1.2 3.6-3.602 0-2.401-1.2-3.602-3.6-3.602z"/></svg>' }
  ];

  const repeated = [...techs, ...techs];
  const listItems = repeated.map(tech => `<span>${tech.logo}${tech.name}</span>`).join('<span class="ticker-dot"></span>');

  tickerWrap.innerHTML = `
    <div class="tech-ticker-content">
      ${listItems}
    </div>
  `;

  const footer = document.querySelector('footer');
  if (footer) {
    footer.parentNode.insertBefore(tickerWrap, footer);
  } else {
    document.body.appendChild(tickerWrap);
  }
}

/* =========================================================================
   12. Interactive Mock Chatbot
   ========================================================================= */
function initChatbot() {
  const chatbotContainer = document.createElement('div');
  chatbotContainer.className = 'chatbot-widget-container';

  chatbotContainer.innerHTML = `
    <!-- Trigger Button -->
    <div class="chatbot-trigger" id="chat-trigger">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    </div>

    <!-- Chat window -->
    <div class="chatbot-window" id="chat-window">
      <div class="chatbot-header">
        <div class="chatbot-profile">
          <div class="chatbot-avatar">Z</div>
          <div class="chatbot-info">
            <h4>Zephyr Assistant</h4>
            <div class="chatbot-status">Online</div>
          </div>
        </div>
        <button class="chatbot-close" id="chat-close">&times;</button>
      </div>

      <div class="chatbot-messages" id="chat-messages-area">
        <div class="chat-msg bot">
          Hey there! 👋 I am the Zephyr assistant. How can I help you build your next project today?
        </div>
      </div>

      <div class="chatbot-suggestions">
        <p>Quick Questions</p>
        <button class="chat-suggest-btn" data-key="starter">Tell me about the Starter Plan (₹1,999/yr)</button>
        <button class="chat-suggest-btn" data-key="pro">Tell me about the Pro Plan (₹2,999/yr)</button>
        <button class="chat-suggest-btn" data-key="enterprise">Tell me about the Enterprise Plan (₹4,999/yr)</button>
        <button class="chat-suggest-btn" data-key="contact">How do I start a project?</button>
      </div>

      <div class="chatbot-input-area">
        <input type="text" class="chatbot-input" id="chat-user-input" placeholder="Type a message...">
        <button class="chatbot-send" id="chat-send-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(chatbotContainer);

  const trigger = document.getElementById('chat-trigger');
  const windowEl = document.getElementById('chat-window');
  const closeBtn = document.getElementById('chat-close');
  const messagesArea = document.getElementById('chat-messages-area');
  const suggestBtns = chatbotContainer.querySelectorAll('.chat-suggest-btn');
  const userInput = document.getElementById('chat-user-input');
  const sendBtn = document.getElementById('chat-send-btn');

  // Toggle open
  trigger.addEventListener('click', () => {
    windowEl.classList.toggle('open');
  });

  // Close
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    windowEl.classList.remove('open');
  });

  const responses = {
    starter: "Our **Starter plan (₹1,999/yr)** is designed for fast, high-performance static websites. It includes premium templates, responsive layout, hosting setup, and essential SEO integration.",
    pro: "Our **Pro plan (₹2,999/yr)** offers dynamic multi-page custom websites. It includes database connections, interactive components, customized forms, and advanced SEO optimization.",
    enterprise: "Our **Enterprise plan (₹4,999/yr)** is a fully tailored solution featuring complex databases, admin dashboards, and custom dual-LLM systems utilizing Google Gemini and Claude APIs.",
    contact: "To start a project, simply go to the **Start Project** page in the navbar, select a plan, input your phone number, and submit. We'll get in touch with you shortly!"
  };

  function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;
    msg.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    messagesArea.appendChild(msg);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function handleBotResponse(key) {
    // Show loading state
    const loader = document.createElement('div');
    loader.className = 'chat-msg bot typing-indicator';
    loader.innerText = 'typing...';
    messagesArea.appendChild(loader);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    setTimeout(() => {
      messagesArea.removeChild(loader);
      const text = responses[key] || "Thanks for messaging! I'm an automated assistant. For custom queries, please reach out to **zephyrdevsofficial@gmail.com** or select one of the quick options above! 🚀";
      appendMessage(text, 'bot');
    }, 1000);
  }

  suggestBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const text = btn.innerText;
      appendMessage(text, 'user');
      handleBotResponse(key);
    });
  });

  function sendUserMsg() {
    const val = userInput.value.trim();
    if (!val) return;
    appendMessage(val, 'user');
    userInput.value = '';
    handleBotResponse('custom');
  }

  sendBtn.addEventListener('click', sendUserMsg);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendUserMsg();
    }
  });
}

/* =========================================================================
   13. Theme Switcher (Light/Dark Toggle)
   ========================================================================= */
function initThemeToggle() {
  const navPill = document.querySelector('.nav-pill');
  if (!navPill) return;

  const btn = document.createElement('button');
  btn.id = 'theme-toggle-btn';
  btn.className = 'theme-toggle-btn';
  btn.setAttribute('aria-label', 'Toggle light/dark theme');
  btn.innerHTML = `
    <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M6.34 17.66l-1.41 1.41"></path><path d="M19.07 4.93l-1.41 1.41"></path></svg>
    <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
  `;

  const ctaBtn = navPill.querySelector('.nav-cta-btn') || navPill.querySelector('.nav-burger');
  if (ctaBtn) {
    navPill.insertBefore(btn, ctaBtn);
  } else {
    navPill.appendChild(btn);
  }

  const currentTheme = localStorage.getItem('theme') || 'dark';
  if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
    btn.querySelector('.sun-icon').style.display = 'none';
    btn.querySelector('.moon-icon').style.display = 'block';
  }

  btn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    if (isLight) {
      btn.querySelector('.sun-icon').style.display = 'none';
      btn.querySelector('.moon-icon').style.display = 'block';
    } else {
      btn.querySelector('.sun-icon').style.display = 'block';
      btn.querySelector('.moon-icon').style.display = 'none';
    }
  });
}

/* =========================================================================
   14. Live Website Preview Modal
   ========================================================================= */
function initLivePreviewModal() {
  if (document.getElementById('live-preview-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'live-preview-modal';
  modal.className = 'preview-modal';
  modal.innerHTML = `
    <div class="preview-modal-container">
      <div class="preview-modal-header">
        <div class="mac-controls">
          <span class="mac-dot close-preview" style="background:#ff5f56; width:12px; height:12px; border-radius:50%; display:inline-block; cursor:pointer;" id="preview-mac-close"></span>
          <span class="mac-dot minimize-preview" style="background:#ffbd2e; width:12px; height:12px; border-radius:50%; display:inline-block; margin-left:4px;"></span>
          <span class="mac-dot maximize-preview" style="background:#27c93f; width:12px; height:12px; border-radius:50%; display:inline-block; margin-left:4px;"></span>
        </div>
        <div class="preview-address-bar">
          <span class="preview-secure-lock">🔒</span>
          <span id="preview-url-text">https://rajdarbars.vercel.app</span>
        </div>
        <button class="preview-tab-btn" id="preview-external-btn" title="Open in new tab">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </button>
        <button class="preview-modal-close" id="preview-close-btn">&times;</button>
      </div>
      <div class="preview-modal-body">
        <div class="preview-loader" id="preview-loader-el">
          <svg class="loader-spinner" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--neon-cyan);"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
          <span style="margin-top: 8px;">Loading live website preview...</span>
        </div>
        <iframe id="preview-iframe" src="" frameborder="0"></iframe>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = document.getElementById('preview-close-btn');
  const macClose = document.getElementById('preview-mac-close');
  const iframe = document.getElementById('preview-iframe');
  const loader = document.getElementById('preview-loader-el');

  function closeModal() {
    modal.classList.remove('open');
    iframe.src = '';
  }

  closeBtn.addEventListener('click', closeModal);
  macClose.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  iframe.addEventListener('load', () => {
    loader.style.opacity = 0;
    setTimeout(() => {
      loader.style.display = 'none';
    }, 300);
  });
}

function openLivePreview(url, title, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const modal = document.getElementById('live-preview-modal');
  const iframe = document.getElementById('preview-iframe');
  const loader = document.getElementById('preview-loader-el');
  const urlText = document.getElementById('preview-url-text');
  const externalBtn = document.getElementById('preview-external-btn');

  if (!modal || !iframe) return;

  urlText.textContent = url.replace('https://', '');
  externalBtn.onclick = () => {
    window.open(url, '_blank');
  };

  if (loader) {
    loader.style.display = 'flex';
    loader.style.opacity = 1;
  }

  iframe.src = url;
  modal.classList.add('open');
}

/* =========================================================================
   15. Email Privacy Protection (Obfuscation)
   ========================================================================= */
function initEmailObfuscation() {
  const elements = document.querySelectorAll('.obfuscated-email');
  elements.forEach(el => {
    const user = el.getAttribute('data-user') || 'zephyrdevsofficial';
    const domain = el.getAttribute('data-domain') || 'gmail.com';
    const email = `${user}@${domain}`;
    
    if (el.tagName === 'A') {
      el.href = `mailto:${email}`;
      if (!el.textContent.trim()) {
        el.textContent = email;
      }
    } else {
      el.textContent = email;
    }
  });
}


// ---------------------- Live Analytics Tracker & Manual Lead Manager ----------------------

// 1. Live Page View Tracker (Runs automatically on load)
(function trackLiveViews() {
  let stats = localStorage.getItem('zephyr_analytics');
  if (stats) {
    stats = JSON.parse(stats);
  } else {
    stats = {
      visitors: 1248,
      pageviews: 4892,
      weeklyData: [420, 580, 490, 680, 810, 740, 930]
    };
  }
  
  // Accumulate views
  stats.pageviews += 1;
  
  // Check if unique visitor session
  if (!sessionStorage.getItem('zephyr_visitor_tracked')) {
    stats.visitors += 1;
    sessionStorage.setItem('zephyr_visitor_tracked', 'true');
  }
  
  dbState.analytics = stats;
  localStorage.setItem('zephyr_analytics', JSON.stringify(stats));
})();

// 2. Live simulated traffic increments (Runs when dashboard is open)
window.startLiveAnalyticsSimulation = function() {
  if (window.liveAnalyticsInterval) clearInterval(window.liveAnalyticsInterval);
  
  window.liveAnalyticsInterval = setInterval(() => {
    if (!dbState.analytics) return;
    
    // Add pageviews (1-3)
    dbState.analytics.pageviews += Math.floor(Math.random() * 3) + 1;
    
    // Add visitor with 35% probability
    if (Math.random() > 0.65) {
      dbState.analytics.visitors += 1;
    }
    
    // Add traffic to the current week data index (last index)
    const lastIdx = dbState.analytics.weeklyData.length - 1;
    dbState.analytics.weeklyData[lastIdx] += Math.floor(Math.random() * 3) + 1;
    
    // Persist
    localStorage.setItem('zephyr_analytics', JSON.stringify(dbState.analytics));
    
    // Re-render if Analytics tab is active
    const tab = document.getElementById('tab-analytics');
    if (tab && tab.classList.contains('active')) {
      renderAdminAnalytics();
    }
  }, 8000);
};

// 3. Toggle Add Lead manual overlay form
window.toggleAddLeadForm = function(show) {
  const form = document.getElementById('admin-add-lead-overlay');
  if (!form) return;
  
  if (show) {
    form.style.display = 'block';
    
    // Clear inputs
    document.getElementById('lead-form-name').value = '';
    document.getElementById('lead-form-email').value = '';
    document.getElementById('lead-form-phone').value = '';
    document.getElementById('lead-form-company').value = '';
    document.getElementById('lead-form-plan').value = 'Starter (₹1,999/yr)';
    document.getElementById('lead-form-desc').value = '';
    
    // Reset checkboxes
    document.querySelectorAll('input[name="lead-form-addons"]').forEach(cb => cb.checked = false);
    
    // Calculate initial budget
    calculateFormBudget();
    
    document.getElementById('lead-form-name').focus();
  } else {
    form.style.display = 'none';
  }
};

// 4. Calculate manual lead budget dynamically
window.calculateFormBudget = function() {
  const plan = document.getElementById('lead-form-plan').value;
  let basePrice = 1999;
  if (plan.includes('3,999')) basePrice = 3999;
  if (plan.includes('Enterprise')) basePrice = 15000;
  
  let addonPrice = 0;
  document.querySelectorAll('input[name="lead-form-addons"]:checked').forEach(() => {
    addonPrice += 1000;
  });
  
  const budgetInput = document.getElementById('lead-form-budget');
  if (budgetInput) {
    budgetInput.value = '₹' + (basePrice + addonPrice).toLocaleString();
  }
};

// 5. Save manual lead entry
window.saveManualLead = function() {
  const name = document.getElementById('lead-form-name').value.trim();
  const email = document.getElementById('lead-form-email').value.trim();
  const phone = document.getElementById('lead-form-phone').value.trim();
  const company = document.getElementById('lead-form-company').value.trim() || 'N/A';
  const plan = document.getElementById('lead-form-plan').value;
  const budget = document.getElementById('lead-form-budget').value.trim() || '₹1,999';
  const desc = document.getElementById('lead-form-desc').value.trim() || 'Manually added lead';
  
  if (!name || !email || !phone) {
    alert('Please fill out all required fields (*)');
    return;
  }
  
  const addonsSelected = [];
  document.querySelectorAll('input[name="lead-form-addons"]:checked').forEach(cb => {
    if (cb.value === 'SEO') addonsSelected.push('Advanced SEO Setup');
    if (cb.value === 'Chatbot') addonsSelected.push('AI Chatbot Integration');
    if (cb.value === 'Branding') addonsSelected.push('Brand Identity Kit');
  });
  
  const newLead = {
    id: 'lead_' + Math.random().toString(36).substring(2, 9),
    date: new Date().toISOString().split('T')[0],
    name: name,
    email: email,
    phone: phone,
    company: company,
    plan: plan,
    budget: budget,
    addons: addonsSelected.join(', ') || 'None',
    description: desc,
    status: 'New'
  };
  
  if (!dbState.leads) dbState.leads = [];
  dbState.leads.unshift(newLead);
  
  // Persist
  localStorage.setItem('zephyr_leads', JSON.stringify(dbState.leads));
  
  // Close form overlay
  toggleAddLeadForm(false);
  
  // Refresh view
  renderAdminLeadsList();
  
  // Try sync with Firebase
  firebaseCall('saveLead', newLead).catch(err => console.warn(err));
  alert('Inquiry added successfully!');
};

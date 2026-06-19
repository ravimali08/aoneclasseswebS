document.addEventListener('DOMContentLoaded', () => {
  // === 1. Sticky Header & Active Link Tracking ===
  const header = document.querySelector('.header');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.remove('header-transparent');
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
      header.classList.add('header-transparent');
    }
  };

  // Run on load and scroll
  handleScroll();
  window.addEventListener('scroll', handleScroll);

  // Set active class based on current HTML file path
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === 'index.html' && href === './')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // === 2. Mobile Nav Menu Drawer ===
  const menuBtn = document.querySelector('.menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile nav when clicking a link
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // === 3. Scroll Reveal Animations (Intersection Observer) ===
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Once revealed, no need to track it anymore
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // === 4. Counter / Count-Up Animation ===
  const counterElements = document.querySelectorAll('.counter-val');
  
  const animateCounter = (element) => {
    const target = parseInt(element.getAttribute('data-count'), 10);
    const suffix = element.getAttribute('data-suffix') || '';
    let current = 0;
    const duration = 2000; // 2 seconds
    const stepTime = Math.max(Math.floor(duration / target), 15);
    
    const timer = setInterval(() => {
      current += Math.ceil(target / (duration / stepTime));
      if (current >= target) {
        element.textContent = target + suffix;
        clearInterval(timer);
      } else {
        element.textContent = current + suffix;
      }
    }, stepTime);
  };

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterElements.forEach(el => counterObserver.observe(el));

  // === 5. FAQ Accordion Mechanism ===
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    if (question && answer) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all other FAQs first (Accordion Style)
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-answer').style.maxHeight = null;
          }
        });
        
        // Toggle current FAQ
        if (isActive) {
          item.classList.remove('active');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('active');
          // Set max-height dynamically to content height
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });

  // === 6. Premium Contact Form Handling ===
  const contactForm = document.getElementById('contactForm');
  const formContent = document.getElementById('formContent');
  const successMessage = document.getElementById('successMessage');

  if (contactForm && formContent && successMessage) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Basic client-side validation check
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const course = document.getElementById('course').value;
      const message = document.getElementById('message').value.trim();
      
      if (!name || !phone) {
        alert('Please fill in your name and phone number.');
        return;
      }

      // Format custom success output message details
      const userNameSpan = document.getElementById('successUserName');
      if (userNameSpan) {
        userNameSpan.textContent = name;
      }

      // Animate transition to success screen
      formContent.style.transition = 'opacity 300ms ease';
      formContent.style.opacity = '0';
      
      setTimeout(() => {
        formContent.style.display = 'none';
        successMessage.style.display = 'block';
        successMessage.style.opacity = '0';
        successMessage.style.transition = 'opacity 500ms ease';
        
        setTimeout(() => {
          successMessage.style.opacity = '1';
        }, 50);
      }, 300);

      // Prefill WhatsApp link button inside success window
      const whatsappCTA = document.getElementById('successWhatsappCTA');
      if (whatsappCTA) {
        const text = encodeURIComponent(
          `Hello AONE Classes! I want to enroll/inquire.\n\n` +
          `*Name:* ${name}\n` +
          `*Phone:* ${phone}\n` +
          `*Course:* ${course}\n` +
          `*Inquiry:* ${message}`
        );
        whatsappCTA.setAttribute('href', `https://wa.me/+919909525195?text=${text}`); 
        // Note: Number format: country code (91 for India) + 10 digit number
      }
    });
  }

  // === 7. About Section Testimonial Carousel ===
  const aboutSlides = document.querySelectorAll('.about-slide');
  const aboutDots = document.querySelectorAll('.about-carousel-dot');
  let aboutCurrentSlide = 0;
  let aboutInterval;

  const showAboutSlide = (index) => {
    if (!aboutSlides.length) return;
    aboutSlides.forEach((slide, i) => {
      slide.classList.remove('active');
      if (aboutDots[i]) aboutDots[i].classList.remove('active');
    });
    aboutCurrentSlide = index;
    aboutSlides[aboutCurrentSlide].classList.add('active');
    if (aboutDots[aboutCurrentSlide]) aboutDots[aboutCurrentSlide].classList.add('active');
  };

  const nextAboutSlide = () => {
    let nextIndex = (aboutCurrentSlide + 1) % aboutSlides.length;
    showAboutSlide(nextIndex);
  };

  const startAboutInterval = () => {
    aboutInterval = setInterval(nextAboutSlide, 4500);
  };

  const prevBtn = document.querySelector('.about-carousel-arrow.prev');
  const nextBtn = document.querySelector('.about-carousel-arrow.next');

  if (aboutSlides.length) {
    aboutDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(aboutInterval);
        showAboutSlide(i);
        startAboutInterval();
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        clearInterval(aboutInterval);
        let prevIndex = (aboutCurrentSlide - 1 + aboutSlides.length) % aboutSlides.length;
        showAboutSlide(prevIndex);
        startAboutInterval();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        clearInterval(aboutInterval);
        nextAboutSlide();
        startAboutInterval();
      });
    }
    
    showAboutSlide(0);
    startAboutInterval();
  }

  // === 7. Theme Toggle (Light / Dark Mode) ===
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeToggleIcon = document.getElementById('themeToggleIcon');
  
  const updateThemeUI = (isLight) => {
    if (isLight) {
      document.documentElement.classList.add('light-mode');
      if (themeToggleIcon) {
        themeToggleIcon.className = 'fa-solid fa-moon';
      }
    } else {
      document.documentElement.classList.remove('light-mode');
      if (themeToggleIcon) {
        themeToggleIcon.className = 'fa-solid fa-sun';
      }
    }
  };

  // Check localStorage on load
  const isLightMode = localStorage.getItem('theme') === 'light';
  updateThemeUI(isLightMode);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentIsLight = document.documentElement.classList.contains('light-mode');
      const nextIsLight = !currentIsLight;
      localStorage.setItem('theme', nextIsLight ? 'light' : 'dark');
      updateThemeUI(nextIsLight);
    });
  }
});


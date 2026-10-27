/**
 * Charivo Animal Welfare Donation Platform - Main Scripts
 * Handles:
 * 1. 5-Image Hero Slider
 * 2. Automatic Left-Sliding Causes Carousel (4th Screenshot)
 * 3. Mobile Menu Toggle
 * 4. Search Modal & Donation Modal
 * 5. Back To Top Smooth Scroll
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. HERO IMAGE SLIDER (5 Slides)
  // ==========================================
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.querySelector('.slider-prev');
  const nextBtn = document.querySelector('.slider-next');
  const sliderTrack = document.querySelector('.hero-slider-track');
  
  let currentSlide = 0;
  const totalSlides = slides.length;
  let slideInterval = null;
  const autoPlayDelay = 5500; // 5.5s per slide

  function showSlide(index) {
    if (index >= totalSlides) {
      currentSlide = 0;
    } else if (index < 0) {
      currentSlide = totalSlides - 1;
    } else {
      currentSlide = index;
    }

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    slideInterval = setInterval(nextSlide, autoPlayDelay);
  }

  function stopAutoplay() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoplay();
    });

    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoplay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      startAutoplay();
    });
  });

  if (sliderTrack) {
    sliderTrack.addEventListener('mouseenter', stopAutoplay);
    sliderTrack.addEventListener('mouseleave', startAutoplay);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
      startAutoplay();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
      startAutoplay();
    }
  });

  startAutoplay();

  // ==========================================
  // 2. AUTOMATIC LEFT-SLIDING CAUSES CAROUSEL
  // ==========================================
  const carouselTrack = document.querySelector('.causes-carousel-track');
  const carouselWrapper = document.querySelector('.causes-carousel-wrapper');
  const carouselPrev = document.querySelector('.carousel-btn-prev');
  const carouselNext = document.querySelector('.carousel-btn-next');

  if (carouselTrack && carouselWrapper) {
    let cardIndex = 0;
    let carouselTimer = null;
    const cardGap = 28;

    function getCardWidth() {
      const firstCard = carouselTrack.querySelector('.cause-item-card');
      return firstCard ? firstCard.getBoundingClientRect().width + cardGap : 328;
    }

    function getMaxIndex() {
      const cards = carouselTrack.querySelectorAll('.cause-item-card');
      const visibleCount = Math.floor(carouselWrapper.clientWidth / getCardWidth()) || 1;
      return Math.max(0, cards.length - visibleCount);
    }

    function updateCarousel() {
      const maxIdx = getMaxIndex();
      if (cardIndex > maxIdx) {
        cardIndex = 0; // Loop back to start smoothly
      } else if (cardIndex < 0) {
        cardIndex = maxIdx;
      }
      const offset = -(cardIndex * getCardWidth());
      carouselTrack.style.transform = `translateX(${offset}px)`;
    }

    function slideNext() {
      const maxIdx = getMaxIndex();
      if (cardIndex >= maxIdx) {
        cardIndex = 0;
      } else {
        cardIndex++;
      }
      updateCarousel();
    }

    function slidePrev() {
      const maxIdx = getMaxIndex();
      if (cardIndex <= 0) {
        cardIndex = maxIdx;
      } else {
        cardIndex--;
      }
      updateCarousel();
    }

    function startCausesAutoplay() {
      stopCausesAutoplay();
      carouselTimer = setInterval(slideNext, 3800); // Automatically slides to the left every 3.8s
    }

    function stopCausesAutoplay() {
      if (carouselTimer) {
        clearInterval(carouselTimer);
        carouselTimer = null;
      }
    }

    if (carouselNext) {
      carouselNext.addEventListener('click', () => {
        slideNext();
        startCausesAutoplay();
      });
    }

    if (carouselPrev) {
      carouselPrev.addEventListener('click', () => {
        slidePrev();
        startCausesAutoplay();
      });
    }

    // Pause sliding on hover so user can easily read or click "Donate Now"
    carouselWrapper.addEventListener('mouseenter', stopCausesAutoplay);
    carouselWrapper.addEventListener('mouseleave', startCausesAutoplay);

    // Recalculate on window resize
    window.addEventListener('resize', updateCarousel);

    // Start auto-slider
    startCausesAutoplay();
  }

  // ==========================================
  // 3. MOBILE MENU TOGGLE (Enhanced Responsive Touch Handling & Background Scroll Lock)
  // ==========================================
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    // Ensure backdrop element exists for backdrop click & back screen dimming
    let navBackdrop = document.querySelector('.mobile-nav-backdrop');
    if (!navBackdrop) {
      navBackdrop = document.createElement('div');
      navBackdrop.className = 'mobile-nav-backdrop';
      navBackdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(navBackdrop);
    }

    // Touch & wheel handling to allow hamburger menu scrolling while locking background screen
    let touchStartY = 0;
    navMenu.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    function preventBackTouchMove(e) {
      // If touch is NOT inside navMenu, prevent background scrolling
      if (!navMenu.contains(e.target)) {
        e.preventDefault();
        return;
      }

      // If touch is inside navMenu, allow scrolling inside navMenu
      if (e.touches && e.touches[0]) {
        const currentY = e.touches[0].clientY;
        const isScrollingDown = currentY < touchStartY;
        const isScrollingUp = currentY > touchStartY;
        const isAtTop = navMenu.scrollTop <= 0;
        const isAtBottom = navMenu.scrollTop + navMenu.clientHeight >= navMenu.scrollHeight - 1;

        if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
          e.preventDefault();
        }
      }
    }

    function preventBackWheel(e) {
      if (!navMenu.contains(e.target)) {
        e.preventDefault();
        return;
      }

      const isAtTop = navMenu.scrollTop <= 0;
      const isAtBottom = navMenu.scrollTop + navMenu.clientHeight >= navMenu.scrollHeight - 1;
      if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
        e.preventDefault();
      }
    }

    function toggleMobileMenu(openState) {
      const willOpen = typeof openState === 'boolean' ? openState : !navMenu.classList.contains('open');
      navMenu.classList.toggle('open', willOpen);
      mobileToggle.classList.toggle('active', willOpen);
      mobileToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      mobileToggle.innerHTML = willOpen ? '&times;' : '&#9776;';

      if (willOpen) {
        // Lock back screen scrolling completely
        document.body.classList.add('nav-menu-open');
        document.documentElement.classList.add('nav-menu-open');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        if (navBackdrop) navBackdrop.classList.add('active');

        // Prevent touch drag & mousewheel scrolling on background, allow in navMenu
        document.addEventListener('touchmove', preventBackTouchMove, { passive: false });
        document.addEventListener('wheel', preventBackWheel, { passive: false });
      } else {
        // Restore normal page scrolling
        document.body.classList.remove('nav-menu-open');
        document.documentElement.classList.remove('nav-menu-open');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        if (navBackdrop) navBackdrop.classList.remove('active');

        // Clean up event listeners
        document.removeEventListener('touchmove', preventBackTouchMove);
        document.removeEventListener('wheel', preventBackWheel);
      }
    }

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });

    // Close on clicking backdrop
    if (navBackdrop) {
      navBackdrop.addEventListener('click', () => {
        toggleMobileMenu(false);
      });
    }

    // Close on clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        toggleMobileMenu(false);
      }
    });

    // Close on clicking any nav link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        toggleMobileMenu(false);
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        toggleMobileMenu(false);
      }
    });

    // Automatically close mobile menu and restore scrolling when resizing to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860 && navMenu.classList.contains('open')) {
        toggleMobileMenu(false);
      }
    });
  }

  // ==========================================
  // 4. SEARCH MODAL LOGIC
  // ==========================================
  const searchModal = document.getElementById('searchModal');
  const searchTrigger = document.querySelector('.btn-search');
  const closeBtns = document.querySelectorAll('.modal-close-btn');

  function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  if (searchTrigger && searchModal) {
    searchTrigger.addEventListener('click', () => {
      searchModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      const input = searchModal.querySelector('input');
      if (input) setTimeout(() => input.focus(), 100);
    });
  }

  const cartBtn = document.querySelector('.btn-cart');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      alert('🛒 Shopping Cart: 2 rescue kits in cart.');
    });
  }

  const gridBtn = document.querySelector('.btn-grid-dots');
  if (gridBtn) {
    gridBtn.addEventListener('click', () => {
      alert('🐾 Quick Access: 24/7 Rescue Dispatch, Pet Food Bank, & Wildlife Sanctuary.');
    });
  }

  // ==========================================
  // 5. DONATION MODAL LOGIC
  //    Donation buttons → redirect to 404.html
  //    (Modal disabled as per site requirement)
  // ==========================================
  const donateModal = document.getElementById('donationModal');
  const donateTriggers = document.querySelectorAll('.trigger-donate-modal');
  const modalAmountDisplay = document.getElementById('modalSelectedAmount');
  const modalTierChoices = document.querySelectorAll('.tier-choice');
  const confirmDonationBtn = document.getElementById('confirmDonationBtn');

  // Redirect all donate triggers to 404 instead of opening the modal
  donateTriggers.forEach(btn => {
    // Skip if login button/link
    if (btn.classList.contains('btn-login-nav') || btn.closest('a[href*="login"]')) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      window.location.href = '404.html';
    });
  });

  // Ensure header Login button redirects to login.html
  const loginNavButtons = document.querySelectorAll('.btn-login-nav');
  loginNavButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = 'login.html';
    });
  });

  // Also redirect the confirm button inside the modal (in case modal is somehow open)
  if (confirmDonationBtn) {
    confirmDonationBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '404.html';
    });
  }

  // Keep modal fully hidden — ensure it never opens
  if (donateModal) {
    donateModal.classList.remove('active');
    donateModal.style.display = 'none';
    donateModal.style.pointerEvents = 'none';
  }

  closeBtns.forEach(btn => {
    btn.addEventListener('click', closeModals);
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModals();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModals();
  });

  // ==========================================
  // 6. BACK TO TOP BUTTON
  // ==========================================
  const backToTopBtn = document.querySelector('.back-to-top-btn');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.style.opacity = '1';
        backToTopBtn.style.visibility = 'visible';
      } else {
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.visibility = 'hidden';
      }
    });

    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================
  // 7. STATISTICS COUNTER ANIMATION
  // ==========================================
  const statsSection = document.querySelector('.stats-counter-section');
  if (statsSection && 'IntersectionObserver' in window) {
    let animated = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          const statEls = statsSection.querySelectorAll('.stat-number');
          statEls.forEach(el => {
            el.style.transform = 'scale(1.05)';
            el.style.transition = 'transform 0.4s ease';
            setTimeout(() => {
              el.style.transform = 'scale(1)';
            }, 400);
          });
        }
      });
    }, { threshold: 0.3 });
    observer.observe(statsSection);
  }

  // ==========================================
  // 8. EVENTS SCHEDULE TABS INTERACTION
  // ==========================================
  const eventTabs = document.querySelectorAll('.event-tab-item');
  if (eventTabs.length > 0) {
    eventTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        eventTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      });
    });
  }

  // ==========================================
  // 9. TESTIMONIAL SLIDER (Big Card, Up/Down Nav)
  // ==========================================
  const testiSlides = document.querySelectorAll('.testi-slide');
  const testiPrevBtn = document.getElementById('testiPrev');
  const testiNextBtn = document.getElementById('testiNext');
  const testiCounterCurrent = document.querySelector('#testiCounter .counter-current');
  const testiCounterTotal = document.querySelector('#testiCounter .counter-total');

  if (testiSlides.length > 0 && testiPrevBtn && testiNextBtn) {
    let currentTesti = 0;
    const totalTesti = testiSlides.length;

    // Update total count
    if (testiCounterTotal) testiCounterTotal.textContent = totalTesti;

    function showTesti(index) {
      // Clamp index
      if (index < 0) index = totalTesti - 1;
      if (index >= totalTesti) index = 0;

      // Hide all, show target
      testiSlides.forEach(slide => slide.classList.remove('active'));
      testiSlides[index].classList.add('active');
      currentTesti = index;

      // Update counter
      if (testiCounterCurrent) testiCounterCurrent.textContent = currentTesti + 1;
    }

    testiPrevBtn.addEventListener('click', () => showTesti(currentTesti - 1));
    testiNextBtn.addEventListener('click', () => showTesti(currentTesti + 1));

    // Optional: Auto-advance every 6 seconds
    let testiAutoInterval = setInterval(() => showTesti(currentTesti + 1), 6000);

    // Pause auto-advance on hover
    const testiSection = document.querySelector('.testi-slider-section');
    if (testiSection) {
      testiSection.addEventListener('mouseenter', () => clearInterval(testiAutoInterval));
      testiSection.addEventListener('mouseleave', () => {
        testiAutoInterval = setInterval(() => showTesti(currentTesti + 1), 6000);
      });
    }

    // Keyboard navigation support
    document.addEventListener('keydown', (e) => {
      const activeEl = document.activeElement;
      if (activeEl === testiPrevBtn || activeEl === testiNextBtn) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          showTesti(currentTesti - 1);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          showTesti(currentTesti + 1);
        }
      }
    });
  }

  // ==========================================
  // 9. NATIVE SCROLL ANIMATION ENGINE (Zero GSAP - Pure IntersectionObserver)
  // Left side contents come from left, right side contents from right
  // ==========================================
  function initScrollAnimations() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Enable animation CSS
    document.documentElement.classList.add('js-scroll-anim');

    // 1. Automatic 2-column split pairings (Left column -> from-left, Right column -> from-right)
    const splitSelectors = [
      '.success-story-grid',
      '.about-impact-grid',
      '.about-hero-grid',
      '.contact-hero-grid',
      '.blog-main-grid',
      '.causes-header-wrap',
      '.events-banner-header',
      '.events-banner-container',
      '.cta-banner-content',
      '.footer-cols-wrap'
    ];

    splitSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(parent => {
        const children = Array.from(parent.children).filter(el => {
          return el.nodeType === 1 && !el.classList.contains('mobile-nav-backdrop');
        });
        if (children.length >= 2) {
          if (!children[0].hasAttribute('data-anim') && !children[0].classList.contains('anim-from-left')) {
            children[0].setAttribute('data-anim', 'from-left');
          }
          if (!children[1].hasAttribute('data-anim') && !children[1].classList.contains('anim-from-right')) {
            children[1].setAttribute('data-anim', 'from-right');
          }
        }
      });
    });

    // 2. Multi-column card grids (Left cards -> from-left, Right cards -> from-right)
    const multiCardGrids = [
      { sel: '.howwe-features-grid', child: '.howwe-feature-box' },
      { sel: '.team-cards-grid', child: '.team-card' },
      { sel: '.team-grid', child: '.team-member-card' },
      { sel: '.events-cards-grid', child: '.event-photo-card' },
      { sel: '.projects-cards-grid', child: '.project-card' },
      { sel: '.projects-grid', child: '.project-card' },
      { sel: '.pricing-cards-grid', child: '.pricing-card' },
      { sel: '.stats-counter-grid', child: '.stat-counter-col' },
      { sel: '.footer-main-grid', child: '.footer-col, .footer-col-brand, .footer-col-nav, .footer-col-cta' },
      { sel: '.feedback-grid', child: '.feedback-card' },
      { sel: '.feedback-cards-wrap', child: '.feedback-card' },
      { sel: '.causes-carousel-track', child: '.cause-item-card' }
    ];

    multiCardGrids.forEach(({ sel, child }) => {
      document.querySelectorAll(sel).forEach(grid => {
        const items = grid.querySelectorAll(child);
        const count = items.length;
        if (count === 0) return;

        items.forEach((item, idx) => {
          if (item.hasAttribute('data-anim')) return;

          if (count === 2) {
            item.setAttribute('data-anim', idx === 0 ? 'from-left' : 'from-right');
          } else if (count === 3) {
            if (idx === 0) item.setAttribute('data-anim', 'from-left');
            else if (idx === 1) item.setAttribute('data-anim', 'from-bottom');
            else item.setAttribute('data-anim', 'from-right');
          } else {
            const half = Math.ceil(count / 2);
            if (idx < half) {
              item.setAttribute('data-anim', 'from-left');
              item.classList.add(`anim-delay-${Math.min(idx + 1, 4)}`);
            } else {
              item.setAttribute('data-anim', 'from-right');
              item.classList.add(`anim-delay-${Math.min(idx - half + 1, 4)}`);
            }
          }
        });
      });
    });

    // 3. Section headers & subheadings
    document.querySelectorAll('.section-header, .howwe-header, .team-header, .projects-header, .pricing-hero-header-wrap').forEach(header => {
      if (!header.hasAttribute('data-anim')) {
        header.setAttribute('data-anim', 'from-bottom');
      }
    });

    // 4. Observe all animated targets
    const animElements = document.querySelectorAll(
      '[data-anim], .anim-from-left, .anim-from-right, .anim-from-bottom, .anim-from-top, .anim-fade-up, .anim-zoom-in'
    );

    if (!('IntersectionObserver' in window)) {
      animElements.forEach(el => el.classList.add('anim-in'));
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    };

    const animObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          target.classList.add('anim-in');

          // Release transform after animation completes so hover transforms work smoothly
          setTimeout(() => {
            target.classList.add('anim-done');
          }, 950);

          obs.unobserve(target);
        }
      });
    }, observerOptions);

    animElements.forEach(el => animObserver.observe(el));
  }

  initScrollAnimations();
});

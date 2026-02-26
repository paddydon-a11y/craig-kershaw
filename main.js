(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===================================================================
     1. SCROLL PROGRESS BAR
     =================================================================== */
  function updateScrollProgress() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var progress = docHeight > 0 ? scrollTop / docHeight : 0;
    document.documentElement.style.setProperty('--scroll-progress', progress);
  }

  /* ===================================================================
     2. NAV SCROLL EFFECT
     =================================================================== */
  var nav = document.querySelector('.nav');

  function updateNavScroll() {
    if (!nav) return;
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  /* ===================================================================
     3. MOBILE NAV TOGGLE
     =================================================================== */
  var navToggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      navLinks.classList.toggle('open');
    });

    var links = navLinks.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        navLinks.classList.remove('open');
      });
    }

    document.addEventListener('click', function (e) {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }

  /* ===================================================================
     4. FLOATING CALL BUTTON
     =================================================================== */
  var floatingBtns = document.querySelector('.floating-btns');
  var heroButtons = document.querySelector('.hero-buttons') || document.querySelector('.hero-cta') || document.querySelector('.hero-btns') || document.querySelector('.hero');

  function updateFloatingButtons() {
    if (!floatingBtns || !heroButtons) return;
    var rect = heroButtons.getBoundingClientRect();
    if (rect.bottom < 0) {
      floatingBtns.classList.add('visible');
    } else {
      floatingBtns.classList.remove('visible');
    }
  }

  /* ===================================================================
     5. HERO TEXT REVEAL - STAGGERED WORDS
     =================================================================== */
  function initHeroReveal() {
    var heroHeading = document.getElementById('hero-heading');
    if (!heroHeading || prefersReducedMotion) {
      if (heroHeading) heroHeading.style.visibility = 'visible';
      return;
    }

    var html = heroHeading.innerHTML;

    // Split text outside of HTML tags into individually wrapped words
    // Strategy: walk through the HTML, preserving tags and wrapping text words
    var result = '';
    var wordIndex = 0;
    var inTag = false;
    var buffer = '';

    for (var i = 0; i < html.length; i++) {
      var ch = html[i];

      if (ch === '<') {
        // Flush any buffered text as words before entering a tag
        if (buffer.length > 0) {
          var words = buffer.split(/(\s+)/);
          for (var w = 0; w < words.length; w++) {
            if (/^\s+$/.test(words[w])) {
              result += words[w];
            } else if (words[w].length > 0) {
              result += '<span class="hero-word" style="transition-delay:' + (wordIndex * 80) + 'ms">' + words[w] + '</span>';
              wordIndex++;
            }
          }
          buffer = '';
        }
        inTag = true;
        result += ch;
      } else if (ch === '>') {
        inTag = false;
        result += ch;
      } else if (inTag) {
        result += ch;
      } else {
        buffer += ch;
      }
    }

    // Flush remaining buffer
    if (buffer.length > 0) {
      var remainingWords = buffer.split(/(\s+)/);
      for (var r = 0; r < remainingWords.length; r++) {
        if (/^\s+$/.test(remainingWords[r])) {
          result += remainingWords[r];
        } else if (remainingWords[r].length > 0) {
          result += '<span class="hero-word" style="transition-delay:' + (wordIndex * 80) + 'ms">' + remainingWords[r] + '</span>';
          wordIndex++;
        }
      }
    }

    heroHeading.innerHTML = result;

    setTimeout(function () {
      var heroWords = heroHeading.querySelectorAll('.hero-word');
      for (var h = 0; h < heroWords.length; h++) {
        heroWords[h].classList.add('revealed');
      }
    }, 200);
  }

  /* ===================================================================
     6. INTERSECTION OBSERVER - SCROLL REVEALS
     =================================================================== */
  function initScrollReveals() {
    var revealElements = document.querySelectorAll('.reveal');

    if (!revealElements.length) return;

    // Fallback: reveal everything immediately
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      for (var i = 0; i < revealElements.length; i++) {
        revealElements[i].classList.add('revealed');
        var children = revealElements[i].querySelectorAll('.reveal-child');
        for (var c = 0; c < children.length; c++) {
          children[c].classList.add('revealed');
        }
      }
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        if (entries[e].isIntersecting) {
          var el = entries[e].target;
          el.classList.add('revealed');

          var revealChildren = el.querySelectorAll('.reveal-child');
          for (var j = 0; j < revealChildren.length; j++) {
            (function (child, delay) {
              setTimeout(function () {
                child.classList.add('revealed');
              }, delay);
            })(revealChildren[j], j * 80);
          }

          observer.unobserve(el);
        }
      }
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    for (var k = 0; k < revealElements.length; k++) {
      observer.observe(revealElements[k]);
    }
  }

  /* ===================================================================
     7. 3D TILT ON SERVICE CARDS (DESKTOP ONLY, >1024px)
     =================================================================== */
  function initServiceCardTilt() {
    if (window.innerWidth <= 1024 || prefersReducedMotion) return;

    var cards = document.querySelectorAll('.service-card');

    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener('mousemove', function (e) {
        var rect = this.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        var mouseX = e.clientX - centerX;
        var mouseY = e.clientY - centerY;

        // Normalize to -1..1 range then scale to max ±3 degrees
        var rotateY = (mouseX / (rect.width / 2)) * 3;
        var rotateX = -(mouseY / (rect.height / 2)) * 3;

        // Clamp values
        rotateX = Math.max(-3, Math.min(3, rotateX));
        rotateY = Math.max(-3, Math.min(3, rotateY));

        this.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
      });

      cards[i].addEventListener('mouseleave', function () {
        this.style.transform = '';
      });
    }
  }

  /* ===================================================================
     8. FAQ ACCORDION
     =================================================================== */
  function initFaqAccordion() {
    var faqQuestions = document.querySelectorAll('.faq-question');

    if (!faqQuestions.length) return;

    for (var i = 0; i < faqQuestions.length; i++) {
      faqQuestions[i].addEventListener('click', function () {
        var parentItem = this.closest('.faq-item');
        if (!parentItem) return;

        var section = parentItem.closest('.faq-section') || parentItem.parentElement;
        var isOpen = parentItem.classList.contains('open');

        // Close all other FAQ items in the same section
        if (section) {
          var siblings = section.querySelectorAll('.faq-item.open');
          for (var s = 0; s < siblings.length; s++) {
            if (siblings[s] !== parentItem) {
              siblings[s].classList.remove('open');
            }
          }
        }

        // Toggle the clicked item
        if (isOpen) {
          parentItem.classList.remove('open');
        } else {
          parentItem.classList.add('open');
        }
      });
    }
  }

  /* ===================================================================
     9. STAT COUNTER ANIMATION
     =================================================================== */
  function initStatCounters() {
    var statNumbers = document.querySelectorAll('.stat-number[data-target]');

    if (!statNumbers.length) return;

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      // Fallback: show final values immediately
      for (var i = 0; i < statNumbers.length; i++) {
        var target = parseInt(statNumbers[i].getAttribute('data-target'), 10);
        var suffix = statNumbers[i].getAttribute('data-suffix') || '';
        statNumbers[i].textContent = target + suffix;
      }
      return;
    }

    var counterObserver = new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        if (entries[e].isIntersecting) {
          var el = entries[e].target;
          animateCounter(el);
          counterObserver.unobserve(el);
        }
      }
    }, {
      threshold: 0.3
    });

    for (var j = 0; j < statNumbers.length; j++) {
      counterObserver.observe(statNumbers[j]);
    }
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1000; // ~1 second
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);

      // Ease-out curve for a natural feel
      var easedProgress = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(easedProgress * target);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  /* ===================================================================
     10. SERVICES DROPDOWN (DESKTOP NAV)
     =================================================================== */
  function initServicesDropdown() {
    var triggers = document.querySelectorAll('.nav-dropdown-trigger');

    if (!triggers.length) return;

    for (var i = 0; i < triggers.length; i++) {
      (function (trigger) {
        var dropdown = trigger.querySelector('.nav-dropdown');
        if (!dropdown) return;

        var hideTimer = null;

        function showDropdown() {
          if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
          }
          dropdown.classList.add('visible');
        }

        function scheduleHide() {
          hideTimer = setTimeout(function () {
            dropdown.classList.remove('visible');
            hideTimer = null;
          }, 150);
        }

        // Desktop: hover behavior
        if (window.innerWidth > 1024) {
          trigger.addEventListener('mouseenter', showDropdown);
          trigger.addEventListener('mouseleave', scheduleHide);
          dropdown.addEventListener('mouseenter', showDropdown);
          dropdown.addEventListener('mouseleave', scheduleHide);
        }

        // Mobile/touch: click to toggle
        var triggerLink = trigger.querySelector('a') || trigger.querySelector('button') || trigger;

        triggerLink.addEventListener('click', function (e) {
          if (window.innerWidth <= 1024) {
            e.preventDefault();
            e.stopPropagation();
            var isVisible = dropdown.classList.contains('visible');
            // Close all other dropdowns first
            var allDropdowns = document.querySelectorAll('.nav-dropdown.visible');
            for (var d = 0; d < allDropdowns.length; d++) {
              allDropdowns[d].classList.remove('visible');
            }
            if (!isVisible) {
              dropdown.classList.add('visible');
            }
          }
        });
      })(triggers[i]);
    }

    // Close dropdowns when clicking outside on mobile
    document.addEventListener('click', function (e) {
      if (window.innerWidth <= 1024) {
        var openDropdowns = document.querySelectorAll('.nav-dropdown.visible');
        for (var d = 0; d < openDropdowns.length; d++) {
          var parentTrigger = openDropdowns[d].closest('.nav-dropdown-trigger');
          if (parentTrigger && !parentTrigger.contains(e.target)) {
            openDropdowns[d].classList.remove('visible');
          }
        }
      }
    });
  }

  /* ===================================================================
     UNIFIED SCROLL HANDLER
     =================================================================== */
  function onScroll() {
    updateScrollProgress();
    updateNavScroll();
    updateFloatingButtons();
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Run once on load so initial state is correct
  onScroll();

  /* ===================================================================
     INITIALISE ALL MODULES
     =================================================================== */
  initHeroReveal();
  initScrollReveals();
  initServiceCardTilt();
  initFaqAccordion();
  initStatCounters();
  initServicesDropdown();

})();

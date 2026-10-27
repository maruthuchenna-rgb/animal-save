/**
 * redirect-404.js
 * ────────────────────────────────────────────────────────────────
 * Intercepts all "placeholder" links (href="#…") and unbound
 * action-buttons across every page and redirects the user to the
 * 404 page, giving a realistic "page not found" experience for
 * buttons/links that don't have a real destination yet.
 *
 * Exceptions (never redirected):
 *   • Real page hrefs   (index.html, about.html, …)
 *   • Mailto / tel      (mailto:… / tel:…)
 *   • Smooth-scroll IDs that match a real element on THIS page
 *   • Form submit       (handled by their own onsubmit)
 *   • Dashboard tab     (handled by switchDashTab())
 *   • Newsletter form   (handled by their own onsubmit)
 *   • Preloader script  (runs before DOM)
 *   • Mobile nav toggle, sidebar close, role-switch (UI-only)
 * ────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  /* ── Determine the 404 page URL relative to current page ── */
  var PAGE_404 = '404.html';

  /* ── Classes / IDs of buttons that must NOT be redirected ── */
  var SAFE_BTN_CLASSES = [
    'mobile-nav-toggle',
    'sidebar-close-btn',
    'mobile-sidebar-toggle',
    'role-switch-trigger',
    'sidebar-search-btn',      // search triggers alert – keep
    'newsletter-btn',          // newsletter triggers alert – keep
    'dash-nav-btn',            // dashboard tab switcher
    'topbar-portal-btn',       // goes to login.html real page
    'btn-login-nav',           // goes to login.html real page
    'quick-demo-btn',          // triggers demoLogin()
    'read-more-btn',           // hero featured – already has real anchor
  ];

  /* ── Logout buttons redirect to login.html (correct behaviour) ── */
  function wireLogout () {
    document.querySelectorAll('.sidebar-logout-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = 'login.html';
      });
    });
  }

  /* ── Anchor hrefs that are real on-page anchors we skip ── */
  var SAFE_HREF_PATTERNS = [
    /^mailto:/i,
    /^tel:/i,
    /^https?:\/\//i,
    /\.html(\?.*)?$/i,         // any .html real page
    /^#top$/i,
    /^#hero$/i,
    /^#about$/i,
    /^#causes$/i,
    /^#contact$/i,
    /^#projects$/i,
    /^#article$/i,             // hero read-more on blog
  ];

  /* ── Redirect helper ── */
  function goTo404 (e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    window.location.href = PAGE_404;
  }

  /* ── Is this href a safe (real) destination? ── */
  function isSafeHref (href) {
    if (!href || href === '' || href === '#') return false; // bare "#" → redirect
    for (var i = 0; i < SAFE_HREF_PATTERNS.length; i++) {
      if (SAFE_HREF_PATTERNS[i].test(href)) return true;
    }
    return false;
  }

  /* ── Is this button class in the safe list? ── */
  function isSafeButton (el) {
    for (var i = 0; i < SAFE_BTN_CLASSES.length; i++) {
      if (el.classList.contains(SAFE_BTN_CLASSES[i])) return true;
    }
    /* Buttons that already have an explicit onclick that isn't redirect ── */
    var oc = el.getAttribute('onclick') || '';
    if (oc && !oc.includes('goTo404') && !oc.includes('redirect')) return true;
    /* Buttons inside forms handle submit themselves */
    if (el.closest('form')) return true;
    return false;
  }

  /* ── Wire up all <a href="#…"> links ── */
  function wireLinks () {
    var anchors = document.querySelectorAll('a[href]');
    anchors.forEach(function (a) {
      var href = a.getAttribute('href') || '';

      /* Skip safe real destinations */
      if (isSafeHref(href)) return;

      /* Skip links that contain SAFE class */
      if (isSafeButton(a)) return;

      /* All remaining #… anchors → 404 */
      if (href.startsWith('#')) {
        a.addEventListener('click', goTo404);
        /* Style hint so devs can see which are intercepted */
        a.setAttribute('data-redir404', '1');
      }
    });
  }

  /* ── Wire up all <button> elements without real handlers ── */
  function wireButtons () {
    var buttons = document.querySelectorAll('button');
    buttons.forEach(function (btn) {
      if (isSafeButton(btn)) return;
      /* If type="submit" inside a form, skip */
      if (btn.type === 'submit' && btn.closest('form')) return;
      btn.addEventListener('click', goTo404);
      btn.setAttribute('data-redir404', '1');
    });
  }

  /* ════════════════════════════════════════════════════════════════
     NAME-ONLY INPUT VALIDATION
     Targets every text input that is clearly a "name" field by
     matching placeholder text, id, or class containing "name".
     • Blocks keypress  of digits and special chars in real-time
     • Strips them on  paste  event
     • Shows an inline shake + border error on invalid key
     • Allows: letters (a-z A-Z), spaces, hyphens, apostrophes
       (needed for names like O'Brien, Mary-Jane, José)
     ════════════════════════════════════════════════════════════════ */

  /* Regex: characters ALLOWED in a name field */
  var NAME_ALLOWED_RE = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'\-]+$/;

  /* Selector: matches name inputs by placeholder / id / class */
  var NAME_SELECTOR = [
    'input[placeholder*="Name"]',
    'input[placeholder*="name"]',
    'input[id*="name"]',
    'input[id*="Name"]',
    'input[id*="fullName"]',
    'input[id*="FullName"]',
    'input[class*="name"]',
    'input[class*="Name"]'
  ].join(',');

  /* Inline error style injected once */
  function injectNameStyles () {
    if (document.getElementById('name-validation-style')) return;
    var s = document.createElement('style');
    s.id = 'name-validation-style';
    s.textContent = [
      '@keyframes nameShake{',
      '  0%,100%{transform:translateX(0)}',
      '  20%{transform:translateX(-5px)}',
      '  40%{transform:translateX(5px)}',
      '  60%{transform:translateX(-4px)}',
      '  80%{transform:translateX(4px)}',
      '}',
      '.name-input-error{',
      '  border-color:#e53e3e !important;',
      '  box-shadow:0 0 0 3px rgba(229,62,62,0.18) !important;',
      '  animation:nameShake 0.35s ease;',
      '}',
      '.name-input-tip{',
      '  display:block;',
      '  font-size:12px;',
      '  color:#e53e3e;',
      '  font-family:inherit;',
      '  margin-top:4px;',
      '  opacity:0;',
      '  transition:opacity 0.2s ease;',
      '  pointer-events:none;',
      '}',
      '.name-input-tip.tip-visible{opacity:1;}',
    ].join('\n');
    document.head.appendChild(s);
  }

  /* Create or get the tip element just below the input */
  function getOrCreateTip (input) {
    var existing = input.parentNode.querySelector('.name-input-tip[data-for="' + input.id + '"]');
    if (existing) return existing;
    var tip = document.createElement('span');
    tip.className = 'name-input-tip';
    tip.setAttribute('data-for', input.id || Math.random());
    tip.setAttribute('aria-live', 'polite');
    tip.textContent = 'Only letters, spaces, hyphens and apostrophes are allowed.';
    input.insertAdjacentElement('afterend', tip);
    return tip;
  }

  /* Flash error state then clear */
  function flashError (input) {
    var tip = getOrCreateTip(input);
    input.classList.add('name-input-error');
    tip.classList.add('tip-visible');
    clearTimeout(input._nameErrTimer);
    input._nameErrTimer = setTimeout(function () {
      input.classList.remove('name-input-error');
      tip.classList.remove('tip-visible');
    }, 1800);
  }

  /* Filter: strip non-name chars from a string */
  function filterName (str) {
    return str.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s'\-]/g, '');
  }

  /* Attach listeners to a single name input */
  function attachNameValidation (input) {
    if (input.dataset.nameValidated) return;
    input.dataset.nameValidated = '1';

    /* keydown: block digits and special chars before they appear */
    input.addEventListener('keydown', function (e) {
      /* Allow control keys: backspace, delete, arrows, tab, enter, etc. */
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var key = e.key;
      if (key.length === 1 && !NAME_ALLOWED_RE.test(key)) {
        e.preventDefault();
        flashError(input);
      }
    });

    /* keypress: second guard layer (older browsers) */
    input.addEventListener('keypress', function (e) {
      var char = String.fromCharCode(e.charCode || e.which);
      if (char && !NAME_ALLOWED_RE.test(char)) {
        e.preventDefault();
        flashError(input);
      }
    });

    /* paste: strip invalid chars from pasted content */
    input.addEventListener('paste', function (e) {
      e.preventDefault();
      var pasted = (e.clipboardData || window.clipboardData).getData('text') || '';
      var cleaned = filterName(pasted);
      if (cleaned !== pasted) flashError(input);
      /* Insert cleaned text at cursor */
      var start = input.selectionStart;
      var end   = input.selectionEnd;
      var current = input.value;
      input.value = current.slice(0, start) + cleaned + current.slice(end);
      input.selectionStart = input.selectionEnd = start + cleaned.length;
    });

    /* input: last-resort cleanup if somehow bad char slips through */
    input.addEventListener('input', function () {
      var clean = filterName(input.value);
      if (clean !== input.value) {
        var pos = input.selectionStart;
        input.value = clean;
        input.selectionStart = input.selectionEnd = Math.max(0, pos - 1);
        flashError(input);
      }
    });
  }

  /* Find and wire all name inputs on the page */
  function wireNameInputs () {
    injectNameStyles();
    var inputs = document.querySelectorAll(NAME_SELECTOR);
    inputs.forEach(function (inp) {
      /* Skip non-name search boxes that accidentally match */
      var ph = (inp.getAttribute('placeholder') || '').toLowerCase();
      var skip = ['search', 'breed', 'tag', 'campaign', 'shelter', 'adoption'];
      for (var i = 0; i < skip.length; i++) {
        if (ph.indexOf(skip[i]) !== -1) return;
      }
      attachNameValidation(inp);
    });
  }

  /* ════════════════════════════════════════════════════════════════
     NUMERIC-ONLY INPUT VALIDATION
     Targets every input that should contain only numbers:
       • type="tel"       → phone numbers
       • type="number"    → numeric fields (already native-blocked,
                            but we add consistent UX feedback)
       • placeholder keywords: phone, mobile, zip, pin, otp,
                                amount, quantity, card number, cvv
       • id / class keywords: phone, mobile, zip, pin, otp, amount
     • Allowed: digits 0–9, +, -, (, ), space, dot (for phone/amount)
     • Blocked : all letters, all special chars except above
     ════════════════════════════════════════════════════════════════ */

  /* Allowed characters in a numeric / phone field */
  var NUM_ALLOWED_RE  = /^[\d\s\+\-\(\)\.]+$/;  /* digits + phone formatting */
  var DIGIT_ONLY_RE   = /^\d+$/;                  /* strict digits (zip/pin/otp) */

  /* Selector for numeric inputs */
  var NUM_SELECTOR = [
    'input[type="tel"]',
    'input[type="number"]',
    'input[id*="phone"]',   'input[id*="Phone"]',
    'input[id*="mobile"]',  'input[id*="Mobile"]',
    'input[id*="zip"]',     'input[id*="Zip"]',
    'input[id*="pin"]',     'input[id*="Pin"]',
    'input[id*="otp"]',     'input[id*="Otp"]',
    'input[id*="amount"]',  'input[id*="Amount"]',
    'input[id*="cvv"]',     'input[id*="Cvv"]',
    'input[id*="card"]',    'input[id*="Card"]',
    'input[class*="phone"]','input[class*="Phone"]',
    'input[class*="mobile"]','input[class*="zip"]',
    'input[class*="amount"]','input[class*="pin"]'
  ].join(',');

  /* Keywords in placeholder → treat as numeric */
  var NUM_PLACEHOLDER_KEYS = [
    'phone','mobile','zip','postal','pin','otp','cvv',
    'card number','amount','quantity','number'
  ];

  /* Inject numeric error CSS (reuses the same shake + tip style) */
  function injectNumStyles () {
    /* name-validation-style already covers the animation + .name-input-error */
    /* Just ensure it exists */
    injectNameStyles();
  }

  /* Determine if a field is "strict digits only" (zip, pin, otp, cvv) */
  function isStrictDigit (input) {
    var ph = (input.getAttribute('placeholder') || '').toLowerCase();
    var id = (input.id || '').toLowerCase();
    var strict = ['zip','postal','pin','otp','cvv'];
    for (var i = 0; i < strict.length; i++) {
      if (ph.indexOf(strict[i]) !== -1 || id.indexOf(strict[i]) !== -1) return true;
    }
    return false;
  }

  /* Filter: strip non-numeric chars from a string */
  function filterNumeric (str, strict) {
    if (strict) return str.replace(/\D/g, '');
    return str.replace(/[^\d\s\+\-\(\)\.]/g, '');
  }

  /* Attach numeric-only validation to a single input */
  function attachNumValidation (input) {
    if (input.dataset.numValidated) return;
    input.dataset.numValidated = '1';

    var strict = isStrictDigit(input);
    var allowed = strict ? DIGIT_ONLY_RE : NUM_ALLOWED_RE;

    /* keydown: block disallowed keys before they appear */
    input.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var key = e.key;
      /* Allow control keys */
      if (key.length !== 1) return;
      if (!allowed.test(key)) {
        e.preventDefault();
        flashError(input);
      }
    });

    /* keypress: legacy guard */
    input.addEventListener('keypress', function (e) {
      var char = String.fromCharCode(e.charCode || e.which);
      if (char && !allowed.test(char)) {
        e.preventDefault();
        flashError(input);
      }
    });

    /* paste: strip invalid chars */
    input.addEventListener('paste', function (e) {
      e.preventDefault();
      var pasted  = (e.clipboardData || window.clipboardData).getData('text') || '';
      var cleaned = filterNumeric(pasted, strict);
      if (cleaned !== pasted) flashError(input);
      var start = input.selectionStart;
      var end   = input.selectionEnd;
      input.value = input.value.slice(0, start) + cleaned + input.value.slice(end);
      input.selectionStart = input.selectionEnd = start + cleaned.length;
    });

    /* input: last-resort cleanup */
    input.addEventListener('input', function () {
      var clean = filterNumeric(input.value, strict);
      if (clean !== input.value) {
        var pos = input.selectionStart;
        input.value = clean;
        input.selectionStart = input.selectionEnd = Math.max(0, pos - 1);
        flashError(input);
      }
    });

    /* Update tip message for numeric context */
    input.addEventListener('focus', function () {
      var tip = getOrCreateTip(input);
      tip.textContent = strict
        ? 'Only digits (0–9) are allowed in this field.'
        : 'Only numbers and phone characters (+, -, spaces) are allowed.';
    });
  }

  /* Find and wire all numeric inputs on the page */
  function wireNumInputs () {
    injectNumStyles();

    /* 1. Wire by selector (type/id/class) */
    var bySelector = document.querySelectorAll(NUM_SELECTOR);
    bySelector.forEach(function (inp) {
      /* Skip if name validation is already on it */
      if (inp.dataset.nameValidated) return;
      attachNumValidation(inp);
    });

    /* 2. Wire text inputs whose placeholder contains numeric keywords */
    var allText = document.querySelectorAll('input[type="text"]');
    allText.forEach(function (inp) {
      if (inp.dataset.numValidated || inp.dataset.nameValidated) return;
      var ph = (inp.getAttribute('placeholder') || '').toLowerCase();
      for (var i = 0; i < NUM_PLACEHOLDER_KEYS.length; i++) {
        if (ph.indexOf(NUM_PLACEHOLDER_KEYS[i]) !== -1) {
          attachNumValidation(inp);
          break;
        }
      }
    });
  }

  /* ── Wire donation triggers specifically to ensure modal never pops up ── */
  function wireDonateButtons () {
    // 1. Immediately hide any donation modal if present
    var modal = document.getElementById('donationModal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
      modal.style.visibility = 'hidden';
      modal.style.pointerEvents = 'none';
    }

    // 2. Select all donation triggers & buttons
    var donateBtns = document.querySelectorAll('.trigger-donate-modal, .btn-cta-donate, .btn-card-donate-teal, .quick-donate-submit, .campaign-action-btn, .donation-callout-btn, .pricing-cta-btn');
    donateBtns.forEach(function (btn) {
      // Never intercept login buttons or links
      if (btn.classList.contains('btn-login-nav') || btn.closest('a[href*="login"]') || (btn.getAttribute('href') && btn.getAttribute('href').includes('login'))) {
        return;
      }
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.location.href = PAGE_404;
      }, true); // useCapture=true to intercept before any other handlers
    });
  }

  /* ── Run after DOM is ready ── */
  function init () {
    wireDonateButtons();   // must run FIRST — before wireButtons/wireLinks
    wireLinks();
    wireButtons();
    wireLogout();
    wireNameInputs();
    wireNumInputs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

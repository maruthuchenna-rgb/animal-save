/**
 * STACKLY ANIMAL WELFARE PLATFORM - ROLE DASHBOARD CORE ENGINE
 * Manages 5 dash bar options switching, mobile drawers, role switcher, and user session display.
 */

// Global function to switch tabs (accessible anywhere)
window.switchDashTab = function(targetId, navBtn) {
  if (!targetId) return;

  // 1. Update active button state
  const allBtns = document.querySelectorAll('.dash-nav-btn');
  allBtns.forEach(b => b.classList.remove('active'));

  if (navBtn) {
    navBtn.classList.add('active');
  } else {
    const matchingBtn = document.querySelector(`.dash-nav-btn[data-tab="${targetId}"]`);
    if (matchingBtn) matchingBtn.classList.add('active');
  }

  // 2. Hide all tab panes, show only targeted one
  const allPanes = document.querySelectorAll('.dash-tab-pane');
  let found = false;
  allPanes.forEach(pane => {
    if (pane.id === targetId) {
      pane.classList.add('active');
      pane.style.display = 'block';
      found = true;
    } else {
      pane.classList.remove('active');
      pane.style.display = 'none';
    }
  });

  // 3. Update topbar title to match selected tab
  const activeBtn = navBtn || document.querySelector(`.dash-nav-btn[data-tab="${targetId}"]`);
  if (activeBtn) {
    const label = activeBtn.querySelector('.dash-nav-label');
    const pageTitle = document.querySelector('.topbar-page-title');
    if (pageTitle && label) {
      pageTitle.textContent = label.textContent.trim();
    }
  }

  // 4. Auto-close mobile sidebar if open
  const sidebar = document.querySelector('.dashboard-sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');
  if (window.innerWidth <= 1024 && sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  // 5. Scroll content viewport to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 6. Update URL hash without jump
  if (history.pushState) {
    history.pushState(null, null, '#' + targetId);
  }
};

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================
  // 1. BIND CLICK HANDLERS TO ALL 5 DASH BAR BUTTONS
  // ========================================================
  const dashNavButtons = document.querySelectorAll('.dash-nav-btn');

  dashNavButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('data-tab');
      window.switchDashTab(targetId, this);
    });
  });

  // Check URL hash on load (e.g. #tab-donations)
  const initialHash = window.location.hash ? window.location.hash.substring(1) : null;
  if (initialHash && document.getElementById(initialHash)) {
    window.switchDashTab(initialHash);
  }

  // ========================================================
  // 2. MOBILE SIDEBAR DRAWER TOGGLE
  // ========================================================
  const mobileToggle = document.querySelector('.mobile-sidebar-toggle');
  const sidebarClose = document.querySelector('.sidebar-close-btn');
  const sidebar = document.querySelector('.dashboard-sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');

  function openMobileSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openMobileSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeMobileSidebar);
  if (backdrop) backdrop.addEventListener('click', closeMobileSidebar);

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && sidebar && sidebar.classList.contains('open')) {
      closeMobileSidebar();
    }
  });

  // ========================================================
  // 3. ROLE SWITCHER DROPDOWN
  // ========================================================
  const roleTrigger = document.querySelector('.role-switch-trigger');
  const roleMenu = document.querySelector('.role-dropdown-menu');

  if (roleTrigger && roleMenu) {
    roleTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      roleMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!roleMenu.contains(e.target) && !roleTrigger.contains(e.target)) {
        roleMenu.classList.remove('show');
      }
    });
  }

  // ========================================================
  // 4. DYNAMIC USER SESSION DISPLAY (EMAIL & NAME)
  // ========================================================
  const defaultRoleUsers = {
    'admin': {
      name: 'Sarah Jenkins',
      email: 'admin@stacklyrescue.org',
      role: 'Shelter Director'
    },
    'donor': {
      name: 'Emily Watson',
      email: 'donor@stacklyrescue.org',
      role: 'Guardian Sponsor'
    }
  };

  const currentRole = document.body.getAttribute('data-role') || 'admin';
  const roleDefaults = defaultRoleUsers[currentRole] || defaultRoleUsers['admin'];

  const storedRole = localStorage.getItem('stackly_user_role');
  const storedEmail = localStorage.getItem('stackly_user_email');
  const storedName = localStorage.getItem('stackly_user_name');

  let finalEmail = roleDefaults.email;
  let finalName = roleDefaults.name;

  if (storedRole === currentRole && storedEmail && storedName) {
    finalEmail = storedEmail;
    finalName = storedName;
  } else if (!storedRole && storedEmail && storedName) {
    finalEmail = storedEmail;
    finalName = storedName;
  }

  // Populate UI
  document.querySelectorAll('.user-display-email').forEach(el => {
    el.textContent = finalEmail;
  });

  document.querySelectorAll('.user-display-name').forEach(el => {
    el.textContent = finalName;
  });

  document.querySelectorAll('.welcome-user-name').forEach(el => {
    el.textContent = finalName.split(' ')[0] || finalName;
  });

  document.querySelectorAll('.welcome-email-text').forEach(el => {
    el.textContent = finalEmail;
  });

  // Switch role link click
  document.querySelectorAll('.role-dropdown-link').forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (href && href.includes('donor')) {
        localStorage.setItem('stackly_user_role', 'donor');
        localStorage.setItem('stackly_user_name', defaultRoleUsers['donor'].name);
        localStorage.setItem('stackly_user_email', defaultRoleUsers['donor'].email);
      } else if (href && href.includes('admin')) {
        localStorage.setItem('stackly_user_role', 'admin');
        localStorage.setItem('stackly_user_name', defaultRoleUsers['admin'].name);
        localStorage.setItem('stackly_user_email', defaultRoleUsers['admin'].email);
      }
    });
  });

  // ========================================================
  // 5. LOGOUT HANDLER
  // ========================================================
  const logoutButtons = document.querySelectorAll('.sidebar-logout-btn, .action-logout');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('stackly_user_email');
      localStorage.removeItem('stackly_user_name');
      localStorage.removeItem('stackly_user_role');
      window.location.href = 'login.html';
    });
  });

});

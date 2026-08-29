window.onerror = function(message, source, lineno, colno, error) {
  if (window.Toast) {
    Toast.show(`JS Error: ${message} (Line ${lineno})`, 'error', 6000);
  }
  console.error(error);
  return false;
};

window.onunhandledrejection = function(event) {
  if (window.Toast) {
    Toast.show(`Promise Fail: ${event.reason?.message || event.reason}`, 'error', 6000);
  }
  console.error(event.reason);
};

const App = {
  currentPage: 'dashboard',

  async init() {
    const user = Utils.getCurrentUser();
    if (user) {
      this.showAppLayout(user);
      await this.navigateTo('dashboard');
    } else {
      this.showAuthLayout();
      Auth.showLogin();
    }

    this.bindEvents();
    this.loadTheme();
  },

  bindEvents() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        this.navigateTo(page);
      });
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
  },

  showAuthLayout() {
    const authLayout = document.getElementById('auth-layout');
    const appLayout = document.getElementById('app-layout');
    if (authLayout) authLayout.style.cssText = 'display: flex !important;';
    if (appLayout) appLayout.style.cssText = 'display: none !important;';
  },

  showAppLayout(user) {
    const authLayout = document.getElementById('auth-layout');
    const appLayout = document.getElementById('app-layout');
    if (authLayout) authLayout.style.cssText = 'display: none !important;';
    if (appLayout) appLayout.style.cssText = 'display: grid !important;';
    const displayName = Utils.getUserDisplayName(user);
    const userElem = document.getElementById('user-name');
    if (userElem) userElem.textContent = displayName;
    const avatarElem = document.getElementById('user-avatar');
    if (avatarElem) avatarElem.textContent = displayName.charAt(0).toUpperCase();

    if (window.Dashboard) Dashboard.init();
  },

  async navigateTo(page) {
    this.currentPage = page;

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    const titles = {
      'dashboard': 'Dashboard Overview',
      'add-transaction': 'Add Transaction',
      'transactions': 'Transaction History',
      'goals': 'Savings Goals',
      'categories': 'Category Management',
      'reports': 'Financial Analytics',
      'budget': 'Budget Planner',
      'export': 'Export Data',
      'settings': 'Settings & Database'
    };
    document.getElementById('page-title').textContent = titles[page] || page;

    try {
      let html = '';
      if (window.api && window.api.loadTemplate) {
        html = await window.api.loadTemplate(page);
      } else {
        const response = await fetch(`pages/${page}.html`);
        html = await response.text();
      }
      const pageContent = document.getElementById('page-content');
      pageContent.innerHTML = html;

      switch(page) {
        case 'dashboard': if (window.Dashboard) await Dashboard.init(); break;
        case 'add-transaction': if (window.Transactions) await Transactions.initAddForm(); break;
        case 'transactions': if (window.Transactions) await Transactions.init(); break;
        case 'goals': if (window.Goals) await Goals.init(); break;
        case 'categories': if (window.Categories) await Categories.init(); break;
        case 'reports': if (window.Reports) await Reports.init(); break;
        case 'budget': if (window.Budget) await Budget.init(); break;
        case 'export': if (window.Export) await Export.init(); break;
        case 'settings': if (window.Settings) await Settings.init(); break;
      }
    } catch (err) {
      console.error('Failed to load page:', err);
      Toast.show(`Failed to load page: ${err.message}`, 'error');
    }
  },

  loadTheme() {
    const user = Utils.getCurrentUser();
    const theme = user?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  },

  logout() {
    Utils.clearCurrentUser();
    this.showAuthLayout();
    Auth.showLogin();
  }
};

window.App = App;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

const App = {
  currentPage: 'dashboard',

  async init() {
    const user = Utils.getCurrentUser();
    if (user) {
      this.showAppLayout(user);
      this.navigateTo('dashboard');
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
    document.getElementById('auth-layout').style.display = 'flex';
    document.getElementById('app-layout').style.display = 'none';
  },

  showAppLayout(user) {
    document.getElementById('auth-layout').style.display = 'none';
    document.getElementById('app-layout').style.display = 'grid';
    const displayName = Utils.getUserDisplayName(user);
    const userElem = document.getElementById('user-name');
    if (userElem) userElem.textContent = displayName;
    const avatarElem = document.getElementById('user-avatar');
    if (avatarElem) avatarElem.textContent = displayName.charAt(0).toUpperCase();
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
      const response = await fetch(`pages/${page}.html`);
      const html = await response.text();
      const pageContent = document.getElementById('page-content');
      pageContent.innerHTML = html;

      switch(page) {
        case 'dashboard': if (window.Dashboard) Dashboard.init(); break;
        case 'add-transaction': if (window.Transactions) Transactions.initAddForm(); break;
        case 'transactions': if (window.Transactions) Transactions.init(); break;
        case 'goals': if (window.Goals) Goals.init(); break;
        case 'categories': if (window.Categories) Categories.init(); break;
        case 'reports': if (window.Reports) Reports.init(); break;
        case 'budget': if (window.Budget) Budget.init(); break;
        case 'export': if (window.Export) Export.init(); break;
        case 'settings': if (window.Settings) Settings.init(); break;
      }
    } catch (err) {
      console.error('Failed to load page:', err);
      Toast.show('Failed to load page template', 'error');
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

const Toast = {
  show(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, duration);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());

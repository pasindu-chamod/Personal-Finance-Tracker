const Utils = {
  formatCurrency(amount, currency = 'LKR') {
    const symbols = { LKR: 'Rs.', USD: '$', EUR: '€', GBP: '£', INR: '₹' };
    const symbol = symbols[currency] || currency;
    return `${symbol} ${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  today() {
    return this.formatDate(new Date());
  },

  firstDayOfMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  },

  lastDayOfMonth(year, month) {
    const d = new Date();
    const y = year || d.getFullYear();
    const m = month || (d.getMonth() + 1);
    const lastDay = new Date(y, m, 0).getDate();
    return `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  },

  animateNumber(element, start, end, duration = 800, formatter = null) {
    if (!element) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = start + progress * (end - start);
      element.textContent = formatter ? formatter(value) : value.toFixed(2);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      return (user && user.id) ? user : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      const displayName = user.full_name || user.fullName || user.username || 'User';
      user.full_name = displayName;
      user.fullName = displayName;
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  },

  getUserDisplayName(user) {
    if (!user) return 'User';
    return user.full_name || user.fullName || user.username || 'User';
  },

  clearCurrentUser() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
  },

  getCurrency() {
    const user = this.getCurrentUser();
    return user?.currency || 'LKR';
  },

  confirm(message, title = 'Confirm Action') {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay active';
      overlay.innerHTML = `
        <div class="modal">
          <h3 style="margin-bottom:12px; font-size:1.2rem;">${title}</h3>
          <p style="margin-bottom:24px; color:var(--text-secondary);">${message}</p>
          <div style="display:flex; justify-content:flex-end; gap:12px;">
            <button class="btn btn-secondary" id="confirm-cancel-btn">Cancel</button>
            <button class="btn btn-primary" id="confirm-ok-btn">Confirm</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelector('#confirm-cancel-btn').onclick = () => {
        overlay.remove();
        resolve(false);
      };
      overlay.querySelector('#confirm-ok-btn').onclick = () => {
        overlay.remove();
        resolve(true);
      };
    });
  }
};

window.Utils = Utils;

// Toast notification utility
const Toast = {
  show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const colors = {
      success: '#10b981',
      error: '#ef4444',
      info: '#6366f1',
      warning: '#f59e0b'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      margin-bottom: 8px;
      animation: slideIn 0.3s ease;
      max-width: 320px;
      word-break: break-word;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

window.Toast = Toast;


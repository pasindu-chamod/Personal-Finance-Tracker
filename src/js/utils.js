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

  lastDayOfMonth() {
    const d = new Date();
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
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
      return JSON.parse(sessionStorage.getItem('currentUser'));
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  },

  clearCurrentUser() {
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

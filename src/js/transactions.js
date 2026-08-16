const Transactions = {
  currentType: 'expense',

  async init() {
    await this.loadTransactions();
    const search = document.getElementById('tx-search-input');
    const type = document.getElementById('tx-type-select');
    if (search) search.addEventListener('input', Utils.debounce(() => this.loadTransactions(), 300));
    if (type) type.addEventListener('change', () => this.loadTransactions());
  },

  async loadTransactions() {
    const user = Utils.getCurrentUser();
    if (!user) return;

    const search = document.getElementById('tx-search-input')?.value || '';
    const type = document.getElementById('tx-type-select')?.value || '';
    const currency = Utils.getCurrency();

    try {
      const { transactions } = await window.api.transactions.getAll(user.id, { search, type, limit: 100 });
      this.renderTable(transactions, currency);
    } catch (err) {
      console.error(err);
    }
  },

  renderTable(transactions, currency) {
    const tbody = document.getElementById('tx-table-body');
    if (!tbody) return;

    if (!transactions || transactions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">No transactions recorded</td></tr>`;
      return;
    }

    tbody.innerHTML = transactions.map(t => `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td style="padding:14px;">${Utils.formatDateDisplay(t.date)}</td>
        <td style="padding:14px;">
          <span style="display:inline-flex; align-items:center; gap:8px;">
            <span>${t.category_icon || '💵'}</span>
            <span>${t.category_name || 'General'}</span>
          </span>
        </td>
        <td style="padding:14px;">${t.description || '-'}</td>
        <td style="padding:14px; font-weight:700; color:${t.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)'};">
          ${t.type === 'income' ? '+' : '-'}${Utils.formatCurrency(t.amount, currency)}
        </td>
        <td style="padding:14px; text-align:right;">
          <button class="btn btn-ghost" style="color:var(--expense-color);" onclick="Transactions.deleteTx(${t.id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  },

  async initAddForm() {
    const user = Utils.getCurrentUser();
    if (!user) return;

    document.getElementById('tx-date').value = Utils.today();
    await this.loadCategoriesSelect(user.id, this.currentType);

    document.getElementById('add-tx-form').addEventListener('submit', (e) => this.handleCreate(e));
  },

  setType(type) {
    this.currentType = type;
    const btnExp = document.getElementById('btn-type-expense');
    const btnInc = document.getElementById('btn-type-income');

    if (type === 'expense') {
      btnExp.className = 'btn btn-primary';
      btnInc.className = 'btn btn-secondary';
    } else {
      btnExp.className = 'btn btn-secondary';
      btnInc.className = 'btn btn-primary';
    }

    const user = Utils.getCurrentUser();
    if (user) this.loadCategoriesSelect(user.id, type);
  },

  async loadCategoriesSelect(userId, type) {
    const select = document.getElementById('tx-category');
    if (!select) return;

    try {
      const categories = await window.api.categories.getByType(userId, type);
      select.innerHTML = '<option value="">Select Category...</option>' + categories.map(c => `
        <option value="${c.id}">${c.icon || ''} ${c.name}</option>
      `).join('');
    } catch (err) {
      console.error(err);
    }
  },

  async handleCreate(e) {
    e.preventDefault();
    const user = Utils.getCurrentUser();
    if (!user) return;

    const amount = parseFloat(document.getElementById('tx-amount').value);
    const categoryId = parseInt(document.getElementById('tx-category').value, 10);
    const date = document.getElementById('tx-date').value;
    const description = document.getElementById('tx-description').value.trim();

    if (!amount || !categoryId || !date) {
      Toast.show('Please fill in required transaction fields', 'error');
      return;
    }

    try {
      await window.api.transactions.create({
        userId: user.id,
        categoryId,
        type: this.currentType,
        amount,
        description,
        date
      });
      Toast.show('Transaction saved successfully!', 'success');
      App.navigateTo('transactions');
    } catch (err) {
      Toast.show(err.message || 'Save transaction failed', 'error');
    }
  },

  async deleteTx(id) {
    const confirmed = await Utils.confirm('Are you sure you want to delete this transaction?');
    if (!confirmed) return;

    try {
      await window.api.transactions.delete(id);
      Toast.show('Transaction deleted', 'success');
      await this.loadTransactions();
    } catch (err) {
      Toast.show(err.message || 'Delete failed', 'error');
    }
  }
};

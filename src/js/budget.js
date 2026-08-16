const Budget = {
  async init() {
    await this.loadBudgets();
    document.getElementById('budget-form').addEventListener('submit', (e) => this.handleSave(e));
  },

  async loadBudgets() {
    const user = Utils.getCurrentUser();
    if (!user) return;

    const d = new Date();
    const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    try {
      const budgets = await window.api.budget.getAll(user.id, currentMonth);
      this.renderBudgets(budgets);
    } catch (err) {
      console.error(err);
    }
  },

  renderBudgets(budgets) {
    const list = document.getElementById('budget-list');
    if (!list) return;

    const currency = Utils.getCurrency();

    if (!budgets || budgets.length === 0) {
      list.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; color:var(--text-muted);" class="card">No monthly budget limits set yet.</div>`;
      return;
    }

    list.innerHTML = budgets.map(b => {
      const pct = Math.min(100, Math.round((b.spent / b.amount) * 100));
      const isOver = b.spent > b.amount;
      return `
        <div class="card" style="${isOver ? 'border-color:var(--expense-color);' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span style="font-weight:700; font-size:1.05rem;">${b.category_icon || '📦'} ${b.category_name}</span>
            <span style="font-size:0.8rem; font-weight:700; color:${isOver ? 'var(--expense-color)' : 'var(--accent-primary)'};">${pct}%</span>
          </div>

          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width:${pct}%; background:${isOver ? 'var(--expense-gradient)' : 'var(--accent-gradient)'};"></div>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text-secondary); margin-top:8px;">
            <span>Spent: ${Utils.formatCurrency(b.spent, currency)}</span>
            <span>Limit: ${Utils.formatCurrency(b.amount, currency)}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  async showAddModal() {
    const user = Utils.getCurrentUser();
    if (!user) return;

    const categories = await window.api.categories.getByType(user.id, 'expense');
    const select = document.getElementById('budget-cat');
    select.innerHTML = categories.map(c => `<option value="${c.id}">${c.icon || ''} ${c.name}</option>`).join('');

    document.getElementById('budget-modal').classList.add('active');
  },

  hideModal() {
    document.getElementById('budget-modal').classList.remove('active');
  },

  async handleSave(e) {
    e.preventDefault();
    const user = Utils.getCurrentUser();
    if (!user) return;

    const categoryId = parseInt(document.getElementById('budget-cat').value, 10);
    const amount = parseFloat(document.getElementById('budget-amount').value);

    const d = new Date();
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    if (!categoryId || !amount) return;

    try {
      await window.api.budget.create({
        userId: user.id,
        categoryId,
        amount,
        month
      });
      Toast.show('Budget limit saved!', 'success');
      this.hideModal();
      await this.loadBudgets();
    } catch (err) {
      Toast.show(err.message || 'Failed to save budget', 'error');
    }
  }
};

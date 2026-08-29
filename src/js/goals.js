const Goals = {
  async init() {
    await this.loadGoals();
    const form = document.getElementById('goal-form');
    if (form) {
      form.onsubmit = (e) => this.handleSave(e);
    }
  },

  async loadGoals() {
    const user = Utils.getCurrentUser();
    if (!user) return;

    try {
      const goals = await window.api.goals.getAll(user.id);
      this.renderGoals(goals);
    } catch (err) {
      console.error(err);
    }
  },

  renderGoals(goals) {
    const list = document.getElementById('goals-list');
    if (!list) return;

    const currency = Utils.getCurrency();

    if (!Array.isArray(goals) || goals.length === 0) {
      list.innerHTML = `
        <div style="grid-column: span 3; text-align:center; padding:50px;" class="card">
          <div style="font-size:3rem; margin-bottom:12px;">🎯</div>
          <h3>No Savings Goals Yet</h3>
          <p style="color:var(--text-secondary); margin:8px 0 20px 0;">Start tracking dedicated financial targets today!</p>
          <button class="btn btn-primary" onclick="Goals.showAddModal()">Create Your First Goal</button>
        </div>
      `;
      return;
    }

    list.innerHTML = goals.map(g => {
      const pct = Math.min(100, Math.round((g.saved_amount / g.target_amount) * 100));
      return `
        <div class="card goal-card">
          <div>
            <div class="goal-header">
              <span class="goal-title">${g.title}</span>
              <span class="goal-category">${g.category || 'Target'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:8px;">
              <span style="font-size:1.3rem; font-weight:800; color:var(--accent-primary);">${Utils.formatCurrency(g.saved_amount, currency)}</span>
              <span style="font-size:0.85rem; color:var(--text-muted);">Goal: ${Utils.formatCurrency(g.target_amount, currency)}</span>
            </div>

            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${pct}%;"></div>
            </div>

            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted); margin-top:6px;">
              <span>${pct}% completed</span>
              <span>Target: ${Utils.formatDateDisplay(g.target_date)}</span>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:20px; border-top:1px solid var(--border-color); padding-top:16px;">
            <button class="btn btn-secondary" style="flex:1; padding:8px;" onclick="Goals.depositModal(${g.id}, '${g.title}')">+ Add Deposit</button>
            <button class="btn btn-ghost" style="color:var(--expense-color);" onclick="Goals.deleteGoal(${g.id})">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  },

  showAddModal() {
    document.getElementById('goal-modal-title').textContent = 'Create Savings Goal';
    document.getElementById('goal-form')?.reset();
    document.getElementById('goal-modal')?.classList.add('active');
  },

  hideModal() {
    document.getElementById('goal-modal')?.classList.remove('active');
  },

  async handleSave(e) {
    e.preventDefault();
    const user = Utils.getCurrentUser();
    if (!user) return;

    const title = document.getElementById('goal-title-input')?.value.trim();
    const targetAmount = parseFloat(document.getElementById('goal-target-input')?.value);
    const targetDate = document.getElementById('goal-date-input')?.value;
    const savedAmount = parseFloat(document.getElementById('goal-initial-input')?.value) || 0;

    if (!title || !targetAmount || !targetDate) {
      Toast.show('Please fill in required goal fields', 'error');
      return;
    }

    try {
      await window.api.goals.create({
        userId: Number(user.id),
        title,
        targetAmount: Number(targetAmount),
        savedAmount: Number(savedAmount),
        targetDate,
        category: 'Target'
      });
      Toast.show('Savings Goal Created!', 'success');
      this.hideModal();
      await this.loadGoals();
    } catch (err) {
      Toast.show(err.message || 'Failed to create goal', 'error');
    }
  },

  async depositModal(goalId, title) {
    const amountStr = prompt(`Enter deposit amount for "${title}":`);
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      Toast.show('Please enter a valid deposit amount', 'error');
      return;
    }

    try {
      await window.api.goals.updateSaved({ id: Number(goalId), amount: Number(amount) });
      Toast.show('Deposit added to savings goal!', 'success');
      await this.loadGoals();
    } catch (err) {
      Toast.show(err.message || 'Deposit failed', 'error');
    }
  },

  async deleteGoal(goalId) {
    const confirmed = await Utils.confirm('Are you sure you want to delete this savings goal?');
    if (!confirmed) return;

    try {
      await window.api.goals.delete(Number(goalId));
      Toast.show('Savings goal deleted', 'success');
      await this.loadGoals();
    } catch (err) {
      Toast.show(err.message || 'Delete failed', 'error');
    }
  }
};

const Dashboard = {
  barChart: null,
  pieChart: null,

  async init() {
    const user = Utils.getCurrentUser();
    const displayName = Utils.getUserDisplayName(user);
    const dashUserElem = document.getElementById('dash-user-name');
    if (dashUserElem) {
      dashUserElem.textContent = displayName;
    }

    const now = new Date();
    if (user) {
      await this.loadData(user.id, now.getMonth() + 1, now.getFullYear());
    }
  },

  async loadData(userId, month, year) {
    try {
      const currency = Utils.getCurrency();
      const summary = await window.api.transactions.getSummary(userId, month, year);

      Utils.animateNumber(document.getElementById('dash-total-income'), 0, summary.totalIncome, 800, (v) => Utils.formatCurrency(v, currency));
      Utils.animateNumber(document.getElementById('dash-total-expense'), 0, summary.totalExpense, 800, (v) => Utils.formatCurrency(v, currency));
      Utils.animateNumber(document.getElementById('dash-net-balance'), 0, summary.balance, 800, (v) => Utils.formatCurrency(v, currency));

      // Financial Health Score Calculation
      let score = 50;
      if (summary.totalIncome > 0) {
        const savingsRatio = (summary.balance / summary.totalIncome) * 100;
        if (savingsRatio >= 30) score = 95;
        else if (savingsRatio >= 20) score = 85;
        else if (savingsRatio >= 10) score = 70;
        else if (savingsRatio > 0) score = 60;
        else score = 40;
      }
      document.getElementById('dash-health-score').textContent = `${Math.max(10, Math.min(100, Math.round(score)))}/100`;

      // Render Charts
      const monthlyData = await window.api.reports.monthlyTotals(userId, year);
      this.renderBarChart(monthlyData);

      const startDate = `${year}-${String(month).padStart(2,'0')}-01`;
      const endDate = Utils.lastDayOfMonth();
      const categoryData = await window.api.reports.categoryBreakdown(userId, startDate, endDate, 'expense');
      this.renderPieChart(categoryData);

      // Render Recent List
      const { transactions } = await window.api.transactions.getAll(userId, { page: 1, limit: 5 });
      this.renderRecent(transactions, currency);

    } catch (err) {
      console.error(err);
    }
  },

  renderBarChart(data) {
    if (this.barChart) this.barChart.destroy();
    const ctx = document.getElementById('dash-bar-chart');
    if (!ctx) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const incomeData = new Array(12).fill(0);
    const expenseData = new Array(12).fill(0);

    data.forEach(item => {
      const idx = parseInt(item.month, 10) - 1;
      if (idx >= 0 && idx < 12) {
        if (item.type === 'income') incomeData[idx] = item.total;
        if (item.type === 'expense') expenseData[idx] = item.total;
      }
    });

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: 'Income', data: incomeData, backgroundColor: '#10b981', borderRadius: 6 },
          { label: 'Expense', data: expenseData, backgroundColor: '#ef4444', borderRadius: 6 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { color: '#9ca3af' } } },
        scales: {
          x: { ticks: { color: '#9ca3af' }, grid: { display: false } },
          y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  },

  renderPieChart(data) {
    if (this.pieChart) this.pieChart.destroy();
    const ctx = document.getElementById('dash-pie-chart');
    if (!ctx) return;

    if (!data || data.length === 0) {
      ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
      return;
    }

    this.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.categoryName),
        datasets: [{
          data: data.map(d => d.total),
          backgroundColor: data.map(d => d.categoryColor || '#6366f1'),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } },
        cutout: '65%'
      }
    });
  },

  renderRecent(transactions, currency) {
    const list = document.getElementById('dash-recent-list');
    if (!list) return;

    if (!transactions || transactions.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted);">No recent transactions found</div>`;
      return;
    }

    list.innerHTML = transactions.map(t => `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border-color);">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:40px; height:40px; border-radius:10px; background:${t.category_color || '#6366f1'}22; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
            ${t.category_icon || '💵'}
          </div>
          <div>
            <div style="font-weight:600;">${t.description || t.category_name || 'Transaction'}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">${Utils.formatDateDisplay(t.date)}</div>
          </div>
        </div>
        <div style="font-weight:700; color:${t.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)'}">
          ${t.type === 'income' ? '+' : '-'}${Utils.formatCurrency(t.amount, currency)}
        </div>
      </div>
    `).join('');
  }
};

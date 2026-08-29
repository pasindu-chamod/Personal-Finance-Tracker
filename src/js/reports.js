const Reports = {
  chart: null,

  async init() {
    const user = Utils.getCurrentUser();
    if (!user) return;

    const year = new Date().getFullYear();
    try {
      const data = await window.api.reports.monthlyTotals(user.id, year);
      this.renderChart(data);
    } catch (err) {
      console.error(err);
    }
  },

  renderChart(data) {
    if (this.chart) this.chart.destroy();
    const ctx = document.getElementById('reports-bar-chart');
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

    this.chart = new Chart(ctx, {
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
  }
};

window.Reports = Reports;

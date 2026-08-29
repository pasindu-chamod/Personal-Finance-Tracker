const Categories = {
  async init() {
    await this.loadCategories();
    const form = document.getElementById('category-form');
    if (form) {
      form.onsubmit = (e) => this.handleSave(e);
    }
  },

  async loadCategories() {
    const user = Utils.getCurrentUser();
    if (!user) return;

    try {
      const categories = await window.api.categories.getAll(user.id);
      this.renderCategories(categories);
    } catch (err) {
      console.error(err);
    }
  },

  renderCategories(categories) {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;

    if (!Array.isArray(categories) || categories.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:30px; color:var(--text-muted);" class="card">No categories found</div>`;
      return;
    }

    grid.innerHTML = categories.map(c => `
      <div class="card" style="display:flex; align-items:center; gap:16px; border-left:4px solid ${c.color || '#6366f1'};">
        <div style="font-size:2rem;">${c.icon || '📦'}</div>
        <div>
          <div style="font-weight:700; font-size:1rem;">${c.name}</div>
          <div style="font-size:0.8rem; color:var(--text-muted); text-transform:capitalize;">${c.type}</div>
        </div>
      </div>
    `).join('');
  },

  showAddModal() {
    const form = document.getElementById('category-form');
    if (form) form.reset();
    document.getElementById('category-modal')?.classList.add('active');
  },

  hideModal() {
    document.getElementById('category-modal')?.classList.remove('active');
  },

  async handleSave(e) {
    e.preventDefault();
    const user = Utils.getCurrentUser();
    if (!user) return;

    const name = document.getElementById('cat-name')?.value.trim() || '';
    const type = document.getElementById('cat-type')?.value || 'expense';
    const icon = document.getElementById('cat-icon')?.value.trim() || '📦';

    if (!name) return;

    try {
      await window.api.categories.create({
        userId: Number(user.id),
        name,
        type,
        icon,
        color: type === 'income' ? '#10b981' : '#ef4444'
      });
      Toast.show('Category created!', 'success');
      this.hideModal();
      await this.loadCategories();
    } catch (err) {
      Toast.show(err.message || 'Failed to create category', 'error');
    }
  }
};

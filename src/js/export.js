const Export = {
  init() {},

  async exportJSON() {
    const user = Utils.getCurrentUser();
    if (!user) return;

    try {
      const res = await window.api.backup.export(user.id);
      if (res.success) {
        Toast.show('Data Backup Exported Successfully!', 'success');
      }
    } catch (err) {
      Toast.show(err.message || 'Export failed', 'error');
    }
  },

  async importJSON() {
    try {
      const res = await window.api.backup.import();
      if (res.success) {
        Toast.show(res.message, 'success');
        App.navigateTo('dashboard');
      } else if (res.message !== 'No file selected') {
        Toast.show(res.message, 'error');
      }
    } catch (err) {
      Toast.show(err.message || 'Import failed', 'error');
    }
  }
};

window.Export = Export;

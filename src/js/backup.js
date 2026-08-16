const Backup = {
  async exportData() {
    const user = Utils.getCurrentUser();
    if (!user) return;
    return await window.api.backup.export(user.id);
  },
  async importData() {
    return await window.api.backup.import();
  }
};

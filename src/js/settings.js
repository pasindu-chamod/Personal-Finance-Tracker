const Settings = {
  async init() {
    const user = Utils.getCurrentUser();
    if (!user) return;

    // Load profile values
    document.getElementById('set-fullname').value = user.full_name || '';
    document.getElementById('set-email').value = user.email || '';
    document.getElementById('set-currency').value = user.currency || 'LKR';

    // Load MySQL config values
    const mysqlConfig = await window.api.settings.getMysqlConfig();
    if (mysqlConfig) {
      document.getElementById('mysql-enabled').checked = !!mysqlConfig.enabled;
      document.getElementById('mysql-host').value = mysqlConfig.host || 'localhost';
      document.getElementById('mysql-port').value = mysqlConfig.port || 3306;
      document.getElementById('mysql-user').value = mysqlConfig.user || 'root';
      document.getElementById('mysql-pass').value = mysqlConfig.password || '';
      document.getElementById('mysql-dbname').value = mysqlConfig.database || 'smartfinance';
    }

    this.bindEvents();
  },

  bindEvents() {
    // MySQL Test Connection
    document.getElementById('mysql-test-btn').addEventListener('click', async () => {
      const config = this.getMysqlFormData();
      Toast.show('Testing MySQL connection...', 'info');
      const res = await window.api.settings.testMysql(config);
      if (res.success) {
        Toast.show(res.message, 'success');
      } else {
        Toast.show(res.message, 'error');
      }
    });

    // MySQL Save Config
    document.getElementById('mysql-config-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const config = this.getMysqlFormData();
      const res = await window.api.settings.saveMysqlConfig(config);
      if (res.success) {
        Toast.show(res.message, 'success');
      } else {
        Toast.show(res.message || 'Failed to save config', 'error');
      }
    });

    // Profile Settings Form
    document.getElementById('profile-settings-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = Utils.getCurrentUser();
      if (!user) return;

      const fullName = document.getElementById('set-fullname').value.trim();
      const email = document.getElementById('set-email').value.trim();
      const currency = document.getElementById('set-currency').value;

      try {
        const updatedUser = await window.api.auth.updateProfile({
          userId: user.id,
          fullName,
          email,
          currency
        });
        Utils.setCurrentUser(updatedUser);
        App.showAppLayout(updatedUser);
        Toast.show('Profile updated successfully!', 'success');
      } catch (err) {
        Toast.show(err.message || 'Profile update failed', 'error');
      }
    });
  },

  getMysqlFormData() {
    return {
      enabled: document.getElementById('mysql-enabled').checked,
      host: document.getElementById('mysql-host').value.trim() || 'localhost',
      port: parseInt(document.getElementById('mysql-port').value, 10) || 3306,
      user: document.getElementById('mysql-user').value.trim() || 'root',
      password: document.getElementById('mysql-pass').value,
      database: document.getElementById('mysql-dbname').value.trim() || 'smartfinance'
    };
  }
};

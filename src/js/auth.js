const Auth = {
  async showLogin() {
    try {
      const response = await fetch('pages/login.html');
      const html = await response.text();
      document.getElementById('auth-content').innerHTML = html;

      document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
      document.getElementById('to-register-link').addEventListener('click', (e) => {
        e.preventDefault();
        this.showRegister();
      });
    } catch (err) {
      console.error(err);
    }
  },

  async showRegister() {
    try {
      const response = await fetch('pages/register.html');
      const html = await response.text();
      document.getElementById('auth-content').innerHTML = html;

      document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
      document.getElementById('to-login-link').addEventListener('click', (e) => {
        e.preventDefault();
        this.showLogin();
      });
    } catch (err) {
      console.error(err);
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
      Toast.show('Please enter username and password', 'error');
      return;
    }

    try {
      const user = await window.api.auth.login({ username, password });
      if (user) {
        Utils.setCurrentUser(user);
        App.showAppLayout(user);
        App.navigateTo('dashboard');
        Toast.show(`Welcome back, ${Utils.getUserDisplayName(user)}!`, 'success');
      } else {
        Toast.show('Invalid username or password', 'error');
      }
    } catch (err) {
      Toast.show(err.message || 'Login failed', 'error');
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById('reg-fullname').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const currency = document.getElementById('reg-currency').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    if (!fullName || !username || !password) {
      Toast.show('Please fill in all required fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      Toast.show('Passwords do not match', 'error');
      return;
    }

    try {
      const user = await window.api.auth.register({ username, password, fullName, email, currency });
      Toast.show('Registration successful! Please login.', 'success');
      this.showLogin();
    } catch (err) {
      Toast.show(err.message || 'Registration failed', 'error');
    }
  }
};

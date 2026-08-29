const Auth = {
  async showLogin() {
    try {
      const authContent = document.getElementById('auth-content');
      if (authContent && !document.getElementById('login-form')) {
        let html = '';
        if (window.api && window.api.loadTemplate) {
          html = await window.api.loadTemplate('login');
        } else {
          const res = await fetch('pages/login.html');
          html = await res.text();
        }
        authContent.innerHTML = html;
      }
      this.bindLoginEvents();
    } catch (err) {
      console.error('showLogin error:', err);
      this.bindLoginEvents();
    }
  },

  bindLoginEvents() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.onsubmit = (e) => this.handleLogin(e);
    const toReg = document.getElementById('to-register-link');
    if (toReg) {
      toReg.onclick = (e) => {
        e.preventDefault();
        this.showRegister();
      };
    }
  },

  async showRegister() {
    try {
      const authContent = document.getElementById('auth-content');
      let html = '';
      if (window.api && window.api.loadTemplate) {
        html = await window.api.loadTemplate('register');
      } else {
        const res = await fetch('pages/register.html');
        html = await res.text();
      }
      if (authContent) authContent.innerHTML = html;
      this.bindRegisterEvents();
    } catch (err) {
      console.error('showRegister error:', err);
    }
  },

  bindRegisterEvents() {
    const regForm = document.getElementById('register-form');
    if (regForm) regForm.onsubmit = (e) => this.handleRegister(e);
    const toLog = document.getElementById('to-login-link');
    if (toLog) {
      toLog.onclick = (e) => {
        e.preventDefault();
        this.showLogin();
      };
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    console.log('[AUTH] handleLogin called, username:', username);

    if (!username || !password) {
      Toast.show('Please enter username and password', 'error');
      return;
    }

    try {
      console.log('[AUTH] calling window.api.auth.login...');
      const user = await window.api.auth.login({ username, password });
      console.log('[AUTH] login result:', user);
      if (user) {
        Utils.setCurrentUser(user);
        console.log('[AUTH] user saved to localStorage');
        console.log('[AUTH] window.App exists:', !!window.App);
        if (window.App) {
          console.log('[AUTH] calling showAppLayout...');
          window.App.showAppLayout(user);
          console.log('[AUTH] showAppLayout done, calling navigateTo dashboard...');
          await window.App.navigateTo('dashboard');
          console.log('[AUTH] navigateTo dashboard done');
        }
        Toast.show(`Welcome back, ${Utils.getUserDisplayName(user)}!`, 'success');
      } else {
        console.log('[AUTH] login returned null/falsy');
        Toast.show('Invalid username or password', 'error');
      }
    } catch (err) {
      console.error('[AUTH] handleLogin ERROR:', err);
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
      if (user) {
        Utils.setCurrentUser(user);
        if (window.App) {
          window.App.showAppLayout(user);
          await window.App.navigateTo('dashboard');
        }
        Toast.show(`Account created! Welcome, ${Utils.getUserDisplayName(user)}!`, 'success');
      } else {
        Toast.show('Registration failed', 'error');
      }
    } catch (err) {
      Toast.show(err.message || 'Registration failed', 'error');
    }
  }
};

window.Auth = Auth;

const Settings = {
  async init() {
    const user = Utils.getCurrentUser();
    if (!user) return;

    // Load profile values
    const nameElem = document.getElementById('set-fullname');
    const emailElem = document.getElementById('set-email');
    const currElem = document.getElementById('set-currency');

    if (nameElem) nameElem.value = Utils.getUserDisplayName(user);
    if (emailElem) emailElem.value = user.email || '';
    if (currElem) currElem.value = user.currency || 'LKR';

    this.bindEvents();
  },

  bindEvents() {
    const form = document.getElementById('profile-settings-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
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
  }
};

window.ALLOWED_COMPANY_NAME = "maxsa innovations and llc";

window.normalizeCompanyName = function normalizeCompanyName(name) {
  return String(name || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
};

window.isAllowedCompanyName = function isAllowedCompanyName(name) {
  return window.normalizeCompanyName(name) === window.ALLOWED_COMPANY_NAME;
};

window.initAuth = function initAuth() {
  firebase.auth().onAuthStateChanged(user => {
    const loginContainer = document.getElementById('login-container');
    const signupContainer = document.getElementById('signup-container');
    const warehouseApp = document.getElementById('warehouse-app');
    const headerBar = document.getElementById('app-header');

    if (user) {
      if (loginContainer) loginContainer.style.display = 'none';
      if (signupContainer) signupContainer.style.display = 'none';
      if (warehouseApp) warehouseApp.style.display = 'block';
      if (headerBar) headerBar.style.display = 'flex';

      if (typeof window.initWarehouseApp === 'function') {
        window.initWarehouseApp();
      }

      if (typeof window.loadWarehouseData === 'function') {
        window.loadWarehouseData();
      }

      if (typeof window.applyEditModeUI === 'function') {
        window.applyEditModeUI();
      }
    } else {
      if (loginContainer) loginContainer.style.display = 'flex';
      if (signupContainer) signupContainer.style.display = 'none';
      if (warehouseApp) warehouseApp.style.display = 'none';
      if (headerBar) headerBar.style.display = 'none';
    }
  });
};

document.addEventListener('DOMContentLoaded', function () {
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const showSignup = document.getElementById('show-signup');
  const showLogin = document.getElementById('show-login');
  const logoutBtn = document.getElementById('logout-btn');

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      firebase.auth().signInWithEmailAndPassword(email, password)
        .catch(error => alert(error.message));
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', async () => {
      const companyName = document.getElementById('signup-company').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;

      if (!window.isAllowedCompanyName(companyName)) {
        alert("This company doesn't have an account.");
        return;
      }

      try {
        const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);

        if (cred && cred.user) {
          await window.database.ref(`warehouse/users/${cred.user.uid}`).set({
            email,
            companyName,
            companyNameNormalized: window.normalizeCompanyName(companyName),
            createdAt: Date.now()
          });
        }

        alert("Sign up successful! You are now logged in.");
      } catch (error) {
        alert(error.message);
      }
    });
  }

  if (showSignup) {
    showSignup.addEventListener('click', () => {
      document.getElementById('login-container').style.display = 'none';
      document.getElementById('signup-container').style.display = 'flex';
    });
  }

  if (showLogin) {
    showLogin.addEventListener('click', () => {
      document.getElementById('signup-container').style.display = 'none';
      document.getElementById('login-container').style.display = 'flex';
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      firebase.auth().signOut();
    });
  }

  window.initAuth();
});

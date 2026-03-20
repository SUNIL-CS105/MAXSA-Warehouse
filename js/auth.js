=window.initAuth = function initAuth() {
  firebase.auth().onAuthStateChanged(user => {
    const loginContainer = document.getElementById('login-container');
    const signupContainer = document.getElementById('signup-container');
    const warehouseApp = document.getElementById('warehouse-app');
    const headerBar = document.getElementById('app-header');

    if (user) {
      loginContainer.style.display = 'none';
      signupContainer.style.display = 'none';
      warehouseApp.style.display = 'block';
      headerBar.style.display = 'flex';

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
      loginContainer.style.display = 'flex';
      signupContainer.style.display = 'none';
      warehouseApp.style.display = 'none';
      headerBar.style.display = 'none';
    }
  });
};

window.onload = function () {
  document.getElementById('login-btn').addEventListener('click', () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch(error => alert(error.message));
  });

  document.getElementById('show-signup').addEventListener('click', () => {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('signup-container').style.display = 'flex';
  });

  document.getElementById('show-login').addEventListener('click', () => {
    document.getElementById('signup-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'flex';
  });

  document.getElementById('signup-btn').addEventListener('click', () => {
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        alert("Sign up successful! You are now logged in.");
      })
      .catch(error => alert(error.message));
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    firebase.auth().signOut();
  });

  window.initAuth();
};

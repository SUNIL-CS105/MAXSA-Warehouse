window.onload = function () {
    const loginContainer = document.getElementById('login-container');
    const signupContainer = document.getElementById('signup-container');
    const warehouseApp = document.getElementById('warehouse-app');
    const logoutBtn = document.getElementById('logout-btn');

    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');

    loginBtn.onclick = () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        firebase.auth().signInWithEmailAndPassword(email, password)
            .catch(err => alert(err.message));
    };

    signupBtn.onclick = () => {
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .catch(err => alert(err.message));
    };

    logoutBtn.onclick = () => firebase.auth().signOut();

    showSignup.onclick = () => {
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'flex';
    };

    showLogin.onclick = () => {
        signupContainer.style.display = 'none';
        loginContainer.style.display = 'flex';
    };

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            loginContainer.style.display = 'none';
            signupContainer.style.display = 'none';
            warehouseApp.style.display = 'block';
            logoutBtn.style.display = 'block';

            createGridLabels();
            setupEventListeners();
            loadWarehouseData();
        } else {
            loginContainer.style.display = 'flex';
            signupContainer.style.display = 'none';
            warehouseApp.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    });
};

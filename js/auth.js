// --- Authentication ---
const loginContainer = document.getElementById('login-container');
const signupContainer = document.getElementById('signup-container');
const warehouseApp = document.getElementById('warehouse-app');
const logoutBtn = document.getElementById('logout-btn');

function initAuth() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            loginContainer.style.display = 'none';
            signupContainer.style.display = 'none';
            warehouseApp.style.display = 'block';
            logoutBtn.style.display = 'block';
            initWarehouseApp();  // Initialize warehouse after login
        } else {
            loginContainer.style.display = 'flex';
            signupContainer.style.display = 'none';
            warehouseApp.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    });
}

// Login button
document.getElementById('login-btn').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    firebase.auth().signInWithEmailAndPassword(email, password)
        .catch(err => alert(err.message));
});

// Logout
logoutBtn.addEventListener('click', () => firebase.auth().signOut());

// Signup
document.getElementById('show-signup').addEventListener('click', () => {
    loginContainer.style.display = 'none';
    signupContainer.style.display = 'flex';
});
document.getElementById('show-login').addEventListener('click', () => {
    signupContainer.style.display = 'none';
    loginContainer.style.display = 'flex';
});
document.getElementById('signup-btn').addEventListener('click', () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => alert("Sign up successful!"))
        .catch(err => alert(err.message));
});

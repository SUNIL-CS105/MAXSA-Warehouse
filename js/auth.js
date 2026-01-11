firebase.auth().onAuthStateChanged(user => {
    if (user) {
        loginContainer.style.display = 'none';
        warehouseApp.style.display = 'block';
        loadWarehouseData();
        createGridLabels();
        setupEventListeners();
    } else {
        loginContainer.style.display = 'flex';
        warehouseApp.style.display = 'none';
    }
});

loginBtn.onclick = () => {
    firebase.auth().signInWithEmailAndPassword(loginEmail.value, loginPassword.value)
        .catch(e => alert(e.message));
};

logoutBtn.onclick = () => firebase.auth().signOut();

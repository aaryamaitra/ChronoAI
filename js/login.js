// =============================
// CHRONOAI REAL LOGIN + REGISTER
// Connected to Node.js Backend + MongoDB Atlas
// Uses your existing login.html IDs: email, password, loginForm
// =============================

const AUTH_BACKEND_URL = "http://localhost:5000/api/auth";

let isRegisterMode = false;

function getEl(id){
    return document.getElementById(id);
}

const loginForm = getEl("loginForm");
const emailInput = getEl("email");
const passwordInput = getEl("password");
const loginBtn = getEl("loginBtn");
const loginError = getEl("loginError");
const loginSubtitle = getEl("loginSubtitle");
const accountText = getEl("accountText");
const accountLink = getEl("accountLink");
const togglePassword = getEl("togglePassword");
const rememberMe = getEl("rememberMe");

function showLoginMessage(message, type){
    if(!loginError) return;

    loginError.textContent = message;

    if(type === "success"){
        loginError.style.color = "#31D0AA";
    }
    else if(type === "info"){
        loginError.style.color = "#46C6FF";
    }
    else{
        loginError.style.color = "#ff6b7a";
    }
}

function clearLoginMessage(){
    if(loginError){
        loginError.textContent = "";
    }
}

function saveUserSession(data){
    localStorage.setItem("chronoLoggedIn", "true");
    localStorage.setItem("chronoToken", data.token);
    localStorage.setItem("chronoUserId", data.user.id);
    localStorage.setItem("chronoUserName", data.user.name);
    localStorage.setItem("chronoUserEmail", data.user.email);
    localStorage.setItem("chronoSelectedPlan", data.user.plan || "Free");
    localStorage.setItem("chronoPaymentStatus", data.user.paymentStatus || "Not Paid");
    localStorage.setItem("chronoAuthProvider", "Email");
}

function createNameInput(){
    if(getEl("name")) return;

    const nameInput = document.createElement("input");

    nameInput.type = "text";
    nameInput.id = "name";
    nameInput.placeholder = "Full Name";
    nameInput.autocomplete = "name";

    loginForm.insertBefore(nameInput, emailInput);
}

function removeNameInput(){
    const nameInput = getEl("name");

    if(nameInput){
        nameInput.remove();
    }
}

function switchToRegisterMode(){
    isRegisterMode = true;

    createNameInput();

    if(loginSubtitle){
        loginSubtitle.textContent = "Create Your Account";
    }

    if(loginBtn){
        loginBtn.textContent = "Create Account";
    }

    if(accountText){
        accountText.textContent = "Already have an account?";
    }

    if(accountLink){
        accountLink.textContent = "Login";
    }

    clearLoginMessage();
}

function switchToLoginMode(){
    isRegisterMode = false;

    removeNameInput();

    if(loginSubtitle){
        loginSubtitle.textContent = "Welcome Back";
    }

    if(loginBtn){
        loginBtn.textContent = "Login";
    }

    if(accountText){
        accountText.textContent = "Don't have an account?";
    }

    if(accountLink){
        accountLink.textContent = "Create Account";
    }

    clearLoginMessage();
}

async function registerUser(){
    const nameInput = getEl("name");

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if(name === ""){
        showLoginMessage("Please enter your full name.", "error");
        return;
    }

    if(email === ""){
        showLoginMessage("Please enter your email.", "error");
        return;
    }

    if(password.length < 6){
        showLoginMessage("Password must be at least 6 characters.", "error");
        return;
    }

    showLoginMessage("Creating your account...", "info");

    try{
        const response = await fetch(AUTH_BACKEND_URL + "/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if(!data.success){
            showLoginMessage(data.message || "Registration failed.", "error");
            return;
        }

        saveUserSession(data);

        showLoginMessage("Account created successfully. Opening dashboard...", "success");

        setTimeout(function(){
            window.location.href = "dashboard.html";
        }, 900);

    }
    catch(error){
        console.error(error);
        showLoginMessage("Backend not connected. Keep backend running on port 5000.", "error");
    }
}

async function loginUser(){
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if(email === ""){
        showLoginMessage("Please enter your email.", "error");
        return;
    }

    if(password === ""){
        showLoginMessage("Please enter your password.", "error");
        return;
    }

    showLoginMessage("Logging in...", "info");

    try{
        const response = await fetch(AUTH_BACKEND_URL + "/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if(!data.success){
            showLoginMessage(data.message || "Login failed.", "error");
            return;
        }

        if(rememberMe && rememberMe.checked){
            localStorage.setItem("chronoRememberEmail", email);
        }
        else{
            localStorage.removeItem("chronoRememberEmail");
        }

        saveUserSession(data);

        showLoginMessage("Login successful. Opening dashboard...", "success");

        setTimeout(function(){
            window.location.href = "dashboard.html";
        }, 700);

    }
    catch(error){
        console.error(error);
        showLoginMessage("Backend not connected. Keep backend running on port 5000.", "error");
    }
}

// =============================
// FORM SUBMIT
// =============================

if(loginForm){
    loginForm.addEventListener("submit", function(event){
        event.preventDefault();

        if(isRegisterMode){
            registerUser();
        }
        else{
            loginUser();
        }
    });
}

// =============================
// CREATE ACCOUNT / LOGIN SWITCH
// =============================

if(accountLink){
    accountLink.addEventListener("click", function(event){
        event.preventDefault();

        if(isRegisterMode){
            switchToLoginMode();
        }
        else{
            switchToRegisterMode();
        }
    });
}

// =============================
// SHOW / HIDE PASSWORD
// =============================

if(togglePassword && passwordInput){
    togglePassword.addEventListener("click", function(){
        if(passwordInput.type === "password"){
            passwordInput.type = "text";
            togglePassword.textContent = "🙈";
        }
        else{
            passwordInput.type = "password";
            togglePassword.textContent = "👁️";
        }
    });
}

// =============================
// REMEMBER EMAIL
// =============================

const rememberedEmail = localStorage.getItem("chronoRememberEmail");

if(rememberedEmail && emailInput){
    emailInput.value = rememberedEmail;

    if(rememberMe){
        rememberMe.checked = true;
    }
}

// =============================
// FORGOT PASSWORD MODAL
// Frontend message only for now
// =============================

const forgotPasswordLink = getEl("forgotPasswordLink");
const resetModal = getEl("resetModal");
const closeResetBtn = getEl("closeResetBtn");
const sendResetBtn = getEl("sendResetBtn");
const resetEmail = getEl("resetEmail");
const resetMessage = getEl("resetMessage");

if(forgotPasswordLink){
    forgotPasswordLink.addEventListener("click", function(event){
        event.preventDefault();

        if(resetModal){
            resetModal.classList.add("show");
        }
    });
}

if(closeResetBtn){
    closeResetBtn.addEventListener("click", function(){
        if(resetModal){
            resetModal.classList.remove("show");
        }
    });
}

if(sendResetBtn){
    sendResetBtn.addEventListener("click", function(){
        if(resetMessage){
            resetMessage.textContent = "Password reset email feature will be added after email service setup.";
            resetMessage.style.color = "#46C6FF";
        }
    });
}

// =============================
// SOCIAL LOGIN BUTTONS
// Real OAuth will be added later
// =============================

const googleLoginBtn = getEl("googleLoginBtn");
const githubLoginBtn = getEl("githubLoginBtn");

if(googleLoginBtn){
    googleLoginBtn.addEventListener("click", function(){
        showLoginMessage("Google login will be added after OAuth setup. Use email login for now.", "info");
    });
}

if(githubLoginBtn){
    githubLoginBtn.addEventListener("click", function(){
        showLoginMessage("GitHub login will be added after OAuth setup. Use email login for now.", "info");
    });
}

// =============================
// INITIAL MODE
// =============================

switchToLoginMode();
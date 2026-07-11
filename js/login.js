// =============================
// CHRONOAI LOGIN SYSTEM
// LocalStorage Demo Authentication
// =============================

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginError = document.getElementById("loginError");
const loginBtn = document.getElementById("loginBtn");

const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const resetModal = document.getElementById("resetModal");
const resetEmail = document.getElementById("resetEmail");
const resetMessage = document.getElementById("resetMessage");
const sendResetBtn = document.getElementById("sendResetBtn");
const closeResetBtn = document.getElementById("closeResetBtn");

const googleLoginBtn = document.getElementById("googleLoginBtn");
const githubLoginBtn = document.getElementById("githubLoginBtn");

const accountText = document.getElementById("accountText");
const accountLink = document.getElementById("accountLink");
const loginSubtitle = document.getElementById("loginSubtitle");

let authMode = "login";


// =============================
// IF ALREADY LOGGED IN
// =============================

if(localStorage.getItem("chronoLoggedIn") === "true"){
    window.location.replace("dashboard.html");
}


// =============================
// HELPER FUNCTIONS
// =============================

function getUsers(){
    try{
        return JSON.parse(localStorage.getItem("chronoUsers")) || {};
    }
    catch(error){
        return {};
    }
}

function saveUsers(users){
    localStorage.setItem("chronoUsers", JSON.stringify(users));
}

function showError(message, type = "error"){
    if(!loginError) return;

    loginError.textContent = message;

    if(type === "success"){
        loginError.style.color = "#31D0AA";
    }
    else{
        loginError.style.color = "#ff6b6b";
    }
}

function showResetMessage(message, type = "error"){
    if(!resetMessage) return;

    resetMessage.textContent = message;

    if(type === "success"){
        resetMessage.style.color = "#31D0AA";
    }
    else{
        resetMessage.style.color = "#ff6b6b";
    }
}

function isValidEmail(email){
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function makeNameFromEmail(email){
    const namePart = email.split("@")[0];

    return namePart
        .replace(/[._-]/g, " ")
        .split(" ")
        .map(function(word){
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
}

function loginUser(email, provider){
    const userName = makeNameFromEmail(email);

    localStorage.setItem("chronoLoggedIn", "true");
    localStorage.setItem("chronoUserEmail", email);
    localStorage.setItem("chronoUserName", userName);
    localStorage.setItem("chronoAuthProvider", provider);

    window.location.href = "dashboard.html";
}


// =============================
// SHOW / HIDE PASSWORD
// =============================

if(togglePassword && passwordInput){

    togglePassword.addEventListener("click", function(){

        if(passwordInput.type === "password"){
            passwordInput.type = "text";
            togglePassword.innerHTML = "🙈";
        }
        else{
            passwordInput.type = "password";
            togglePassword.innerHTML = "👁️";
        }

    });

}


// =============================
// LOGIN / CREATE ACCOUNT
// =============================

if(loginForm){

    loginForm.addEventListener("submit", function(e){

        e.preventDefault();

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();

        if(email === ""){
            showError("Please enter your email address.");
            return;
        }

        if(!isValidEmail(email)){
            showError("Please enter a valid email address.");
            return;
        }

        if(password === ""){
            showError("Please enter your password.");
            return;
        }

        if(password.length < 6){
            showError("Password must be at least 6 characters.");
            return;
        }

        const users = getUsers();

        if(authMode === "signup"){

            if(users[email]){
                showError("Account already exists. Please login instead.");
                return;
            }

            users[email] = {
                email: email,
                password: password,
                name: makeNameFromEmail(email),
                provider: "Email"
            };

            saveUsers(users);

            showError("Account created successfully. Redirecting...", "success");

            setTimeout(function(){
                loginUser(email, "Email");
            }, 700);

        }
        else{

            if(!users[email]){
                showError("Account not found. Please create an account first.");
                return;
            }

            if(users[email].provider !== "Email"){
                showError("This account was created using " + users[email].provider + ". Please use that login option.");
                return;
            }

            if(users[email].password !== password){
                showError("Incorrect password. Please try again.");
                return;
            }

            showError("Login successful. Redirecting...", "success");

            setTimeout(function(){
                loginUser(email, "Email");
            }, 700);

        }

    });

}


// =============================
// SWITCH LOGIN / SIGNUP MODE
// =============================

if(accountLink){

    accountLink.addEventListener("click", function(e){

        e.preventDefault();

        showError("");

        if(authMode === "login"){

            authMode = "signup";

            loginSubtitle.textContent = "Create Your Account";
            loginBtn.textContent = "Create Account";
            accountText.textContent = "Already have an account?";
            accountLink.textContent = "Login";

            passwordInput.setAttribute("autocomplete", "new-password");

        }
        else{

            authMode = "login";

            loginSubtitle.textContent = "Welcome Back";
            loginBtn.textContent = "Login";
            accountText.textContent = "Don't have an account?";
            accountLink.textContent = "Create Account";

            passwordInput.setAttribute("autocomplete", "current-password");

        }

    });

}


// =============================
// FORGOT PASSWORD DEMO
// =============================

if(forgotPasswordLink){

    forgotPasswordLink.addEventListener("click", function(e){

        e.preventDefault();

        resetModal.classList.add("show");
        resetEmail.value = emailInput.value.trim();
        resetMessage.textContent = "";

    });

}

if(closeResetBtn){

    closeResetBtn.addEventListener("click", function(){
        resetModal.classList.remove("show");
    });

}

if(sendResetBtn){

    sendResetBtn.addEventListener("click", function(){

        const email = resetEmail.value.trim().toLowerCase();

        if(email === ""){
            showResetMessage("Please enter your email address.");
            return;
        }

        if(!isValidEmail(email)){
            showResetMessage("Please enter a valid email address.");
            return;
        }

        showResetMessage("If this email is registered, a password reset link has been sent. Demo mode.", "success");

        setTimeout(function(){
            resetModal.classList.remove("show");
        }, 1800);

    });

}

// =============================
// PROFESSIONAL GOOGLE / GITHUB LOGIN DEMO
// =============================

const providerModal = document.getElementById("providerModal");
const providerIcon = document.getElementById("providerIcon");
const providerTitle = document.getElementById("providerTitle");
const providerSubtitle = document.getElementById("providerSubtitle");
const providerEmail = document.getElementById("providerEmail");
const providerMessage = document.getElementById("providerMessage");
const continueProviderBtn = document.getElementById("continueProviderBtn");
const closeProviderBtn = document.getElementById("closeProviderBtn");

let selectedProvider = "Google";

function providerLogin(providerName){

    selectedProvider = providerName;

    if(providerModal){
        providerModal.classList.add("show");
    }

    if(providerTitle){
        providerTitle.textContent = "Continue with " + providerName;
    }

    if(providerSubtitle){
        providerSubtitle.textContent = "Enter your email to continue with " + providerName + ".";
    }

    if(providerIcon){
        if(providerName === "GitHub"){
            providerIcon.textContent = "⌘";
            providerIcon.classList.add("github-icon");
        }
        else{
            providerIcon.textContent = "G";
            providerIcon.classList.remove("github-icon");
        }
    }

    if(providerEmail){
        providerEmail.value = emailInput.value.trim();
        providerEmail.focus();
    }

    if(providerMessage){
        providerMessage.textContent = "";
    }

}

function closeProviderModal(){

    if(providerModal){
        providerModal.classList.remove("show");
    }

}

function completeProviderLogin(){

    let email = providerEmail.value.trim().toLowerCase();

    if(email === ""){
        providerMessage.textContent = "Please enter your email address.";
        providerMessage.style.color = "#ff6b6b";
        return;
    }

    if(!isValidEmail(email)){
        providerMessage.textContent = "Please enter a valid email address.";
        providerMessage.style.color = "#ff6b6b";
        return;
    }

    const users = getUsers();

    if(!users[email]){
        users[email] = {
            email: email,
            password: null,
            name: makeNameFromEmail(email),
            provider: selectedProvider
        };

        saveUsers(users);
    }

    providerMessage.textContent = selectedProvider + " login successful. Redirecting...";
    providerMessage.style.color = "#31D0AA";

    setTimeout(function(){
        loginUser(email, selectedProvider);
    }, 800);

}

if(continueProviderBtn){
    continueProviderBtn.addEventListener("click", completeProviderLogin);
}

if(closeProviderBtn){
    closeProviderBtn.addEventListener("click", closeProviderModal);
}

if(providerEmail){
    providerEmail.addEventListener("keydown", function(e){
        if(e.key === "Enter"){
            completeProviderLogin();
        }
    });
}

window.addEventListener("click", function(e){
    if(e.target === providerModal){
        closeProviderModal();
    }
});

if(googleLoginBtn){

    googleLoginBtn.addEventListener("click", function(){
        providerLogin("Google");
    });

}

if(githubLoginBtn){

    githubLoginBtn.addEventListener("click", function(){
        providerLogin("GitHub");
    });

}


// =============================
// CLOSE RESET MODAL OUTSIDE CLICK
// =============================

window.addEventListener("click", function(e){

    if(e.target === resetModal){
        resetModal.classList.remove("show");
    }

});
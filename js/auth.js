// =============================
// CHRONOAI AUTH CHECK
// Checks real JWT token using /api/auth/me
// =============================

const CHRONO_AUTH_API = "http://localhost:5000/api/auth";

async function checkChronoAuth(){
    const token = localStorage.getItem("chronoToken");

    if(!token){
        localStorage.removeItem("chronoLoggedIn");
        window.location.href = "login.html";
        return;
    }

    try{
        const response = await fetch(CHRONO_AUTH_API + "/me", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();

        if(!data.success){
            clearChronoSession();
            window.location.href = "login.html";
            return;
        }

        localStorage.setItem("chronoLoggedIn", "true");
        localStorage.setItem("chronoUserId", data.user.id);
        localStorage.setItem("chronoUserName", data.user.name);
        localStorage.setItem("chronoUserEmail", data.user.email);
        localStorage.setItem("chronoSelectedPlan", data.user.plan || "Free");
        localStorage.setItem("chronoPaymentStatus", data.user.paymentStatus || "Not Paid");

        updateUserUI(data.user);

    }
    catch(error){
        console.error("Auth check failed:", error);
        clearChronoSession();
        window.location.href = "login.html";
    }
}

function updateUserUI(user){
    const nameElements = document.querySelectorAll(
        "#userName, #profileName, .user-name, .profile-name"
    );

    const emailElements = document.querySelectorAll(
        "#userEmail, #profileEmail, .user-email, .profile-email"
    );

    const planElements = document.querySelectorAll(
        "#userPlan, #profilePlan, .user-plan, .profile-plan"
    );

    const paymentElements = document.querySelectorAll(
        "#paymentStatus, #profilePaymentStatus, .payment-status"
    );

    nameElements.forEach(function(el){
        el.textContent = user.name;
    });

    emailElements.forEach(function(el){
        el.textContent = user.email;
    });

    planElements.forEach(function(el){
        el.textContent = user.plan || "Free";
    });

    paymentElements.forEach(function(el){
        el.textContent = user.paymentStatus || "Not Paid";
    });
}

function clearChronoSession(){
    localStorage.removeItem("chronoLoggedIn");
    localStorage.removeItem("chronoToken");
    localStorage.removeItem("chronoUserId");
    localStorage.removeItem("chronoUserName");
    localStorage.removeItem("chronoUserEmail");
    localStorage.removeItem("chronoSelectedPlan");
    localStorage.removeItem("chronoPaymentStatus");
    localStorage.removeItem("chronoAuthProvider");
}

function logoutChronoUser(){
    clearChronoSession();
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function(){
    checkChronoAuth();
});
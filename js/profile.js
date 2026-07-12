// =============================
// CHRONOAI PROFILE PAGE
// Real user data from backend + local study settings
// =============================

const PROFILE_AUTH_API = "http://localhost:5000/api/auth";

function getEl(id){
    return document.getElementById(id);
}

function showProfileToast(message){
    let toast = document.querySelector(".profile-toast");

    if(!toast){
        toast = document.createElement("div");
        toast.className = "profile-toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(function(){
        toast.classList.remove("show");
    }, 2500);
}

function formatDate(dateValue){
    if(!dateValue){
        return "Not available";
    }

    const date = new Date(dateValue);

    if(isNaN(date.getTime())){
        return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function getProfileData(){
    return {
        name: localStorage.getItem("chronoUserName") || "User",
        email: localStorage.getItem("chronoUserEmail") || "user@example.com",
        goal: localStorage.getItem("chronoStudyGoal") || "Build better productivity habits with ChronoAI.",
        targetHours: localStorage.getItem("chronoDailyTargetHours") || "2",
        plan: localStorage.getItem("chronoSelectedPlan") || "Free",
        paymentStatus: localStorage.getItem("chronoPaymentStatus") || "Not Paid",
        createdAt: localStorage.getItem("chronoAccountCreatedAt") || ""
    };
}

function createAccountDetailsBox(){
    const oldBox = getEl("profileAccountDetails");

    if(oldBox){
        return;
    }

    const mainCard = document.querySelector(".profile-main-card");

    if(!mainCard){
        return;
    }

    const box = document.createElement("div");
    box.className = "profile-account-details";
    box.id = "profileAccountDetails";

    box.innerHTML = `
        <h3>Account Details</h3>

        <div class="account-grid">

            <div>
                <span>Payment Status</span>
                <strong id="profilePaymentStatus">Not Paid</strong>
            </div>

            <div>
                <span>Account Created</span>
                <strong id="profileCreatedAt">Not available</strong>
            </div>

            <div>
                <span>Login Provider</span>
                <strong id="profileProvider">Email</strong>
            </div>

            <div>
                <span>Account Status</span>
                <strong>Active</strong>
            </div>

        </div>

        <button type="button" class="profile-logout-btn" id="profileLogoutBtn">
            Logout
        </button>
    `;

    mainCard.appendChild(box);

    const logoutBtn = getEl("profileLogoutBtn");

    if(logoutBtn){
        logoutBtn.addEventListener("click", logoutProfileUser);
    }
}

function loadProfilePage(){
    createAccountDetailsBox();

    const profile = getProfileData();

    if(getEl("profileNameInput")){
        getEl("profileNameInput").value = profile.name;
        getEl("profileNameInput").readOnly = true;
    }

    if(getEl("profileEmailInput")){
        getEl("profileEmailInput").value = profile.email;
        getEl("profileEmailInput").readOnly = true;
    }

    if(getEl("profileGoalInput")){
        getEl("profileGoalInput").value = profile.goal;
    }

    if(getEl("profileTargetHoursInput")){
        getEl("profileTargetHoursInput").value = profile.targetHours;
    }

    if(getEl("profileDisplayName")){
        getEl("profileDisplayName").textContent = profile.name;
    }

    if(getEl("profileDisplayEmail")){
        getEl("profileDisplayEmail").textContent = profile.email;
    }

    if(getEl("profilePlan")){
        getEl("profilePlan").textContent = profile.plan + " Plan";
    }

    if(getEl("profilePlanBadge")){
        getEl("profilePlanBadge").textContent = profile.plan + " Plan";
    }

    if(getEl("profileTarget")){
        getEl("profileTarget").textContent = profile.targetHours + " Hours";
    }

    if(getEl("profileGoalShort")){
        getEl("profileGoalShort").textContent = profile.goal.length > 25
            ? profile.goal.slice(0, 25) + "..."
            : profile.goal;
    }

    if(getEl("profileGoalText")){
        getEl("profileGoalText").textContent = "Goal: " + profile.goal;
    }

    if(getEl("profileAvatar")){
        getEl("profileAvatar").textContent = profile.name.charAt(0).toUpperCase();
    }

    if(getEl("profilePaymentStatus")){
        getEl("profilePaymentStatus").textContent = profile.paymentStatus;
    }

    if(getEl("profileCreatedAt")){
        getEl("profileCreatedAt").textContent = formatDate(profile.createdAt);
    }

    if(getEl("profileProvider")){
        getEl("profileProvider").textContent = localStorage.getItem("chronoAuthProvider") || "Email";
    }
}

async function syncProfileFromBackend(){
    const token = localStorage.getItem("chronoToken");

    if(!token){
        window.location.href = "login.html";
        return;
    }

    try{
        const response = await fetch(PROFILE_AUTH_API + "/me", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();

        if(!data.success){
            logoutProfileUser();
            return;
        }

        localStorage.setItem("chronoLoggedIn", "true");
        localStorage.setItem("chronoUserId", data.user.id);
        localStorage.setItem("chronoUserName", data.user.name);
        localStorage.setItem("chronoUserEmail", data.user.email);
        localStorage.setItem("chronoSelectedPlan", data.user.plan || "Free");
        localStorage.setItem("chronoPaymentStatus", data.user.paymentStatus || "Not Paid");
        localStorage.setItem("chronoAccountCreatedAt", data.user.createdAt || "");

        loadProfilePage();

    }
    catch(error){
        console.error("Profile sync error:", error);
        showProfileToast("Unable to load profile from backend.");
    }
}

function saveProfilePage(){
    const goal = getEl("profileGoalInput").value.trim();
    const targetHours = getEl("profileTargetHoursInput").value.trim();

    if(goal === ""){
        showProfileToast("Please enter your study goal.");
        return;
    }

    if(targetHours === "" || Number(targetHours) <= 0){
        showProfileToast("Please enter valid daily target hours.");
        return;
    }

    if(Number(targetHours) > 12){
        showProfileToast("Daily target cannot be more than 12 hours.");
        return;
    }

    localStorage.setItem("chronoStudyGoal", goal);
    localStorage.setItem("chronoDailyTargetHours", targetHours);

    loadProfilePage();

    showProfileToast("Profile updated successfully.");
}

function logoutProfileUser(){
    localStorage.removeItem("chronoLoggedIn");
    localStorage.removeItem("chronoToken");
    localStorage.removeItem("chronoUserId");
    localStorage.removeItem("chronoUserName");
    localStorage.removeItem("chronoUserEmail");
    localStorage.removeItem("chronoSelectedPlan");
    localStorage.removeItem("chronoPaymentStatus");
    localStorage.removeItem("chronoAccountCreatedAt");
    localStorage.removeItem("chronoAuthProvider");

    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function(){
    loadProfilePage();
    syncProfileFromBackend();
});
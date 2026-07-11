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

function getProfileData(){
    return {
        name: localStorage.getItem("chronoUserName") || "User",
        email: localStorage.getItem("chronoUserEmail") || "user@example.com",
        goal: localStorage.getItem("chronoStudyGoal") || "Build better productivity habits with ChronoAI.",
        targetHours: localStorage.getItem("chronoDailyTargetHours") || "2",
        plan: localStorage.getItem("chronoSelectedPlan") || "Free"
    };
}

function loadProfilePage(){
    const profile = getProfileData();

    getEl("profileNameInput").value = profile.name;
    getEl("profileEmailInput").value = profile.email;
    getEl("profileGoalInput").value = profile.goal;
    getEl("profileTargetHoursInput").value = profile.targetHours;

    getEl("profileDisplayName").textContent = profile.name;
    getEl("profileDisplayEmail").textContent = profile.email;
    getEl("profilePlan").textContent = profile.plan + " Plan";
    getEl("profilePlanBadge").textContent = profile.plan + " Plan";
    getEl("profileTarget").textContent = profile.targetHours + " Hours";
    getEl("profileGoalShort").textContent = profile.goal.length > 25
        ? profile.goal.slice(0,25) + "..."
        : profile.goal;

    getEl("profileGoalText").textContent = "Goal: " + profile.goal;
    getEl("profileAvatar").textContent = profile.name.charAt(0).toUpperCase();
}

function saveProfilePage(){
    const name = getEl("profileNameInput").value.trim();
    const email = getEl("profileEmailInput").value.trim();
    const goal = getEl("profileGoalInput").value.trim();
    const targetHours = getEl("profileTargetHoursInput").value.trim();

    if(name === ""){
        showProfileToast("Please enter your name.");
        return;
    }

    if(email === ""){
        showProfileToast("Please enter your email.");
        return;
    }

    if(goal === ""){
        showProfileToast("Please enter your study goal.");
        return;
    }

    if(targetHours === "" || Number(targetHours) <= 0){
        showProfileToast("Please enter valid daily target hours.");
        return;
    }

    localStorage.setItem("chronoUserName", name);
    localStorage.setItem("chronoUserEmail", email);
    localStorage.setItem("chronoStudyGoal", goal);
    localStorage.setItem("chronoDailyTargetHours", targetHours);

    loadProfilePage();

    showProfileToast("Profile updated successfully.");
}

loadProfilePage();
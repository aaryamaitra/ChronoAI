const isLoggedIn = localStorage.getItem("chronoLoggedIn");

if(isLoggedIn !== "true"){
    window.location.replace("login.html");
}

function getEl(id){
    return document.getElementById(id);
}

function escapeHTML(value){
    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}

function showDashboardToast(message){
    let toast = document.querySelector(".dashboard-toast");

    if(!toast){
        toast = document.createElement("div");
        toast.className = "dashboard-toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(function(){
        toast.classList.remove("show");
    }, 2500);
}

/* Live Clock */
function updateLiveClock(){
    const clock = getEl("liveClock");

    if(!clock) return;

    const now = new Date();

    clock.textContent = now.toLocaleTimeString("en-US", {
        hour:"2-digit",
        minute:"2-digit",
        second:"2-digit",
        hour12:false
    });
}

setInterval(updateLiveClock, 1000);
updateLiveClock();

/* Pomodoro */
let timerTime = 25 * 60;
let timerInterval = null;

function updateTimerDisplay(){
    const timer = getEl("timer");

    if(!timer) return;

    const minutes = Math.floor(timerTime / 60);
    const seconds = timerTime % 60;

    timer.textContent =
        String(minutes).padStart(2,"0") + ":" +
        String(seconds).padStart(2,"0");
}

function startTimer(){
    if(timerInterval) return;

    timerInterval = setInterval(function(){
        if(timerTime > 0){
            timerTime--;
            updateTimerDisplay();
        }
        else{
            clearInterval(timerInterval);
            timerInterval = null;
            showDashboardToast("Pomodoro session completed.");
            playAlarmSound("Medium");
        }
    }, 1000);
}

function pauseTimer(){
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer(){
    clearInterval(timerInterval);
    timerInterval = null;
    timerTime = 25 * 60;
    updateTimerDisplay();
}

updateTimerDisplay();

/* Stopwatch */
let stopwatchSeconds = 0;
let stopwatchInterval = null;

function updateStopwatchDisplay(){
    const stopwatch = getEl("stopwatch");

    if(!stopwatch) return;

    const hours = Math.floor(stopwatchSeconds / 3600);
    const minutes = Math.floor((stopwatchSeconds % 3600) / 60);
    const seconds = stopwatchSeconds % 60;

    stopwatch.textContent =
        String(hours).padStart(2,"0") + ":" +
        String(minutes).padStart(2,"0") + ":" +
        String(seconds).padStart(2,"0");
}

function startStopwatch(){
    if(stopwatchInterval) return;

    stopwatchInterval = setInterval(function(){
        stopwatchSeconds++;
        updateStopwatchDisplay();
    }, 1000);
}

function stopStopwatch(){
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
}

function resetStopwatch(){
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    stopwatchSeconds = 0;
    updateStopwatchDisplay();
}

updateStopwatchDisplay();

/* Audio */
let chronoAudioContext = null;

function getChronoAudioContext(){
    if(!chronoAudioContext){
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        chronoAudioContext = new AudioContextClass();
    }

    return chronoAudioContext;
}

async function unlockChronoSound(){
    try{
        const audioContext = getChronoAudioContext();

        if(audioContext.state === "suspended"){
            await audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);

        localStorage.setItem("chronoSoundEnabled", "true");

        updateSoundButton();

        showDashboardToast("Alarm sound enabled.");
    }
    catch(error){
        showDashboardToast("Please click Enable Sound again.");
    }
}

function updateSoundButton(){
    const button = getEl("soundPermissionBtn");

    if(!button) return;

    if(localStorage.getItem("chronoSoundEnabled") === "true"){
        button.textContent = "Sound Enabled";
    }
    else{
        button.textContent = "Enable Sound";
    }
}

updateSoundButton();

async function playAlarmSound(priority){
    try{
        const audioContext = getChronoAudioContext();

        if(audioContext.state === "suspended"){
            await audioContext.resume();
        }

        const startTime = audioContext.currentTime;
        const totalDuration = 5;

        const masterGain = audioContext.createGain();
        const compressor = audioContext.createDynamicsCompressor();

        compressor.threshold.setValueAtTime(-18, startTime);
        compressor.knee.setValueAtTime(25, startTime);
        compressor.ratio.setValueAtTime(8, startTime);
        compressor.attack.setValueAtTime(0.003, startTime);
        compressor.release.setValueAtTime(0.25, startTime);

        masterGain.connect(compressor);
        compressor.connect(audioContext.destination);

        masterGain.gain.setValueAtTime(0.95, startTime);
        masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + totalDuration);

        function playNote(freq, time, length, volume, type){
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = type || "sine";
            oscillator.frequency.setValueAtTime(freq, time);

            gainNode.gain.setValueAtTime(0.001, time);
            gainNode.gain.exponentialRampToValueAtTime(volume, time + 0.03);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + length);

            oscillator.connect(gainNode);
            gainNode.connect(masterGain);

            oscillator.start(time);
            oscillator.stop(time + length + 0.05);
        }

        function playChord(notes, time, length, volume){
            notes.forEach(function(note){
                playNote(note, time, length, volume, "triangle");
            });
        }

        if(priority === "High"){
            const melody = [659.25, 783.99, 987.77, 1046.50];

            for(let round = 0; round < 4; round++){
                const base = startTime + round * 1.15;

                melody.forEach(function(note, index){
                    playNote(note, base + index * 0.22, 0.34, 0.48, "sine");
                });

                playChord([329.63, 493.88, 659.25], base + 0.95, 0.42, 0.18);
            }
        }
        else if(priority === "Medium"){
            const melody = [523.25, 659.25, 783.99, 659.25];

            for(let round = 0; round < 3; round++){
                const base = startTime + round * 1.45;

                melody.forEach(function(note, index){
                    playNote(note, base + index * 0.28, 0.42, 0.44, "triangle");
                });

                playChord([523.25, 659.25, 783.99], base + 1.05, 0.50, 0.16);
            }
        }
        else{
            const melody = [392.00, 493.88, 587.33, 783.99];

            for(let round = 0; round < 3; round++){
                const base = startTime + round * 1.6;

                melody.forEach(function(note, index){
                    playNote(note, base + index * 0.34, 0.58, 0.36, "triangle");
                });

                playChord([392.00, 587.33], base + 1.25, 0.68, 0.14);
            }
        }
    }
    catch(error){
        showDashboardToast("Audio blocked. Click Enable Sound first.");
    }
}

/* Notifications */
function requestChronoNotifications(){
    if(!("Notification" in window)){
        showDashboardToast("Browser notifications are not supported.");
        return;
    }

    Notification.requestPermission().then(function(permission){
        updateNotificationButton();

        if(permission === "granted"){
            showDashboardToast("Notifications enabled.");
        }
        else{
            showDashboardToast("Notifications not enabled.");
        }
    });
}

function updateNotificationButton(){
    const button = getEl("notificationPermissionBtn");

    if(!button) return;

    if(!("Notification" in window)){
        button.textContent = "Notifications Not Supported";
        button.disabled = true;
        return;
    }

    if(Notification.permission === "granted"){
        button.textContent = "Notifications Enabled";
    }
    else if(Notification.permission === "denied"){
        button.textContent = "Notifications Blocked";
    }
    else{
        button.textContent = "Enable Notifications";
    }
}

updateNotificationButton();

/* Reminders */
function getReminders(){
    try{
        return JSON.parse(localStorage.getItem("chronoReminders")) || [];
    }
    catch(error){
        return [];
    }
}

function saveReminders(reminders){
    localStorage.setItem("chronoReminders", JSON.stringify(reminders));
}

function addReminder(){
    const titleInput = getEl("reminderTitle");
    const timeInput = getEl("reminderTime");
    const priorityInput = getEl("reminderPriority");

    const title = titleInput.value.trim();
    const time = timeInput.value;
    const priority = priorityInput.value;

    if(title === ""){
        showDashboardToast("Please enter reminder title.");
        return;
    }

    if(time === ""){
        showDashboardToast("Please select reminder time.");
        return;
    }

    const reminders = getReminders();

    reminders.push({
        id: Date.now(),
        title:title,
        time:time,
        priority:priority,
        completed:false,
        notified:false
    });

    saveReminders(reminders);

    titleInput.value = "";
    timeInput.value = "";
    priorityInput.value = "Medium";

    loadReminders();

    showDashboardToast("Reminder added.");
}

function loadReminders(){
    const reminderList = getEl("reminderList");

    if(!reminderList) return;

    const reminders = getReminders();

    reminderList.innerHTML = "";

    if(reminders.length === 0){
        reminderList.innerHTML = `
            <div class="reminder-item">
                <div>
                    <div class="reminder-title">No reminders yet</div>
                    <div class="reminder-meta">Add your first reminder to stay on track.</div>
                </div>
            </div>
        `;
        return;
    }

    reminders.forEach(function(reminder){
        const item = document.createElement("div");
        item.className = "reminder-item";

        if(reminder.completed){
            item.classList.add("completed");
        }

        const priorityClass = "priority-" + reminder.priority.toLowerCase();

        item.innerHTML = `
            <div>
                <div class="reminder-title">${escapeHTML(reminder.title)}</div>
                <div class="reminder-meta">
                    Time: ${escapeHTML(reminder.time)}
                    <span class="reminder-priority ${priorityClass}">
                        ${escapeHTML(reminder.priority)}
                    </span>
                </div>
            </div>

            <div class="reminder-actions">
                <button onclick="completeReminder(${reminder.id})">✔</button>
                <button onclick="deleteReminder(${reminder.id})">🗑</button>
            </div>
        `;

        reminderList.appendChild(item);
    });
}

function completeReminder(id){
    const reminders = getReminders();

    const updated = reminders.map(function(reminder){
        if(reminder.id === id){
            reminder.completed = !reminder.completed;
        }

        return reminder;
    });

    saveReminders(updated);
    loadReminders();
}

function deleteReminder(id){
    const reminders = getReminders();

    const updated = reminders.filter(function(reminder){
        return reminder.id !== id;
    });

    saveReminders(updated);
    loadReminders();

    showDashboardToast("Reminder deleted.");
}

function showReminderNotification(reminder){
    playAlarmSound(reminder.priority);

    showChronoReminderPopup(reminder);

    showDashboardToast(reminder.priority + " Reminder: " + reminder.title);

    if("Notification" in window && Notification.permission === "granted"){
        new Notification("⏰ ChronoAI Reminder", {
            body: reminder.priority + " Priority • " + reminder.title + " • " + reminder.time,
            silent:true
        });
    }
}

function showChronoReminderPopup(reminder){
    const oldPopup = document.querySelector(".chrono-reminder-popup");

    if(oldPopup){
        oldPopup.remove();
    }

    const popup = document.createElement("div");
    popup.className = "chrono-reminder-popup";

    const priorityClass = reminder.priority.toLowerCase();

    popup.innerHTML = `
        <div class="chrono-reminder-top">
            <div class="chrono-reminder-icon">⏰</div>
            <div>
                <h3>ChronoAI Reminder</h3>
                <p>Your scheduled reminder is ready.</p>
            </div>
        </div>

        <p><b>${escapeHTML(reminder.title)}</b></p>

        <div class="chrono-reminder-meta">
            <span class="chrono-reminder-pill ${priorityClass}">
                ${escapeHTML(reminder.priority)} Priority
            </span>
            <span class="chrono-reminder-pill">
                ${escapeHTML(reminder.time)}
            </span>
        </div>

        <div class="chrono-reminder-actions">
            <button onclick="closeChronoReminderPopup()">Okay, Done</button>
            <button onclick="closeChronoReminderPopup()">Dismiss</button>
        </div>
    `;

    document.body.appendChild(popup);

    setTimeout(function(){
        popup.classList.add("show");
    }, 50);

    setTimeout(function(){
        closeChronoReminderPopup();
    }, 9000);
}

function closeChronoReminderPopup(){
    const popup = document.querySelector(".chrono-reminder-popup");

    if(!popup) return;

    popup.classList.remove("show");

    setTimeout(function(){
        popup.remove();
    }, 350);
}

function checkReminders(){
    const now = new Date();
    const currentTime = now.toTimeString().slice(0,5);

    const reminders = getReminders();
    let changed = false;

    reminders.forEach(function(reminder){
        if(
            reminder.time === currentTime &&
            reminder.completed === false &&
            reminder.notified === false
        ){
            showReminderNotification(reminder);

            reminder.completed = true;
            reminder.notified = true;

            changed = true;
        }
    });

    if(changed){
        saveReminders(reminders);
        loadReminders();
    }
}

setInterval(checkReminders, 1000);
loadReminders();

/* Mobile Sidebar */
function toggleMobileSidebar(){
    const sidebar = document.querySelector(".sidebar");
    const overlay = getEl("sidebarOverlay");

    if(!sidebar || !overlay) return;

    sidebar.classList.toggle("mobile-open");
    overlay.classList.toggle("show");
}

function closeMobileSidebar(){
    const sidebar = document.querySelector(".sidebar");
    const overlay = getEl("sidebarOverlay");

    if(!sidebar || !overlay) return;

    sidebar.classList.remove("mobile-open");
    overlay.classList.remove("show");
}

// =============================
// TIME TOOLS PLAN CONTROL
// =============================

function getCurrentPlan(){
    return localStorage.getItem("chronoSelectedPlan") || "Free";
}

function getPlanLevel(plan){
    if(plan === "Premium") return 3;
    if(plan === "Pro") return 2;
    return 1;
}

function hasPlanAccess(requiredPlan){
    return getPlanLevel(getCurrentPlan()) >= getPlanLevel(requiredPlan);
}

function lockTimeToolCard(selector, featureName, requiredPlan){
    const card = document.querySelector(selector);

    if(!card) return;

    if(hasPlanAccess(requiredPlan)){
        return;
    }

    card.classList.add("locked-feature-card");

    const inputs = card.querySelectorAll("input, select, button");

    inputs.forEach(function(input){
        input.disabled = true;
    });

    card.insertAdjacentHTML("beforeend", `
        <div class="plan-lock-overlay">
            <div class="lock-content">
                <div class="lock-icon">🔒</div>
                <h3>${featureName} Locked</h3>
                <p>This feature is available in the <b>${requiredPlan}</b> plan.</p>
                <a href="dashboard.html" class="upgrade-link-btn">Upgrade Plan</a>
            </div>
        </div>
    `);
}

function applyTimeToolsPlanControl(){

    // Free plan gets Pomodoro and Stopwatch.
    // Alarm is Pro and above.
    lockTimeToolCard(".alarm-card", "Alarm & Reminder", "Pro");
}

applyTimeToolsPlanControl();
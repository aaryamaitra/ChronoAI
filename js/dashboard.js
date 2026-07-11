// =============================
// DASHBOARD AUTH PROTECTION
// =============================

const isLoggedIn = localStorage.getItem("chronoLoggedIn");

if(isLoggedIn !== "true"){
    window.location.replace("login.html");
}


// =============================
// CHRONOAI DASHBOARD JS
// FULL SAFE PROFESSIONAL VERSION
// =============================

function getEl(id){
    return document.getElementById(id);
}

function escapeHTML(value){
    return String(value).replace(/[&<>"']/g, function(char){
        const safeChars = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return safeChars[char];
    });
}


// =============================
// USER NAME + GREETING SYSTEM
// =============================

let currentUserName = localStorage.getItem("chronoUserName") || "User";

function getGreeting(){
    const hour = new Date().getHours();

    if(hour < 12) return "Good Morning";
    if(hour < 17) return "Good Afternoon";
    if(hour < 21) return "Good Evening";
    return "Good Night";
}

function updateUserName(){
    const topbarTitle = document.querySelector(".topbar h1");
    const welcomeName = getEl("welcomeName");
    const chatUserName = getEl("chatUserName");

    if(topbarTitle){
        topbarTitle.innerHTML = `${getGreeting()}, <span id="userName">${escapeHTML(currentUserName)}</span> 👋`;
    }

    if(welcomeName){
        welcomeName.textContent = currentUserName;
    }

    if(chatUserName){
        chatUserName.textContent = currentUserName;
    }
}

function formatName(name){
    if(!name) return "User";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function detectUserName(message){
    const matches = [];

    const patterns = [
        /my name is\s+([a-zA-Z]+)/gi,
        /call me\s+([a-zA-Z]+)/gi,
        /\bi am\s+([a-zA-Z]+)/gi,
        /\bi'm\s+([a-zA-Z]+)/gi
    ];

    const blockedWords = [
        "not", "a", "an", "the", "student", "studying", "study",
        "tired", "sad", "happy", "fine", "good", "bad", "okay", "ok",
        "from", "in", "at", "stress", "stressed", "busy", "ready"
    ];

    patterns.forEach(function(pattern){
        let match;

        while((match = pattern.exec(message)) !== null){
            const possibleName = match[1].trim().toLowerCase();

            if(!blockedWords.includes(possibleName)){
                matches.push(possibleName);
            }
        }
    });

    if(matches.length > 0){
        const finalName = formatName(matches[matches.length - 1]);

        localStorage.setItem("chronoUserName", finalName);
        currentUserName = finalName;
        updateUserName();

        return finalName;
    }

    return null;
}

updateUserName();


// =============================
// LIVE CLOCK
// =============================

function updateClock(){
    const clock = getEl("clock");

    if(clock){
        clock.textContent = new Date().toLocaleTimeString();
    }

    updateUserName();
}

setInterval(updateClock, 1000);
updateClock();


// =============================
// POMODORO TIMER
// =============================

let time = 25 * 60;
let timer = null;
let running = false;
let pomodoroSessions = Number(localStorage.getItem("pomodoroSessions")) || 0;

function updateTimer(){
    const timerDisplay = getEl("timer");

    if(!timerDisplay) return;

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    timerDisplay.textContent = `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
}

function startTimer(){
    if(running) return;

    running = true;

    timer = setInterval(function(){
        if(time > 0){
            time--;
            updateTimer();
        }
        else{
            clearInterval(timer);
            running = false;

            pomodoroSessions++;
            localStorage.setItem("pomodoroSessions", pomodoroSessions);

            updateDashboardStats();
            showDashboardToast("Pomodoro completed successfully.");
        }
    }, 1000);
}

function pauseTimer(){
    clearInterval(timer);
    running = false;
}

function resetTimer(){
    clearInterval(timer);
    running = false;
    time = 25 * 60;
    updateTimer();
}

updateTimer();


// =============================
// STOPWATCH
// =============================

let stopwatchTime = 0;
let stopwatchInterval = null;

function updateStopwatch(){
    const stopwatchDisplay = getEl("stopwatch");

    if(!stopwatchDisplay) return;

    const hours = Math.floor(stopwatchTime / 3600);
    const minutes = Math.floor((stopwatchTime % 3600) / 60);
    const seconds = stopwatchTime % 60;

    stopwatchDisplay.textContent = `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
}

function startStopwatch(){
    if(stopwatchInterval) return;

    stopwatchInterval = setInterval(function(){
        stopwatchTime++;
        updateStopwatch();
    }, 1000);
}

function stopStopwatch(){
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
}

function resetStopwatch(){
    stopStopwatch();
    stopwatchTime = 0;
    updateStopwatch();
}

updateStopwatch();


// =============================
// TASK MANAGER
// =============================

function getTasks(){
    try{
        return JSON.parse(localStorage.getItem("tasks")) || [];
    }
    catch(error){
        return [];
    }
}

function saveTasks(tasks){
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask(){
    const taskInput = getEl("taskInput");
    const priorityInput = getEl("priority");
    const dueDateInput = getEl("dueDate");

    if(!taskInput || !priorityInput || !dueDateInput) return;

    const task = taskInput.value.trim();
    const priority = priorityInput.value || "Medium";
    const date = dueDateInput.value;

    if(task === ""){
        showDashboardToast("Please enter a task.");
        return;
    }

    const tasks = getTasks();

    tasks.push({
        task: task,
        priority: priority,
        date: date,
        completed: false
    });

    saveTasks(tasks);

    taskInput.value = "";
    dueDateInput.value = "";

    loadTasks();
}

function loadTasks(){
    const list = getEl("taskList");

    if(!list) return;

    list.innerHTML = "";

    const tasks = getTasks();

    tasks.forEach(function(item, index){
        const li = document.createElement("li");
        const priority = item.priority || "Medium";

        li.className = priority.toLowerCase();

        if(item.completed){
            li.classList.add("completed");
        }

        li.innerHTML = `
            <div>
                <strong>${escapeHTML(item.task)}</strong><br>
                <small>${escapeHTML(priority)} | ${item.date ? escapeHTML(item.date) : "No due date"}</small>
            </div>

            <div class="task-buttons">
                <button onclick="completeTask(${index})">✔</button>
                <button onclick="deleteTask(${index})">🗑</button>
            </div>
        `;

        list.appendChild(li);
    });

    updateDashboardStats();
}

function completeTask(index){
    const tasks = getTasks();

    if(!tasks[index]) return;

    tasks[index].completed = !tasks[index].completed;
    saveTasks(tasks);
    loadTasks();
}

function deleteTask(index){
    const tasks = getTasks();

    if(!tasks[index]) return;

    tasks.splice(index, 1);
    saveTasks(tasks);
    loadTasks();
}

loadTasks();


// =============================
// DASHBOARD STATS
// =============================

function updateDashboardStats(){
    const tasks = getTasks();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(function(task){
        return task.completed;
    }).length;

    const taskCount = getEl("taskCount");
    const completedCount = getEl("completedCount");
    const pomodoroCount = getEl("pomodoroCount");
    const streakCount = getEl("streakCount");

    if(taskCount) taskCount.textContent = totalTasks;
    if(completedCount) completedCount.textContent = completedTasks;
    if(pomodoroCount) pomodoroCount.textContent = pomodoroSessions;

    if(streakCount){
        streakCount.textContent = completedTasks > 0 ? "1" : "0";
    }
}

updateDashboardStats();


// =============================
// CALENDAR
// =============================

const monthYear = getEl("monthYear");
const calendarDays = getEl("calendarDays");
let currentDate = new Date();

function renderCalendar(){
    if(!calendarDays || !monthYear) return;

    calendarDays.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    monthYear.textContent = `${months[month]} ${year}`;

    for(let i = 0; i < firstDay; i++){
        const empty = document.createElement("div");
        empty.className = "empty";
        calendarDays.appendChild(empty);
    }

    const today = new Date();

    for(let dayNumber = 1; dayNumber <= lastDate; dayNumber++){
        const day = document.createElement("div");

        day.className = "day";
        day.textContent = dayNumber;

        if(
            dayNumber === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ){
            day.classList.add("today");
        }

        calendarDays.appendChild(day);
    }
}

function previousMonth(){
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth(){
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

renderCalendar();


// =============================
// HABIT TRACKER
// =============================

const habits = document.querySelectorAll(".habit input");

function loadHabitState(){
    const savedHabits = JSON.parse(localStorage.getItem("chronoHabits") || "[]");

    habits.forEach(function(habit, index){
        habit.checked = savedHabits[index] || false;
    });
}

function saveHabitState(){
    const habitState = [];

    habits.forEach(function(habit){
        habitState.push(habit.checked);
    });

    localStorage.setItem("chronoHabits", JSON.stringify(habitState));
}

function updateHabitTracker(){
    let completed = 0;

    habits.forEach(function(habit){
        if(habit.checked){
            completed++;
        }
    });

    const percent = habits.length ? (completed / habits.length) * 100 : 0;

    const habitBar = getEl("habitBar");
    const habitText = getEl("habitText");

    if(habitBar){
        habitBar.style.width = percent + "%";
    }

    if(habitText){
        habitText.textContent = Math.round(percent) + "% Completed";
    }
}

loadHabitState();

habits.forEach(function(habit){
    habit.addEventListener("change", function(){
        saveHabitState();
        updateHabitTracker();
    });
});

updateHabitTracker();


// =============================
// QUICK NOTES
// =============================

const notesInputBox = getEl("notesInput");

if(notesInputBox){
    notesInputBox.value = localStorage.getItem("chronoNotes") || "";
}

function saveNotes(){
    const notesBox = getEl("notesInput");
    const notesStatus = getEl("notesStatus");

    if(!notesBox || !notesStatus) return;

    localStorage.setItem("chronoNotes", notesBox.value);

    notesStatus.textContent = "✅ Notes saved successfully!";

    setTimeout(function(){
        notesStatus.textContent = "Notes are saved automatically.";
    }, 2000);
}

// =============================
// ADVANCED SMART AI ASSISTANT USING BACKEND
// FIXED VERSION WITH TIMEOUT
// =============================

const AI_BACKEND_URL = "http://127.0.0.1:5000";
let aiIsSending = false;

function getAIChatHistory(){
    try{
        return JSON.parse(localStorage.getItem("chronoAIChatHistory")) || [];
    }
    catch(error){
        return [];
    }
}

function saveAIChatHistory(history){
    localStorage.setItem("chronoAIChatHistory", JSON.stringify(history.slice(-12)));
}

function addToAIHistory(role, content){
    const history = getAIChatHistory();

    history.push({
        role: role,
        content: content
    });

    saveAIChatHistory(history);
}

function addChatMessage(type, content){
    const chat = getEl("chatBox");

    if(!chat) return;

    const message = document.createElement("div");
    message.className = type + "-message";
    message.innerHTML = content;

    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
}

function showTypingEffect(){
    const chat = getEl("chatBox");

    if(!chat) return;

    removeTypingEffect();

    const typing = document.createElement("div");
    typing.className = "bot-message typing-message";
    typing.innerHTML = "ChronoAI is thinking...";

    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;
}

function removeTypingEffect(){
    const typingMessages = document.querySelectorAll(".typing-message");

    typingMessages.forEach(function(item){
        item.remove();
    });
}

function getAssistantContext(){
    const tasks = getTasks();
    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(function(task){
        return task.completed;
    }).length;

    return {
        userName: localStorage.getItem("chronoUserName") || "User",
        currentPlan: localStorage.getItem("chronoSelectedPlan") || "Free",
        totalTasks: totalTasks,
        completedTasks: completedTasks,
        pendingTasks: totalTasks - completedTasks,
        notes: localStorage.getItem("chronoNotes") || ""
    };
}

function formatAIReply(reply){
    return escapeHTML(reply)
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
}

function handleLocalAICommands(message){
    const text = message.toLowerCase();

    if(text.startsWith("add task")){
        const taskText = message.replace(/add task/gi, "").trim();

        if(taskText === ""){
            return "Please write the task name. Example: **Add task complete DBMS assignment**";
        }

        const tasks = getTasks();

        tasks.push({
            task: taskText,
            priority: "Medium",
            date: "",
            completed: false
        });

        saveTasks(tasks);
        loadTasks();

        return `Task added successfully: **${taskText}**`;
    }

    if(text.includes("clear chat")){
        localStorage.removeItem("chronoAIChatHistory");

        const chat = getEl("chatBox");

        if(chat){
            chat.innerHTML = "";
        }

        return "Chat history cleared successfully.";
    }

    return null;
}

async function fetchWithTimeout(url, options, timeout = 90000){
    const controller = new AbortController();

    const timer = setTimeout(function(){
        controller.abort();
    }, timeout);

    try{
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(timer);
        return response;
    }
    catch(error){
        clearTimeout(timer);
        throw error;
    }
}

async function sendMessage(){

    if(aiIsSending){
        showDashboardToast("Please wait. ChronoAI is still replying.");
        return;
    }

    const input = getEl("userMessage");

    if(!input) return;

    const message = input.value.trim();

    if(message === "") return;

    aiIsSending = true;

    addChatMessage("user", escapeHTML(message));
    addToAIHistory("user", message);

    input.value = "";

    const localReply = handleLocalAICommands(message);

    if(localReply){
        removeTypingEffect();
        addChatMessage("bot", formatAIReply(localReply));
        addToAIHistory("assistant", localReply);
        aiIsSending = false;
        return;
    }

    showTypingEffect();

    try{

        const context = getAssistantContext();

        const response = await fetchWithTimeout(AI_BACKEND_URL + "/ask-ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                userName: context.userName,
                currentPlan: context.currentPlan,
                totalTasks: context.totalTasks,
                completedTasks: context.completedTasks,
                pendingTasks: context.pendingTasks,
                notes: context.notes,
                chatHistory: getAIChatHistory()
            })
        }, 90000);

        const data = await response.json();

        removeTypingEffect();

        if(data.success){
            addChatMessage("bot", formatAIReply(data.reply));
            addToAIHistory("assistant", data.reply);
        }
        else{
            const errorReply = data.reply || "ChronoAI could not answer right now.";
            addChatMessage("bot", formatAIReply(errorReply));
            addToAIHistory("assistant", errorReply);
        }

    }
    catch(error){

        console.error(error);

        removeTypingEffect();

        let errorMessage = "ChronoAI could not connect to AI backend. Keep backend running on port 5000.";

        if(error.name === "AbortError"){
            errorMessage = "ChronoAI is taking longer than usual. Please send the message again once.";
        }

        addChatMessage("bot", errorMessage);
        addToAIHistory("assistant", errorMessage);

    }
    finally{
        removeTypingEffect();
        aiIsSending = false;
    }
}

const userMessageInput = getEl("userMessage");

if(userMessageInput){
    userMessageInput.addEventListener("keydown", function(e){
        if(e.key === "Enter"){
            e.preventDefault();
            sendMessage();
        }
    });
}

// =============================
// SETTINGS MODAL
// =============================

function openSettings(event){
    if(event){
        event.preventDefault();
    }

    const modal = getEl("settingsModal");

    if(modal){
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
        loadSettings();
    }
    else{
        showDashboardToast("Settings modal not found in HTML.");
    }
}

function closeSettings(){
    const modal = getEl("settingsModal");

    if(modal){
        modal.classList.remove("show");
        document.body.style.overflow = "auto";
    }
}

window.addEventListener("click", function(e){
    const settingsModal = getEl("settingsModal");

    if(e.target === settingsModal){
        closeSettings();
    }
});

window.addEventListener("keydown", function(e){
    if(e.key === "Escape"){
        closeSettings();
        closeUpgradePlan();
        closePaymentModal();
        closeResetConfirm();
    }
});


// =============================
// SETTINGS DATA
// =============================

function loadSettings(){
    const name = localStorage.getItem("chronoUserName") || "User";
    const email = localStorage.getItem("chronoUserEmail") || "user@example.com";
    const plan = localStorage.getItem("chronoSelectedPlan") || "Free";
    const provider = localStorage.getItem("chronoAuthProvider") || "Email";

    const settingsName = getEl("settingsName");
    const settingsEmail = getEl("settingsEmail");
    const settingsPlan = getEl("settingsPlan");
    const settingsAvatar = getEl("settingsAvatar");
    const settingsProvider = getEl("settingsProvider");

    if(settingsName) settingsName.textContent = name;
    if(settingsEmail) settingsEmail.textContent = email;
    if(settingsPlan) settingsPlan.textContent = plan + " Plan";
    if(settingsAvatar) settingsAvatar.textContent = name.charAt(0).toUpperCase();
    if(settingsProvider) settingsProvider.textContent = provider + " Login";
}

function logoutUser(){
    localStorage.removeItem("chronoLoggedIn");
    localStorage.removeItem("chronoUserEmail");
    localStorage.removeItem("chronoAuthProvider");

    window.location.href = "login.html";
}

function toggleTheme(){
    document.body.classList.toggle("light-mode");

    if(document.body.classList.contains("light-mode")){
        localStorage.setItem("chronoTheme","light");
    }
    else{
        localStorage.setItem("chronoTheme","dark");
    }
}

function loadTheme(){
    const theme = localStorage.getItem("chronoTheme");

    if(theme === "light"){
        document.body.classList.add("light-mode");
    }
}

loadSettings();
loadTheme();


// =============================
// RESET MODAL
// =============================

function resetDashboardData(){
    const modal = getEl("resetConfirmModal");

    if(modal){
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }
    else{
        localStorage.removeItem("tasks");
        localStorage.removeItem("chronoNotes");
        localStorage.removeItem("chronoHabits");
        localStorage.removeItem("pomodoroSessions");
        showDashboardToast("Dashboard data reset successfully.");
        setTimeout(function(){
            window.location.reload();
        }, 900);
    }
}

function closeResetConfirm(){
    const modal = getEl("resetConfirmModal");

    if(modal){
        modal.classList.remove("show");
    }

    const settingsModal = getEl("settingsModal");

    if(settingsModal && settingsModal.classList.contains("show")){
        document.body.style.overflow = "hidden";
    }
    else{
        document.body.style.overflow = "auto";
    }
}

function confirmResetDashboardData(){
    localStorage.removeItem("tasks");
    localStorage.removeItem("chronoNotes");
    localStorage.removeItem("chronoHabits");
    localStorage.removeItem("pomodoroSessions");

    closeResetConfirm();
    closeSettings();

    showDashboardToast("Dashboard data reset successfully.");

    setTimeout(function(){
        window.location.reload();
    }, 900);
}


// =============================
// UPGRADE PLAN MODAL
// =============================

function openUpgradePlan(){
    const modal = getEl("upgradeModal");

    if(modal){
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }
    else{
        showDashboardToast("Upgrade modal not found in HTML.");
    }
}

function closeUpgradePlan(){
    const modal = getEl("upgradeModal");

    if(modal){
        modal.classList.remove("show");
    }

    const settingsModal = getEl("settingsModal");

    if(settingsModal && settingsModal.classList.contains("show")){
        document.body.style.overflow = "hidden";
    }
    else{
        document.body.style.overflow = "auto";
    }
}


// =============================
// REAL RAZORPAY PAYMENT SYSTEM
// =============================

const PAYMENT_BACKEND_URL = "http://localhost:5000";

async function selectUpgradePlan(planName){

    if(planName === "Free"){

        localStorage.setItem("chronoSelectedPlan", "Free");

        const settingsPlan = getEl("settingsPlan");

        if(settingsPlan){
            settingsPlan.textContent = "Free Plan";
        }

        closeUpgradePlan();

        showDashboardToast("Free plan selected.");

        return;
    }

    closeUpgradePlan();

    showDashboardToast("Opening secure payment checkout...");

    try{

        const orderResponse = await fetch(PAYMENT_BACKEND_URL + "/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                planName: planName
            })
        });

        const orderData = await orderResponse.json();

        if(!orderData.success){
            showDashboardToast(orderData.message || "Unable to create payment order.");
            return;
        }

        openRazorpayCheckout(orderData);

    }
    catch(error){
        console.error(error);
        showDashboardToast("Payment backend is not running.");
    }
}

function openRazorpayCheckout(orderData){

    if(typeof Razorpay === "undefined"){
        showDashboardToast("Razorpay checkout script not loaded.");
        return;
    }

    const userName = localStorage.getItem("chronoUserName") || "ChronoAI User";
    const userEmail = localStorage.getItem("chronoUserEmail") || "";

    const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "ChronoAI",
        description: orderData.planName + " Plan Subscription",
        order_id: orderData.order.id,

        prefill: {
            name: userName,
            email: userEmail
        },

        theme: {
            color: "#46C6FF"
        },

        handler: async function(response){

            showDashboardToast("Verifying payment...");

            try{

                const verifyResponse = await fetch(PAYMENT_BACKEND_URL + "/verify-payment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        planName: orderData.planName
                    })
                });

                const verifyData = await verifyResponse.json();

                if(verifyData.success){

                    localStorage.setItem("chronoSelectedPlan", orderData.planName);
                    localStorage.setItem("chronoPaymentStatus", "Paid");
                    localStorage.setItem("chronoPaymentId", verifyData.paymentId);
                    localStorage.setItem("chronoPaymentAmount", orderData.displayAmount);
                    localStorage.setItem("chronoPaymentDate", new Date().toLocaleString());

                    const settingsPlan = getEl("settingsPlan");

                    if(settingsPlan){
                        settingsPlan.textContent = orderData.planName + " Plan";
                    }

                    loadSettings();

                    showDashboardToast(orderData.planName + " plan activated successfully.");

                }
                else{
                    showDashboardToast("Payment verification failed.");
                }

            }
            catch(error){
                console.error(error);
                showDashboardToast("Could not verify payment.");
            }
        },

        modal: {
            ondismiss: function(){
                showDashboardToast("Payment cancelled.");
            }
        }
    };

    const razorpayCheckout = new Razorpay(options);
    razorpayCheckout.open();
}


// Keep this because your Escape/outside-click code calls closePaymentModal()
function closePaymentModal(){
    const paymentModal = getEl("paymentModal");

    if(paymentModal){
        paymentModal.classList.remove("show");
    }
}

// =============================
// GLOBAL MODAL OUTSIDE CLICK
// =============================

window.addEventListener("click", function(e){
    const resetModal = getEl("resetConfirmModal");
    const upgradeModal = getEl("upgradeModal");
    const paymentModal = getEl("paymentModal");

    if(e.target === resetModal){
        closeResetConfirm();
    }

    if(e.target === upgradeModal){
        closeUpgradePlan();
    }

    if(e.target === paymentModal){
        closePaymentModal();
    }
});


// =============================
// TOAST
// =============================

function showDashboardToast(message){
    let toast = getEl("dashboardToast");

    if(!toast){
        toast = document.createElement("div");
        toast.id = "dashboardToast";
        toast.className = "dashboard-toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(function(){
        toast.classList.remove("show");
    }, 2200);
}

// =============================
// PLAN ACCESS CONTROL + PAYMENT HISTORY
// =============================

function getCurrentPlan(){
    return localStorage.getItem("chronoSelectedPlan") || "Free";
}

function getPlanRank(planName){
    if(planName === "Premium") return 2;
    if(planName === "Pro") return 1;
    return 0;
}

function hasPlanAccess(requiredPlan){
    const currentPlan = getCurrentPlan();

    return getPlanRank(currentPlan) >= getPlanRank(requiredPlan);
}

function loadPaymentHistory(){

    const plan = localStorage.getItem("chronoSelectedPlan") || "Free";
    const status = localStorage.getItem("chronoPaymentStatus") || "Not Paid";
    const amount = localStorage.getItem("chronoPaymentAmount") || "₹0";
    const paymentId = localStorage.getItem("chronoPaymentId") || "N/A";

    const historyPlan = getEl("historyPlan");
    const historyStatus = getEl("historyStatus");
    const historyAmount = getEl("historyAmount");
    const historyPaymentId = getEl("historyPaymentId");
    const historyStatusBadge = getEl("historyStatusBadge");

    if(historyPlan){
        historyPlan.textContent = plan + " Plan";
    }

    if(historyStatus){
        historyStatus.textContent = status;
    }

    if(historyAmount){
        historyAmount.textContent = amount;
    }

    if(historyPaymentId){
        historyPaymentId.textContent = paymentId;
    }

    if(historyStatusBadge){
        if(status === "Paid"){
            historyStatusBadge.textContent = "Paid";
        }
        else{
            historyStatusBadge.textContent = plan;
        }
    }
}


function findFeatureCardByHeading(titleText){

    const headings = document.querySelectorAll("h1, h2, h3");

    for(let heading of headings){

        const headingText = heading.textContent.toLowerCase();

        if(headingText.includes(titleText.toLowerCase())){

            return heading.closest(".card, .dashboard-card, section, .timer-card, .glass-card, .content-card") || heading.parentElement;

        }

    }

    return null;
}


function lockFeature(card, featureName, requiredPlan){

    if(!card) return;

    card.classList.add("locked-feature-card");

    const inputs = card.querySelectorAll("button, input, textarea, select");

    inputs.forEach(function(input){
        input.disabled = true;
    });

    let overlay = card.querySelector(".plan-lock-overlay");

    if(!overlay){

        overlay = document.createElement("div");
        overlay.className = "plan-lock-overlay";

        overlay.innerHTML = `
            <div class="lock-content">
                <div class="lock-icon">🔒</div>
                <h3>${featureName} Locked</h3>
                <p>This feature is available in the ${requiredPlan} Plan. Upgrade your plan to unlock it.</p>
                <button class="unlock-btn" type="button">Upgrade Now</button>
            </div>
        `;

        const unlockBtn = overlay.querySelector(".unlock-btn");

        unlockBtn.addEventListener("click", function(e){
            e.stopPropagation();
            openUpgradePlan();
        });

        card.appendChild(overlay);
    }
}


function unlockFeature(card){

    if(!card) return;

    card.classList.remove("locked-feature-card");

    const overlay = card.querySelector(".plan-lock-overlay");

    if(overlay){
        overlay.remove();
    }

    const inputs = card.querySelectorAll("button, input, textarea, select");

    inputs.forEach(function(input){
        input.disabled = false;
    });
}


function applyPlanAccessControl(){

    const featureRules = [
        {
            heading: "Productivity Analytics",
            name: "Productivity Analytics",
            requiredPlan: "Pro"
        },
        {
            heading: "Calendar",
            name: "Calendar",
            requiredPlan: "Pro"
        },
        {
            heading: "Habit",
            name: "Habit Tracker",
            requiredPlan: "Pro"
        },
        {
            heading: "AI Assistant",
            name: "AI Assistant",
            requiredPlan: "Pro"
        }
    ];

    featureRules.forEach(function(rule){

        const card = findFeatureCardByHeading(rule.heading);

        if(!card) return;

        if(hasPlanAccess(rule.requiredPlan)){
            unlockFeature(card);
        }
        else{
            lockFeature(card, rule.name, rule.requiredPlan);
        }

    });
}


// This upgrades your existing loadSettings() without breaking it
const chronoOriginalLoadSettings = loadSettings;

loadSettings = function(){

    chronoOriginalLoadSettings();

    loadPaymentHistory();

    applyPlanAccessControl();

};


// Run once when dashboard opens
loadPaymentHistory();
applyPlanAccessControl();

// =============================
// ALARM & REMINDER MODULE
// =============================

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

    if(!titleInput || !timeInput || !priorityInput) return;

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
        title: title,
        time: time,
        priority: priority,
        completed: false,
        notified: false
    });

    saveReminders(reminders);

    titleInput.value = "";
    timeInput.value = "";
    priorityInput.value = "Medium";

    loadReminders();

    showDashboardToast("Reminder added successfully.");
}

function loadReminders(){
    const reminderList = getEl("reminderList");

    if(!reminderList) return;

    const reminders = getReminders();

    reminderList.innerHTML = "";

    if(reminders.length === 0){
        reminderList.innerHTML = `
            <div class="reminder-item">
                <div class="reminder-info">
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
            <div class="reminder-info">
                <div class="reminder-title">${escapeHTML(reminder.title)}</div>
                <div class="reminder-meta">
                    Time: ${escapeHTML(reminder.time)}
                    <span class="reminder-priority ${priorityClass}">
                        ${escapeHTML(reminder.priority)}
                    </span>
                </div>
            </div>

            <div class="reminder-actions">
                <button onclick="completeReminder(${reminder.id})" title="Complete">✔</button>
                <button onclick="deleteReminder(${reminder.id})" title="Delete">🗑</button>
            </div>
        `;

        reminderList.appendChild(item);
    });
}

function completeReminder(id){
    const reminders = getReminders();

    const updatedReminders = reminders.map(function(reminder){
        if(reminder.id === id){
            reminder.completed = !reminder.completed;
        }

        return reminder;
    });

    saveReminders(updatedReminders);
    loadReminders();
}

function deleteReminder(id){
    const reminders = getReminders();

    const updatedReminders = reminders.filter(function(reminder){
        return reminder.id !== id;
    });

    saveReminders(updatedReminders);
    loadReminders();

    showDashboardToast("Reminder deleted.");
}

function playAlarmSound(){
    try{
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 880;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

        oscillator.start();

        setTimeout(function(){
            oscillator.stop();
        }, 700);
    }
    catch(error){
        console.log("Audio not supported.");
    }
}

function showReminderNotification(reminder){
    playAlarmSound();

    showDashboardToast("Reminder: " + reminder.title);

    if("Notification" in window){

        if(Notification.permission === "granted"){
            new Notification("ChronoAI Reminder", {
                body: reminder.title + " at " + reminder.time
            });
        }
        else if(Notification.permission !== "denied"){
            Notification.requestPermission().then(function(permission){
                if(permission === "granted"){
                    new Notification("ChronoAI Reminder", {
                        body: reminder.title + " at " + reminder.time
                    });
                }
            });
        }

    }
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
            reminder.notified = true;
            changed = true;
        }

        if(reminder.time !== currentTime && reminder.notified === true){
            reminder.notified = false;
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

// =============================
// PROFILE SECTION
// =============================

// function getProfileData(){
//     return {
//         name: localStorage.getItem("chronoUserName") || "User",
//         email: localStorage.getItem("chronoUserEmail") || "user@example.com",
//         goal: localStorage.getItem("chronoStudyGoal") || "Build better productivity habits with ChronoAI.",
//         targetHours: localStorage.getItem("chronoDailyTargetHours") || "2",
//         plan: localStorage.getItem("chronoSelectedPlan") || "Free"
//     };
// }

// function loadProfileSection(){
//     const profile = getProfileData();

//     const profileNameInput = getEl("profileNameInput");
//     const profileEmailInput = getEl("profileEmailInput");
//     const profileGoalInput = getEl("profileGoalInput");
//     const profileTargetHoursInput = getEl("profileTargetHoursInput");

//     const profileSummaryName = getEl("profileSummaryName");
//     const profileSummaryEmail = getEl("profileSummaryEmail");
//     const profileSummaryPlan = getEl("profileSummaryPlan");
//     const profileSummaryTarget = getEl("profileSummaryTarget");
//     const profileGoalText = getEl("profileGoalText");
//     const profileAvatarLarge = getEl("profileAvatarLarge");

//     if(profileNameInput) profileNameInput.value = profile.name;
//     if(profileEmailInput) profileEmailInput.value = profile.email;
//     if(profileGoalInput) profileGoalInput.value = profile.goal;
//     if(profileTargetHoursInput) profileTargetHoursInput.value = profile.targetHours;

//     if(profileSummaryName) profileSummaryName.textContent = profile.name;
//     if(profileSummaryEmail) profileSummaryEmail.textContent = profile.email;
//     if(profileSummaryPlan) profileSummaryPlan.textContent = profile.plan + " Plan";
//     if(profileSummaryTarget) profileSummaryTarget.textContent = profile.targetHours + " Hours";

//     if(profileGoalText){
//         profileGoalText.textContent = "Goal: " + profile.goal;
//     }

//     if(profileAvatarLarge){
//         profileAvatarLarge.textContent = profile.name.charAt(0).toUpperCase();
//     }
// }

// function saveProfileSection(){
//     const nameInput = getEl("profileNameInput");
//     const emailInput = getEl("profileEmailInput");
//     const goalInput = getEl("profileGoalInput");
//     const targetInput = getEl("profileTargetHoursInput");

//     if(!nameInput || !emailInput || !goalInput || !targetInput) return;

//     const name = nameInput.value.trim();
//     const email = emailInput.value.trim();
//     const goal = goalInput.value.trim();
//     const targetHours = targetInput.value.trim();

//     if(name === ""){
//         showDashboardToast("Please enter your name.");
//         return;
//     }

//     if(email === ""){
//         showDashboardToast("Please enter your email.");
//         return;
//     }

//     if(goal === ""){
//         showDashboardToast("Please enter your study goal.");
//         return;
//     }

//     if(targetHours === "" || Number(targetHours) <= 0){
//         showDashboardToast("Please enter valid daily target hours.");
//         return;
//     }

//     localStorage.setItem("chronoUserName", name);
//     localStorage.setItem("chronoUserEmail", email);
//     localStorage.setItem("chronoStudyGoal", goal);
//     localStorage.setItem("chronoDailyTargetHours", targetHours);

//     loadProfileSection();

//     const userName = getEl("userName");
//     const welcomeName = getEl("welcomeName");
//     const chatUserName = getEl("chatUserName");

//     if(userName) userName.textContent = name;
//     if(welcomeName) welcomeName.textContent = name;
//     if(chatUserName) chatUserName.textContent = name;

//     showDashboardToast("Profile updated successfully.");
// }

// loadProfileSection();

// // =============================
// // PROFILE SHOW / HIDE
// // =============================

// function openProfileSection(event){
//     if(event){
//         event.preventDefault();
//     }

//     const profileSection = getEl("profile-section");

//     if(!profileSection) return;

//     profileSection.classList.remove("profile-hidden");
//     profileSection.classList.add("profile-open");

//     loadProfileSection();

//     profileSection.scrollIntoView({
//         behavior:"smooth",
//         block:"start"
//     });
// }

// function closeProfileSection(){
//     const profileSection = getEl("profile-section");

//     if(!profileSection) return;

//     profileSection.classList.add("profile-hidden");
//     profileSection.classList.remove("profile-open");
// }

// =============================
// MOBILE SIDEBAR
// =============================

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

document.querySelectorAll(".sidebar a").forEach(function(link){
    link.addEventListener("click", function(){
        closeMobileSidebar();
    });
});

// =============================
// ACTIVE SIDEBAR MENU
// =============================

function setActiveSidebarLink(activeLink){
    const sidebarLinks = document.querySelectorAll(".sidebar a");

    sidebarLinks.forEach(function(link){
        link.classList.remove("active-menu");
    });

    if(activeLink){
        activeLink.classList.add("active-menu");
    }
}

document.querySelectorAll(".sidebar a").forEach(function(link){

    link.addEventListener("click", function(){

        const href = link.getAttribute("href");

        if(href && href.startsWith("#")){
            setActiveSidebarLink(link);
        }

    });

});

function updateActiveSidebarOnScroll(){
    const sections = document.querySelectorAll(".cards .card[id]");
    const sidebarLinks = document.querySelectorAll(".sidebar a[href^='#']");

    let currentSectionId = "";

    sections.forEach(function(section){
        const sectionTop = section.offsetTop - 160;

        if(window.scrollY >= sectionTop){
            currentSectionId = section.getAttribute("id");
        }
    });

    sidebarLinks.forEach(function(link){
        link.classList.remove("active-menu");

        if(link.getAttribute("href") === "#" + currentSectionId){
            link.classList.add("active-menu");
        }
    });
}

window.addEventListener("scroll", updateActiveSidebarOnScroll);
updateActiveSidebarOnScroll();
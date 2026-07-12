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
    const replyParts = [];

    const isComplaint =
        text.includes("did not") ||
        text.includes("didn't") ||
        text.includes("not doing") ||
        text.includes("not working");

    // GREETING
    if(
        text === "hi" ||
        text === "hello" ||
        text === "hey" ||
        text.includes("hello buddy") ||
        text.includes("hi buddy") ||
        text.includes("hii")
    ){
        return `
Hello 👋

I am your **ChronoAI Assistant**.

I can help you with:
• Study planning
• Productivity
• Time management
• Daily schedules

You can also give me commands like:
• **Add task complete DBMS assignment**
• **Create 7 tasks for Python study**
• **Start timer**
        `;
    }

    // ADD SINGLE TASK
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

        if(typeof updateDashboardStats === "function"){
            updateDashboardStats();
        }

        return `Task added successfully: **${taskText}**`;
    }

    // CREATE 7 STUDY TASKS
    if(
        !isComplaint &&
        (text.includes("create") || text.includes("make") || text.includes("set up") || text.includes("generate")) &&
        (text.includes("7") || text.includes("seven")) &&
        (text.includes("task") || text.includes("study plan") || text.includes("plan"))
    ){
        let topic = message
            .replace(/create|make|set up|setup|generate|add|seven|7|tasks|task|study|plan|for|me|my/gi, "")
            .replace(/\s+/g, " ")
            .trim();

        if(topic === ""){
            topic = "Study";
        }

        const studyTasks = [
            `Day 1: Learn basics of ${topic}`,
            `Day 2: Practice important concepts of ${topic}`,
            `Day 3: Solve beginner-level questions of ${topic}`,
            `Day 4: Revise weak topics in ${topic}`,
            `Day 5: Build short notes for ${topic}`,
            `Day 6: Practice mixed questions of ${topic}`,
            `Day 7: Final revision and mini test for ${topic}`
        ];

        const tasks = getTasks();

        studyTasks.forEach(function(taskText){
            tasks.push({
                task: taskText,
                priority: "High",
                date: "",
                completed: false
            });
        });

        saveTasks(tasks);
        loadTasks();

        if(typeof updateDashboardStats === "function"){
            updateDashboardStats();
        }

        replyParts.push(`I added **7 study tasks** for **${topic}** to your dashboard.`);
    }

    // START POMODORO TIMER
    if(
        !isComplaint &&
        (
            text.includes("start timer") ||
            text.includes("start pomodoro") ||
            text.includes("begin timer") ||
            text.includes("start my timer")
        )
    ){
        if(typeof startTimer === "function"){
            startTimer();
            replyParts.push("I started your **Pomodoro timer**.");
        }
        else{
            replyParts.push("Timer function is not available on this page. Please open Time Tools page.");
        }
    }

    // PAUSE TIMER
    if(!isComplaint && (text.includes("pause timer") || text.includes("pause pomodoro"))){
        if(typeof pauseTimer === "function"){
            pauseTimer();
            replyParts.push("I paused your **Pomodoro timer**.");
        }
    }

    // RESET TIMER
    if(!isComplaint && (text.includes("reset timer") || text.includes("reset pomodoro"))){
        if(typeof resetTimer === "function"){
            resetTimer();
            replyParts.push("I reset your **Pomodoro timer**.");
        }
    }

    // CURRENT PLAN
    if(text.includes("my plan") || text.includes("current plan") || text.includes("subscription")){
        const currentPlan = localStorage.getItem("chronoSelectedPlan") || "Free";
        const paymentStatus = localStorage.getItem("chronoPaymentStatus") || "Not Paid";

        return `
Your Current Plan:

Plan: **${currentPlan}**
Payment Status: **${paymentStatus}**
        `;
    }

    // CLEAR CHAT
    if(text.includes("clear chat")){
        localStorage.removeItem("chronoAIChatHistory");

        const chat = getEl("chatBox");

        if(chat){
            chat.innerHTML = "";
        }

        return "Chat history cleared successfully.";
    }

    if(replyParts.length > 0){
        return replyParts.join("\n\n");
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

if(!hasPlanAccess("Premium")){
    addChatMessage("user", escapeHTML(message));

    addChatMessage(
        "bot",
        "🔒 Full AI Assistant is available only in the <b>Premium Plan</b>. Please upgrade to use AI planning, task creation, smart schedules, and productivity control."
    );

    input.value = "";
    return;
}

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
// Connected to protected backend + MongoDB plan update
// =============================

const PAYMENT_BACKEND_URL = "http://localhost:5000";

function getPaymentAuthHeaders(){
    const token = localStorage.getItem("chronoToken");

    if(!token){
        showDashboardToast("Login session expired. Please login again.");

        setTimeout(function(){
            window.location.href = "login.html";
        }, 900);

        return null;
    }

    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}

function savePaidPlanFromBackend(verifyData, orderData){
    const user = verifyData.user || {};

    const finalPlan = user.plan || orderData.planName;
    const finalPaymentStatus = user.paymentStatus || "Paid";

    localStorage.setItem("chronoSelectedPlan", finalPlan);
    localStorage.setItem("chronoPaymentStatus", finalPaymentStatus);

    if(user.id){
        localStorage.setItem("chronoUserId", user.id);
    }

    if(user.name){
        localStorage.setItem("chronoUserName", user.name);
        currentUserName = user.name;
        updateUserName();
    }

    if(user.email){
        localStorage.setItem("chronoUserEmail", user.email);
    }

    if(verifyData.paymentId){
        localStorage.setItem("chronoPaymentId", verifyData.paymentId);
    }

    localStorage.setItem("chronoPaymentAmount", orderData.displayAmount || "");
    localStorage.setItem("chronoPaymentDate", new Date().toLocaleString());

    const settingsPlan = getEl("settingsPlan");

    if(settingsPlan){
        settingsPlan.textContent = finalPlan + " Plan";
    }

    loadSettings();
    loadPaymentHistory();
    applyPlanAccessControl();

    if(typeof checkChronoAuth === "function"){
        checkChronoAuth();
    }
}

async function selectUpgradePlan(planName){

    if(planName === "Free"){
        closeUpgradePlan();
        showDashboardToast("Free plan is default. Plan downgrade will be added later.");
        return;
    }

    const headers = getPaymentAuthHeaders();

    if(!headers){
        return;
    }

    closeUpgradePlan();

    showDashboardToast("Opening secure payment checkout...");

    try{

        const orderResponse = await fetch(PAYMENT_BACKEND_URL + "/create-order", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                planName: planName
            })
        });

        const orderData = await orderResponse.json();

        if(orderResponse.status === 401){
            showDashboardToast("Login session expired. Please login again.");

            setTimeout(function(){
                window.location.href = "login.html";
            }, 900);

            return;
        }

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

            const headers = getPaymentAuthHeaders();

            if(!headers){
                return;
            }

            try{

                const verifyResponse = await fetch(PAYMENT_BACKEND_URL + "/verify-payment", {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        planName: orderData.planName
                    })
                });

                const verifyData = await verifyResponse.json();

                if(verifyResponse.status === 401){
                    showDashboardToast("Login session expired. Please login again.");

                    setTimeout(function(){
                        window.location.href = "login.html";
                    }, 900);

                    return;
                }

                if(verifyData.success){

                    savePaidPlanFromBackend(verifyData, orderData);

                    showDashboardToast(orderData.planName + " plan activated successfully.");

                    setTimeout(function(){
                        window.location.reload();
                    }, 1200);

                }
                else{
                    showDashboardToast(verifyData.message || "Payment verification failed.");
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
            requiredPlan: "Premium"
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

        // LOUDER VOLUME
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

            // High: loud premium alert
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

            // Medium: louder digital bell
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

            // Low: louder calm chime
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
        console.log("Audio not supported.", error);
        showDashboardToast("Audio blocked. Click Enable Sound first.");
    }
}
let chronoAudioContext = null;
let chronoSoundEnabled = false;

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

        chronoSoundEnabled = true;
        localStorage.setItem("chronoSoundEnabled", "true");

        updateSoundButton();

        showDashboardToast("Alarm sound enabled successfully.");
    }
    catch(error){
        console.log("Sound unlock failed", error);
        showDashboardToast("Please click Enable Sound again.");
    }
}

function updateSoundButton(){
    const button = getEl("soundPermissionBtn");

    if(!button) return;

    if(localStorage.getItem("chronoSoundEnabled") === "true"){
        button.textContent = "Sound Enabled";
        button.classList.add("enabled");
    }
    else{
        button.textContent = "Enable Sound";
        button.classList.remove("enabled");
    }
}

updateSoundButton();



function showReminderNotification(reminder){
    playAlarmSound(reminder.priority);

    showChronoReminderPopup(reminder);

    showDashboardToast(reminder.priority + " Reminder: " + reminder.title);

    if("Notification" in window && Notification.permission === "granted"){

        const iconSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
                <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#6C63FF"/>
                        <stop offset="100%" stop-color="#46C6FF"/>
                    </linearGradient>
                </defs>
                <rect width="128" height="128" rx="32" fill="url(#g)"/>
                <text x="64" y="78" text-anchor="middle" font-size="58" font-family="Arial" fill="white">⏰</text>
            </svg>
        `;

        const iconUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(iconSvg);

        new Notification("⏰ ChronoAI Reminder", {
            body: reminder.priority + " Priority • " + reminder.title + " • " + reminder.time,
            icon: iconUrl,
            badge: iconUrl,
            silent: true
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

function requestChronoNotifications(){

    if(!("Notification" in window)){
        showDashboardToast("Browser notifications are not supported.");
        return;
    }

    Notification.requestPermission().then(function(permission){

        updateNotificationButton();

        if(permission === "granted"){
            showDashboardToast("Notifications enabled successfully.");
        }
        else if(permission === "denied"){
            showDashboardToast("Notifications blocked. Alarm sound and toast will still work.");
        }
        else{
            showDashboardToast("Notifications not enabled yet.");
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

    button.classList.remove("enabled", "blocked");

    if(Notification.permission === "granted"){
        button.textContent = "Notifications Enabled";
        button.classList.add("enabled");
        button.disabled = true;
    }
    else if(Notification.permission === "denied"){
        button.textContent = "Notifications Blocked";
        button.classList.add("blocked");
    }
    else{
        button.textContent = "Enable Notifications";
        button.disabled = false;
    }
}

updateNotificationButton();

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

            // Automatically cut/complete reminder after ringing
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

// =============================
// FINAL PLAN UX + SETTINGS FIX
// =============================

function getRequiredPlanForSidebarLink(link){
    const text = link.textContent.toLowerCase();
    const href = link.getAttribute("href") || "";

    if(
        text.includes("settings") ||
        text.includes("profile") ||
        text.includes("dashboard") ||
        text.includes("notes") ||
        text.includes("time tools")
    ){
        return "Free";
    }

    if(text.includes("ai planner") || href.includes("planner")){
        return "Premium";
    }

    if(
        text.includes("tasks") ||
        text.includes("analytics") ||
        text.includes("habit") ||
        text.includes("calendar")
    ){
        return "Pro";
    }

    return "Free";
}

function addSidebarPlanBadges(){
    const links = document.querySelectorAll(".sidebar a");

    links.forEach(function(link){
        const requiredPlan = getRequiredPlanForSidebarLink(link);

        const oldBadge = link.querySelector(".sidebar-plan-badge");

        if(oldBadge){
            oldBadge.remove();
        }

        link.classList.remove("locked-sidebar-link");

        if(requiredPlan === "Free"){
            return;
        }

        const badge = document.createElement("span");
        badge.className = "sidebar-plan-badge";
        badge.textContent = requiredPlan;

        link.appendChild(badge);

        if(!hasPlanAccess(requiredPlan)){
            link.classList.add("locked-sidebar-link");
        }
    });
}

function protectLockedSidebarLinks(){
    const links = document.querySelectorAll(".sidebar a");

    links.forEach(function(link){
        link.addEventListener("click", function(event){
            const requiredPlan = getRequiredPlanForSidebarLink(link);

            if(requiredPlan === "Free"){
                return;
            }

            if(!hasPlanAccess(requiredPlan)){
                event.preventDefault();
                event.stopPropagation();

                showDashboardToast(requiredPlan + " plan required to unlock this feature.");
                openUpgradePlan();
            }
        });
    });
}

function forceSettingsAlwaysAvailable(){
    const settingsModal = getEl("settingsModal");
    const upgradeModal = getEl("upgradeModal");

    const settingsLinks = Array.from(document.querySelectorAll(".sidebar a")).filter(function(link){
        return link.textContent.toLowerCase().includes("settings");
    });

    settingsLinks.forEach(function(link){
        link.classList.remove("locked-sidebar-link");

        const badge = link.querySelector(".sidebar-plan-badge");

        if(badge){
            badge.remove();
        }

        link.onclick = function(event){
            event.preventDefault();
            event.stopPropagation();
            openSettings(event);
        };
    });

    [settingsModal, upgradeModal].forEach(function(modal){
        if(!modal) return;

        modal.classList.remove("locked-feature-card");

        const overlay = modal.querySelector(".plan-lock-overlay");

        if(overlay){
            overlay.remove();
        }

        const controls = modal.querySelectorAll("button, input, textarea, select");

        controls.forEach(function(control){
            control.disabled = false;
        });
    });
}

function keepUpgradeButtonsWorking(){
    const unlockButtons = document.querySelectorAll(".unlock-btn, .lock-content button");

    unlockButtons.forEach(function(button){
        button.disabled = false;

        button.onclick = function(event){
            event.preventDefault();
            event.stopPropagation();
            openUpgradePlan();
        };
    });
}

const originalApplyPlanAccessControl = applyPlanAccessControl;

applyPlanAccessControl = function(){
    originalApplyPlanAccessControl();

    addSidebarPlanBadges();
    forceSettingsAlwaysAvailable();
    keepUpgradeButtonsWorking();
};

addSidebarPlanBadges();
protectLockedSidebarLinks();
forceSettingsAlwaysAvailable();
keepUpgradeButtonsWorking();
applyPlanAccessControl();

   
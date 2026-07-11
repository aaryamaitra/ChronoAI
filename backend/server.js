const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const plans = {
    Pro: {
        amount: 19900,
        displayAmount: "₹199"
    },
    Premium: {
        amount: 39900,
        displayAmount: "₹399"
    }
};

app.get("/", function(req, res){
    res.send("ChronoAI payment backend is running.");
});

app.post("/create-order", async function(req, res){

    try{
        const { planName } = req.body;

        if(!plans[planName]){
            return res.status(400).json({
                success: false,
                message: "Invalid plan selected."
            });
        }

        const orderOptions = {
            amount: plans[planName].amount,
            currency: "INR",
            receipt: "chronoai_" + Date.now(),
            notes: {
                planName: planName,
                product: "ChronoAI"
            }
        };

        const order = await razorpay.orders.create(orderOptions);

        res.json({
            success: true,
            key_id: process.env.RAZORPAY_KEY_ID,
            order: order,
            planName: planName,
            displayAmount: plans[planName].displayAmount
        });

    }
    catch(error){
        console.error("Create order error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to create Razorpay order."
        });
    }

});

app.post("/verify-payment", function(req, res){

    try{
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planName
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isPaymentValid = expectedSignature === razorpay_signature;

        if(!isPaymentValid){
            return res.status(400).json({
                success: false,
                message: "Payment verification failed."
            });
        }

        res.json({
            success: true,
            message: "Payment verified successfully.",
            planName: planName,
            paymentId: razorpay_payment_id
        });

    }
    catch(error){
        console.error("Verify payment error:", error);

        res.status(500).json({
            success: false,
            message: "Payment verification failed."
        });
    }

});

// =============================
// AI HEALTH CHECK
// =============================

app.get("/ai-health", function(req, res){
    res.json({
        success: true,
        geminiKeyLoaded: process.env.GEMINI_API_KEY ? "YES" : "NO",
        geminiModel: process.env.GEMINI_MODEL || "gemini-3.5-flash"
    });
});


// =============================
// CHRONOAI ADVANCED AI ASSISTANT
// =============================

app.post("/ask-ai", async function(req, res){

    try{

        if(!process.env.GEMINI_API_KEY){
            return res.status(500).json({
                success: false,
                reply: "Gemini API key is missing in .env file."
            });
        }

        const {
            message,
            userName,
            currentPlan,
            totalTasks,
            completedTasks,
            pendingTasks,
            notes,
            chatHistory
        } = req.body;

        if(!message || message.trim() === ""){
            return res.status(400).json({
                success: false,
                reply: "Please enter a message."
            });
        }

        const safeHistory = Array.isArray(chatHistory)
            ? chatHistory.slice(-8)
            : [];

        const formattedHistory = safeHistory.map(function(item, index){
            return `${index + 1}. ${item.role}: ${item.content}`;
        }).join("\n");

        const prompt = `
You are ChronoAI Assistant, a professional AI productivity and study assistant inside a SaaS dashboard.

User details:
- User name: ${userName || "User"}
- Current plan: ${currentPlan || "Free"}
- Total tasks: ${totalTasks || 0}
- Completed tasks: ${completedTasks || 0}
- Pending tasks: ${pendingTasks || 0}
- User notes: ${notes || "No notes available"}

Recent conversation history:
${formattedHistory || "No previous conversation."}

Rules:
1. Answer like a helpful professional AI assistant.
2. Use simple student-friendly language.
3. Give accurate and practical answers.
4. Keep answers short unless the user asks for detail.
5. For study/career topics, give step-by-step guidance.
6. For productivity, use the user's task count.
7. Do not invent fake personal details.
8. Do not claim payment is active unless current plan is Pro or Premium.

User message:
${message}
`;

        const fallbackModels = [
    process.env.GEMINI_MODEL || "gemini-flash-latest",
    "gemini-flash-latest",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite"
];

let aiReply = null;
let lastError = null;

for(const modelName of fallbackModels){

    try{

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt
        });

        aiReply = response.text;

        if(aiReply){
            break;
        }

    }
    catch(modelError){

        lastError = modelError;

        console.log("Model failed:", modelName);
        console.log("Reason:", modelError.message);

    }

}

if(!aiReply){
    return res.status(500).json({
        success: false,
        reply: "AI is busy right now. Please try again after a few seconds. Last error: " + (lastError ? lastError.message : "Unknown error")
    });
}

res.json({
    success: true,
    reply: aiReply
});

    }
    catch(error){

        console.error("AI assistant error full:", error);
        console.error("AI assistant error message:", error.message);

        res.status(500).json({
            success: false,
            reply: "AI error: " + (error.message || "Unknown Gemini error")
        });

    }

});

app.listen(process.env.PORT || 5000, function(){
    console.log("ChronoAI backend running on port " + (process.env.PORT || 5000));
});


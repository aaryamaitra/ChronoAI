// ==============================
// CHRONOAI MAIN JS
// REAL RAZORPAY PAYMENT VERSION
// ==============================


// ==============================
// LIVE CLOCK
// ==============================

function updateClock(){
    const now = new Date();

    const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });

    const liveTime = document.getElementById("live-time");

    if(liveTime){
        liveTime.textContent = time;
    }
}

setInterval(updateClock, 1000);
updateClock();


// ==============================
// SUBSCRIPTION MODAL FUNCTIONS
// ==============================

function openPlan(){
    const modal = document.getElementById("planModal");

    if(modal){
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }
}

function closePlan(){
    const modal = document.getElementById("planModal");

    if(modal){
        modal.classList.remove("show");
        document.body.style.overflow = "auto";
    }
}


// ==============================
// LANDING PAGE RAZORPAY PAYMENT
// ==============================

const LANDING_PAYMENT_BACKEND_URL = "http://localhost:5000";

async function selectPlan(planName){

    localStorage.setItem("chronoSelectedPlan", planName);

    closePlan();

    if(planName === "Free"){

        showLandingNotice(
            "Free Plan Selected",
            "Your Free Plan is selected. Redirecting you to login..."
        );

        setTimeout(function(){
            window.location.href = "login.html";
        }, 1200);

        return;
    }

    showLandingNotice(
        "Opening Secure Checkout",
        "Please wait while we open Razorpay payment checkout."
    );

    try{

        const orderResponse = await fetch(LANDING_PAYMENT_BACKEND_URL + "/create-order", {
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
            showLandingNotice(
                "Payment Error",
                orderData.message || "Unable to create payment order."
            );
            return;
        }

        openLandingRazorpayCheckout(orderData);

    }
    catch(error){
        console.error(error);

        showLandingNotice(
            "Backend Not Running",
            "Please start ChronoAI backend on port 5000 first."
        );
    }
}


function openLandingRazorpayCheckout(orderData){

    if(typeof Razorpay === "undefined"){
        showLandingNotice(
            "Checkout Error",
            "Razorpay checkout script is not loaded."
        );
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

            showLandingNotice(
                "Verifying Payment",
                "Please wait while we verify your payment securely."
            );

            try{

                const verifyResponse = await fetch(LANDING_PAYMENT_BACKEND_URL + "/verify-payment", {
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

                    showLandingNotice(
                        orderData.planName + " Plan Activated",
                        "Payment verified successfully. Redirecting you to login..."
                    );

                    setTimeout(function(){
                        window.location.href = "login.html";
                    }, 1600);

                }
                else{
                    showLandingNotice(
                        "Verification Failed",
                        "Payment verification failed. Please try again."
                    );
                }

            }
            catch(error){
                console.error(error);

                showLandingNotice(
                    "Verification Error",
                    "Could not verify payment. Please try again."
                );
            }
        },

        modal: {
            ondismiss: function(){
                showLandingNotice(
                    "Payment Cancelled",
                    "You cancelled the payment checkout."
                );
            }
        }
    };

    const razorpayCheckout = new Razorpay(options);
    razorpayCheckout.open();
}


// ==============================
// PROFESSIONAL NOTICE MODAL
// ==============================

function showLandingNotice(title, message){

    const planNoticeModal = document.getElementById("planNoticeModal");
    const planNoticeTitle = document.getElementById("planNoticeTitle");
    const planNoticeMessage = document.getElementById("planNoticeMessage");

    if(planNoticeTitle){
        planNoticeTitle.textContent = title;
    }

    if(planNoticeMessage){
        planNoticeMessage.textContent = message;
    }

    if(planNoticeModal){
        planNoticeModal.classList.add("show");
        document.body.style.overflow = "hidden";
    }
}

function closePlanNotice(){

    const planNoticeModal = document.getElementById("planNoticeModal");

    if(planNoticeModal){
        planNoticeModal.classList.remove("show");
        document.body.style.overflow = "auto";
    }
}


// ==============================
// PAGE BUTTON ACTIONS
// ==============================

document.addEventListener("DOMContentLoaded", function(){

    const getStartedBtn = document.getElementById("getStartedBtn");
    const startFreeBtn = document.getElementById("startFreeBtn");
    const learnMoreBtn = document.getElementById("learnMoreBtn");

    if(getStartedBtn){
        getStartedBtn.addEventListener("click", function(){
            openPlan();
        });
    }

    if(startFreeBtn){
        startFreeBtn.addEventListener("click", function(){
            window.location.href = "login.html";
        });
    }

    if(learnMoreBtn){
        learnMoreBtn.addEventListener("click", function(){
            const about = document.getElementById("about");

            if(about){
                about.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    }

    const planCards = document.querySelectorAll(".chrono-plan-card");

    planCards.forEach(function(card){

        card.addEventListener("click", function(){

            planCards.forEach(function(item){
                item.classList.remove("active-plan");
            });

            card.classList.add("active-plan");

        });

    });

});


// ==============================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// ==============================

window.addEventListener("click", function(event){

    const planModal = document.getElementById("planModal");
    const planNoticeModal = document.getElementById("planNoticeModal");

    if(event.target === planModal){
        closePlan();
    }

    if(event.target === planNoticeModal){
        closePlanNotice();
    }

});


// ==============================
// CLOSE MODALS WITH ESC KEY
// ==============================

window.addEventListener("keydown", function(event){

    if(event.key === "Escape"){
        closePlan();
        closePlanNotice();
    }

});
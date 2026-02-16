const https = require("https");
const User = require("../models/User");

const MAX_MESSAGE_LENGTH = 1500;

const buildSystemPrompt = (userContext) => {
  return `You are SuryaUrja assistant for a solar energy platform. Your job is to guide users to the correct features and explain steps clearly. You do NOT perform real actions, write data, or change user records. Provide safe guidance and direct links to pages.

User context (if available): ${userContext}

User features and routes:
- Booking: /booking
- Booking status: /booking-status
- Subsidy eligibility: /subsidy
- Apply for subsidy: /apply-subsidy
- Subsidy status: /subsidy-status
- Recommendations: /recommendations
- Alerts: /dashboard/alerts
- Profile: /profile
- Notifications: /notifications
- Messages: /messages
- Support tickets: /support

Guidelines:
- Keep replies concise and actionable.
- Ask a short follow-up question if needed.
- If the user requests actions, explain how to do it in the app and provide the route.
- If the user asks about admin-only items, explain access is restricted.
- Never ask for passwords or secrets.`;
};

const callOpenAI = (payload, apiKey) =>
  new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);

    const request = https.request(
      {
        hostname: "api.openai.com",
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            return reject(new Error(body || `OpenAI error ${response.statusCode}`));
          }

          try {
            const parsed = JSON.parse(body);
            return resolve(parsed);
          } catch (error) {
            return reject(error);
          }
        });
      }
    );

    request.on("error", (error) => reject(error));
    request.write(data);
    request.end();
  });

const buildMockReply = (message, userContext, lastAssistant = "") => {
  const text = message.toLowerCase();
  const last = lastAssistant.toLowerCase();
  const isGuest = userContext === "Guest user";

  if (["yes", "y", "yep", "ok", "okay", "sure"].includes(text.trim())) {
    if (last.includes("eligibility")) {
      return "Eligibility steps: 1) Go to /subsidy. 2) Enter your system size, location, and roof details. 3) Review eligibility result. 4) If eligible, continue to /apply-subsidy.";
    }
    if (last.includes("form fields") || last.includes("booking")) {
      return "Booking form steps: 1) Select system capacity. 2) Enter address and contact details. 3) Choose preferred date/time. 4) Submit and track at /booking-status.";
    }
    return "Please tell me which area you want help with: booking, subsidy, support, or status.";
  }

  if (text.includes("document") || text.includes("doc") || text.includes("upload")) {
    if (last.includes("subsidy") || last.includes("eligibility")) {
      return "For subsidy, keep ID proof, address proof, property ownership/consent, and system details ready. Upload them during /apply-subsidy.";
    }
  }

  if (text.includes("help") || text.includes("menu") || text.includes("options") || text.includes("what can you do")) {
    return "I can help with: booking, booking status, subsidy eligibility, subsidy application, subsidy status, support tickets, profile updates, notifications, messages, alerts, recommendations, and login/register. What do you want to do?";
  }

  if (text.includes("booking status") || text.includes("track booking") || text.includes("booking track")) {
    return "To track your booking, open /booking-status. You can see current status and updates there.";
  }

  if (text.includes("reschedule") && text.includes("booking")) {
    return "To reschedule a booking, go to /booking-status and choose reschedule on the booking entry.";
  }

  if (text.includes("book") && text.includes("cancel")) {
    return "To cancel a booking, open /booking-status, select the booking, and choose cancel. If you need help, open /support.";
  }

  if (text.includes("complain") || text.includes("complaint") || text.includes("resolve") || text.includes("resolution") || text.includes("days")) {
    if (last.includes("support") || last.includes("ticket")) {
      return "Support requests are usually resolved within 2-3 business days. You can check the status anytime in /support.";
    }
    return "Support requests are usually resolved within 2-3 business days. For exact status, open /support and check your ticket.";
  }

  if (text.includes("booking")) {
    return "To create a booking, go to /booking and fill the form. You can track it later in /booking-status. Want help with the form fields?";
  }

  if (text.includes("subsidy")) {
    if (text.includes("apply")) {
      return "To apply for subsidy, open /apply-subsidy and upload the required documents. I can explain the fields if you want.";
    }
    if (text.includes("status") || text.includes("track")) {
      return "You can track subsidy progress in /subsidy-status. If you have a reference number, keep it ready.";
    }
    if (text.includes("document") || text.includes("doc") || text.includes("upload")) {
      return "Subsidy documents are uploaded during /apply-subsidy. Keep ID proof, address proof, and system details ready.";
    }
    return "First check eligibility at /subsidy, then apply at /apply-subsidy. Do you want the eligibility steps?";
  }

  if (text.includes("eligibility") || text.includes("eligible")) {
    return "Check eligibility at /subsidy. Enter your system size, location, and roof details to see eligibility.";
  }

  if (text.includes("support") || text.includes("ticket")) {
    return "You can raise a support request in /support. Add a short issue title and details, then submit.";
  }

  if (text.includes("status") && text.includes("ticket")) {
    return "To check ticket status, open /support and view your ticket list.";
  }

  if (text.includes("profile") || text.includes("account")) {
    return "You can view and update your profile details in /profile.";
  }

  if (text.includes("login") || text.includes("sign in")) {
    return "To log in, open /login. You can also use Google login on that page.";
  }

  if (text.includes("register") || text.includes("sign up")) {
    return "To create a new account, open /register and fill in your details.";
  }

  if (text.includes("logout") || text.includes("sign out")) {
    return "You can log out from your profile menu in the top navigation.";
  }

  if (text.includes("contact") || text.includes("reach")) {
    return "You can contact us on /contact. Fill out the form and we will get back to you.";
  }

  if (text.includes("password") || text.includes("reset")) {
    return "To reset your password, go to /forgot-password and follow the instructions.";
  }

  if (text.includes("alert")) {
    return "Your alerts are in /dashboard/alerts. You can review and acknowledge them there.";
  }

  if (text.includes("notification")) {
    return "Notifications are available at /notifications. You can open each item for details.";
  }

  if (text.includes("message") || text.includes("chat")) {
    return "Your messages are in /messages. You can view and reply there.";
  }

  if (text.includes("recommend")) {
    return "Recommendations are in /recommendations. You can review energy suggestions there.";
  }

  if (text.includes("dashboard")) {
    return "Your main dashboard is /dashboard where you can view energy insights and quick actions.";
  }

  if (text.includes("energy") || text.includes("usage")) {
    return "Energy insights and usage trends are available in /dashboard.";
  }

  if (text.includes("roi") || text.includes("payback")) {
    return "For ROI and payback estimates, check recommendations in /recommendations.";
  }

  if (text.includes("solar type") || text.includes("types of solar") || text.includes("solar types")) {
    return "Common solar types are: On-grid (grid-tied), Off-grid, and Hybrid. If you want help choosing, tell me your usage pattern and backup needs.";
  }

  if (text.includes("weather")) {
    return "Weather-based insights are available in your dashboard at /dashboard.";
  }

  if (text.includes("installation") || text.includes("install")) {
    return "Installation status and project progress can be tracked in /booking-status.";
  }

  if (text.includes("payment") || text.includes("pay")) {
    return "Payments are tied to your booking or subsidy process. Check your booking details in /booking-status, or raise a query in /support.";
  }

  if (text.includes("report") || text.includes("export")) {
    return "Reports and exports are available in your dashboard area. If you need a specific report, open /support.";
  }


  if (text.includes("status pages") || text.includes("status page") || text === "status" || text.includes("status")) {
    return "Which status do you want? Booking status is at /booking-status, and subsidy status is at /subsidy-status.";
  }

  if (text.includes("admin") || text.includes("role")) {
    return "Admin features are restricted. Please contact an administrator if you need access.";
  }

  if (isGuest) {
    return "I can guide you through bookings, subsidy, support, and more. Please log in to access your account features. What do you want to do?";
  }

  return "I can guide you to bookings, subsidy, support, and status pages. Tell me what you want to do.";
};

exports.chat = async (req, res) => {
  try {
    const { message, lastAssistant } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Message is required" });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ message: "Message too long" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    let userContext = "Guest user";
    if (req.user?.id) {
      const user = await User.findById(req.user.id).select("email role name");
      if (user) {
        userContext = `Name: ${user.name || "Unknown"}, Email: ${user.email}, Role: ${user.role}`;
      }
    }

    const mode = (process.env.AI_MODE || (apiKey ? "openai" : "mock")).toLowerCase();
    if (mode === "mock") {
      const reply = buildMockReply(message, userContext, lastAssistant);
      return res.json({ reply });
    }

    if (!apiKey) {
      return res.status(500).json({ message: "OPENAI_API_KEY is not set" });
    }

    const systemPrompt = buildSystemPrompt(userContext);
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const data = await callOpenAI(
      {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.4,
        max_tokens: 300,
      },
      apiKey
    );
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({ message: "No response from AI" });
    }

    return res.json({ reply });
  } catch (error) {
    console.error("AI CHAT ERROR:", error);
    return res.status(500).json({ message: "AI request failed" });
  }
};

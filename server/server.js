require("dotenv").config(); // Load env vars
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Schema
const messageSchema = new mongoose.Schema({
  wa_id: { type: String, required: true },
  name: { type: String, default: "" },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
  meta_msg_id: { type: String }
});

const Message = mongoose.model("processed_messages", messageSchema);

// ✅ Get conversations: latest message per wa_id
app.get("/conversations", async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      { $match: { wa_id: { $exists: true, $ne: null } } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$wa_id",
          name: { $first: "$name" },
          lastMessage: { $first: "$message" },
          lastTimestamp: { $first: "$timestamp" },
          lastStatus: { $first: "$status" },
          lastMessageDocId: { $first: "$_id" }
        }
      },
      { $sort: { lastTimestamp: -1 } },
      {
        $project: {
          wa_id: "$_id",
          name: { $ifNull: ["$name", "Unknown"] },
          message: { $ifNull: ["$lastMessage", ""] },
          timestamp: "$lastTimestamp",
          status: "$lastStatus",
          lastMessageDocId: 1,
          _id: 0
        }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get all messages for a specific wa_id
app.get("/messages/:wa_id", async (req, res) => {
  try {
    const waId = req.params.wa_id;
    const messages = await Message.find({ wa_id: waId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Save a new message (demo send)
app.post("/messages", async (req, res) => {
  try {
    const { wa_id, name, text, message, timestamp, status, meta_msg_id } = req.body;
    const bodyText = text || message || "";
    if (!wa_id || !bodyText) {
      return res.status(400).json({ error: "wa_id and text/message are required" });
    }

    const newMessage = new Message({
      wa_id,
      name: name || "",
      message: bodyText,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      status: status || "sent",
      meta_msg_id
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Serve React frontend after build (FIXED for Render)
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});


// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

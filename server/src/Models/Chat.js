import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    // ЗМІНЕНО: тип тепер String, оскільки в моделі User _id є рядком (uuid)
    user: { 
      type: String, 
      ref: "User", 
      required: true 
    },
    // Масив історії у тому форматі, якого вимагає Gemini
    history: [
      {
        role: { type: String, enum: ["user", "model"], required: true },
        parts: [{ text: { type: String, required: true } }]
      }
    ]
  },
  { timestamps: true }
);

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export default Chat;

import React, { useState } from "react";
import axios from "axios";

export default function MessageInput({ apiBase, wa_id, name, onSent }) {
  const [text, setText] = useState("");

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !wa_id) return;

    const payload = {
      wa_id,
      name: name || "You",
      // send both to match whichever server expects
      text: text,
      message: text,
      timestamp: new Date(),
      status: "sent",
      meta_msg_id: `local_${Date.now()}`
    };

    try {
      const res = await axios.post(`${apiBase}/messages`, payload);
      // server may return created message; if not, append payload
      const saved = res.data || payload;
      onSent(saved);
      setText("");
    } catch (err) {
      console.error("send message:", err);
      // still append locally for demo
      onSent(payload);
      setText("");
    }
  };

  return (
    <form onSubmit={send} className="p-4 bg-white border-t flex items-center gap-2">
      <input
        className="flex-1 border rounded-full px-4 py-2 outline-none"
        placeholder="Type a message"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-full">Send</button>
    </form>
  );
}

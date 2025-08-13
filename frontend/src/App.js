
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

const API =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000");


export default function App() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchConversations();
    const iv = setInterval(fetchConversations, 10000);
    return () => clearInterval(iv);
  }, []);

  function fetchConversations() {
    axios
      .get(`${API}/conversations`)
      .then((res) => setConversations(res.data))
      .catch((err) => console.error("fetch conversations:", err));
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`h-full bg-white border-r 
          ${selected ? "hidden sm:block" : "block"} 
          w-full sm:w-80`}
      >
        <Sidebar
          conversations={conversations}
          onSelect={(c) => setSelected(c)}
          selected={selected}
        />
      </div>

      {/* Chat Window */}
      <div
        className={`h-full flex-1 flex min-w-0 
          ${!selected ? "hidden sm:flex" : "flex"}`}
      >
        {selected ? (
          <ChatWindow
            conversation={selected}
            apiBase={API}
            onMessageSent={fetchConversations}
            onBack={() => setSelected(null)}
          />
        ) : (
          // Show placeholder only for desktop
          <div className="hidden sm:flex flex-1 items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

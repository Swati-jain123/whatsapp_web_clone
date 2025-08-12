

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import MessageInput from "./MessageInput";
import { FaCheck, FaCheckDouble } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";

export default function ChatWindow({ conversation, apiBase, onMessageSent, onBack }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    if (conversation) fetchMessages(conversation.wa_id || conversation._id || conversation.id);
  }, [conversation]);

  function fetchMessages(waId) {
    axios.get(`${apiBase}/messages/${waId}`)
      .then(res => setMessages(res.data))
      .catch(() => setMessages([]));
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const statusIcon = (s) => {
    if (!s) return null;
    if (s === "sent") return <FaCheck className="text-gray-500 inline-block ml-1" />;
    if (s === "delivered") return <FaCheckDouble className="text-gray-500 inline-block ml-1" />;
    if (s === "read") return <FaCheckDouble className="text-blue-500 inline-block ml-1" />;
    return null;
  };

  if (!conversation) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">Select a chat</div>;
  }

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-[#e5ddd5]">
      {/* Header */}
      <div className="p-4 border-b bg-white flex items-center gap-3">
        {/* Back button for mobile */}
        <button className="sm:hidden text-gray-600" onClick={onBack}>
          <IoArrowBack size={24} />
        </button>
        <div className="font-semibold text-lg">{conversation.name || conversation.wa_id}</div>
        <div className="text-sm text-gray-500">({conversation.wa_id || conversation.id})</div>
      </div>
  
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4" ref={scrollRef}>
        {messages.map((m, i) => {
          const isInbound = m.from === conversation.wa_id; 
          return (
            <div key={m._id || i} className={`mb-3 flex ${isInbound ? "justify-start" : "justify-end"}`}>
              <div className={`${isInbound ? "bg-white" : "bg-green-400 text-black"} p-3 rounded-lg max-w-[80%] sm:max-w-[70%]`}>
                <div className="whitespace-pre-wrap">
                  {m.message || m.text || m.messageText || ""}
                </div>
                <div className="text-xs text-gray-500 mt-2 flex items-center justify-end">
                  <span>{m.timestamp ? dayjs(m.timestamp).format("DD/MM HH:mm") : ""}</span>
                  {!isInbound && statusIcon(m.status)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
  
      {/* Input */}
      <MessageInput
        apiBase={apiBase}
        wa_id={conversation.wa_id || conversation.id || conversation._id}
        name={conversation.name}
        onSent={(newMsg) => {
          setMessages(prev => [...prev, newMsg]);
          if (onMessageSent) onMessageSent();
        }}
      />
    </div>
  );
      }  
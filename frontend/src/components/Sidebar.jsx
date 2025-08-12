
import React from "react";
import dayjs from "dayjs";

export default function Sidebar({ conversations, onSelect, selected }) {
  return (
    <div className="w-100 bg-white border-r">
      <div className="text-green-500 p-4 border-b font-bold text-2xl">WhatsApp</div>
      <div className="h-[calc(100vh-64px)] overflow-auto">
        {conversations.length === 0 && (
          <div className="p-4 text-sm text-gray-500">No conversations</div>
        )}
        {conversations.map((c) => (
          <div
            key={c._id || c.id}
            onClick={() => onSelect(c)}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 flex justify-between ${
              selected && (selected._id === c._id || selected.id === c.id) ? "bg-gray-100" : ""
            }`}
          >
            <div>
              <div className="font-semibold">{c.name || c.wa_id || "Unknown"}</div>
              <div className="text-sm text-gray-600 truncate max-w-[180px]">{c.message}</div>
            </div>
            <div className="text-xs text-gray-400">
              {c.timestamp ? dayjs(c.timestamp).format("HH:mm") : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

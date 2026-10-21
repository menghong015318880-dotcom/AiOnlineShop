"use client";
import { FaRobot } from "react-icons/fa"; // robot icon

// Floating button at the bottom-right of every page.
// Phone = round icon only. From sm up = icon + text.
// The real chat panel is built later (clicking only shows an alert for now).
export default function AiChatButton() {
  return (
    <button
      onClick={() => alert("AI assistant coming soon")}
      aria-label="Chat with AI Assistant"
      className="fixed bottom-4 right-4 z-50 flex items-center rounded-full bg-blue-600 p-1.5 text-sm font-medium text-white shadow-lg hover:bg-blue-700 sm:bottom-6 sm:right-6 sm:pr-5"
    >
      {/* Round icon area */}
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-blue-600 sm:mr-3">
        <FaRobot />
      </span>
      {/* Text is hidden on phones so only the round icon shows */}
      <span className="hidden sm:inline">Chat with AI Assistant</span>
    </button>
  );
}
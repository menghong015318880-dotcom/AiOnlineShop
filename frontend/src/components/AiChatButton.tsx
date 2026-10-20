"use client";
import { FaRobot } from "react-icons/fa"; // robot icon

// Floating button at the bottom-right of every page.
// The real chat panel is built later (clicking only shows an alert for now).
export default function AiChatButton() {
  return (
    <button
      onClick={() => alert("AI assistant coming soon")}
      aria-label="Chat with AI Assistant"
      className="fixed bottom-6 right-6 z-50 flex items-center rounded-full bg-blue-600 py-1.5 pl-1.5 pr-5 text-sm font-medium text-white shadow-lg hover:bg-blue-700"
    >
      {/* Round icon area. To use your own bot image instead of the icon:
          import Image from "next/image" and replace <FaRobot /> with
          <Image src="/assets/images/bot.png" alt="" width={36} height={36} /> */}
      <span className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-blue-600">
        <FaRobot />
      </span>
      {/* Text is hidden on very small screens so only the icon shows */}
      <span className="hidden sm:inline">Chat with AI Assistant</span>
    </button>
  );
}
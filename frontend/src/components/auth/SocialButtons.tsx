"use client";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

// "or continue with" Google / Apple.
// These do not work yet: social login needs OAuth in the backend.
export default function SocialButtons() {
  const comingSoon = (name: string) => () => window.alert(`${name} login will be available later.`);

  return (
    <>
      <div className="my-5 flex items-center gap-3 text-xs text-gray-500">
        <span className="h-px flex-1 bg-gray-200" />
        or continue with
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={comingSoon("Google")}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FcGoogle className="text-xl" /> Google
        </button>
        <button
          type="button"
          onClick={comingSoon("Apple")}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FaApple className="text-xl" /> Apple
        </button>
      </div>
    </>
  );
}
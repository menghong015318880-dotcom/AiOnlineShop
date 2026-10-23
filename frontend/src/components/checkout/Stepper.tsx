import { FiCheck } from "react-icons/fi";

const STEPS = ["Shpping", "Payment", "Confirmation"];

// The 3 steps at the top of the checkout page.
// Finished steps show a check mark, th current step is blue.
export default function Stepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-start">
      {STEPS.map((label, index) => {
        const number = index + 1;
        const done = number < current;
        const active = number === current;
        
        return (
          <li key={label} className="flex items-start">
            <div className="flex flex-col items-center gap-1">
              <span 
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                  done || active
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {done ? <FiCheck /> : number}
              </span>
              <span className={`text-xs ${active ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                {label}
              </span>
            </div>

            {/* Line between two steps */}
            {number < STEPS.length && (
              <span className={`mx-2 mt-4 h-0.5 sm:w-14 ${done ? "bg-blue-600" : "bg-gray-300"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
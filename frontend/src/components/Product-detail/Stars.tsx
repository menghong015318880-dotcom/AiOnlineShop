import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

// Five stars for a rating from 0 to 5 (rounded to the nearest half star).
export default function Stars({ value }: { value: number }) {
  const rounded = Math.round(value * 2) / 2;

  return (
    <span className="flex text-yellow-400" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        if (rounded >= i) return <FaStar key={i} />;
        if (rounded >= i - 0.5) return <FaStarHalfAlt key={i} />;
        return <FaRegStar key={i} />;
      })}
    </span>
  );
}
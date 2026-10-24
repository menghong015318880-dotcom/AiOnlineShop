"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

// Put your 3 images in public/assets/images/auth/ and use these names
// (or change the names here, e.g. ".jpg" or ".webp").
const SLIDES = [
  "/assets/images/auth/auth-1.png",
  "/assets/images/auth/auth-2.png",
  "/assets/images/auth/auth-3.png",
];

const INTERVAL_MS = 4000; // time between two slides

// Background images that slide to the left by themselves, with dots at the bottom.
// It stops while the mouse is over it. It fills its parent (the parent must be "relative").
export default function AuthCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Go to the next slide every few seconds. The timer starts again whenever
  // "index" changes, so clicking a dot gives the new slide a full interval.
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, index]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* All slides are in one row. Moving the row left by index x 100% shows slide "index". */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((src, i) => (
          <div key={src} className="relative h-full w-full min-w-full shrink-0">
            <Image
              src={src}
              alt=""
              fill
              priority={i === 0}
              sizes="(min-width: 768px) 40vw, 0px"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Show image ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-5 bg-blue-600" : "w-2 bg-blue-300 hover:bg-blue-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
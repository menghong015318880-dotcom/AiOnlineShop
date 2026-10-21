"use client";
import { useState } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface ProductGalleryProps {
  images: string[]; // at least one image
  alt: string;
}

// Big image with arrows and dots, plus thumbnails (only when there is more than one image).
export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  // Go to the previous / next image, and loop around at the ends
  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  return (
    // Phone: thumbnails under the image. From sm up: thumbnails on the left.
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white ${
                i === index ? "border-blue-600" : "border-gray-200"
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative aspect-square w-full min-w-0 overflow-hidden rounded-xl bg-gray-50 sm:flex-1">
        <Image
          src={images[index]}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1280px) 40vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-6"
        />

        {count > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 text-lg shadow hover:bg-gray-100"
            >
              <FiChevronLeft />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 text-lg shadow hover:bg-gray-100"
            >
              <FiChevronRight />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${i === index ? "bg-blue-600" : "bg-gray-300"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
import { useState } from "react";
import { PiBowlFoodFill } from "react-icons/pi";

export default function FoodImage({ src, alt, className = "" }) {
  const [state, setState] = useState(src ? "loading" : "error");

  return (
    <div className={`relative overflow-hidden bg-kupa-50 ${className}`}>
      {state === "loading" && <div className="absolute inset-0 animate-pulse bg-kupa-100" />}
      {state === "error" ? (
        <div className="flex h-full w-full items-center justify-center text-kupa-500/50">
  <PiBowlFoodFill size={36} />
</div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
          className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
            state === "loaded" ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
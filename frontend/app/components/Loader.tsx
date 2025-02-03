import React from "react";

const BloodDropletLoader = () => {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="relative w-12 h-12">
        {/* SVG droplet */}
        <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full">
          {/* Droplet outline */}
          <path
            d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
            className="fill-none stroke-red-500"
            strokeWidth="1.5"
          />

          {/* Animated fill mask */}
          <defs>
            <clipPath id="fillMask">
              <rect
                x="0"
                y="24"
                width="24"
                height="24"
                className="animate-wave"
              >
                <animate
                  attributeName="y"
                  values="24;-24"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </rect>
            </clipPath>
          </defs>

          {/* Filled droplet */}
          <path
            d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
            className="fill-red-500"
            style={{ clipPath: "url(#fillMask)" }}
          />

          {/* Shine effect */}
          <circle cx="10" cy="8" r="0.8" className="fill-white opacity-60" />
        </svg>
      </div>
    </div>
  );
};

export default BloodDropletLoader;

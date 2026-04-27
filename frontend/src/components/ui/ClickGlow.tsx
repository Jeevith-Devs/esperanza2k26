"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

const ClickGlow = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Only enable on mobile/touch devices or generally everywhere if desired
    // The request specifically mentions "mobile view", but often click effects are nice on all devices
    // We can just bind to 'click' event globally.

    const handleClick = (e: MouseEvent) => {
      // Create the glow element
      const glow = document.createElement("div");
      glow.classList.add("click-glow");

      // Position it at click coordinates
      // Adjust center of the 100px circle to the mouse point
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;

      // Add to body
      document.body.appendChild(glow);

      // Remove after animation completes (e.g. 600ms)
      setTimeout(() => {
        glow.remove();
      }, 600);
    };

    window.addEventListener("click", handleClick);

    // Cleanup
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [pathname]);

  return (
    <style jsx global>{`
      .click-glow {
        position: fixed;
        width: 40px;
        height: 40px;
        background: radial-gradient(
          circle,
          rgba(168, 85, 247, 0.6) 0%,
          rgba(168, 85, 247, 0) 70%
        );
        transform: translate(-50%, -50%) scale(0);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: glowExpand 0.5s ease-out forwards;
        mix-blend-mode: screen; 
      }

      @keyframes glowExpand {
        0% {
          transform: translate(-50%, -50%) scale(0);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -50%) scale(4);
          opacity: 0;
        }
      }
    `}</style>
  );
};

export default ClickGlow;

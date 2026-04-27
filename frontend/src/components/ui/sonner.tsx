"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#0c0c0c] group-[.toaster]:text-white group-[.toaster]:border-[#A855F7]/30 group-[.toaster]:shadow-[0_0_30px_rgba(168,85,247,0.15)] font-bricolage group-[.toaster]:border-2 group-[.toaster]:rounded-xl px-6 py-4",
          description: "group-[.toast]:text-zinc-400 font-bricolage",
          actionButton:
            "group-[.toast]:bg-[#A855F7] group-[.toast]:text-white font-bricolage hover:bg-[#A855F7]/90 transition-colors",
          cancelButton:
            "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-400 font-bricolage hover:bg-zinc-700 transition-colors",
          success: "group-[.toast]:border-green-500/50 group-[.toaster]:shadow-[0_0_30px_rgba(34,197,94,0.15)]",
          error: "group-[.toast]:border-red-500/50 group-[.toaster]:shadow-[0_0_30px_rgba(239,68,68,0.15)]",
        },
      }}
      style={
        {
          "--normal-bg": "#0c0c0c",
          "--normal-text": "#ffffff",
          "--normal-border": "rgba(168, 85, 247, 0.3)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

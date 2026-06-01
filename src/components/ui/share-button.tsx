"use client"

import React, { useState } from "react"
import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ShareLink {
  icon: LucideIcon
  href?: string
  onClick?: () => void
  label?: string
}

interface ShareButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  links: ShareLink[]
  children: React.ReactNode
}

const ShareButton = ({
  className,
  links,
  children,
  ...props
}: ShareButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Button
        className={cn(
          "relative min-w-40 rounded-3xl",
          "transition-all duration-300",
          isHovered ? "opacity-0" : "opacity-100",
          className
        )}
        {...props}
      >
        <span className="flex items-center gap-2">{children}</span>
      </Button>

      <div className="absolute inset-0 flex">
        {links.map((link, index) => {
          const Icon = link.icon
          const handleAction = (e: React.MouseEvent) => {
            e.stopPropagation()
            if (link.onClick) {
              link.onClick()
            } else if (link.href) {
              window.open(link.href, "_blank", "noopener,noreferrer")
            }
          }
          return (
            <button
              type="button"
              key={index}
              onClick={handleAction}
              className={cn(
                "h-full",
                "flex-1",
                "flex items-center justify-center",
                "bg-black dark:bg-white",
                "text-white dark:text-black",
                "transition-all duration-300",
                index === 0 && "rounded-l-3xl",
                index === links.length - 1 && "rounded-r-3xl",
                "border-r border-white/10 last:border-r-0 dark:border-black/10",
                "hover:bg-gray-900 dark:hover:bg-gray-100",
                isHovered
                  ? "translate-x-0 opacity-100 pointer-events-auto"
                  : "-translate-x-full opacity-0 pointer-events-none",
                index === 0 && "transition-all duration-200",
                index === 1 && "delay-75 transition-all duration-200",
                index === 2 && "transition-all delay-100 duration-200",
                index === 3 && "transition-all delay-150 duration-200"
              )}
              title={link.label}
            >
              <Icon className="size-4" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ShareButton;

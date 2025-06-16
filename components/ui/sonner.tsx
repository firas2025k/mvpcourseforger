"use client"

import React from "react";
import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps, toast } from "sonner"
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"; // Import icons

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      style={
        {
          '--normal-bg': 'var(--card)',
          '--normal-text': 'var(--card-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--primary)',
          '--success-text': 'var(--primary-foreground)',
          '--error-bg': 'var(--destructive)',
          '--error-text': 'var(--destructive-foreground)',
          '--info-bg': 'var(--secondary)',
          '--info-text': 'var(--secondary-foreground)',
          '--warning-bg': '#f59e0b',
          '--warning-text': '#1f2937',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "bg-[var(--normal-bg)] text-[var(--normal-text)] border border-[var(--normal-border)] rounded-lg shadow-lg transition-all duration-300 ease-in-out",
          title: "text-sm font-semibold",
          description: "text-xs text-[var(--normal-text)]",
          actionButton: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 rounded-md px-3 py-1 text-xs",
          cancelButton: "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/90 rounded-md px-3 py-1 text-xs",
          closeButton: "text-[var(--normal-text)] hover:text-[var(--primary)]",
          icon: "mr-2", // Space between icon and text
        },
        duration: 4000,
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
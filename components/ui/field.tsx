import * as LabelPrimitive from "@radix-ui/react-label";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function FieldLabel({ className, ...props }: LabelPrimitive.LabelProps) {
  return <LabelPrimitive.Root className={cn("admin-label", className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("admin-input", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("admin-input admin-textarea", className)} {...props} />;
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="admin-field-hint">{children}</p>;
}


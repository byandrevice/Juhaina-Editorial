import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("admin-button", {
  variants: {
    variant: {
      primary: "admin-button--primary",
      secondary: "admin-button--secondary",
      ghost: "admin-button--ghost",
      danger: "admin-button--danger",
    },
    size: { default: "", small: "admin-button--small" },
  },
  defaultVariants: { variant: "primary", size: "default" },
});

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}


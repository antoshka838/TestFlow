import React from "react";
import classes from "./button.module.css";

export default function Button({
  children,
  onClick,
  className = "",
  ...props
}) {
  return (
    <button
      className={`${classes.btn} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

import classes from "./toolBar.module.css";

export default function ToolBar({ children }) {
  return (
    <div className={classes.toolBar}>
      {children}
    </div>
  );
}

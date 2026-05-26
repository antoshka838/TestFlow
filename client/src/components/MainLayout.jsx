import React from "react";
import { Outlet } from "react-router";
import Sidebar from "./UI/navbar/Sidebar";
import classes from "../App.module.css";

export default function MainLayout() {
  return (
    <div className={classes.container}>
      <Sidebar />
      <main className={classes.mainContainer}>
        <Outlet/>
      </main>
    </div>
  );
}

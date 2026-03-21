import React from 'react'
import classes from "./dataCard.module.css"

export default function DataCard({children, actions}) {
  return (
    <div className={classes.card}>
      <div className={classes.cardContent}>
        {children}
      </div>
      <div className={classes.cardActions}>
        {actions}
      </div>
    </div>
  )
}

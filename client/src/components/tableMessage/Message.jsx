import React from 'react'
import classes from "./style.module.css"

export default function Message({children}) {
  return (
    <div className={classes.massege}>{children}</div>
  )
}

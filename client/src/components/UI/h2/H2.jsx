import React from 'react'
import classes from "./h2.module.css"

export default function H2({children}) {
  return (
    <h2 className={classes.h2}>{children}</h2>
  )
}

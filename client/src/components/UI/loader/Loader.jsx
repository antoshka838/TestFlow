import React from 'react'
import { CircularProgress } from '@mui/material'
import classes from "./style.module.css"

export default function Loader() {
  return (
    <div className={classes.container}>
      <CircularProgress sx={{color: "#FFDA53"}} size={50}/>
    </div>
  )
}

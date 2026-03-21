import React from 'react'
import { TextField } from '@mui/material'

export default function Input(props) {
  return (
    <TextField
      variant='filled'
      fullWidth
      {...props}
    />
  )
}

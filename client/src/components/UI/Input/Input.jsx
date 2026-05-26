import React, {useRef, useEffect} from 'react'
import { TextField } from '@mui/material'

export default function Input({autoFocus, ...props}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  return (
    <TextField
      fullWidth
      {...props}
      inputRef={inputRef}
      FormHelperTextProps={{
        sx: {
          position: 'absolute',
          top: '100%',
          marginLeft: '4px',
          marginTop: '4px',
          lineHeight: 1,
          fontSize: "12px !important",
          fontWeight: 500,
        }
      }}
    />
  )
}

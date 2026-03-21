import React from 'react'
import { useNavigate } from 'react-router'

export default function ButtonToSomePage() {
  const navigate = useNavigate()


  return (
    <button onClick={() => navigate("somePage")}>перейти кудато</button>
  )
}

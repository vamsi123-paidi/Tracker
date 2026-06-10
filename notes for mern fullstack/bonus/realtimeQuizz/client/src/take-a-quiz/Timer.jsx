import React, { useState, useEffect } from 'react'

const Timer = ({ timeLeft, setTimeLeft }) => {

  
  // const [timerId, setTimerId] = useState(null)

  useEffect(() => {
    if (timeLeft > 0) {
      setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    }
  }, [timeLeft])

  return (
    <h2>{timeLeft}</h2>
  )
}

export default Timer




import React, { useState, useEffect } from 'react'

const ReturnToTop = () => {
  const [arrowButton, setArrowButton] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 200) {
        setArrowButton(true)
      } else {
        setArrowButton(false)
      }
    })
  }, [])

  // Function to send user back to the top of the page
  const goToTop = () => {
    window.scrollTo({
      top: 10,
      behavior: 'smooth'
    })
  }
	
	return (
    <div className='d-flex flex wrap position-absolute bottom-0 start-0'>
    <button onClick={goToTop} className='return-to-top'>
      &#8593;
    </button>
    </div>
  )
}

export default ReturnToTop

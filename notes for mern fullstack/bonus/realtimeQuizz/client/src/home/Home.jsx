import React from 'react'
import ShowQuiz from '../categories/ShowQuiz'
import '../styles/CommonStyles.css'
import logo from '../assets/logo.png'

const Home = ({ quizzes }) => {
  const slicedQuizzes = quizzes.slice(0, 3)
  
  return (
    <>
    <div className='main-body flex-wrap'>
      <div>
        <h1 className='d-flex justify-content-center'>The Quiz App</h1>
        <div className="d-flex justify-content-center">
           <img src={logo} alt="Logo" width="200" height="200" />
        </div>

        <h2>Test your knowledge and have fun!</h2>
        <br />
        <h4 className='d-flex justify-content-center'>Featured Quizzes</h4>
      </div>
        <ul className='d-flex justify-content-center flex-wrap '> 
          {slicedQuizzes.length === 0 ? 'Loading...' : slicedQuizzes.map((quiz, index) => (              
              <div key={index} className="card m-3" style={{width: "15rem"}}>
                <ShowQuiz quiz={quiz}/>
              </div>
          ))}
        </ul>
     </div>   
    </>
  )
}

export default Home
import React, { useEffect, useState } from "react";
import RandomQuiz from "./RandomQuiz";
import ShowQuiz from "./ShowQuiz";
import ReturnToTop from "../UI/ReturnToTop";
import "../styles/CommonStyles.css";

const Quizzes = ({ quizzes, setQuizzes, questions }) => {
  useEffect(() => {
    async function getQuizzes() {
      const res = await fetch('https://quiz-app-server-production-09e8.up.railway.app/quizzes')
      const data = await res.json()
      setQuizzes(data)
    }
    getQuizzes()
  }, [questions])

  return (
    <>
      <div className="main-body flex-wrap">
        <h1>All Quizzes</h1>
          <ul className="d-flex justify-content-center flex-wrap ">
            {isNaN(quizzes) ? quizzes.map((quiz, index) => (
                <div key={index} data-testid='quiz' className="card m-3" style={{ width: "15rem" }} >
                  <ShowQuiz quiz={quiz} />
                </div>
              )) : 'Loading...' 
            }
          </ul>
        <RandomQuiz quizzes={quizzes} />
        <div>
          <ReturnToTop />
        </div>
      </div>
    </>
  )
}

export default Quizzes
import React from "react";
import { Link } from "react-router-dom";

const RandomQuiz = ({ quizzes }) => {
  // function to get a random quiz from the quizzes array
  function randomQuiz(array) {
     if(array !== undefined) {
    const index = Math.floor(Math.random() * array.length); //generate a random index
    return array[index];
     }
  }

  const quiz = randomQuiz(quizzes);

  return (
    <>
      <div className=" flex-wrap">
        {quiz ? (
          <>
            <p className="d-flex justify-content-center text-dark fw-bold">
              Can't choose?
            </p>
            <button>
              <Link
                to={`/quizzes/${quiz._id}`}
                className="d-flex justify-content-center fw-normal"
              >
                Random Quiz
              </Link>
            </button>
          </>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default RandomQuiz;

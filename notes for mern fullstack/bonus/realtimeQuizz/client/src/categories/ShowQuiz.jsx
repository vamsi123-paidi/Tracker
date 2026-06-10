import React from "react";
import { Link } from "react-router-dom";

const ShowQuiz = ({ quiz }) => {
  return (
    <>
      <div className="d-flex justify-content-center flex-wrap ">
        <img
          src={quiz.image}
          alt="Alt text for quiz image"
          className="img-fixed-size"
          style={{ width: "15rem", height: "15rem" }}
        />
        <Link
          to={`/quizzes/${quiz._id}`}
          className="card m-3 align-items-center text-dark fw-bold"
          style={{ width: "15rem" }}
        >
          {quiz.title}
        </Link>
        <div className="card m-3" style={{ width: "15rem" }}>
          <div className="fw-bold">Author:</div>
          <div>{quiz.author}</div>
          <div className="fw-bold">Number of Questions:</div>
          {quiz.questions.length === 0 ? (
            "0 questions"
          ) : (
            <div>{quiz.questions.length} questions</div>
          )}
        </div>
      </div>
    </>
  );
};
export default ShowQuiz;

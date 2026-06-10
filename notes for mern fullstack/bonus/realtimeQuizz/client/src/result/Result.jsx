import React, { useEffect, useState } from 'react'
import '../styles/CommonStyles.css'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { Link } from 'react-router-dom'
import ReturnToTop from '../UI/ReturnToTop'

function HighScorePopup(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          You got every answer correct!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>&#127881;</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

const Result = ({ answers, quiz }) => {
  const [showPopup, setShowPopup] = useState(false)

  let points = 0

  function calculatePoints(answers, quiz) {
    for (let i = 0;i < answers.length;i++) {
      if (answers[i] === quiz.questions[i].correctAnswer) {
        points = points + 1
      }
    }
  }

  calculatePoints(answers, quiz)

  useEffect(() => {
    if (points === answers.length) {
      setShowPopup(true)
    }
  }, [])

  return (
    <>
      <div>
        <HighScorePopup
          show={showPopup}
          value={false}
          onHide={(e) => setShowPopup(e.target.value)}
        />
      </div>
      <div className='main-body'>
        <h1>Result!</h1>
        <h2>{points} / {quiz.questions.length}</h2>
        <br />
        <img src={quiz.image} height={200} width={200} style={{ padding: 5 }} />
        <h4>Review Answers</h4>
        {quiz.questions.map((question, index) => 
        (
          <>
            <div className="card" style={{ width: '18rem' }} key={index}>
            <div className="card-header">
              {question.question}
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item bg-success">{ question.correctAnswer }</li>
              {question.incorrectAnswers.map((incorrectAnswer, index2) => 
                incorrectAnswer === answers[index] ? <li className="list-group-item bg-danger" key={index2}> {incorrectAnswer} </li> :
                <li className="list-group-item" key={index2}>{ incorrectAnswer }</li>
              )}
            </ul>
            </div>
            <br />
          </>
        ))}
        <br />
        <button className="d-flex justify-content-between fw-normal">
            <Link to={'/quizzes'}>Take another quiz</Link>
        </button>
        <br />
      </div>
      <div>
        <ReturnToTop />
      </div>
    </>

  )
}

export default Result
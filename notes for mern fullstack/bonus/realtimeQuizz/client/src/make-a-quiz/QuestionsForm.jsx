import React, { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import '../styles/CommonStyles.css'

const QuestionsForm = ({ questions, setQuestions }) => {
  const { quizId } = useParams()
  
  const [question, setQuestion] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [incorrectAnswers, setIncorrectAnswers] = useState([])
  const [incorrectAns1, setIncorrectAns1] = useState('')
  const [incorrectAns2, setIncorrectAns2] = useState('')
  const [incorrectAns3, setIncorrectAns3] = useState('')
  const [lastQuestion, setLastQuestion] = useState(false)

  const nav = useNavigate()

  //validation incorrect answers
  function validate() {
    if (incorrectAns1 !== '' && incorrectAns2 !== '' && incorrectAns3 !== '') {
        return true
    } else {
      return false
    } 
  }
  // Function to put incorrect answers into array and set quizId from URL
  function getParams(e) {
    e.preventDefault()
    if (validate()) {
      setIncorrectAnswers(
        incorrectAnswers.push(incorrectAns1, incorrectAns2, incorrectAns3))
      addQuestion(quizId, question, correctAnswer, incorrectAnswers)
      if (lastQuestion) {
        nav('/quizzes')
      } else {
        alert('Question added successfully!')
      }
    } else {
      alert('Please provide all required information.')
    }
    
  }

  // Function to reset the state of the form after submitting a question
  function resetForm() {
    setQuestion('')
    setCorrectAnswer('')
    setIncorrectAnswers([])
    setIncorrectAns1('')
    setIncorrectAns2('')
    setIncorrectAns3('')
  }

  // Function to post a new question to the DB
  const addQuestion = async (
    quizId,
    question,
    correctAnswer,
    incorrectAnswers
  ) => {
    // Add a new question
    const newQuestion = {
      quizId: quizId,
      question: question,
      correctAnswer: correctAnswer,
      incorrectAnswers: incorrectAnswers,
    }
    // Post new question to API
    const res = await fetch('https://quiz-app-server-production-09e8.up.railway.app/questions', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newQuestion)
    })
    
    //handle validation error
    if (res.status === 400) {
      alert('Please provide all required information.')
    } else if (res.status === 409) {
      alert('Question already exists in the same quiz. Please provide another question.')
    }  else {
      const data = await res.json()
    // Make sure questions state is updated
      setQuestions([...questions, data])
      resetForm()
    }
  }

  //handle quit
  async function handleQuit() {
    //deletes the quiz from db
    await fetch(`https://quiz-app-server-production-09e8.up.railway.app/quizzes/${quizId}`, {
      method: 'DELETE',
    })
    nav('/quizzes')
  }

  return (
    <>
      <div className='main-body flex-wrap' style={{ height: '100vh' }}>
        <h2>Add questions to your new Quiz</h2>
        <p>
          You can always quit and do this later from the Edit a Quiz page, your
          quiz has been saved.
        </p>
        <form onSubmit={getParams} className='d-flex flex-column flex-wrap' style={{width:'400px'}}>
          <div className='question-form d-flex flex-column'>
            <label>Question:</label>
            <input
              type='text'
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder='Type question here..'
              aria-label='Type Question Here'
            />
          </div>
          <div className='correct-answer-form  d-flex flex-column'>
            <label>Correct answer:</label>
            <input
              type='text'
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder='Correct answer is..'
              aria-label='Type Question Here'
            />
          </div>
          <div className='incorrect-answers-form d-flex flex-column'>
            <label>Incorrect answers:</label>
            <input
              type='text'
              value={incorrectAns1}
              onChange={(e) => setIncorrectAns1(e.target.value)}
              placeholder='Incorrect answer 1'
              aria-label='Incorrect Answer 1'
            />

            <input
              type='text'
              value={incorrectAns2}
              onChange={(e) => setIncorrectAns2(e.target.value)}
              placeholder='Incorrect answer 2'
              aria-label='Incorrect Answer 2'
            />
            <input
              type='text'
              value={incorrectAns3}
              onChange={(e) => setIncorrectAns3(e.target.value)}
              placeholder='Incorrect answer 3'
              aria-label='Incorrect Answer 3'
            />
          </div>
          <br/>
          <div className='d-flex justify-content-between'>
            <button
              onClick={() => setLastQuestion(lastQuestion)}
              type='submit'
              name='add-question'
              className='fw-normal'
            >
              Add new question
            </button>
            <button
              onClick={() => setLastQuestion(true)}
              type='submit'
              name='submit-form'
              className='fw-normal'
            >
              Save and publish
            </button>
          </div>
        </form>
        <button  className='d-flex justify-content-center fw-normal' 
          onClick={ handleQuit }> Quit </button>
      </div>
    </>
  )
}

export default QuestionsForm

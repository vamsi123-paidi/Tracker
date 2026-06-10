import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/CommonStyles.css"

const EditQuestions = ({ quiz, questions, setQuestions }) => {
  const [index, setIndex] = useState(0);
  const nav = useNavigate();

  // const questionObject = quiz.questions[index]
  
  const [questionObject, setQuestionObject] = useState(quiz.questions[index])
  const [question, setQuestion] = useState(questionObject.question)
  const [confirm, setConfirm] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState(questionObject.correctAnswer)
  const [incAnswersNew, setIncAnswersNew] = useState([])
  const [incorrectAnswer1, setIncorrectAnswer1] = useState(questionObject.incorrectAnswers[0])
  const [incorrectAnswer2, setIncorrectAnswer2] = useState(questionObject.incorrectAnswers[1])
  const [incorrectAnswer3, setIncorrectAnswer3] = useState(questionObject.incorrectAnswers[2])
  const [newQuestion, setNewQuestion] = useState(false)


  // this function creates a new question object and put it to the server API
  async function updateQuestion() {
    // creates a new question object to send back to server
    const updatedQuestion = {
      question: question, 
      correctAnswer: correctAnswer,
      incorrectAnswers: [incorrectAnswer1, incorrectAnswer2, incorrectAnswer3]
    }
    // fetch to API
    const res = await fetch(`https://quiz-app-server-production-09e8.up.railway.app/questions/${questionObject._id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedQuestion)
    })
  }

  // updates index when user click next
  function handleClickSaveNext(event) {
    event.preventDefault()
    setIndex(index+1)
    setQuestionObject(quiz.questions[index+1])
    setQuestion(quiz.questions[index+1].question)
    setCorrectAnswer(quiz.questions[index+1].correctAnswer)
    setIncorrectAnswer1(quiz.questions[index+1].incorrectAnswers[0])
    setIncorrectAnswer2(quiz.questions[index+1].incorrectAnswers[1])
    setIncorrectAnswer3(quiz.questions[index+1].incorrectAnswers[2])
    updateQuestion()
  }

  // updates index when user click next
  function handleClickSave(event) {
    event.preventDefault()
    updateQuestion()
  }

  // handle update question
  function handleSubmit(event) {
    event.preventDefault()
    updateQuestion()
    nav('/quizzes')
  }

  // updates index when user click next
  function handleSaveQuestion(event) {
    event.preventDefault()
    addQuestion()
    setNewQuestion(false)
  }

  // handle click delete
  function handleClickDelete(event) {
    event.preventDefault()
    setConfirm(true)
    setIndex(index+1)
  }

   // Function to reset the state of the form after deleting the last question
   function resetForm() {
    // need to set up this way, not hard setQuestion, etc because they won't be populated in the form
    const blankQuestion = {
      question: '',
      correctAnswer: '',
      incorrectAnswers: ['', '', '']
    }
    setQuestionObject(blankQuestion)
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
    await fetch(
      "https://quiz-app-server-production-09e8.up.railway.app/questions",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newQuestion),
      }
    )
    // console.log(createdQuestion)
    // const data = await createdQuestion.json()
    // const updatedQuestions = questions.push(data)
    // setQuestions(updatedQuestions)
    // console.log(updatedQuestions)
  };

  // handle add a new question
  function handleAddQuestion(event) {
    event.preventDefault()
    resetForm()
    setIndex(index + 1) //need this to update the form 
    setNewQuestion(true)
  }

  // handles confirming deletion of a question
  const handleConfirmDelete = async (event) => {
    event.preventDefault()
    if (quiz.questions.length === 1) {
      alert('Cannot delete this question. Quiz is required to have at least one question.')
    } else {
      try {
        await fetch(`https://quiz-app-server-production-09e8.up.railway.app/questions/${questionObject._id}`, {
            method: "DELETE"
        })
        setIndex(index+1)
        setConfirm(false)
      } catch (error) {
        console.log(error)
      }
      // index === quiz.questions.length-1 ? resetForm() : setIndex(index+1) 
      // checks if the question is the last before moving to next question. 
      if (index !== quiz.questions.length-1) {
        setIndex(index+1)
        setQuestionObject(quiz.questions[index+1])
      } else {
        resetForm() //if last question, only reset form
      }
      setConfirm(false)
    }
  }

  // handles click on delete a question
  const confirmForm = () => {
    return (
      <>
        <p> Do you want to delete this question? </p>
        <button onClick={handleConfirmDelete}> Confirm </button>
        <button onClick={ () => setConfirm(false) }> Cancel </button>
        <br />
      </>
    );
  };

  // add new question after typing all the info
  const handleConfirmAdd = async (event) => {
    event.preventDefault();

    const newQuestion = {
      quizId: quiz._id,
      question: question,
      correctAnswer: correctAnswer,
      incorrectAnswers: [incorrectAnswer1, incorrectAnswer2, incorrectAnswer3],
    };
    // Post new question to API

    const res = await fetch('https://quiz-app-server-production-09e8.up.railway.app/questions', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newQuestion)
    })
    const data = await res.json()
    setNewQuestion(false)
    setQuestionObject(newQuestion)
    quiz.questions.push(data)
    setQuestions([...questions, data])
    alert('Question added successfully')
  } 

  return (
    <>
      <div className="main-body flex-wrap" style={{ height: "100vh" }}>
        <h2>Edit {quiz.title}</h2>
        <form
          className="container d-flex flex-column flex-wrap"
          key={index}
          style={{ width: "400px" }}
        >
          <div className="question-form d-flex flex-column">
            <label> Question </label>
            <input
              type="text"
              defaultValue={questionObject.question}
              // value={questionObject.question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div className="correct-answer-form d-flex flex-column">
            <label>Correct answer:</label>
            <input
              type="text"
              defaultValue={questionObject.correctAnswer}
              // value={questionObject.correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
            />
          </div>
          <div className="incorrect-answers-form d-flex flex-column">
            <label>Incorrect answers:</label>
            <input
              type='text'
              defaultValue={questionObject.incorrectAnswers[0]}
              // value={questionObject.incorrectAnswers[2]}
              onChange={(e) => setIncorrectAnswer1(e.target.value)} 
              />
            <input
              type='text'
              defaultValue={questionObject.incorrectAnswers[1]}
              // value={questionObject.incorrectAnswers[2]}
              onChange={(e) => setIncorrectAnswer2(e.target.value)} 
              />
            <input
              type='text'
              defaultValue={questionObject.incorrectAnswers[2]}
              // value={questionObject.incorrectAnswers[2]}
              onChange={(e) => setIncorrectAnswer3(e.target.value)} 
              />
          </div> 
        </form>
        { confirm && confirmForm() }  
        <br/> 
        <div className="d-flex justify-content-between">
        { newQuestion && <button onClick={ handleConfirmAdd }> Save Question </button> } 
        { (!confirm && !newQuestion) && <button onClick={ handleClickDelete }> Delete this question </button> }  
        { (index === quiz.questions.length-1 && !confirm) &&  <button onClick={ handleAddQuestion }> Add a new question </button>}
        </div>
        <br/>
        { index === quiz.questions.length-1 && <button onClick={handleSubmit}> Submit </button> }
        <br/>
        <div className="d-flex justify-content-between">
        <button onClick={() => nav('/edit-a-quiz')}>Quit</button> 
        { (index < quiz.questions.length-1 && !confirm) && <button onClick={ handleClickSaveNext }> Save & Next </button> }
        { (index === quiz.questions.length-1 && !confirm) && <button onClick={ handleClickSave }> Save </button> }
        </div> 
        
      </div>

    </>
  )
}

export default EditQuestions

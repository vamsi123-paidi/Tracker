import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useParams, useNavigate, redirect } from 'react-router-dom'
import Home from './home/Home'
import NavBar from './home/NavBar'
import Footer from './home/Footer'
import Categories from './categories/Categories'
import Leaderboard from './leaderboard/Leaderboard'
import LogIn from './login/LogIn'
import QuizForm from './make-a-quiz/QuizForm'
import Profile from './profile/Profile'
import Quizzes from './categories/Quizzes'
import CategoryQuizzes from './categories/CategoryQuizzes'
import EditQuizzes from './edit-a-quiz/EditQuizzes'
import Result from './result/Result'
// import ShowQuestion from './take-a-quiz/ShowQuestion'
import TakeAQuiz from './take-a-quiz/TakeAQuiz'
import QuestionsForm from './make-a-quiz/QuestionsForm'
import EditQuestions from './edit-a-quiz/EditQuestions'
import EditAQuiz from './edit-a-quiz/EditAQuiz'
import CategoryForm from './make-a-quiz/CategoryForm'

const App = () => {
  const [categories, setCategories] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [questions, setQuestions] = useState('')
  const nav = useNavigate()

  useEffect(() => {
    async function getCategories() {
      const res = await fetch('https://quiz-app-server-production-09e8.up.railway.app/categories')
      const data = await res.json()
      setCategories(data)
    }
    getCategories()
  }, [])

  useEffect(() => {
    async function getQuizzes() {
      const res = await fetch('https://quiz-app-server-production-09e8.up.railway.app/quizzes')
      const data = await res.json()
      setQuizzes(data)
    }
    getQuizzes()
  }, [])

  useEffect(() => {
    async function getQuestions() {
      const res = await fetch('https://quiz-app-server-production-09e8.up.railway.app/questions')
      const data = await res.json()
      setQuestions(data)
    }
    getQuestions()
  }, [])

  const [answers, setAnswers] = useState([])

  
  //this function gets points sent from TakeAQuiz component (child to parent)
  function getAnswers(data) {
    setAnswers(data)
    console.log(data)
    // nav(`/result/${quizId}`)
  }
  
  // HOC for ShowQuestion to access quizId in the URL and to fetch a quiz
  const TakeAQuizWrapper = () => {
    const { quizId } = useParams()
    const [quiz, setQuiz] = useState('')

    useEffect(() => {
      async function getQuiz() {
        const res = await fetch(`https://quiz-app-server-production-09e8.up.railway.app/quizzes/${quizId}`)
        const data = await res.json()
        setQuiz(data)
      }
      getQuiz()
    }, [quizId])

    return quiz ? <TakeAQuiz quiz={quiz} onChange={getAnswers} /> : 'Loading...'
  }

  // HOC for EditAQuiz to access quizId in the URL
  const EditAQuizWrapper = () => {
    const { quizId } = useParams()
    const [quiz, setQuiz] = useState('')
    
    useEffect(() => {
      async function getQuiz() {
        const res = await fetch(`https://quiz-app-server-production-09e8.up.railway.app/quizzes/${quizId}`)
        const data = await res.json()
        setQuiz(data)
      }
      getQuiz()
    }, [quizId])

    return quiz ? <EditAQuiz quiz={quiz} /> : <h4>Loading... </h4>
  }

  // HOC for Result to access quizId in the URL
  const ResultWrapper = () => {
    const { quizId } = useParams()
    const [quiz, setQuiz] = useState('')
    
    useEffect(() => {
      async function getQuiz() {
        const res = await fetch(`https://quiz-app-server-production-09e8.up.railway.app/quizzes/${quizId}`)
        const data = await res.json()
        setQuiz(data)
      }
      getQuiz()
    }, [quizId])

    return quiz ? <Result quiz={quiz} answers={answers} /> : <h4>Loading... </h4>
  }

  const EditQuestionWrapper = () => {
    const { quizId } = useParams()
    const [quiz, setQuiz] = useState('')
    
    useEffect(() => {
      async function getQuiz() {
        const res = await fetch(`https://quiz-app-server-production-09e8.up.railway.app/quizzes/${quizId}`)
        const data = await res.json()
        setQuiz(data)
      }
      getQuiz()
    }, [quizId])

    return quiz ? <EditQuestions quiz={quiz} questions={questions} setQuestions={setQuestions} /> : <h4>Loading... </h4>
  }
  
  // HOC for QuestionsForm to access quizTitle in the URL
  // const AddQuestionWrapper = () => {
  //   const { quizId } = useParams()
    
  //   // get quiz ObjectId from quizTitle
  //   const quiz = quizzes.find(quiz => quiz._id === quizId)
  //   return quiz ? <QuestionsForm addQuestion={addQuestion} quiz={quiz} questions={questions} quizzes={quizzes}/> : <h4>Loading... </h4>
  // }

  return (
    <>
      <NavBar />
        <Routes>
          <Route path='/' element={<Home quizzes={quizzes}/>} />
          <Route path='/quizzes' element={<Quizzes quizzes={quizzes} questions={questions} setQuizzes={setQuizzes} setQuestions={setQuestions} />} />
          <Route path='/categories' element={<Categories categories={categories}/>} />
          <Route path='/categories/:categoryName' element={<CategoryQuizzes categories={categories} quizzes={quizzes}/>} />
          <Route path='/quizzes/:quizId' element={<TakeAQuizWrapper />} />
          <Route path='/make-a-quiz' element={<QuizForm quizzes={quizzes} categories={categories} setQuizzes={setQuizzes} />} />
          <Route path='/edit-a-quiz' element={<EditQuizzes quizzes={quizzes} />} />
          <Route path='/edit-a-quiz/:quizId' element={<EditAQuiz categories={categories} />} />
          <Route path='/edit-a-quiz/:quizId/questions' element={<EditQuestionWrapper />} />
          {/* <Route path='/edit-a-quiz/:quizId/questions' element={<EditQuestions />} /> */}
          <Route path='/add-a-category' element={<CategoryForm categories={categories} setCategories={setCategories} />} />
          <Route path='/add-questions/:quizId' element={<QuestionsForm questions={questions} quizzes={quizzes} setQuestions={setQuestions} />} />
          <Route path='/leaderboard' element={<Leaderboard />} />
          <Route path='/log-in' element={<LogIn />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/result/:quizId' element={<ResultWrapper />} />
          <Route path='*' element={<h4>Page not found</h4>} />
        </Routes>
      <Footer />
    </>
  )
}

export default App
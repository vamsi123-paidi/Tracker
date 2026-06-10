import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from "react-router-dom"
import { expect } from 'vitest'
import EditQuizzes, { DeleteConfirmation } from '../edit-a-quiz/EditQuizzes'

describe('Edit a Quiz component', () => {
	let container

	// Fake data for testing
	const quizzes = [
		{ category: 'Science', title: 'Random Facts', author: 'Quiz App Staff', questions: [], image: '/question-mark.png' },
		{ category: 'TV & Movies', title: 'Movie Trivia', author: 'Quiz App Staff', questions: [], image: '/movies.png' },
		{ category: 'Geography', title: 'Geography Master', author: 'Quiz App Staff', questions: [], image: '/geography.png' }
	]

	// Functions
	const handleDeleteQuiz = async (id) => {
    try {
      const res = await fetch(
        `https://quiz-app-server-production-09e8.up.railway.app/quizzes/${id}`,
        {
          method: "DELETE",
        }
      )
    } catch (error) {
      console.error(error)
    }
  }

	const handleConfirmDelete = () => {
    handleDeleteQuiz(selectedQuiz._id)
    alert("Quiz deleted successfully")
    setSelectedQuiz(null)
    refreshPage()
  }

	function refreshPage() {
    window.location.reload(false)
  }

	const handleConfirmEdit = () => {
    console.log("calling edit quiz :", selectedQuizEdit._id)
    nav(`/edit-a-quiz/${selectedQuizEdit._id}`)
  }

	// Setup
	beforeEach(function () {
		container = render(
			<BrowserRouter>
				<EditQuizzes quizzes={quizzes}/>
			</BrowserRouter>
		).container
	})

	it('Should display edit quizzes heading', () => {   
    expect(container.querySelector('h1')).toBeDefined()
		expect(screen.findByText('Choose a Quiz to edit or delete')).toBeInTheDocument
  })

	it('Should render buttons', () => {
		expect(container.querySelectorAll('button')).toBeDefined()
		const btn = container.querySelectorAll('button')
		expect(btn[0]).toHaveTextContent('Edit')
		expect(btn[1]).toHaveTextContent('Delete')
	})

	it('Should find text content within all mapped quizzes'), () => {
		const quizId = screen.getAllByTestId('edit-quiz') 
		expect(quizId).toHaveLength(3)
		expect(quizId[0]).toHaveTextContent('Random Facts')
		expect(quizId[1]).toHaveTextContent('Movie Trivia')
		expect(quizId[2]).toHaveTextContent('Geography Master')
	}

	it('Checks functions are functions', () => {
		expect(handleDeleteQuiz).toBeTypeOf('function')
		expect(handleConfirmDelete).toBeTypeOf('function')
		expect(refreshPage).toBeTypeOf('function')
		expect(handleConfirmEdit).toBeTypeOf('function')
	})
})
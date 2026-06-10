import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from "react-router-dom"
import { expect } from 'vitest'
import Quizzes from '../categories/Quizzes'

describe('Categories component', () => {
	let container
	
	// Provide fake quizzes to use in tests
	const quizzes = [
			{ category: 'Science', title: 'Random Facts', author: 'Quiz App Staff', questions: [], image: '/question-mark.png' },
			{ category: 'TV & Movies', title: 'Movie Trivia', author: 'Quiz App Staff', questions: [], image: '/movies.png' },
			{ category: 'Geography', title: 'Geography Master', author: 'Quiz App Staff', questions: [], image: '/geography.png' }
    ]

	// Setup
	beforeEach(function () {
		container = render(
			<BrowserRouter>
				<Quizzes quizzes={quizzes}/>
			</BrowserRouter>
		).container
	})

	it('Should display quizzes heading', () => {
		expect(container.querySelector('h1')).toBeDefined()
    expect(container.querySelector('h1')).toHaveTextContent('All Quizzes')
	})

	it('Should find text content within all mapped quizzes', () => {
		const quizId = screen.getAllByTestId('quiz') 
		expect(quizId).toHaveLength(3)
		expect(quizId[0]).toHaveTextContent('Random Facts')
		expect(quizId[1]).toHaveTextContent('Movie Trivia')
		expect(quizId[2]).toHaveTextContent('Geography Master')
	})

	it('Should find that Random Quiz is rendered on the screen', async () => {
		await userEvent.click(screen.getByText('Random Quiz'))
		expect(screen.findByText('Random Quiz')).toBeInTheDocument
	})
})
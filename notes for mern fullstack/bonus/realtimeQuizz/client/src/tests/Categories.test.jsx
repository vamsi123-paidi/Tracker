import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react"
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from "react-router-dom"
import { expect } from 'vitest'
import Categories from '../categories/Categories'

describe('Categories component', () => {
	let container

	// Provide fake categories to use in tests
	const categories = [
    { name: 'Science' },
    { name: 'TV & Movies' },
    { name: 'Geography' },
	]

	// Setup
	beforeEach(function () {
		container = render(
			<BrowserRouter>
				<Categories categories={categories}/>
			</BrowserRouter>
		).container
	})

	it('Should display categories heading', () => {
		expect(container.querySelector('h1')).toBeDefined()
    expect(container.querySelector('h1')).toHaveTextContent('Categories')
	})

	it('Should find text content within all mapped categories', () => {
		const cats = screen.getAllByTestId('cat') 
		expect(cats).toHaveLength(3)
		expect(cats[0]).toHaveTextContent('Science')
		expect(cats[1]).toHaveTextContent('TV & Movies')
		expect(cats[2]).toHaveTextContent('Geography')
	})

	it('Should find that Random Category is rendered on the screen', async () => {
		await userEvent.click(screen.getByText('Random Category'))
		expect(screen.findByText('Random Category')).toBeInTheDocument
	})
})

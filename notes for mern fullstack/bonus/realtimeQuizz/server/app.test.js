import app from './app.js'
import request from 'supertest'

describe('App tests', () => {

  // test home page
  test('Get home page', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/json/i)
    expect(res.body.title).toBeDefined()
    expect(res.body.title).toBe('Quiz App')
  })
})

describe('Integration test', () => {

  // creates a new category, then add a quiz to it, then add a question to the quiz
  describe('create a new category', () =>{
    it('should create a new category', async () => { 
      const newCategoryName = 'J. Testing'
      const res = await request(app).post('/categories').send({
        name: newCategoryName
      })

      expect(res.status).toBe(201)
  })
  })

  describe('create a quiz using the new category', () =>{
    it('should create a new quiz', async () => {
      const cats = await request(app).get('/categories')
      const newQuizTitle = 'Jest Testing Quiz'
      const res = await request(app).post('/quizzes').send({
        category: 'J. Testing',
        title: newQuizTitle,
        author: 'Dev Team',
        image: 'http://placekitten.com/200/300'
      })

      expect(res.status).toBe(201)
    })
  })

  describe('add a question to the new quiz', () =>{
    it('should create a new question', async () => {
      const quizzes = await request(app).get('/quizzes')
      const res = await request(app).post('/questions').send({
        quizId: quizzes.body[6]._id,
        question: "What is 2 + 2?",
        correctAnswer: "4", 
        incorrectAnswers: ["6", "12", "8"]
      })

      expect(res.status).toBe(201)
    })
  })

})
import app from '../app.js'
import request from 'supertest'

// testing questions route
describe('Test questions route', () => {
  describe('Test getting all questions', () => {
    let res 

    // common exertions for all tests
    beforeEach(async () => {
      res = await request(app).get('/questions')
      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toMatch(/json/i)
    })

    it('should return an array of 16 elements', () => {
      expect(res.body).toBeInstanceOf(Array)
      expect(res.body.length).toBe(16)
    })
  })
    
  describe('Test posting a question', () => {
    it('should create a new question', async () => {
      const quizzes = await request(app).get('/quizzes')
      const res = await request(app).post('/questions').send({
        quizId: quizzes.body[0]._id,
        question: "What is 2 + 2?",
        correctAnswer: "4", 
        incorrectAnswers: ["6", "12", "8"]
      })

      expect(res.status).toBe(201)
      expect(res.headers['content-type']).toMatch(/json/i)
      expect(res.body._id).toBeDefined()
      expect(res.body.quizId).toBeDefined()
      expect(res.body.question).toBeDefined()
      expect(res.body.correctAnswer).toBeDefined()
      expect(res.body.incorrectAnswers).toBeDefined()
      expect(res.body._id.length).toBe(24)
      expect(res.body.quizId).toBe(quizzes.body[0]._id)
      expect(res.body.question).toBe("What is 2 + 2?")
      expect(res.body.correctAnswer).toBe("4")
      expect(res.body.incorrectAnswers[0]).toBe("6")
      expect(res.body.incorrectAnswers[1]).toBe("12")
      expect(res.body.incorrectAnswers[2]).toBe("8")
    })

    it('should send 409 status when posting a duplicated title with the same quizId', async () => {
      const quizzes = await request(app).get('/quizzes')
      const res = await request(app).post('/questions').send({
        quizId: quizzes.body[0]._id,
        question: "What is 2 + 2?",
        correctAnswer: "4", 
        incorrectAnswers: ["6", "12", "8"]
      })

      expect(res.status).toBe(409)
    })
  })

  describe('Deleting a question', () => {
    it('should response with 204 status and remove the question', async () => {
      const questions = await request(app).get('/questions')
      const res = await request(app).delete(`/questions/${questions.body[0]._id}`)
      
      expect(res.status).toBe(204)
      const updatedquestions = await request(app).get('/questions')
      // updated category should have one item less than the original category list
      expect(updatedquestions.body.length).toBe(questions.body.length-1)
    })
  })

  describe('Editing a question', () => {
    it('should update the chosen question', async () => {
      const questions = await request(app).get('/questions')
      const questionId = questions.body[0]._id
      const res = await request(app).put(`/questions/${questionId}`).send({
        question: 'Jest Testing is ...?',
        correctAnswer: 'All of the options are correct', 
        incorrectAnswers: ['Amazing', 'Great', 'Fantastic']
      })
      expect(res.status).toBe(200)

      const updatedquestions= await request(app).get('/questions')
      expect(updatedquestions.body[0].question).toBe('Jest Testing is ...?')
      expect(updatedquestions.body[0].correctAnswer).toBe('All of the options are correct')
      expect(updatedquestions.body[0].incorrectAnswers[0]).toBe('Amazing')
      expect(updatedquestions.body[0].incorrectAnswers[1]).toBe('Great')
      expect(updatedquestions.body[0].incorrectAnswers[2]).toBe('Fantastic')
    })
  })
})
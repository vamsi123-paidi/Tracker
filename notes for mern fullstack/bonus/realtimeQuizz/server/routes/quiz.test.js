import app from '../app.js'
import request from 'supertest'

// testing quizzes route
describe('Test quizzes route', () => {
  describe('Test getting all quizzes', () => {
    let res 

    // common exertions for all tests
    beforeEach(async () => {
      res = await request(app).get('/quizzes')
      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toMatch(/json/i)
    })

    it('should return an array of 6 elements', () => {
      expect(res.body).toBeInstanceOf(Array)
      expect(res.body.length).toBe(6)
    })
  })
    
  describe('Test posting a quiz', () => {
    it('should create a new quiz', async () => {
      const cats = await request(app).get('/categories')
      const newQuizTitle = 'Jest Testing'
      const res = await request(app).post('/quizzes').send({
        category: 'Geography',
        title: newQuizTitle,
        author: 'Dev Team',
        image: 'http://placekitten.com/200/300'
      })

      expect(res.status).toBe(201)
      expect(res.headers['content-type']).toMatch(/json/i)
      expect(res.body._id).toBeDefined()
      expect(res.body.category).toBeDefined()
      expect(res.body.title).toBeDefined()
      expect(res.body.author).toBeDefined()
      expect(res.body.image).toBeDefined()
      expect(res.body._id.length).toBe(24)
      expect(res.body.category).toBe(cats.body[2]._id)
      expect(res.body.title).toBe(newQuizTitle)
      expect(res.body.author).toBe('Dev Team')
      expect(res.body.image).toBe('http://placekitten.com/200/300')
    })

    it('should not create a quiz with duplicated title', async () => {
      const newQuiz = await request(app).post('/quizzes').send({
        category: 'Geography',
        title: 'Jest Testing',
        author: 'Dev Team',
        image: 'http://placekitten.com/200/300'
      })

      const res = await request(app).post('/quizzes').send({
        category: 'Geography',
        title: 'Jest Testing',
        author: 'Dev Team',
        image: 'http://placekitten.com/200/300'
      })

      expect(res.status).toBe(409)
    })
  })

  describe('Deleting a quiz', () => {
    it('should response with 204 status and remove the quiz', async () => {
      const quizzes = await request(app).get('/quizzes')
      const res = await request(app).delete(`/quizzes/${quizzes.body[0]._id}`)
      
      expect(res.status).toBe(204)
      const updatedQuizzes = await request(app).get('/quizzes')
      // updated category should have one item less than the original category list
      expect(updatedQuizzes.body.length).toBe(quizzes.body.length-1)
    })
  })

  describe('Editing a quiz', () => {
    it('should update the chosen quiz', async () => {
      const quizzes = await request(app).get('/quizzes')
      const quizId = quizzes.body[0]._id
      console.log(quizId)
      const updatedQuiz = {
        title: 'New Quiz',
        author: 'Dev Team'
      }
      const res = await request(app).put(`/quizzes/${quizId}`).send(updatedQuiz)
      expect(res.status).toBe(200)
      console.log(res.body)
      const updatedQuizzes= await request(app).get('/quizzes')
      expect(updatedQuizzes.body[0].title).toBe('New Quiz')
      expect(updatedQuizzes.body[0].author).toBe('Dev Team')
    })
  })
})
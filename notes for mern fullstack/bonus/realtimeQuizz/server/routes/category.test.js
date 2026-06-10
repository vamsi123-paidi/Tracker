import app from '../app.js'
import request from 'supertest'
// import { dbClose, dbConnect } from '../db'

// const DATABASE_URI = 'mongodb://localhost:27017/'
// beforeEach(async () => {
//   await dbConnect(DATABASE_URI)
// })

// afterEach(async () => {
//   await dbClose()
// })

//Categories
describe('Test categories route', () => {
  let res

  describe('Getting categories list', () => {
    
    // common exertions for all tests
    beforeEach(async () => {
      res = await request(app).get('/categories')
      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toMatch(/json/i)
    })

    it('Should return an array of 3 elements', () => {
      expect(res.body).toBeInstanceOf(Array)
      expect(res.body.length).toBe(3)
    })

    it('Has elements with the correct data structure', () => {
      
      // each element to have an id of 24 characters, and a name property
      res.body.forEach(el => {
        expect(el._id).toBeDefined()
        expect(el._id.length).toBe(24)
        expect(el.name).toBeDefined()
      })

      // the first element's name is Science
      expect(res.body[0].name).toBe('Science')
      expect(res.body[1].name).toBe('TV & Movies')
      expect(res.body[2].name).toBe('Geography')
      })
    })

  // creating new category
  describe('Creating a new category', () => {
    
    it('should create a new category', async () => { 
      const newCategoryName = 'J. Testing'
      const res = await request(app).post('/categories').send({
        name: newCategoryName
      })

      expect(res.status).toBe(201)
      expect(res.headers['content-type']).toMatch(/json/i)
      expect(res.body._id).toBeDefined()
      expect(res.body.name).toBeDefined()
      expect(res.body._id.length).toBe(24)
      expect(res.body.name).toBe(newCategoryName)
    })
  
    it('should send 409 error when createing a new category with duplicated names', 
      async () => {
        const newCategoryName = 'J. Testing'
        const res = await request(app).post('/categories').send({
          name: newCategoryName
      })

      expect(res.status).toBe(409) // expect 409 status
    })
    })

  describe('Deleting a category', () => {
    
    it('should response with 204 status and remove the category', async () => {
      const cats = await request(app).get('/categories')
      const catsLength = cats.body.length-1
      const res = await request(app).delete(`/categories/${cats.body[catsLength]._id}`)
      expect(res.status).toBe(204)

      const updatedCats = await request(app).get('/categories')
      // updated category should have one item less than the original category list
      expect(updatedCats.body.length).toBe(cats.body.length-1)
    })
  })


  describe('Editing a category', () => {
    it('should update the name and image of the chosen category', async () => {
      const cats = await request(app).get('/categories')
      const res = await request(app).put(`/categories/${cats.body[0]._id}`).send({
        name: 'New Category'
      })
      expect(res.status).toBe(200)

      const updatedCats = await request(app).get('/categories')
      expect(updatedCats.body[0].name).toBe('New Category')
    })
  })
})
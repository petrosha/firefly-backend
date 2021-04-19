const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/systems_db') 
const initialBlogs = [  
    [
        {
          title: "Title1",
          author: "Author1",
          url: "http:google.com",
          likes: 3,
        },
        {
          title: "Title2",
        author: "Author2",
          url: "http:ibm.com",
          likes: 4,
        },
        {
          title: "Title3",
          author: "Author2",
          url: "http:facebook.com",
          likes: 5,
        },
        {
          title: "new title",
          author: "new author",
          url: "http://amazon.com",
          likes: 8,
        }
    
    {    
        content: 'HTML is easy', 
           date: new Date(),    important: false,  },  {    content: 'Browser can execute only Javascript',    date: new Date(),    important: true,  },]beforeEach(async () => {  await Note.deleteMany({})  let noteObject = new Note(initialNotes[0])  await noteObject.save()  noteObject = new Note(initialNotes[1])  await noteObject.save()})



test('notes are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

afterAll(() => {
  mongoose.connection.close()
})
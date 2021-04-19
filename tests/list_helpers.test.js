const listHelpers = require("../utils/list_helpers")

const listWithOneBlog = [
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  }
]

const listWith4Blogs = JSON.parse(`[
  {
    "_id": "5fd60410f2f46b7bf2350858",
    "title": "Title1",
    "author": "Author1",
    "url": "http:google.com",
    "likes": 3,
    "__v": 0
  },
  {
    "_id": "5fd604192ca95e7bfd4ff6db",
    "title": "Title2",
    "author": "Author2",
    "url": "http:google.com",
    "likes": 4,
    "__v": 0
  },
  {
    "_id": "5fd60420d9c4c67c101c0cbb",
    "title": "Title3",
    "author": "Author2",
    "url": "http:google.com",
    "likes": 5,
    "__v": 0
  },
  {
    "_id": "5fd612aea30ec9894441af20",
    "title": "new title",
    "author": "new author",
    "url": "http://google.com",
    "likes": 8,
    "__v": 0
  }
]`);

test("dummy returns one", () => {
  const blogs = []

  const result = listHelpers.dummy(blogs)
  expect(result).toBe(1)
})

describe("total likes",()=>{

  
  test("total likes of an empty list should be zero", () => {
    const result = listHelpers.totalLikes([])
    expect(result).toBe(0)
  })

  test("when list has only one blog, equals the likes of that", () => {
    const result = listHelpers.totalLikes(listWithOneBlog)
    expect(result).toBe(5)
  })

  test("counting likes in a long list. should be 20", () => {
    const result = listHelpers.totalLikes(listWith4Blogs);
    expect(result).toBe(20);
  })

})

describe("favorite blog",()=>{
  
  test("testing the proper favorite blog", () => {
    const result = listHelpers.favoriteBlog(listWith4Blogs);
    expect(result).toEqual({
      title: "new title",
      author: "new author",
      likes: 8,
    })
  })

});

describe("most blogs",()=>{
  
  test("testing the author with most blogs", () => {
    const result = listHelpers.mostBlogs(listWith4Blogs);
    expect(result).toEqual({
      author: "Author2",
      blogs: 2
    })
  })

});

describe("most likes",()=>{
  test("testing the author with most blogs", () => {
    const result=listHelpers.mostLikes(listWith4Blogs);
    console.log(result);
    expect(result).toEqual({
      author: "Author2",
      likes: 9
    })
  });
});
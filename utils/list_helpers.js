const { result, values } = require("lodash");
const _ = require("lodash");


const dummy = (blogs) => {
  return 1;
  // ...
}
  
const totalLikes = (blogs) => {
  return blogs.length === 0 ?  0 :  blogs.reduce((sum,item)=>sum+item.likes, 0)
}

const favoriteBlog = (blogs) => {
  if(blogs===undefined) return undefined;

  let blogMostLiked=blogs[0];
  blogs.forEach(element => { 
    if(element.likes>blogMostLiked.likes) blogMostLiked=element;
  });  

  return {title: blogMostLiked.title,author: blogMostLiked.author,likes:blogMostLiked.likes}
} 

const mostBlogs = (blogs) => {
  if(blogs===undefined) return undefined;
  
  let tmpList={};

  blogs.forEach(element => { 
    if(tmpList[element.author]) tmpList[element.author].blogs++;
    else tmpList[element.author]={author:element.author, blogs:1 }
  });  
  
 
  let tmpListSorted = Object.values(tmpList).sort((el1, el2)=>-(el1.blogs-el2.blogs));
  return tmpListSorted[0];
} 

const mostLikes = (blogs) => {
  return  _.chain(blogs)
    .reduce((result,elem)=>{
      (result[elem.author] || (result[elem.author] = [])).push(elem.likes);
      return result;
    },{})
    .map((val,key)=>{return {author:key, likes: _.sum(val)}})
    .maxBy("likes")
    .value();    
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}


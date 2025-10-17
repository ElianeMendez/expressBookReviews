const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;               // Obtener ISBN de la URL
  const review = req.query.review;            // Obtener la reseña de la query (?review=...)
    
  // Verificar que el usuario esté autenticado
  if (!req.session.authorization || !req.session.authorization.username) {
      return res.status(403).json({ message: "User not logged in" });
  }    
  const username = req.session.authorization.username;    
  // Verificar que el libro exista
  if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
  }    
  // Añadir o actualizar la reseña del usuario
  books[isbn].reviews[username] = review;    
  return res.status(200).json({
      message: `Review added/updated for ISBN ${isbn} by user ${username}`,
      reviews: books[isbn].reviews
  });
});

regd_users.get("/all", (req, res) => {
  res.json(users);
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;  
  // Verificamos si el usuario está loggeado
  if (!req.session.authorization || !req.session.authorization.username) {
      return res.status(403).json({ message: "User not logged in" });
  }  
  const username = req.session.authorization.username;  
  // Verificamos que el libro exista
  if (books[isbn]) {
      if (books[isbn].reviews[username]) {
          // Eliminamos la reseña del usuario
          delete books[isbn].reviews[username];
          return res.status(200).json({ message: `Review by ${username} deleted successfully`, reviews: books[isbn].reviews });
      } else {
          return res.status(404).json({ message: "No review found for this user" });
      }
  } else {
      return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

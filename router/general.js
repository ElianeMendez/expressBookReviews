const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body; // Extraer username y password del cuerpo de la solicitud

    // Validar que username y password existan
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Verificar si el usuario ya existe
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Registrar nuevo usuario
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn; // "1", "2", etc.
    const book = books[isbn];     // Accede directamente al objeto por clave

    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;  // Obtener el autor de los parámetros
  let booksByAuthor = [];

    // Iterar sobre todas las claves del objeto books
    Object.keys(books).forEach((isbn) => {
        if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
            // Agregar el libro al array si el autor coincide
            booksByAuthor.push({ isbn: isbn, ...books[isbn] });
        }
    });

    if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
    } else {
        return res.status(404).json({ message: "No books found for this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title; // Extrae el título de los parámetros
  const bookKeys = Object.keys(books); // Obtiene todas las claves del objeto books
  let filtered_books = [];

    bookKeys.forEach((key) => {
        if (books[key].title === title) {
            filtered_books.push(books[key]);
        }
    });

    if (filtered_books.length > 0) {
        return res.status(200).json(filtered_books);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn; // Extrae el ISBN de los parámetros
    const book = books[isbn]; // Busca el libro por su ISBN (clave)

    if (book) {
        return res.status(200).json(book.reviews); // Devuelve solo las reseñas
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;

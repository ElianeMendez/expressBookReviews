const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


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
public_users.get('/async-books', async (req, res) => {
    try {
        // Simulamos la obtención de datos con una promesa
        const getBooks = () => {
            return new Promise((resolve, reject) => {
                if (books) {
                    resolve(books);
                } else {
                    reject("No books found");
                }
            });
        };

        const allBooks = await getBooks();
        res.status(200).json(allBooks);
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

// Get book details based on ISBN
public_users.get('/async-isbn/:isbn', async (req, res) => {
    try {
        const getBookByISBN = (isbn) => {
            return new Promise((resolve, reject) => {
                const book = books[isbn];
                if (book) {
                    resolve(book);
                } else {
                    reject("Book not found");
                }
            });
        };

        const isbn = req.params.isbn;
        const book = await getBookByISBN(isbn);
        res.json(book);
    } catch (err) {
        res.status(404).json({ message: err });
    }
});
  
// Get book details based on author
public_users.get('/async-author/:author', async (req, res) => {
    try {
        const getBooksByAuthor = (author) => {
            return new Promise((resolve, reject) => {
                const allBooks = Object.values(books);
                const filteredBooks = allBooks.filter(book => book.author.toLowerCase() === author.toLowerCase());
                if (filteredBooks.length > 0) {
                    resolve(filteredBooks);
                } else {
                    reject("No books found for this author");
                }
            });
        };

        const author = req.params.author;
        const booksByAuthor = await getBooksByAuthor(author);
        res.json(booksByAuthor);
    } catch (err) {
        res.status(404).json({ message: err });
    }
});

// Get all books based on title
public_users.get('/async-title/:title', async (req, res) => {
    try {
        const getBooksByTitle = (title) => {
            return new Promise((resolve, reject) => {
                const allBooks = Object.values(books);
                const filteredBooks = allBooks.filter(book => book.title.toLowerCase() === title.toLowerCase());
                if (filteredBooks.length > 0) {
                    resolve(filteredBooks);
                } else {
                    reject("No books found with this title");
                }
            });
        };

        const title = req.params.title;
        const booksByTitle = await getBooksByTitle(title);
        res.json(booksByTitle);
    } catch (err) {
        res.status(404).json({ message: err });
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

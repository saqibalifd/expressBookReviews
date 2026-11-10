const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

/* ===================== Server routes ===================== */

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (book) {
    return res.status(200).json(book);
  }
  return res.status(404).json({ message: "Book not found" });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const result = Object.keys(books)
    .filter((isbn) => books[isbn].author.toLowerCase() === author)
    .map((isbn) => ({ isbn, ...books[isbn] }));

  if (result.length > 0) {
    return res.status(200).json({ booksbyauthor: result });
  }
  return res.status(404).json({ message: "No books found for this author" });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const result = Object.keys(books)
    .filter((isbn) => books[isbn].title.toLowerCase() === title)
    .map((isbn) => ({ isbn, ...books[isbn] }));

  if (result.length > 0) {
    return res.status(200).json({ booksbytitle: result });
  }
  return res.status(404).json({ message: "No books found with this title" });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

/* ============ Axios client functions (Task 11) ============
   Promise callbacks for: all books, ISBN
   async/await for: author, title
   Run with:  node router/general.js   (while the server is running)
*/

// Task 10: Get all books - Promise callbacks
const getAllBooks = () => {
  return axios.get(`${BASE_URL}/`)
    .then((response) => {
      console.log("All books:");
      console.log(response.data);
    })
    .catch((error) => console.error("Error fetching all books:", error.message));
};

// Task 11: Get book by ISBN - Promise callbacks
const getBookByISBN = (isbn) => {
  return axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => {
      console.log(`Book with ISBN ${isbn}:`);
      console.log(response.data);
    })
    .catch((error) => console.error("Error fetching book by ISBN:", error.message));
};

// Task 12: Get books by author - async/await
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log(`Books by ${author}:`);
    console.log(JSON.stringify(response.data, null, 4));
  } catch (error) {
    console.error("Error fetching books by author:", error.message);
  }
};

// Task 13: Get books by title - async/await
const getBooksByTitle = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    console.log(`Books titled "${title}":`);
    console.log(JSON.stringify(response.data, null, 4));
  } catch (error) {
    console.error("Error fetching books by title:", error.message);
  }
};

// Run the client demo only when this file is executed directly (node router/general.js)
if (require.main === module) {
  (async () => {
    await getAllBooks();
    await getBookByISBN(1);
    await getBooksByAuthor("Chinua Achebe");
    await getBooksByTitle("Fairy tales");
  })();
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
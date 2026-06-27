const express = require('express');
const router = express.Router();
const {
  addBook,
  getAllBooks,
  getBookDetails,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook
} = require('../controllers/bookController');
const { bookValidator } = require('../validators/bookValidator');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { borrowValidator } = require('../validators/borrowValidator');

// Protect all routes with authMiddleware
router.use(authMiddleware);

// GET /api/books - Get all books (Authenticated users)
router.get('/', getAllBooks);

// GET /api/books/:id - Get book details (Authenticated users)
router.get('/:id', getBookDetails);

// POST /api/books - Add book (Librarian only)
router.post('/', authorizeRoles('librarian'), bookValidator, addBook);

// PUT /api/books/:id - Update book (Librarian only)
router.put('/:id', authorizeRoles('librarian'), updateBook);

// DELETE /api/books/:id - Delete book (Librarian only)
router.delete('/:id', authorizeRoles('librarian'), deleteBook);

// POST /api/books/:id/borrow - Borrow book (Member only)
router.post('/:id/borrow', authorizeRoles('member'), borrowValidator, borrowBook);

// POST /api/books/:id/return - Return book (Member only)
router.post('/:id/return', authorizeRoles('member'), borrowValidator, returnBook);

module.exports = router;

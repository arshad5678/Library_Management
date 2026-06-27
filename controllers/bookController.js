const Book = require('../models/Book');
const Borrow = require('../models/Borrow');

/**
 * Add Book
 * POST /api/books
 */
const addBook = async (req, res) => {
  try {
    const { title, author, isbn, category, quantity, availableQuantity } = req.body;

    // Check if book with ISBN already exists
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }

    const newBook = new Book({
      title,
      author,
      isbn,
      category,
      quantity,
      availableQuantity
    });

    const savedBook = await newBook.save();

    return res.status(201).json({
      success: true,
      message: 'Book added successfully',
      book: savedBook
    });
  } catch (error) {
    console.error(`Add Book Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get All Books
 * GET /api/books
 */
const getAllBooks = async (req, res) => {
  try {
    // Sort by newest first
    const books = await Book.find().sort({ createdAt: -1 });
    return res.status(200).json(books);
  } catch (error) {
    console.error(`Get All Books Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get Book Details
 * GET /api/books/:id
 */
const getBookDetails = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    return res.status(200).json(book);
  } catch (error) {
    console.error(`Get Book Details Error: ${error.message}`);
    // If it's a Mongoose CastError (invalid ObjectId format) return 404
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Update Book
 * PUT /api/books/:id
 */
const updateBook = async (req, res) => {
  try {
    // Update only provided fields
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    return res.status(200).json(updatedBook);
  } catch (error) {
    console.error(`Update Book Error: ${error.message}`);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Delete Book
 * DELETE /api/books/:id
 */
const deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error(`Delete Book Error: ${error.message}`);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Borrow Book
 * POST /api/books/:id/borrow
 */
const borrowBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const memberId = req.user._id;

    // 1. Find the book
    const book = await Book.findById(bookId);

    // 2. If the book does not exist
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // 3. If availableQuantity <= 0
    if (book.availableQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is currently unavailable'
      });
    }

    // 4. Check Borrow collection for active borrow record (status = "borrowed")
    const activeBorrow = await Borrow.findOne({
      memberId,
      bookId,
      status: 'borrowed'
    });

    if (activeBorrow) {
      return res.status(400).json({
        success: false,
        message: 'You have already borrowed this book'
      });
    }

    // 5. Create a Borrow record
    const borrowRecord = new Borrow({
      memberId,
      bookId,
      status: 'borrowed',
      borrowDate: new Date()
    });

    await borrowRecord.save();

    // 6. Decrease book.availableQuantity by 1
    book.availableQuantity -= 1;

    // 7. Save the book
    await book.save();

    // 8. Return 201
    return res.status(201).json({
      success: true,
      message: 'Book borrowed successfully',
      borrow: borrowRecord
    });
  } catch (error) {
    console.error(`Borrow Book Error: ${error.message}`);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Return Book
 * POST /api/books/:id/return
 */
const returnBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const memberId = req.user._id;

    // 1. Validate req.params.id (CastError handling is done below, format check in validator)
    // 2. Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // 3. Find Borrow document matching memberId, bookId, and status = "borrowed"
    const borrowRecord = await Borrow.findOne({
      memberId,
      bookId,
      status: 'borrowed'
    });

    // 4. If Borrow record not found
    if (!borrowRecord) {
      return res.status(404).json({
        success: false,
        message: 'No active borrow record found'
      });
    }

    // 5. Update Borrow document
    borrowRecord.status = 'returned';
    borrowRecord.returnDate = new Date();

    // 6. Save Borrow document
    const updatedBorrow = await borrowRecord.save();

    // 7. Increase book.availableQuantity by 1
    book.availableQuantity += 1;

    // 8. Save Book
    await book.save();

    // 9. Return 200
    return res.status(200).json({
      success: true,
      message: 'Book returned successfully',
      borrow: updatedBorrow
    });
  } catch (error) {
    console.error(`Return Book Error: ${error.message}`);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  addBook,
  getAllBooks,
  getBookDetails,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook
};

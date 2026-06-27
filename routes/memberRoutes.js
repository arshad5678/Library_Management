const express = require('express');
const router = express.Router();
const { getAllMembers, deleteMember, getMyBorrowedBooks } = require('../controllers/memberController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Protect all routes with authMiddleware
router.use(authMiddleware);

// GET /api/members/me/books - Get logged-in member's borrowed books (Member only)
router.get('/me/books', authorizeRoles('member'), getMyBorrowedBooks);

// Restrict subsequent routes to Librarian only
router.use(authorizeRoles('librarian'));

// GET /api/members - Get all members (Librarian only)
router.get('/', getAllMembers);

// DELETE /api/members/:id - Delete a member (Librarian only)
router.delete('/:id', deleteMember);

module.exports = router;

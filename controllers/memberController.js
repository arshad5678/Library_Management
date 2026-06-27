const User = require('../models/User');
const Borrow = require('../models/Borrow');

/**
 * Get All Members
 * GET /api/members
 */
const getAllMembers = async (req, res) => {
  try {
    // Only return users with role = "member", exclude passwords, sort by newest first
    const members = await User.find({ role: 'member' })
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: members.length,
      members
    });
  } catch (error) {
    console.error(`Get All Members Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Delete Member
 * DELETE /api/members/:id
 */
const deleteMember = async (req, res) => {
  try {
    const memberId = req.params.id;

    // Find user by ID
    const user = await User.findById(memberId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Do NOT allow deleting librarians
    if (user.role === 'librarian') {
      return res.status(403).json({
        success: false,
        message: 'Librarian accounts cannot be deleted.'
      });
    }

    // Delete the member
    await User.findByIdAndDelete(memberId);

    return res.status(200).json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error(`Delete Member Error: ${error.message}`);
    // If invalid ObjectId format (CastError)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get My Borrowed Books
 * GET /api/members/me/books
 */
const getMyBorrowedBooks = async (req, res) => {
  try {
    const borrowRecords = await Borrow.find({
      memberId: req.user._id,
      status: 'borrowed'
    }).populate('bookId', 'title author isbn category');

    return res.status(200).json({
      success: true,
      count: borrowRecords.length,
      books: borrowRecords
    });
  } catch (error) {
    console.error(`Get My Borrowed Books Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllMembers,
  deleteMember,
  getMyBorrowedBooks
};

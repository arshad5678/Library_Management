const { body, validationResult } = require('express-validator');

// Reusable validation result checker middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

const bookValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 2 })
    .withMessage('Title must be at least 2 characters long'),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required'),
  body('isbn')
    .trim()
    .notEmpty()
    .withMessage('ISBN is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be an integer and at least 0'),
  body('availableQuantity')
    .notEmpty()
    .withMessage('Available Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Available Quantity must be an integer and at least 0'),
  validateRequest
];

module.exports = {
  bookValidator
};

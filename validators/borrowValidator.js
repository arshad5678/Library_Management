const { param, validationResult } = require('express-validator');

const borrowValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Book ID'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Book ID'
      });
    }
    next();
  }
];

module.exports = {
  borrowValidator
};

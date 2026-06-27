/**
 * Role-Based Authorization Middleware
 * @param  {...string} allowedRoles - The roles that are allowed to access the route
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // 3. Read the authenticated user from req.user
    // 4. Check whether the user's role is included in the allowed roles
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      // 6. If not authorized, return HTTP 403
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to perform this action.'
      });
    }

    // 5. If authorized, call next()
    next();
  };
};

// 7. Export the middleware using CommonJS
module.exports = authorizeRoles;

# Library Management System - Backend

A clean, modular, and secure RESTful API backend for a Library Management System built using Node.js, Express.js, and MongoDB.

---

## Project Overview
This project provides a complete backend system to manage library activities including user registration, role-based authorization (Librarians vs. Members), book CRUD operations, book borrowing, and returns.

Key features:
- **Authentication**: Secure registration and login using JWT.
- **Authorization**: Role-based access control (RBAC) ensuring only librarians can modify inventory or view/delete members, while only members can borrow/return books.
- **Validation**: Strict input validation and sanitization using `express-validator`.
- **Global Error Handling**: Centralized error middleware handling validation exceptions, CastErrors, and 404 routes cleanly.

---

## Technologies Used
- **Runtime Environment**: Node.js (v18+)
- **Web Framework**: Express.js
- **Database**: MongoDB & Mongoose ORM
- **Security**: JSON Web Tokens (JWT) & bcryptjs (password hashing)
- **Validation**: express-validator
- **Cross-Origin Resource Sharing**: CORS
- **Environment Management**: dotenv

---

## Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/arshad5678/Library_Management.git
   cd Library_Management
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and insert your configuration values (Database URL, JWT Secret, and Port).

4. **Run in Development mode** (with hot-reloading using nodemon):
   ```bash
   npm run dev
   ```

5. **Run in Production mode**:
   ```bash
   npm start
   ```

---

## Environment Variables
The application requires the following variables configured in your `.env` file:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | The port the Express server will listen on. | `5001` |
| `DATABASE_URL` | The connection string for your MongoDB instance. | `mongodb+srv://<user>:<password>@cluster.mongodb.net/library` |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens. | `super_secret_jwt_key_12345` |

---

## Database Setup
1. Create a MongoDB database cluster on **MongoDB Atlas** or start a local instance of MongoDB.
2. Retrieve your connection string (URI).
3. Paste the URI as the `DATABASE_URL` value inside the `.env` file.
4. Mongoose automatically establishes connection and creates the `users`, `books`, and `borrows` collections on server startup.

---

## API Endpoints

### 1. Authentication
| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register a new user (default role is `member`). |
| `/api/auth/login` | `POST` | Public | Login with email & password, returns JWT token. |

### 2. Book Management
| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/books` | `POST` | Librarian | Add a new book to the library inventory. |
| `/api/books` | `GET` | Authenticated | Retrieve all books sorted by newest. |
| `/api/books/:id` | `GET` | Authenticated | Retrieve details of a specific book. |
| `/api/books/:id` | `PUT` | Librarian | Update details of a book. |
| `/api/books/:id` | `DELETE`| Librarian | Delete a book from the library. |
| `/api/books/:id/borrow`| `POST`| Member | Borrow an available book (decreases stock by 1). |
| `/api/books/:id/return`| `POST`| Member | Return a borrowed book (increases stock by 1). |

### 3. Member Management
| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/members/me/books` | `GET` | Member | List all active borrowed books for the logged-in member. |
| `/api/members` | `GET` | Librarian | Get details of all registered library members. |
| `/api/members/:id` | `DELETE`| Librarian | Delete a library member account (librarians cannot be deleted). |

---

## Authentication Flow

1. **User Registration**: Client registers at `POST /api/auth/register`. Passwords are encrypted before database insertion.
2. **User Login**: Client sends credentials to `POST /api/auth/login`. On success, server signs and responds with a JWT token containing user `id` and `role`.
3. **Authorized Requests**: For protected endpoints, the client must include the JWT token in the HTTP header:
   ```http
   Authorization: Bearer <your_jwt_token>
   ```
4. **Middleware Parsing**: `authMiddleware.js` extracts, decodes, and verifies the token. It resolves the user profile and assigns it to `req.user`.
5. **Access Control**: `roleMiddleware.js` checks `req.user.role` to allow or deny (`403 Access Denied`) requests.

---

## Deployment URL
*(Add your production deployment links here once configured)*
- Production API URL: `https://library-management-api.onrender.com` (Example)

---

## Postman Collection
To test the API manually:
1. Import all route definitions into Postman by creating a new request collection mapping the endpoints listed above.
2. Set the `Authorization` type of your requests to **Bearer Token** and insert the token received from the Login API.
3. Alternatively, you can use the built-in **[test_endpoints.js](file:///Users/shaikarshadbasha/Library_management/test_endpoints.js)** script to test the APIs locally without installing any tools:
   ```bash
   node test_endpoints.js
   ```

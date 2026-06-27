require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const BASE_URL = 'http://localhost:5001';

// Helper function to print logs clearly
const logHeader = (title) => {
  console.log(`\n==========================================`);
  console.log(` ${title}`);
  console.log(`==========================================`);
};

const runTests = async () => {
  logHeader('STARTING END-TO-END VERIFICATION');

  const randomSuffix = Math.floor(Math.random() * 100000);
  const memberEmail = `test_member_${randomSuffix}@example.com`;
  const librarianEmail = `test_librarian_${randomSuffix}@example.com`;
  const bookIsbn = `isbn-${randomSuffix}`;

  let memberToken = '';
  let librarianToken = '';
  let bookId = '';

  try {
    // -------------------------------------------------------------
    // STEP 1: Register Member User
    // -------------------------------------------------------------
    logHeader('1. REGISTER MEMBER');
    const registerMemberRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Member',
        email: memberEmail,
        password: 'password123'
      })
    });
    const registerMemberData = await registerMemberRes.json();
    console.log('Status Code:', registerMemberRes.status);
    console.log('Response:', registerMemberData);

    // -------------------------------------------------------------
    // STEP 2: Login Member User to get Token
    // -------------------------------------------------------------
    logHeader('2. LOGIN MEMBER');
    const loginMemberRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: memberEmail,
        password: 'password123'
      })
    });
    const loginMemberData = await loginMemberRes.json();
    console.log('Status Code:', loginMemberRes.status);
    console.log('Response:', loginMemberData);
    memberToken = loginMemberData.token;

    // -------------------------------------------------------------
    // STEP 3: Register Librarian User
    // -------------------------------------------------------------
    logHeader('3. REGISTER LIBRARIAN (starts as member)');
    const registerLibRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob Librarian',
        email: librarianEmail,
        password: 'password123'
      })
    });
    const registerLibData = await registerLibRes.json();
    console.log('Status Code:', registerLibRes.status);
    console.log('Response:', registerLibData);

    // -------------------------------------------------------------
    // STEP 4: Promote Librarian in Database
    // -------------------------------------------------------------
    logHeader('4. PROMOTING LIBRARIAN IN DATABASE');
    await mongoose.connect(process.env.DATABASE_URL);
    const updatedUser = await User.findOneAndUpdate(
      { email: librarianEmail },
      { role: 'librarian' },
      { new: true }
    );
    console.log('User promoted successfully. New details in DB:', {
      email: updatedUser.email,
      role: updatedUser.role
    });
    await mongoose.disconnect();

    // -------------------------------------------------------------
    // STEP 5: Login Librarian User to get Token
    // -------------------------------------------------------------
    logHeader('5. LOGIN LIBRARIAN');
    const loginLibRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: librarianEmail,
        password: 'password123'
      })
    });
    const loginLibData = await loginLibRes.json();
    console.log('Status Code:', loginLibRes.status);
    console.log('Response:', loginLibData);
    librarianToken = loginLibData.token;

    // -------------------------------------------------------------
    // STEP 6: Librarian adds a new book
    // -------------------------------------------------------------
    logHeader('6. ADD BOOK (Librarian role required)');
    const addBookRes = await fetch(`${BASE_URL}/api/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${librarianToken}`
      },
      body: JSON.stringify({
        title: 'Learning Express',
        author: 'TJ Holowaychuk',
        isbn: bookIsbn,
        category: 'Web Development',
        quantity: 5,
        availableQuantity: 5
      })
    });
    const addBookData = await addBookRes.json();
    console.log('Status Code:', addBookRes.status);
    console.log('Response:', addBookData);
    bookId = addBookData.book._id;

    // -------------------------------------------------------------
    // STEP 7: Member borrows the book
    // -------------------------------------------------------------
    logHeader('7. BORROW BOOK (Member role required)');
    const borrowRes = await fetch(`${BASE_URL}/api/books/${bookId}/borrow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`
      }
    });
    const borrowData = await borrowRes.json();
    console.log('Status Code:', borrowRes.status);
    console.log('Response:', borrowData);

    // -------------------------------------------------------------
    // STEP 8: Get Member\'s Borrowed Books
    // -------------------------------------------------------------
    logHeader('8. GET MY BORROWED BOOKS (Member role required)');
    const getBooksRes = await fetch(`${BASE_URL}/api/members/me/books`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${memberToken}`
      }
    });
    const getBooksData = await getBooksRes.json();
    console.log('Status Code:', getBooksRes.status);
    console.log('Response:', getBooksData);

    // -------------------------------------------------------------
    // STEP 9: Member returns the book
    // -------------------------------------------------------------
    logHeader('9. RETURN BOOK (Member role required)');
    const returnRes = await fetch(`${BASE_URL}/api/books/${bookId}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`
      }
    });
    const returnData = await returnRes.json();
    console.log('Status Code:', returnRes.status);
    console.log('Response:', returnData);

    // -------------------------------------------------------------
    // STEP 10: Trigger 404 Route NotFound
    // -------------------------------------------------------------
    logHeader('10. TRIGGER 404 ROUTE');
    const notFoundRes = await fetch(`${BASE_URL}/api/invalid-route`);
    const notFoundData = await notFoundRes.json();
    console.log('Status Code:', notFoundRes.status);
    console.log('Response:', notFoundData);

    logHeader('VERIFICATION COMPLETE');
  } catch (error) {
    console.error('Error during testing:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

runTests();

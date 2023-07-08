const router = require('express').Router();
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
// const isAuthenticated = require('../middleware/firebase.middleware');
const auth = require('../config/firebase.config');

const saltRounds = 10;

// Signup - Create a new user
router.post('/signup', async (req, res, next) => {
  const { email, password, name } = req.body;

  try {
    // check if all parameters have been provided
    if (email === '' || password === '' || name === '') {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    // Use regex to validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Provide a valid email address' });
    }

    // Use regex to validate the password format
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.'
      });
    }

    // Check the users collection if a user with the same email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: 'The provided email is already registered' });
    }

    // Encrypting the password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Creating the new user
    const newUser = await User.create({
      email,
      name,
      password: hashedPassword
    });

    // Returning the new user without password - WE SHOULD NEVER EXPOSE PASSWORDS, EVEN ENCRYPTED!
    res.json({ email: newUser.email, name: newUser.name, _id: newUser._id });
  } catch (error) {
    console.log('An error occurred creating the user', error);
    next(error);
  }
});

// Login - Verifies and logs the user, returns JWT
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // check if all parameters have been provided
    if (email === '' || password === '') {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // if the user is not found, send an error response
      return res
        .status(401)
        .json({ message: 'Provided email is not registered' });
    }

    // comparing the provided password with the one saved in the database
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);

    if (isPasswordCorrect) {
      // Create Custom Token using Firebase
      const authToken = await auth.createCustomToken(user._id.toString(), {
        _id: user._id,
        email: user.email,
        name: user.name
      });

      // Create and sign the JWT
      // we pass the user payload and the token secret defined in the .env
      // const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      //   algorithm: 'HS256', // the algorithm we want to use to encrypt, default is HS256
      //   expiresIn: '6h' // TTL - time to live of the JWT
      // });

      // send the token as the response
      res.status(200).json({ authToken: authToken });
    } else {
      res.status(401).json({ message: 'Incorrect password' });
    }
  } catch (error) {
    console.log('An error occurred login the user', error);
    next(error);
  }
});

// Login Google - Checks if user already exists, creates it otherwise
router.post('/signup-google', async (req, res, next) => {
  const { email, name } = req.body;
  try {
    // check if all parameters have been provided
    if (email === '' || name === '') {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.json({ message: 'User already exists' });
    }

    // Creating the new user
    await User.create({
      email,
      name
    });
    res.json({ message: 'User created successfully' });
  } catch (error) {
    console.log('An error occurred login the user', error);
    next(error);
  }
});

// // Verify - used to verify JWT stored on the client
// router.get('/verify', isAuthenticated, (req, res, next) => {
//   // If JWT token is valid the payload gets decoded by the
//   // isAuthenticated middleware and made available on `req.payload`
//   console.log('req.payload', req.payload);

//   // Send back the object with user data
//   // previously set as the token payload
//   res.json(req.payload);
// });

module.exports = router;

const auth = require('../config/firebase.config');

const isAuthenticated = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    const token = req.headers.authorization.split(' ')[1];

    try {
      const decodeValue = await auth.verifyIdToken(token);
      if (decodeValue) {
        req.user = decodeValue;
        return next();
      }
    } catch (e) {
      console.log(e);
      return res.json({ message: 'Internal Error' });
    }
  } else {
    return res.json({ message: 'No token' });
  }
};

module.exports = isAuthenticated;

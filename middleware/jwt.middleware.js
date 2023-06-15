const { expressjwt: jwt } = require('express-jwt');

// instantiate the JWT token validation middleware
const isAuthenticated = jwt({
  secret: process.env.TOKEN_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'payload', // we'll be able to access the decoded jwt in req.payload
  getToken: getTokenFromHeaders // the function below to extract the jwt
});

// function used to extracts the JWT token from the request's 'Authorization' Headers
function getTokenFromHeaders(req) {
  // checks if the token is available on the request Headers
  // format: 'Bearer tokenHere'
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    // Get the encoded token string and return it
    const token = req.headers.authorization.split(' ')[1];
    return token;
  }

  return null;
}

// Export the middleware so that we can use it to create a protected routes
module.exports = {
  isAuthenticated
};

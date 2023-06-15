const router = require('express').Router();

router.get('/', (req, res, next) => {
  // Since we are building an API, we no longer render views here
  // we send a json response
  res.json('All good in here');
});

module.exports = router;

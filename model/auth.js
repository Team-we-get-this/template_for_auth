

const { createToken } = require('../lib/token.js');
const bcrypt = require('bcryptjs');
const psql = require('../db/db.js');


function logIn(req, res, next) {
  const loginData = {
    username: req.body.username,
    password: req.body.password,
  };
  console.log(loginData);
    psql.any(`SELECT *
      FROM users
      WHERE username = '${loginData.username}';`)
      .then(data => {
        let dbUsers = data;
        if (!(Array.isArray(data))) {
          dbUsers = [data];
        }
        dbUsers.forEach((user) => {
          const matches = bcrypt.compareSync(loginData.password, user.password);
          if (matches) {
            console.log(user);
            res.id = user.id
            res.token = createToken(user.id)
            next();
          }
        })
        res.token = 'invalid';
        next();
      })
    .catch((error) => console.log(error));
  }

  function verifyUser(req, res, next) {
  const token = req.body.token
  console.log(req.body.token);
  if (token) {
    // const decoded = jwt.decode(token, { complete: true });
    // returns the user by fetching the id from the database
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch(err) {
      res.send(err)
      next(err)
    }
      // res.user = getUserById(req.body.id)
      res.token = createToken(req.body.id)
      next();
  } else {
    res.token = {
      error: true,
      message: 'Unauthenticated User',
      }
      next();
    // req.session.userID = null;
  }
}

module.exports = {
  logIn,
  verifyUser
};

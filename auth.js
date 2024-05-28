const jwt = require('jsonwebtoken');

const secretKey = 'your_secret_key'; // Change this to a strong secret key and keep it safe

// Function to generate a token
function generateToken(user) {
  return jwt.sign({ id: user.uid, Userid: user.Userid, userType: user.userType }, secretKey, {
    expiresIn: '1h' // Token expires in 1 hour
  });
}

// Middleware to verify token
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = { generateToken, authenticateToken };

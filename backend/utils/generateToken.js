const jwt = require('jsonwebtoken');

function generateToken(user) {
  const payload = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

module.exports = generateToken;

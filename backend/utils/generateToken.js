const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'expensewise_super_secret_jwt_key_2026_finance', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

module.exports = generateToken;

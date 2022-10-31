const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const AuthError = require('../errors/AuthError');
const { NEED_TO_AUTHORIZE } = require('../utils/constants');

const auth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return next(new AuthError(NEED_TO_AUTHORIZE));
  }

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (e) {
    return next(new AuthError(NEED_TO_AUTHORIZE));
  }

  req.user = payload;

  return next();
};

module.exports = auth;

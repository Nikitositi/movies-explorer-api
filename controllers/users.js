const bcrypt = require('bcryptjs');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const UniqueValueError = require('../errors/UniqueValueError');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');

const {
  NOT_FOUND_USER,
  UNIQUE_EMAIL,
  NOT_VALID_ID,
  INCORRET_DATA,
} = require('../utils/constants');

module.exports.getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  return User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError(NOT_FOUND_USER);
      } else {
        res.send(user);
      }
    })
    .catch(next);
};

module.exports.updateUserProfile = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    {
      runValidators: true,
      new: true,
    }
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError(NOT_FOUND_USER);
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(new UniqueValueError(UNIQUE_EMAIL));
      }
      if (err.name === 'ValidationError') {
        return next(new BadRequestError(INCORRET_DATA));
      }
      if (err.name === 'CastError') {
        return next(new BadRequestError(NOT_VALID_ID));
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const { name, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hashedPassword) => {
      User.create({
        name,
        email,
        password: hashedPassword,
      })
        .then((user) => {
          const userInfo = user.toObject();
          delete userInfo.password;
          res.send(userInfo);
        })
        .catch((err) => {
          if (err.code === 11000) {
            return next(new UniqueValueError(UNIQUE_EMAIL));
          }
          if (err.name === 'ValidationError' || err.name === 'CastError') {
            return next(new BadRequestError(INCORRET_DATA));
          }
          return next(err);
        });
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        {
          expiresIn: '7d',
        }
      );
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        })
        .send({ token });
    })
    .catch(next);
};

module.exports.logout = (req, res, next) => {
  res
    .clearCookie('jwt', {
      sameSite: 'none',
      secure: true,
    })
    .send({ message: 'Вы успешно разлогинились' })
    .end();
  next();
};

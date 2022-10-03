const bcrypt = require('bcryptjs');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const isAuthorized = require('../utils/isAuthorized');

const { JWT_SECRET } = process.env;

const UniqueValueError = require('../errors/UniqueValueError');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const NoRightsError = require('../errors/NoRightsError');
const AuthError = require('../errors/AuthError');

module.exports.getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  const token = req.headers.authorization;

  if (!isAuthorized(token)) {
    throw new NoRightsError('Нет прав доступа');
  }

  return User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь c таким id не найден');
      } else {
        res.send({ data: user });
      }
    })
    .catch(next);
  // .catch((err) => {
  //   if (err.name === 'CastError') {
  //     return next(new BadRequestError('Некорректный id'));
  //   }
  //   return next(err);
  // });
};

module.exports.updateUserProfile = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    {
      runValidators: true,
      new: true,
    },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь c таким id не найден');
      } else {
        res.send(user);
      }
    })
    .catch(next);
  // .catch((err) => {
  //   if (err.name === 'ValidationError') {
  //     return next(new BadRequestError('Переданы некорректные данные'));
  //   }
  //   if (err.name === 'CastError') {
  //     return next(new BadRequestError('Некорректный id'));
  //   }
  //   return next(err);
  // });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hashedPassword) => {
      User.create({
        name,
        email,
        password: hashedPassword,
      })
        .then((user) => {
          // const userInfo = user.toObject();
          // delete userInfo.password;
          res.send(user);
        })
        .catch((err) => {
          if (err.code === 11000) {
            return next(
              new UniqueValueError('Пользователь с таким email уже существует'),
            );
          }
          if (err.name === 'ValidationError' || err.name === 'CastError') {
            return next(
              new BadRequestError(
                'Переданы некорректные данные при создании пользователя',
              ),
            );
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
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: '7d',
      });
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .send({ token });
    })
    .catch(() => {
      throw new AuthError('Неверная почта или пароль');
    })
    .catch(next);
};
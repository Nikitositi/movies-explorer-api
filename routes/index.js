const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');

const { createUser, login, logout } = require('../controllers/users');
const usersRouter = require('./users');
const moviesRouter = require('./movies');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/NotFoundError');
const { INCORRET_EMAIL, NOT_FOUND } = require('../utils/constants');

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().custom((value, helpers) => {
      if (validator.isEmail(value)) {
        return value;
      }
      return helpers.message(INCORRET_EMAIL);
    }),
    password: Joi.string().required(),
  }),
}), createUser);
router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
router.use('/signout', logout);

router.use(auth);

router.use(usersRouter);
router.use(moviesRouter);
router.use((req, res, next) => {
  next(new NotFoundError(NOT_FOUND));
});

module.exports = router;

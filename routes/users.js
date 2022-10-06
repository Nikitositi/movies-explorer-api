const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getCurrentUser, updateUserProfile } = require('../controllers/users');

usersRouter.get('/users/me', getCurrentUser);
usersRouter.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
  }),
}), updateUserProfile);

module.exports = usersRouter;

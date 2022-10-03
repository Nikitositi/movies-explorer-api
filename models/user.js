const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const AuthError = require('../errors/AuthError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Это поле обязательное'],
    minlength: [2, 'Поле должно быть не меньше 2 символов'],
    maxlength: [30, 'Поле должно быть не больше 30 символов'],
  },
  email: {
    type: String,
    required: [true, 'Это поле обязательное'],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'Некорректный email',
    },
  },
  password: {
    type: String,
    required: [true, 'Это поле обязательное'],
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new AuthError('Неверная почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new AuthError('Неверная почта или пароль'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);

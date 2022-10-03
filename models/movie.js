const mongoose = require('mongoose');
const validator = require('validator');

const movieSchema = new mongoose.Schema({
  country: {
    type: String,
    required: [true, 'Это поле обязательное'],
  },
  director: {
    type: String,
    required: [true, 'Это поле обязательное'],
  },
  duration: {
    type: Number,
    required: [true, 'Это поле обязательное'],
  },
  year: {
    type: String,
    required: [true, 'Это поле обязательное'],
  },
  description: {
    type: String,
    required: [true, 'Это поле обязательное'],
  },
  image: {
    type: String,
    required: [true, 'Это поле обязательное'],
    validate: {
      validator: validator.isURL(),
      message: 'Некорректная ссылка',
    },
  },
  trailerLink: {
    type: String,
    required: [true, 'Это поле обязательное'],
    validate: {
      validator: validator.isURL(),
      message: 'Некорректная ссылка',
    },
  },
  thumbnail: {
    type: String,
    required: [true, 'Это поле обязательное'],
    validate: {
      validator: validator.isURL(),
      message: 'Некорректная ссылка',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Это поле обязательное'],
  },
  movieId: {
    type: Number,
    ref: 'movie',
    required: [true, 'Это поле обязательное'],
  },
  nameRU: {
    type: String,
    required: [true, 'Это поле обязательное'],
  },
  nameEN: {
    type: String,
    required: [true, 'Это поле обязательное'],
  },
});

module.exports = mongoose.model('movie', movieSchema);

const Movie = require('../models/movie');

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const NoRightsError = require('../errors/NoRightsError');

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const owner = req.user._id;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => res.send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(
          'Переданы некорректные данные при создании фильма',
        );
      }
    })
    .catch(next);
};

module.exports.getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
    .then((movies) => {
      res.send(movies);
    })
    .catch(next);
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Фильм не найден');
      } else if (movie.owner.toString() !== req.user._id) {
        throw new NoRightsError('Нет прав доступа');
      }
      Movie.findByIdAndDelete(req.params.movieId)
        .then(() => {
          res.send({ message: 'Фильм успешно удалён' });
        })
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные');
      } else {
        next(err);
      }
    });
};

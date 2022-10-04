const whiteList = [
  'http://movies-nikitositi.nomoredomains.icu',
  'https://movies-nikitositi.nomoredomains.icu',
  'http://api.movies-nikitositi.nomoredomains.icu',
  'https://api.movies-nikitositi.nomoredomains.icu',
  'http://localhost:3000',
  'https://localhost:3000',
];

const corsHandler = (req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true);
  const { origin } = req.headers;
  if (whiteList.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  const { method } = req;
  const requestHeaders = req.headers['access-control-request-headers'];

  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);
    res.end();
    return;
  }
  next();
};

module.exports = corsHandler;

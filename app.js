const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');

const DomainService = require('./services/DomainService');
const WitService = require('./services/WitService');
const SessionService = require('./services/SessionService');

const indexRouter = require('./routes/index');
const slackRouter = require('./routes/bots/slack');
const alexaRouter = require('./routes/bots/alexa');

module.exports = (config) => {
  const app = express();

  const domainService = new DomainService(config.domains);
  const witService = new WitService(config.wit.token);
  const sessionService = new SessionService();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  app.use(logger('dev'));

  app.use('/bots/slack', slackRouter({
    domainService,
    witService,
    sessionService,
    config
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));

  // Don't create an error if favicon is requested
  app.use((req, res, next) => {
    if (req.originalUrl && req.originalUrl.split('/').pop() === 'favicon.ico') {
      return res.sendStatus(204);
    }
    return next();
  });

  app.use('/bots/alexa', alexaRouter({
    domainService,
    witService,
    sessionService,
    config
  }));

  app.use('/', indexRouter({ domainService, config }));

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    next(createError(404));
  });

  // error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  return app;
};

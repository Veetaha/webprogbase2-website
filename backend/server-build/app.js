'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const Mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Express = require('express');
const logger = require('morgan');
const Config = require('./config');
const ApiV1 = require('./public-api/v1/index');
const HttpCodes = require('http-status-codes');
const Passport = require('passport');
const gql_1 = require('./routes/api/v1/gql');
const v1_1 = require('./routes/api/v1/index');
const auth_1 = require('./routes/auth');
require('./modules/passport');
const app = Express().use(logger('dev')).use(bodyParser.json()).use(Express.static(Config.DocsDir)).use(Express.static(Config.FrontendDistDir)).use(Passport.initialize());
gql_1.apolloServer.applyMiddleware({
    app,
    path: '/api/v1/gql'
});
app.use(ApiV1.Routes.Api.V1._, v1_1.router).use(ApiV1.Routes.Auth._, auth_1.router).get('*', (_req, res, next) => res.sendFile(Config.FrontendIndexPath, next)).use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || HttpCodes.INTERNAL_SERVER_ERROR).json({ error: String(err) });
});
Mongoose.connect(Config.MongoDbUri, {
    useNewUrlParser: true,
    keepAlive: 1,
    connectTimeoutMS: 30000
}).then(() => app.listen(Config.Port, () => console.log(`🚀  Server is listening on port ${ Config.Port }`))).catch(err => {
    console.error(err);
    process.exit(1);
});
process.on('SIGINT', () => Mongoose.disconnect().finally(() => process.exit(0)));
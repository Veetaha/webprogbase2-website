import * as Mongoose     from 'mongoose';
import * as bodyParser   from 'body-parser';
import * as Express      from 'express';
import * as logger       from 'morgan';
import * as Config       from '@app/config';
import * as ApiV1        from '@public-api/v1';
import * as HttpCodes    from 'http-status-codes';
import * as Passport     from 'passport';
import { apolloServer          } from '@routes/api/v1/gql';
import { router as ApiV1Router } from '@routes/api/v1';
import { router as AuthRouter  } from '@routes/auth';
import '@modules/passport';

const app = Express()
    .use(logger('dev'))
    .use(bodyParser.json())
    .use(Express.static(Config.DocsDir))
    .use(Express.static(Config.FrontendDistDir))
    .use(Passport.initialize());

apolloServer.applyMiddleware({
    app,
    path: '/api/v1/gql'
});
app .use(ApiV1.Routes.Api.V1._, ApiV1Router)
    .use(ApiV1.Routes.Auth._,   AuthRouter)
    .get('*', (_req, res, next) => res.sendFile(Config.FrontendIndexPath, next))
    .use(((err, _req, res, _next) => {
        console.error(err);
        res.status(err.status || HttpCodes.INTERNAL_SERVER_ERROR)
           .json({ error: String(err) });
    }) as Express.ErrorRequestHandler);


Mongoose.connect(Config.MongoDbUri, { 
        useNewUrlParser: true,
        keepAlive: 1, 
        connectTimeoutMS: 30000 
    })
    .then(() => app.listen(
        Config.Port,
        () => console.log(`🚀  Server is listening on port ${Config.Port}`)
    ))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
    
process.on('SIGINT', () => Mongoose.disconnect().finally(() => process.exit(0)));
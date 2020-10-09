import express from 'express';
import path from 'path';
import {api} from './api';
import {isDevMode} from './utils';
import {viewsRouter} from './views/routes';
import AWSXRay from 'aws-xray-sdk';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT;
const DEVMODE = isDevMode();

app.use(AWSXRay.express.openSegment('PlaylistFilter'));

if (!DEVMODE) {
  app.use((req, res, next) => {
    console.log(req.headers.host);
    console.log(req.hostname);
    req.get('host');

    res.setHeader('Access-Control-Allow-Origin', `${req.protocol}://${req.get('host')}`);
    next();
  });
}

app.set('view engine', 'ejs');
app.set('views', path.join('server', 'views'));

app.use('/api', api)
app.use(viewsRouter);

app.use(cors(), express.static(path.resolve('dist', 'client'), {extensions: ['html', 'js']}));

app.use(AWSXRay.express.closeSegment());

app.listen(PORT || 8080);
console.log('listening on http://localhost:8080')

if (DEVMODE) {
  console.log('in dev mode, starting livereload');
  const livereload = require("livereload");
  const liveReloadServer = livereload.createServer({
    exts: ['css', 'js', 'png', 'gif', 'jpg', 'ejs']
  });
  liveReloadServer.watch([path.join('dist', 'client'), path.join('server', 'views')]);

  liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 10);
  });
}
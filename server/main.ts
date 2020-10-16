import express, {Router} from 'express';
import path from 'path';
import {api} from './api';
import {isDevMode} from './utils';
import {viewsRouter} from './views/routes';
import AWSXRay from 'aws-xray-sdk';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT;
const DEVMODE = isDevMode();
app.set('trust proxy', true);
app.set('view engine', 'ejs');


const healthTest = Router().get('/test', (req, res) => {
  res.sendStatus(200);
  res.end();
});

app.use('/health', healthTest);

app.use(AWSXRay.express.openSegment('PlaylistFilter'));

app.set('views', path.join('server', 'views'));

app.use('/api', api);
app.use(viewsRouter);

app.use(cors(), express.static(path.resolve('dist', 'client'), {extensions: ['html', 'js']}));

app.use(AWSXRay.express.closeSegment());

app.listen(PORT || 8080);
console.log('listening on http://localhost:8080');

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
import express, {query} from 'express';
import path from 'path';
import {api} from './api';
import {isDevMode} from './utils';
import {viewsRouter} from './views/routes';

const app = express();
const PORT = process.env.PORT;
const DEVMODE = isDevMode();

app.set('view engine', 'ejs');
app.set('views', path.join('server', 'views'));

app.use('/api', api)
app.use(viewsRouter);

app.use(express.static(path.resolve('dist', 'client'), {extensions: ['html', 'js']}));

if (DEVMODE) {
  app.use(function (req, res, next) {
    if (req.secure) {
      next();
    } else {
      res.redirect('https://' + req.headers.host + req.url);
    }
  });
  app.enable('trust proxy');
}

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
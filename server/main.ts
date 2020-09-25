import express from 'express';
import path from 'path';
import {api} from './api';

const app = express();
const PORT = process.env.PORT;
var env = process.env.NODE_ENV || 'development';
const DEVMODE = env === 'development';

app.set('view engine', 'ejs');
app.set('views', path.join('server', 'views'));

app.get('/', (req, res) => {
  res.render('index', {dev: DEVMODE});
});

app.get('/redirect', (req, res) => {
  res.render('redirect', {dev: DEVMODE});
});

app.use('/api', api)
app.use(express.static(path.resolve('dist', 'client'), {extensions: ['html', 'js']}));

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
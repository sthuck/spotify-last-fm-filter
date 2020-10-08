import {Request, Router} from 'express';
import cookieParser from 'cookie-parser';
import {isDevMode} from '../utils';

const DEVMODE = isDevMode();
const cdn = process.env.CDN_URL || '/';

const pageNames = ['Pick playlist', 'Set filter', 'Save new playlist'];
const urls = ['pick-playlist', 'set-filter', 'save'];

const getStateObj = (req: Request) => {
  let stateObj = {};
  try {
    const state = req.cookies.state;
    stateObj = JSON.parse(decodeURIComponent(Buffer.from(state, 'base64').toString()));
  } catch (e) {}
  return stateObj;
}

const router = Router();
router.use(cookieParser());

router.get('/', (req, res) => {
  const state = getStateObj(req);
  res.render('index', {dev: DEVMODE, state, baseApi: '/', cdn});
});

router.get('/redirect', (req, res) => {
  res.render('redirect', {dev: DEVMODE});
});

urls.forEach((url, index) => {
  router.get(`/${url}`, (req, res) => {
    const state = getStateObj(req);
    res.render(url, {
      dev: DEVMODE,
      pageNames,
      urls,
      pageIndex: index,
      pageName: pageNames[index],
      jsScript: url,
      state,
      baseApi: '/',
      cdn
    });
  });
});


export const viewsRouter = router;
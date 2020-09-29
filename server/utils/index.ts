import {AxiosError} from 'axios';
import {RequestHandler} from 'express';

var env = process.env.NODE_ENV || 'development';
const DEVMODE = env === 'development';

export const asyncHandler = (fn: RequestHandler): RequestHandler => (req, res, next) => {
  fn(req, res, next).catch(e => {
    console.error(e);
    if (DEVMODE) {
      res.status(500);
      res.json(e);
      res.end();
    } else {
      res.sendStatus(500);
    }
  });
};

export const isDevMode = () => {
  return DEVMODE;
};

export const axiosHandler = (err: AxiosError) => {
  if (err.response) {
    throw new Error(`${err.name}::${err.message}:: ${err.response.status}:: ${JSON.stringify(err.response.data)}`);
  } else if (err.request) {
    throw new Error(`${err.name}::${err.message} :: ${JSON.stringify(err.request)}`);
  } else {
    throw err;
  }
};
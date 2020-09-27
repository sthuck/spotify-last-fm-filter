import {RequestHandler} from 'express';

export const asyncHandler = (fn: RequestHandler): RequestHandler => (req, res, next) => {
  fn(req, res, next).catch(e => {
    console.error(e);
    res.sendStatus(500);
  });
}

export const isDevMode = () => {
  var env = process.env.NODE_ENV || 'development';
  const DEVMODE = env === 'development';
  return DEVMODE;
}
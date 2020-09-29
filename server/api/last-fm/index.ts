import {Router, Request} from "express";
import {LastFmApi} from "../../services/lastfm-api";
import {asyncHandler} from "../../utils";
const lastFmClient = new LastFmApi()

type SameLength<T extends readonly any[]> = {[K in keyof T]: string};


const getQueryParams = (req: Request) => <T extends readonly string[]>(...keys: T): SameLength<T> => {
  const values = keys.map(key => {
    const value = req.query[key];
    if (value !== undefined && value !== null && typeof value === 'string') {
      return value;
    }
    throw new Error(`Missing query param ${key}`);
  }) as readonly string[] as SameLength<T>;
  return values;
}



export const lastFmRouter = Router()
  .get('/session', asyncHandler(async (req, res) => {
    const params = getQueryParams(req)('token');
    const r = await lastFmClient.getSession(...params);
    res.json(r);
  })).
  get('/track-info', asyncHandler(async (req, res) => {
    const params = getQueryParams(req)('sk', 'track', 'artist', 'username');
    const r = await lastFmClient.trackInfo(...params);
    res.json(r);
  }))
  .get('/artist-info', asyncHandler(async (req, res) => {
    const params = getQueryParams(req)('sk', 'artist', 'username');
    const r = await lastFmClient.artistInfo(...params);
    res.json(r);
  }))
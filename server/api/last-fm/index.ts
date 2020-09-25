import {Router} from "express";
import {LastFmApi} from "../../services/lastfm-api";
import {asyncHandler} from "../../utils";
const lastFmClient = new LastFmApi()

export const lastFmRouter = Router()
  .get('/session', asyncHandler(async (req, res) => {
    const token = req.query.token;
    if (token && typeof token === 'string') {
      const r = await lastFmClient.getSession(token)
      res.json(r);
      return;
    };
    throw new Error('missing token query param')
  }));
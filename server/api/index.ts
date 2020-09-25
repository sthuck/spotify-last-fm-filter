import {Router} from 'express'
import {lastFmRouter} from './last-fm'
export const api = Router().use('/last-fm', lastFmRouter);

import express from 'express';
import { matchCooks } from '../contorllers/aicontroller.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/match-cooks', auth, matchCooks);

export default router;

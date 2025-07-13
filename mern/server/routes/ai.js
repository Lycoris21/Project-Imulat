import express from 'express';
import AIController from '../controllers/aiController.js';

const router = express.Router();

router.post('/evaluate-truth-index', AIController.evaluateTruthIndex);

export default router;

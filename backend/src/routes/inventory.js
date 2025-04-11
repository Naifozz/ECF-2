import express from 'express';
import { getInventoryByUserId } from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/:userId', getInventoryByUserId);

export default router;

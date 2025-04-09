import express from 'express';
import { getInventoryByUserId } from '../repositories/inventoryRepository';

const router = express.Router();

router.get('/:userId', getInventoryByUserId);

export default router;

import express from 'express';
import { 
  getInteractions, 
  getInteraction, 
  createInteraction, 
  updateInteraction, 
  deleteInteraction,
  getInteractionsByCustomer,
  getPendingFollowUps,
  completeFollowUp
} from '../controllers/interactionController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/error.js';
import { createInteractionValidator } from '../middleware/validators.js';

const router = express.Router();

router.get('/followups', protect, getPendingFollowUps);
router.get('/customer/:customerId', protect, getInteractionsByCustomer);

router.route('/')
  .get(protect, getInteractions)
  .post(protect, createInteractionValidator, validate, createInteraction);

router.route('/:id')
  .get(protect, getInteraction)
  .put(protect, updateInteraction)
  .delete(protect, deleteInteraction);

router.patch('/:id/followup-complete', protect, completeFollowUp);

export default router;

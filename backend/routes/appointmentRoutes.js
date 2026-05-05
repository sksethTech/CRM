import express from 'express';
import { 
  getAppointments, 
  getAppointment, 
  createAppointment, 
  updateAppointment, 
  cancelAppointment,
  getCalendar,
  sendReminder
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/error.js';
import { 
  createAppointmentValidator, 
  updateAppointmentValidator 
} from '../middleware/validators.js';

const router = express.Router();

router.get('/calendar', protect, getCalendar);

router.route('/')
  .get(protect, getAppointments)
  .post(protect, createAppointmentValidator, validate, createAppointment);

router.route('/:id')
  .get(protect, getAppointment)
  .put(protect, updateAppointmentValidator, validate, updateAppointment)
  .delete(protect, cancelAppointment);

router.post('/:id/remind', protect, sendReminder);

export default router;

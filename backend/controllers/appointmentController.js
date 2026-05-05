import Appointment from '../models/Appointment.js';

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    const { startDate, endDate, staffId, status } = req.query;
    
    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    }
    
    if (staffId) query.staffId = staffId;
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('customerId', 'firstName lastName email phone')
      .populate('staffId', 'firstName lastName email')
      .sort({ date: 1, timeSlot: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customerId', 'firstName lastName email phone addresses')
      .populate('staffId', 'firstName lastName email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  try {
    // Check availability if staff is assigned
    if (req.body.staffId) {
      const available = await Appointment.checkAvailability(
        req.body.date,
        req.body.timeSlot,
        req.body.staffId
      );

      if (!available) {
        return res.status(400).json({
          success: false,
          message: 'Time slot is not available for selected staff'
        });
      }
    }

    const appointment = await Appointment.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customerId', 'firstName lastName email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if can be cancelled
    if (!appointment.canCancel()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel appointment less than 2 hours before scheduled time'
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get calendar view
// @route   GET /api/appointments/calendar
// @access  Private
export const getCalendar = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month are required'
      });
    }

    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0);

    const appointments = await Appointment.getByDateRange(startDate, endDate);

    // Group by date
    const calendar = {};
    appointments.forEach(apt => {
      const dateKey = apt.date.toISOString().split('T')[0];
      if (!calendar[dateKey]) {
        calendar[dateKey] = [];
      }
      calendar[dateKey].push(apt);
    });

    res.json({
      success: true,
      data: calendar
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send appointment reminder
// @route   POST /api/appointments/:id/remind
// @access  Private
export const sendReminder = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customerId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // In production, send email/SMS here using nodemailer or SMS service
    // For now, just mark as sent
    appointment.remindersSent = true;
    appointment.reminderDates.push(new Date());
    await appointment.save();

    res.json({
      success: true,
      message: 'Reminder sent successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

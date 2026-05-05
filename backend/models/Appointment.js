import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  appointmentType: {
    type: String,
    enum: ['consultation', 'fitting', 'collection', 'viewing', 'repair'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 30, // minutes
    min: 15,
    max: 180
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  staffName: String,
  purpose: {
    type: String,
    trim: true
  },
  notes: String,
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  remindersSent: {
    type: Boolean,
    default: false
  },
  reminderDates: [{
    type: Date
  }],
  location: {
    type: String,
    enum: ['store', 'home-visit', 'virtual'],
    default: 'store'
  },
  storeLocation: String
}, {
  timestamps: true
});

// Indexes for better query performance
appointmentSchema.index({ date: 1, timeSlot: 1 });
appointmentSchema.index({ customerId: 1 });
appointmentSchema.index({ staffId: 1 });
appointmentSchema.index({ status: 1 });

// Validate that appointment date is in the future
appointmentSchema.pre('save', function(next) {
  if (this.isNew && this.date < new Date()) {
    const err = new Error('Appointment date must be in the future');
    err.name = 'ValidationError';
    return next(err);
  }
  next();
});

// Virtual for appointment end time
appointmentSchema.virtual('endTime').get(function() {
  const startDate = new Date(this.date);
  startDate.setMinutes(startDate.getMinutes() + this.duration);
  return startDate;
});

// Method to check if appointment can be cancelled
appointmentSchema.methods.canCancel = function() {
  const now = new Date();
  const appointmentTime = new Date(`${this.date.toISOString().split('T')[0]}T${this.timeSlot}`);
  const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);
  
  return hoursUntilAppointment > 2; // Can cancel up to 2 hours before
};

// Static method to get appointments by date range
appointmentSchema.statics.getByDateRange = function(startDate, endDate, staffId = null) {
  const query = {
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  if (staffId) {
    query.staffId = staffId;
  }
  
  return this.find(query)
    .populate('customerId', 'firstName lastName email phone')
    .populate('staffId', 'firstName lastName email')
    .sort({ date: 1, timeSlot: 1 });
};

// Static method to check availability
appointmentSchema.statics.checkAvailability = async function(date, timeSlot, staffId) {
  const existingAppointment = await this.findOne({
    date: new Date(date),
    timeSlot,
    staffId,
    status: { $nin: ['cancelled', 'no-show'] }
  });
  
  return !existingAppointment;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;

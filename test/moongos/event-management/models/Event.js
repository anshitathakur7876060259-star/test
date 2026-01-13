const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    minlength: [3, 'Event name must be at least 3 characters'],
    maxlength: [50, 'Event name must be at most 50 characters'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  participants: {
    type: [String],
    required: [true, 'At least one participant is required'],
    validate: {
      validator: function(value) {
        return value && value.length > 0;
      },
      message: 'At least one participant must be added'
    }
  },
  ticketPrice: {
    type: Number,
    required: [true, 'Ticket price is required'],
    min: [0.01, 'Ticket price must be positive'],
    max: [9999.99, 'Ticket price must be less than 10,000'],
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: 'Ticket price must be positive'
    }
  }
}, {
  timestamps: true
});

// Pre-save hook: Capitalize first letter of each word in event name
eventSchema.pre('save', function(next) {
  if (this.name) {
    this.name = this.name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  next();
});

// Post-save hook: Log success message
eventSchema.post('save', function(doc, next) {
  console.log('Event added successfully.');
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

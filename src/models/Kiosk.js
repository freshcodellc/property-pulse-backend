const mongoose = require('mongoose');
const KioskSchema = new mongoose.Schema(
  {
    name: String,
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company.groups',
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    },
    history: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
        },
        beginDate: Date,
        endDate: Date,
      },
    ],
    provisionCode: String,
    lastActive: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Kiosk', KioskSchema);

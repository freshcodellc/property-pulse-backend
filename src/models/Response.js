const mongoose = require('mongoose');
const ResponseSchema = new mongoose.Schema(
  {
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
    kiosk: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Kiosk',
    },
    response: mongoose.Schema.Types.Mixed,
    comments: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Response', ResponseSchema);

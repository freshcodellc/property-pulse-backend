const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    type: {
      type: String,
      enum: ['admin', 'company_admin', 'group_admin'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company.groups',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);

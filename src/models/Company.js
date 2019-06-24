const mongoose = require('mongoose');
const GroupSchema = new mongoose.Schema({
  name: String,
});
const CompanySchema = new mongoose.Schema(
  {
    name: String,
    groups: [GroupSchema],
  },
  { timestamps: true }
);
module.exports = mongoose.model('Company', CompanySchema);

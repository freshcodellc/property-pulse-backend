const mongoose = require('mongoose');
const ResponseSchema = new mongoose.Schema({
  text: String,
  value: mongoose.Schema.Types.Mixed,
  askForComments: Boolean,
});
const QuestionSchema = new mongoose.Schema(
  {
    text: String,
    type: {
      type: String,
      enum: ['boolean', 'multiple-choice', 'multiple-response'],
    },
    responses: [ResponseSchema],
  },
  { timestamps: true }
);
module.exports = mongoose.model('Question', QuestionSchema);

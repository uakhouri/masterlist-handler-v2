const mongoose = require('mongoose');

const trialSchema = new mongoose.Schema({
  nct: { type: String, required: true },
  title: String,
  phase: String,
  study_type: String,
  sponsor: String,
  url: String,
  location: [String],
  inclusion_criteria: [String],
  exclusion_criteria: [String]
});

const masterlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    cancerType: {
      type: String,
      required: true,
      trim: true
    },
    trials: [trialSchema],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

masterlistSchema.index({ name: 'text', cancerType: 'text' });

module.exports = mongoose.model('Masterlist', masterlistSchema);

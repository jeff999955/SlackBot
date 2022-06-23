const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProblemSchema = new Schema({
  stat: {
    question_id: {
      type: Number,
      required: true,
    },
    question__article__live: {
      type: Mixed,
    },
    question__article__slug: {
      type: Mixed,
    },
    question__article__has_video_solution: {
      type: Mixed,
    },
    question__title: {
      type: String,
      required: true,
    },
    question__title_slug: {
      type: String,
      required: true,
    },
    question__hide: {
      type: Boolean,
      required: true,
    },
    total_acs: {
      type: Number,
      required: true,
    },
    total_submitted: {
      type: Number,
      required: true,
    },
    frontend_question_id: {
      type: Number,
    },
    is_new_question: {
      type: Boolean,
    },
  },
  status: {
    type: Mixed,
  },
  difficulty: {
    level: {
      type: Number,
      required: true,
    },
  },
  paid_only: {
    type: Boolean,
    required: true,
  },
  is_favor: {
    type: Boolean,
  },
  frequency: {
    type: Number,
  },
  progress: {
    type: Number,
  },
});

const Problem = mongoose.model('problem', ProblemSchema);

module.exports = Problem;
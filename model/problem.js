"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Problem = void 0;
const mongoose_1 = require("mongoose");
const ProblemSchema = new mongoose_1.Schema({
    stat: {
        question_id: {
            type: Number,
            required: true,
        },
        question__article__live: {
            type: mongoose_1.Schema.Types.Mixed,
        },
        question__article__slug: {
            type: mongoose_1.Schema.Types.Mixed,
        },
        question__article__has_video_solution: {
            type: mongoose_1.Schema.Types.Mixed,
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
        type: mongoose_1.Schema.Types.Mixed,
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
    done: {
        type: Boolean,
        default: false,
    }
});
const Problem = (0, mongoose_1.model)('problem', ProblemSchema);
exports.Problem = Problem;

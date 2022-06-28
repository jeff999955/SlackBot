"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bolt_1 = require("@slack/bolt");
const mongoose_1 = __importDefault(require("mongoose"));
const problem_1 = require("./model/problem");
const randomChoice = require("random-choice");
const randomSample = require("@stdlib/random-sample");
const cron = require("node-cron");
require("dotenv").config();
mongoose_1.default.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose_1.default.connection;
const slackApp = new bolt_1.App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});
const getDifficulty = () => {
    const difficulty = randomChoice([1, 2, 3], [1, 3, 2]);
    const numProblems = [0, 2, 1, 1][difficulty];
    return [difficulty, numProblems];
};
const parseProblem = (problem) => {
    // TODO: clarify type of problem
    const slug = problem["stat"]["question__title_slug"];
    const url = `https://leetcode.com/problems/${slug}`;
    return url;
};
const getMessage = (problemResponse) => {
    const { difficulty, numProblems, problems } = problemResponse;
    const today = new Date();
    const difficultyString = '"' + ["", "easy", "medium", "hard"][difficulty] + '"';
    const slackMessage = `It's ${today.toLocaleDateString("zh-TW").split("T")[0]} today.\nToday's difficulty is *${difficultyString}*, with ${numProblems} problems.`;
    let problemMessage = "";
    for (const problem in problems)
        problemMessage += parseProblem(problem) + "\n";
    const finalMessage = slackMessage + "\n" + problemMessage;
    return finalMessage;
};
const findLeetcodeProblems = (condition) => __awaiter(void 0, void 0, void 0, function* () {
    return yield problem_1.Problem.find(condition);
});
const getLeetcodeProblems = (difficulty, numProblems) => __awaiter(void 0, void 0, void 0, function* () {
    const condition = {
        "difficulty.level": difficulty,
        done: false,
    };
    const problems = yield findLeetcodeProblems(condition);
    const returnProblems = randomSample(problems, {
        size: numProblems,
        replace: false,
    });
    returnProblems.forEach((problem) => problem_1.Problem.findByIdAndUpdate(problem._id.toString(), { done: true }).exec());
    return {
        difficulty: difficulty,
        numProblems: numProblems,
        problems: returnProblems
    };
});
const generateDailyProblemMessage = () => __awaiter(void 0, void 0, void 0, function* () {
    const [difficulty, numProblems] = getDifficulty();
    const problemResponse = yield getLeetcodeProblems(difficulty, numProblems);
    const message = getMessage(problemResponse);
    return message;
});
db.on("error", (e) => console.error(e));
db.once("open", () => {
    console.log("connected to mongoDB");
    cron.schedule("*/5 * * * * *", () => __awaiter(void 0, void 0, void 0, function* () { return console.log(generateDailyProblemMessage()); }));
});

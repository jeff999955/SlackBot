import { App } from "@slack/bolt";
import mongoose from "mongoose";
import { Problem } from "./model/problem";

const randomChoice = require("random-choice");
const randomSample = require("@stdlib/random-sample");
const cron = require("node-cron");

require("dotenv").config();

mongoose.connect(process.env.MONGO_URL as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} as mongoose.ConnectOptions);

const db = mongoose.connection;
interface ProblemResponse {
    difficulty: number,
    numProblems: number,
    problems: Array<any>
}
const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

const getDifficulty = () => {
    const difficulty: number = randomChoice([1, 2, 3], [1, 3, 2]);
    const numProblems: number = [0, 2, 1, 1][difficulty];
    return [difficulty, numProblems];
}

const parseProblem = (problem: any) => {
    // TODO: clarify type of problem
    const slug: string = problem["stat"]["question__title_slug"];
    const url: string = `https://leetcode.com/problems/${slug}`;
    return url;
};

const getMessage = (problemResponse: ProblemResponse): string => {
    const { difficulty, numProblems, problems } = problemResponse;
    const today = new Date();
    const difficultyString =
        '"' + ["", "easy", "medium", "hard"][difficulty] + '"';
    const slackMessage = `It's ${today.toLocaleDateString("zh-TW").split("T")[0]
        } today.\nToday's difficulty is *${difficultyString}*, with ${numProblems} problems.`;
    let problemMessage: string = "";
    for (const problem in problems)
        problemMessage += parseProblem(problem) + "\n";
    const finalMessage = slackMessage + "\n" + problemMessage;
    return finalMessage;
};

const findLeetcodeProblems = async (condition: Object) => {
    return await Problem.find(condition);
}


const getLeetcodeProblems = async (difficulty: number, numProblems: number): Promise<ProblemResponse> => {
    const condition: Object = {
        "difficulty.level": difficulty,
        done: false,
    };
    const problems = await findLeetcodeProblems(condition);
    const returnProblems = randomSample(problems, {
        size: numProblems,
        replace: false,
    });
    returnProblems.forEach((problem: any) => Problem.findByIdAndUpdate(problem._id.toString(), { done: true }).exec());
    return {
        difficulty: difficulty,
        numProblems: numProblems,
        problems: returnProblems
    };
};

const generateDailyProblemMessage = async () => {
    const [difficulty, numProblems] = getDifficulty();
    const problemResponse = await getLeetcodeProblems(difficulty, numProblems);
    const message = getMessage(problemResponse);
    return message;
}

db.on("error", (e) => console.error(e));
db.once("open", () => {
    console.log("connected to mongoDB");
    cron.schedule("*/5 * * * * *", async () => console.log(generateDailyProblemMessage()));
});



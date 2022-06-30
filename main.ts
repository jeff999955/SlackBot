import { App } from "@slack/bolt";
import mongoose from "mongoose";
import { Problem } from "./model/problem";
import { sendSlackMessage } from "./slack";


const randomChoice = require("random-choice");
const randomSample = require("@stdlib/random-sample");
const cron = require("node-cron");

require("dotenv").config();

mongoose.connect(process.env.MONGO_URL as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} as mongoose.ConnectOptions);

const db = mongoose.connection;

const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

const difficultyValueMap: Record<Difficulty, number> = {
    'easy': 1,
    'medium': 2,
    'hard': 3,
};

const difficultyNumProblemsMap: Record<Difficulty, number> = {
    'easy': 2,
    'medium': 1,
    'hard': 1,
};

const getDifficulty = (): [Difficulty, number] => {
    const weight = [1, 3, 2];
    const difficulties: Difficulty[] = ["easy", "medium", "hard"];
    const difficulty: Difficulty = randomChoice(difficulties, weight);
    const numProblems: number = difficultyNumProblemsMap[difficulty];
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
        '"' + difficulty.toString() + '"';
    const slackMessage = `It's ${today.toLocaleDateString("zh-TW").split("T")[0]
        } today.\nToday's difficulty is *${difficultyString}*, with ${numProblems} problems.`;
    let problemMessage: string = "";
    for (const problem of problems) {
        problemMessage += parseProblem(problem) + "\n";
    }
    const finalMessage = slackMessage + "\n" + problemMessage;
    return finalMessage;
};

const findLeetcodeProblems = async (condition: Object) => {
    return await Problem.find(condition);
}


const getLeetcodeProblems = async (difficulty: Difficulty, numProblems: number, toUpdate: boolean = true): Promise<ProblemResponse> => {
    const condition: Object = {
        "difficulty.level": difficultyValueMap[difficulty],
        done: false,
    };
    const problems = await findLeetcodeProblems(condition);
    const returnProblems = randomSample(problems, {
        size: numProblems,
        replace: false,
    });
    toUpdate && returnProblems.forEach((problem: any) => Problem.findByIdAndUpdate(problem._id.toString(), { done: true }).exec());
    return {
        difficulty,
        numProblems,
        problems: returnProblems
    };
};

const generateDailyProblemMessage = async (toUpdate: boolean = true) => {
    const [difficulty, numProblems] = getDifficulty();
    const problemResponse = await getLeetcodeProblems(difficulty, numProblems, toUpdate);
    const message = getMessage(problemResponse);
    return message;
}

db.on("error", (e) => console.error(e));
db.once("open", () => {
    console.log("connected to mongoDB");
    cron.schedule("0 9 * * *", async () => {
        const slackMessage = await generateDailyProblemMessage();
        console.log(slackMessage);
        sendSlackMessage(slackApp, 'leetcode', slackMessage);
    });
});



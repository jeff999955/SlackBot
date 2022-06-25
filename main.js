const cron = require("node-cron");
const { App } = require("@slack/bolt");
const WebSocket = require("ws");
const randomChoice = require("random-choice");
const { sendMessage } = require("./slack");

require("dotenv").config();

const ws = new WebSocket(`ws://localhost:${process.env.PORT}`);

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

ws.on("open", async () => {
  const sendData = (data) => {
    ws.send(JSON.stringify(data));
  };
  console.log("connected to websocket");
  const getDifficultyNumber = () => {
    const difficulty = randomChoice([1, 2, 3], [1, 3, 2]);
    const numProblems = [0, 3, 2, 1][difficulty];
    return [difficulty, numProblems];
  };
  const generateProblems = () => {
    const [difficulty, numProblems] = getDifficultyNumber();
    sendData([
      "generate",
      { difficulty: difficulty, numProblems: numProblems },
    ]);
  };

  cron.schedule("*/5 * * * * *", async () => {
    console.log("spamming...");
    generateProblems();
  });
});

ws.on("message", (data) => {
  const [task, payload] = JSON.parse(data);
  const today = new Date();
  const parseProblem = (data) => {
    const title = data["stat"]["question__title"],
      slug = data["stat"]["question__title_slug"];

    const url = `https://leetcode.com/problems/${slug}/`;
    return url;
  };

  switch (task) {
    case "generate_success":
      const slackMessage = `It's ${today.toLocaleDateString('zh-TW').split('T')[0]} today.\nToday's difficulty is ${payload.difficulty}, with ${payload.numProblems} problems.`;
      var problemMessage = "";
      for (const problem of payload.problems) {
        problemMessage += parseProblem(problem) + "\n";
      }
      const finalMessage = slackMessage + "\n" + problemMessage;
      console.log(finalMessage);
      sendMessage(app, 'test', finalMessage);
      break;
    default:
      console.log(task);
      console.log(payload);
      break;
  }
});

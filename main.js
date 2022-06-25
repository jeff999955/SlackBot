const cron = require("node-cron");
const { App } = require("@slack/bolt");
const axios = require("axios");
const WebSocket = require("ws");
const getProblem = require("./leetcode");
const randomChoice = require("random-choice");
const {getChannel, sendMessage} = require("./slack");

require("dotenv").config();

const ws = new WebSocket(`ws://localhost:${process.env.PORT}`);

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

  const problems = await getProblem();
  generateProblems();
  // cron.schedule("* * * * * *", () => console.log("test"));
});

ws.on("message", (data) => {
  const [task, payload] = JSON.parse(data);
  const parseProblem = (data) => {
    const title = data["stat"]["question__title"],
      slug = data["stat"]["question__title_slug"];

    const url = `https://leetcode.com/problems/${slug}/`;
    return url;
  };

  switch (task) {
    case "success":
      const slackMessage = `Today's difficulty is ${payload.difficulty}, with ${payload.numProblems} problems.`;
      var problemMessage = '';
      for (const problem of payload.problems) {
        problemMessage += parseProblem(problem) + "\n";
      }
      const finalMessage = slackMessage + "\n" + problemMessage;
      console.log(finalMessage);
  }
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

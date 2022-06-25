const cron = require("node-cron");
const { App } = require("@slack/bolt");
const WebSocket = require("ws");
const randomChoice = require("random-choice");
const { sendSlackMessage } = require("./slack");

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
    const numProblems = [0, 2, 1, 1][difficulty];
    return [difficulty, numProblems];
  };
  const generateProblems = () => {
    const [difficulty, numProblems] = getDifficultyNumber();
    sendData([
      "generate",
      { difficulty: difficulty, numProblems: numProblems },
    ]);
  };

  cron.schedule("0 9 * * *", async () => generateProblems());
});

ws.on("message", (data) => {
  const [task, payload] = JSON.parse(data);
  const today = new Date();
  const { difficulty, numProblems, problems } = payload;
  const difficultyString =
    '"' + ["", "easy", "medium", "hard"][difficulty] + '"';
  const parseProblem = (data) => {
    const title = data["stat"]["question__title"],
      slug = data["stat"]["question__title_slug"];

    const url = `https://leetcode.com/problems/${slug}/`;
    return url;
  };

  switch (task) {
    case "generate_success":
      const slackMessage = `It's ${
        today.toLocaleDateString("zh-TW").split("T")[0]
      } today.\nToday's difficulty is *${difficultyString}*, with ${numProblems} problems.`;
      var problemMessage = "";
      for (const problem of problems) {
        problemMessage += parseProblem(problem) + "\n";
      }
      const finalMessage = slackMessage + "\n" + problemMessage;
      console.log(finalMessage);
      sendSlackMessage(app, "leetcode", finalMessage);
      break;
    default:
      console.log(task);
      console.log(payload);
      break;
  }
});

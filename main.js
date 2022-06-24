const cron = require("node-cron");
const { App } = require("@slack/bolt");
const axios = require("axios");
const WebSocket = require("ws");
const getProblem = require("./leetcode");

require("dotenv").config();

const ws = new WebSocket("ws://localhost:4000");

ws.on("open", async () => {
  const sendData = (data) => {
    ws.send(JSON.stringify(data));
  };
  console.log("connected to websocket");

  const problems = await getProblem();
  console.log(problems.length);
  console.log(problems[0]);
  sendData(["insert", problems]);
});

ws.on("message", (data) => {
  console.log(data);
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// cron.schedule("* * * * * *", () => console.log("test"));

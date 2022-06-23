const cron = require("node-cron");
const { App } = require("@slack/bolt");
const axios = require("axios");
require("dotenv").config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// cron.schedule("* * * * * *", () => console.log("test"));
const getChannel = async (channelName) => {
  const channels = await app.client.conversations.list();
  const channel = channels.channels.find(
    (channel) => channel.name === channelName
  );
  return channel;
};

const sendMessage = async (channelName, message) => {
  var channel = await getChannel(channelName);
  if (channel === undefined) return;
  var result = await app.client.chat.postMessage({
    channel: channel.id,
    text: message,
  });
  return result;
};

// sendMessage("test", "https://www.google.com").then((result) =>
//   console.log(result)
// );

const leetcodeAPIEndpoint = "https://leetcode.com/api/problems/algorithms/";
const leetcodeBaseURL = "https://leetcode.com/problems/";

const getProblem = async () => {
  const ret = [];
  const leetcodeData = await axios.get(leetcodeAPIEndpoint);
  const problems = leetcodeData.data.stat_status_pairs;
  console.log(problems.length);
  for (var i = 0; i < problems.length; i++) {
    const problem = problems[i];
    if (problem.paid_only) continue;
    ret.push(problem);
  }
  return ret;
};

getProblem().then((res) => {
  console.log(`${typeof res} ${res.length}`);
  console.log(res[0]);
}); //console.log(res));

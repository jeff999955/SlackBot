const { App } = require("@slack/bolt");
require("dotenv").config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const getChannel = async (app, channelName) => {
  const channels = await app.client.conversations.list();
  const channel = channels.channels.find(
    (channel) => channel.name === channelName
  );
  return channel;
};

const sendSlackMessage = async (app, channelName, message) => {
  var channel = await getChannel(app, channelName);
  if (channel === undefined) return;
  var result = await app.client.chat.postMessage({
    channel: channel.id,
    text: message,
  });
  return result;
};

module.exports = {
  getChannel,
  sendSlackMessage,
};

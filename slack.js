const getChannel = async (app, channelName) => {
  const channels = await app.client.conversations.list();
  const channel = channels.channels.find(
    (channel) => channel.name === channelName
  );
  return channel;
};

const sendMessage = async (app, channelName, message) => {
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

module.exports = {
  getChannel,
  sendMessage,
};

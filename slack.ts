import { App } from "@slack/bolt";
import { ChatPostMessageArguments } from "@slack/web-api";
import { Channel } from "@slack/web-api/dist/response/AdminUsergroupsListChannelsResponse";

const getChannel = async (app: App, channelName: string) => {
    const response = await app.client.conversations.list();
    if (response.channels === undefined) throw "Channels are not defined";
    const channel: Channel | undefined = response.channels.find(
        (channel) => channel.name === channelName
    );
    return channel;
}

const sendSlackMessage = async (app: App, channelName: string, message: string) => {
    let channel: Channel | undefined;
    try {
        channel = await getChannel(app, channelName);
    } catch (e: any) {
        throw "Send message failed because" + e.message;
    }
    if (channel === undefined) return;
    const result = await app.client.chat.postMessage({
        channel: channel.id,
        text: message,
    } as ChatPostMessageArguments);
    return result;
};

export {
    getChannel,
    sendSlackMessage,
};

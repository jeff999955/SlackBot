"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSlackMessage = exports.getChannel = void 0;
const getChannel = (app, channelName) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield app.client.conversations.list();
    if (response.channels === undefined)
        throw "Channels are not defined";
    const channel = response.channels.find((channel) => channel.name === channelName);
    return channel;
});
exports.getChannel = getChannel;
const sendSlackMessage = (app, channelName, message) => __awaiter(void 0, void 0, void 0, function* () {
    let channel;
    try {
        channel = yield getChannel(app, channelName);
    }
    catch (e) {
        throw "Send message failed because" + e.message;
    }
    if (channel === undefined)
        return;
    const result = yield app.client.chat.postMessage({
        channel: channel.id,
        text: message,
    });
    return result;
});
exports.sendSlackMessage = sendSlackMessage;

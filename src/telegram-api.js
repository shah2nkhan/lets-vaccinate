"use strict";
const axios = require("axios");
const { buildFormattedString } = require("./helpers");
const TelegramData = require("../data/telegram.json");
const { API_TOKEN } = TelegramData;

const deleteMessages = async (chatId, messages) => {
    if (messages !== undefined &&
        Array.isArray(messages) && messages.length > 0) {
        const cloneMessages = Array.from(messages);
        for (const message of cloneMessages) {
            try {
                await axios.get(`https://api.telegram.org/${API_TOKEN}/deleteMessage?chat_id=${chatId}&message_id=${message}`);
            } catch (ex) {
                console.error(`fail to delete on messenger Status: ${err.response?.status}`, err.response?.data);
            }
        }
    }
}


const writeToTelegramStringArray = async (chatId, messagesStringArr) => {
    const messageIds = await Promise.all(messagesStringArr.map(async message => {
        if (message !== undefined && message !== null) {
            try {
                const result = await axios.get(`https://api.telegram.org/${API_TOKEN}/sendMessage?chat_id=${chatId}&text=${message}`);
                return result.data.result.message_id;
            }
            catch (err) {
                console.error(`fail to write on messenger Status: ${err.response?.status}`, err.response?.data);
            }
        }
        return undefined;
    }
    ));
    return messageIds.filter(p => p !== undefined);
}

const writeMessagesToTelegram = async (chatId, messagesArray) => {
    return await writeToTelegramStringArray(chatId, messagesArray.map(p => buildFormattedString(p)));
}

const cleanUpOldChat = async (chatId, start, end) => {
    return deleteMessages(chatId, [...Array((end - start)).keys()].map(i => i + start));
}

module.exports =
{
    deleteMessages,
    cleanUpOldChat,
    writeMessagesToTelegram
}


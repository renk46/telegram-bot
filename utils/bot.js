/**
 * Created by vlad on 01.11.2018.
 */
"use strict";

const debug = require('debug')('telegrambot:server');
const config = require('config');

const c_api = config.get('Api');
const c_socks = config.get('Socks5');

const api = require('../utils/api')(c_api.Host, c_api.Key, c_socks.Host, c_socks.Port);

let offset = -1;
let context_array = [];

module.exports = () => {
    return {
        processingUpdate: processingUpdate
    };
};

if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
    let url = 'setWebhook?url=https://ivan-bot-tg.herokuapp.com/hooks/' + c_api.Key;
    api.get(url);
    debug('SET WEBHOOK METHOD FOR UPDATES');
} else {
    let url = 'deleteWebhook';
    api.get(url).then(() => {
        setTimeout(Update, 1000);
        debug('SET POOLING METHOD FOR UPDATES');
    });
}

function Update() {
    let url = 'getUpdates?offset=' + offset;
    api.get(url)
        .then((result => {
            processingResponse(result);
            setTimeout(Update, 1000);
        }))
        .catch(() => {
            setTimeout(Update, 1000);
        });
}

function processingResponse(data) {
    let res = JSON.parse(data);

    if (res.ok) {
        res.result.forEach((update) => {
            processingUpdate(update);
        });
    }
}

function processingUpdate(update) {
    let text = null;

    if (update.message) {
        text = update.message.text ? update.message.text : null;

        if (text && text[0] === '/') {
            processingCommand(update);
        } else {
            processingMessage(update);
        }
    }

    offset = update.update_id + 1;
}

function processingCommand(update) {
    let text = update.message.text.slice(1);
    let arr = text.split(' ');
    let message = null;

    switch (arr[0]) {
        case 's':
            message = 'What event do you want to subscribe to?';
            sendMessage(message, update.message.chat.id);
            addingContext({
                comm: arr[0],
                user_id: update.message.from.id,
                update: update,
                try: 0
            });
            break;
        case 'help':
            message = '/s - subscribe on event';
            sendMessage(message, update.message.chat.id);
            break;
        case 'start':
            message = 'Welcome, @' + update.message.from.username + '\n\rFor all commands, please send /help';
            sendMessage(message, update.message.chat.id);
            break;
        default:
            message = 'Unknown command!\n\rFor all commands, please send /help';
            sendMessage(message, update.message.chat.id);
            break;
    }
}

function processingMessage(update) {
    let last = context_array.find((element) => {
        return element.user_id === update.message.from.id
    });

    if (last) {
        let message = null;

        switch (last.comm) {
            case 's':
                message = update.message.text + ' not possible value\r\n';
                last.try++;

                if (last.try > 2) {
                    deleteContext(last);
                    message += 'Try over';
                    sendMessage(message, update.message.chat.id);
                } else {
                    message += 'Count try - ' + (2 - (last.try - 1));
                    sendMessage(message, update.message.chat.id);
                }

                break;
            default:
                message = 'Unknown command!\n\rFor all commands, please send /help';
                sendMessage(message, update.message.chat.id);
                deleteContext(last);
                break;
        }
    }
}

function addingContext(e) {
    let last = context_array.find((element) => {
        return element.user_id === e.user_id;
    });

    if (last) return;

    context_array.push(e);
}

function deleteContext(e) {
    let index = context_array.indexOf(e);
    context_array.splice(index, 1);
}

function sendMessage(text, chat_id, keyboard) {
    let url = 'sendMessage?chat_id=' + chat_id + '&text=' + text;

    if(keyboard) {
        let inlineButton = {
            keyboard: keyboard
        };
        inlineButton = JSON.stringify(inlineButton);
        url += '&reply_markup=' + inlineButton;
    }

    return api.get(url);
}

function editMessageText(text, chat_id, message_id) {
    let url = 'editMessageText?text=' + text + '&chat_id=' + chat_id + '&message_id=' + message_id;
    return api.get(url);
}
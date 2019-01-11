// TODO Ressurect Telegram Bot

import * as TelegramBot from 'node-telegram-bot-api';
import * as Config from "./config";
import * as GqlReq from 'graphql-request';
// import * as Vts from 'vee-type-safe';
import * as Gql from '../backend/public-api/v1/gql';
export const bot = new TelegramBot(Config.BotToken, { polling: true });

function gql(str: TemplateStringsArray) {
    return str.join('');
}
// const gqlClient = new GqlReq.GraphQLClient(Config.MainServerGqlEndpoint);
// function gqlQuery<T>(
//     chatId: string,
//     query: string, 
//     variables: Vts.BasicObject
// ) {
//     gqlClient.setHeader('veetaha-tg-chat-id', chatId);
//     return gqlClient.request<T>(query, variables);
// }


//# import * from '../backend/public-api/v1/schema.gql';
bot.onText(/\/start/, async msg => {
    const fromId = msg.from!.id;
    const req: Gql.RegisterTgChatIdRequest = {
        tgChatId: msg.chat.id,
        tgUsername: msg.from!.username!
    }
    debugger;
    try {
        const res = await GqlReq.request<{
            registerTgChatId: Gql.RegisterTgChatIdResponse
        }>(
            Config.MainServerGqlEndpoint, gql `
            mutation registerTgChatId($req: RegisterTgChatIdRequest!) {
                registerTgChatId(req: $req) {
                    failure
                }
            }
        `, { req });
        console.dir(res);
        debugger;
        if (res.registerTgChatId.failure) {
            bot.sendMessage(fromId, `Error: ${res.registerTgChatId.failure}`);
            return;
        }
        bot.sendMessage(fromId, "Welcome");
    } catch (err) {
        bot.sendMessage(fromId, `Server error`);
        debugger;
        console.error(err);
    }
});
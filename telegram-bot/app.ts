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

// bot.onText(/wallets/, async function (msg) {
//     const fromId = msg.from.id;
//     const name = msg.from.username;
//     try {
//         const response = await fetch(`https://primat24.herokuapp.com/api/telegram/users/wallets?userName=${name}`);
//         if (!response) {
//             return bot.sendMessage(fromId, `Server not work`);
//         }
//         const data = await response.json();
//         if (data.err) {
//             return bot.sendMessage(fromId, `You are not registered`);

//         }
//         console.log(`username ${name} id ${fromId}`);
//         let str: string = `Your wallets \n`;
//         data.forEach(element => {
//             str = `${str}${element.currency}:${element.sum}\n`;
//         });
//         bot.sendMessage(fromId, str);
//     } catch (err) {
//         return bot.sendMessage(fromId, `Server not work`);

//     }
// });
// bot.onText(/info/, async function (msg) {
//     const fromId = msg.from.id;
//     const name = msg.from.username;
//     console.log()
//     const str = "/wallets - your wallets\n/info - info about bot";
//     bot.sendMessage(fromId, str);
// });
// // bot.on("text", async function (msg) {
// //     const fromId = msg.from.id;
// //     const name = msg.from.username;
// //     console.log(`username ${name} id ${fromId}`);
// //     const str = "your text";
// //     bot.sendMessage(fromId, str);
// // });
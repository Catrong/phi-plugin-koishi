import { Context } from "koishi"
import { Config } from ".."
import { i18nList } from "../components/i18n"
import { getInfo, send } from "../model"
import { guessLetter } from "./guessGame/index"


let games = "(提示猜曲|tipgame|ltr|letter|开字母|guess|猜曲绘)"
let gameList: { [key: string]: { gameType: string } } = {}
let rex = [new RegExp(`^.*open.*`, 'i'), new RegExp(`^.*[0-9]+\..*`, 'i'), new RegExp(`^.*tip`, 'i'), new RegExp(`^.*ans`, 'i')]

export default class phiGames {
    constructor(ctx: Context, config: Config) {
        ctx.command('phi.letter <message:text>', `开启一局开字母猜曲游戏`).action(async ({ session }, arg = "") => {
            if (gameList[session.guildId]?.gameType && gameList[session.guildId]?.gameType != 'letter') {
                send.send_with_At(session, session.text(i18nList.game.haveAnotherGame, { prefix: getInfo.getCmdPrefix(ctx, session) }))
                return;
            }
            guessLetter.start(ctx, session, gameList, arg)
        })

        // ctx.command('phi.open <string>', `翻开一个字母`).action(async ({ session }, arg = "") => {
        //     if (gameList[session.guildId]?.gameType && gameList[session.guildId]?.gameType != 'letter') {
        //     }
        //     guessLetter.reveal(ctx, session, gameList, arg)
        // })

        // ctx.command('phi.tip', `随机翻开一个字母`).action(async ({ session }) => {
        //     if (gameList[session.guildId]?.gameType && gameList[session.guildId]?.gameType != 'letter') {
        //         send.send_with_At(session, session.text(i18nList.game.haveAnotherGame, { prefix: getInfo.getCmdPrefix(ctx, session) }))
        //         return;
        //     }
        //     guessLetter.getTip(ctx, session, gameList)
        // })

        // ctx.command('phi.ans', `结束当前游戏`).action(async ({ session }) => {
        //     if (gameList[session.guildId]?.gameType && gameList[session.guildId]?.gameType != 'letter') {
        //         send.send_with_At(session, session.text(i18nList.game.haveAnotherGame, { prefix: getInfo.getCmdPrefix(ctx, session) }))
        //         return;
        //     }
        //     guessLetter.ans(ctx, session, gameList)
        // })

        ctx.middleware(async (session, next) => {
            if (gameList[session.guildId]?.gameType == 'letter') {
                if (rex[0].test(session.content)) {
                    return guessLetter.reveal(ctx, session, gameList, session.content.replace(/^.*open\s*/, '')) ? null : next();
                } else if (rex[1].test(session.content)) {
                    return guessLetter.guess(ctx, session, gameList, session.content) ? null : next();
                } else if (rex[2].test(session.content)) {
                    return guessLetter.getTip(ctx, session, gameList) ? null : next();
                } else if (rex[3].test(session.content)) {
                    return guessLetter.ans(ctx, session, gameList) ? null : next();
                }
            }
            return next()
        })
    }

}

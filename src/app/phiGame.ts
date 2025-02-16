import { Context } from "koishi"
import { Config } from ".."
import { i18nList } from "../components/i18n"
import { send } from "../model"
import { guessLetter } from "./guessGame/index"


let games = "(提示猜曲|tipgame|ltr|letter|开字母|guess|猜曲绘)"
let gameList: { [key: string]: { gameType: string } } = {}

export default class phiGames {
    constructor(ctx: Context, config: Config) {
        ctx.command('phi.letter <message:text>', `开启一局开字母猜曲游戏`).action(async ({ session }, arg = "") => {
            // 获取指令前缀
            const prefix:string = session.resolve(session.app.koishi.config.prefix)[0] ?? ''

            if (gameList[session.guildId]?.gameType && gameList[session.guildId]?.gameType != 'letter') {
                send.send_with_At(session, session.text(i18nList.haveAnotherGame,{prefix:prefix}))
                return;
            }
            guessLetter.start(session, gameList, arg)
        })

        ctx.command('phi.open <string>', `翻开一个字母`).action(async ({ session }, arg = "") => {
            // 获取指令前缀
            const prefix:string = session.resolve(session.app.koishi.config.prefix)[0] ?? ''
            if (gameList[session.guildId]?.gameType && gameList[session.guildId]?.gameType != 'letter') {
                send.send_with_At(session, session.text(i18nList.haveAnotherGame,{prefix:prefix}))
                return;
            }
            guessLetter.reveal(session, gameList, arg)
        })

        ctx.command('phi.tip', `随机翻开一个字母`).action(async ({ session }) => {
            // 获取指令前缀
            const prefix:string = session.resolve(session.app.koishi.config.prefix)[0] ?? ''
            if (gameList[session.guildId]?.gameType && gameList[session.guildId]?.gameType != 'letter') {
                send.send_with_At(session, session.text(i18nList.haveAnotherGame,{prefix:prefix}))
                return;
            }
            guessLetter.getTip(session, gameList)
        })

        ctx.command('phi.ans', `结束当前游戏`).action(async ({ session }) => {
            // 获取指令前缀
            const prefix:string = session.resolve(session.app.koishi.config.prefix)[0] ?? ''
            if (gameList[session.guildId]?.gameType && gameList[session.guildId]?.gameType != 'letter') {
                send.send_with_At(session, session.text(i18nList.haveAnotherGame,{prefix:prefix}))
                return;
            }
            guessLetter.ans(session, gameList)
        })

        ctx.middleware(async (session, next) => {
            if (gameList[session.guildId]?.gameType == 'letter') {
                return guessLetter.guess(session, gameList, session.content) ? null : next();
            }
            return next()
        })
    }

}

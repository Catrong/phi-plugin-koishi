/**Phigros出字母猜曲名游戏
 * 会随机抽选 n 首歌曲
 * 每首曲目的名字只显示一部分，剩下的部分隐藏
 * 通过给出的字母猜出相应的歌曲
 * 玩家可以翻开所有曲目响应的字母获得更多线索
*/
import { pinyin } from 'pinyin-pro'
import { config } from '../../components/Config'
import getInfo from '../../model/getInfo'
import send from '../../model/send'
import { Context, Session } from 'koishi'
import { i18nList } from '../../components/i18n'
import { fCompute } from '../../model/index'

/**存储谜底 */
let anslist: { [key: string]: string[] } = {}
/**猜对者 */
let winnerlist: { [key: string]: string[] } = {}
/**范围 */
let range: { [key: string]: string[] } = {}
/**开启的字母 */
let openlist: { [key: string]: string[] } = {}

export default class guessLetter {
    /**发起出字母猜歌 **/
    static start(ctx: Context, session: Session, gameList: { [key: string]: { gameType: string } }, msg: string) {
        let { guildId } = session // 使用对象解构提取guildId
        if (anslist[guildId]) {
            send.send_with_At(session, session.text(i18nList.game.haveAnotherGame, { prefix: getInfo.getCmdPrefix(ctx, session) }), true)
            return false
        }
        gameList[guildId] = { gameType: 'letter' }
        let totList = msg ? [] : Object.keys(getInfo.idBySong)
        range[guildId] = msg ? [] : ['phigros']
        let askList = msg.split(' ')
        // console.info(askList)
        for (let i in getInfo.DLC_Info) {
            if (askList.indexOf(i) != -1) {
                totList = totList.concat(getInfo.DLC_Info[i])
                range[guildId].push(i)
            }
        }
        // console.info(getInfo.DLC_Info)
        if (!totList.length) {
            send.send_with_At(session, session.text(i18nList.letter.notFoundSong), true)
            return false
        }
        anslist[guildId] = randFromArr(totList, config.LetterNum)

        openlist[guildId] = [' ']
        winnerlist[guildId] = []
        session.send(session.text(i18nList.letter.start) + '\n' + session.text(i18nList.letter.body, [range[guildId].join(' '), openlist[guildId].join(' '), getBlurRes(guildId, getBlurlist(guildId))]))
        return true
    }

    /** 翻开字母 **/
    static reveal(ctx: Context, session: Session, gameList: { [key: string]: { gameType: string } }, msg: string) {
        let { guildId } = session // 使用对象解构提取guildId
        msg = msg.replace(/\s/g, '')
        if (msg.length != 1) {
            /**一次只能开一个字母 */
            send.send_with_At(session, session.text(i18nList.letter.onlyCanOpenOne), true)
            return false
        }
        msg = msg.toLowerCase()
        if (openlist[guildId].includes(msg)) {
            /**开过了 */
            send.send_with_At(session, session.text(i18nList.letter.haveBeOpened), true)
            return false
        }
        if (!checkCharInSongs(guildId, msg)) {
            /**没这个 */
            send.send_with_At(session, session.text(i18nList.letter.notHaveThisLetter), true)
            return false
        }
        openlist[guildId].push(msg)
        let res = getBlurlist(guildId)
        if (checkGameOver(guildId, res)) {
            gameOver(guildId, gameList, session)
            return true
        }

        session.send(session.text(i18nList.letter.open, [msg]) + '\n' + session.text(i18nList.letter.body, [range[guildId].join(' '), openlist[guildId].join(' '), getBlurRes(guildId, res)]))

    }

    /** 猜测 **/
    static guess(ctx: Context, session: Session, gameList: { [key: string]: { gameType: string } }, msg: string) {
        let { guildId } = session // 使用对象解构提取guildId
        if (!anslist[guildId]) {
            return false
        }

        if (!msg.match(/^n[0-9]+./g)) {
            return false
        }

        let guess = msg.match(/^n[0-9]+./g)[0]

        let index = Number(guess.match(/[0-9]+/g)[0]) - 1

        if (index >= anslist[guildId].length) {
            send.send_with_At(session, session.text(i18nList.letter.guessNumIg, [index + 1]), true)
            return true
        }

        let songId = getInfo.fuzzysongsnick(msg.replace(guess, ''), 0.95)

        if (!songId[0]) {
            send.send_with_At(session, session.text(i18nList.common.notFoundSong, [msg.replace(guess, '')]), true)
            return false
        }

        if (anslist[guildId][index] != getInfo.info(songId[0]).song) {
            send.send_with_At(session, session.text(i18nList.letter.guessFalse, [index + 1, getInfo.info(songId[0]).song]), true)
            return true
        }

        send.send_with_At(session, session.text(i18nList.letter.guessTrue, [index + 1, getInfo.info(songId[0]).song]), true)

        winnerlist[guildId][index] = session?.event?.user?.name || 'true'
        let res = getBlurlist(guildId)
        if (checkGameOver(guildId, res)) {
            gameOver(guildId, gameList, session)
            return true
        }
        session.send(session.text(i18nList.letter.body, [range[guildId].join(' '), openlist[guildId].join(' '), getBlurRes(guildId, res)]))
        return true
    }

    /** 答案 **/
    static ans(ctx: Context, session: Session, gameList: { [key: string]: { gameType: string } }) {
        let { guildId } = session // 使用对象解构提取guildId
        if (!anslist[guildId]) {
            send.send_with_At(session, session.text(i18nList.letter.notFoundGame, { prefix: getInfo.getCmdPrefix(ctx, session) }), true)
            return false
        }
        gameOver(guildId, gameList, session)
        return true
    }

    /** 提示 **/
    static getTip(ctx: Context, session: Session, gameList: { [key: string]: { gameType: string } }) {
        let { guildId } = session

        if (!gameList[guildId]) {
            send.send_with_At(session, session.text(i18nList.letter.notFoundGame, { prefix: getInfo.getCmdPrefix(ctx, session) }), true)
            return false
        }

        let res = getBlurlist(guildId)
        let ans = anslist[guildId]
        let closed = []

        for (let i = 0; i < res.length; i++) {
            if (!res[i].includes('*')) {
                continue
            }
            for (let j = 0; j < res[i].length; j++) {
                if (res[i][j] === '*') {
                    closed.push(ans[i][j])
                }
            }
        }

        let tip = closed[fCompute.randBetween(0, closed.length - 1)]

        session.send(session.text(i18nList.letter.getTip, [tip]))

        openlist[guildId].push(tip)

        if (checkGameOver(guildId, res)) {
            gameOver(guildId, gameList, session)
            return true
        }

        session.send(session.text(i18nList.letter.body, [range[guildId].join(' '), openlist[guildId].join(' '), getBlurRes(guildId, res)]))

        return true
    }
}


/**从数组中随机抽取n个元素 */
function randFromArr(arr: string[], num: number) {
    let result = []
    for (let i = 0; i < num; i++) {
        let rand = Math.floor(Math.random() * arr.length)
        result.push(arr.splice(rand, 1)[0])
    }
    return result
}
/**
 * 获取谜面
 * @param guildId 
 */
function getBlurlist(guildId: string): string[] {
    let ans = anslist[guildId]
    let res = []
    for (let i = 0; i < ans.length; i++) {
        let str = ''
        for (let j = 0; j < ans[i].length; j++) {
            if (openlist[guildId].includes(pinyin(ans[i][j], { pattern: 'first', toneType: 'none', type: 'string' }).toLowerCase())) {
                // console.info(pinyin(ans[i][j], { pattern: 'first', toneType: 'none', type: 'string' }), ans[i][j])
                str += ans[i][j]
            } else {
                str += '*'
            }
        }
        res.push(str)
    }
    return res
}

function checkCharInSongs(guildId: string, letter: string) {
    let ans = anslist[guildId]
    for (let i = 0; i < ans.length; i++) {
        if (winnerlist[guildId][i]) continue
        if (pinyin(ans[i], { pattern: 'first', toneType: 'none', type: 'string' }).toLowerCase().includes(letter)) {
            return true
        }
    }
    return false
}

function checkGameOver(guildId: string, blurlist: string[]) {
    for (let i = 0; i < blurlist.length; i++) {
        if (winnerlist[guildId][i]) continue
        if (blurlist[i].includes('*')) {
            return false
        }
    }
    return true
}

function getBlurRes(guildId: string, blurlist: string[]) {
    let res = ''
    for (let i = 0; i < blurlist.length; i++) {
        res += `[${i + 1}] ${blurlist[i]}`
        if (winnerlist[guildId][i]) {
            res += ' ✓\n'
        } else {
            res += '\n'
        }
    }
    return res
}

function getAnsList(guildId: string) {
    let res = ''
    for (let i = 0; i < anslist[guildId].length; i++) {
        res += `[${i + 1}] ${anslist[guildId][i]}`
        if (winnerlist[guildId][i]) {
            res += ' ✓\n'
        } else {
            res += '\n'
        }
    }
    return res
}

function gameOver(guildId: string, gameList: { [key: string]: { gameType: string } }, session: Session) {
    let res = ''
    for (let i = 0; i < anslist[guildId].length; i++) {
        res += `[${i + 1}] ${anslist[guildId][i]}\n`
    }
    session.send(session.text(i18nList.letter.gameOver) + '\n' + session.text(i18nList.letter.body, [range[guildId].join(' '), openlist[guildId].join(' '), getAnsList(guildId)]))
    delete anslist[guildId]
    delete winnerlist[guildId]
    delete range[guildId]
    delete openlist[guildId]
    delete gameList[guildId]
}
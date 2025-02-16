import { Context, h } from "koishi";
import send from "../model/send";
import { Config } from "..";
import { logger } from "../components/Logger";
import getPluginData from "../model/getPluginData";
import PhigrosUser from "../lib/PhigrosUser";
import buildingRecord from "../model/getUpdate";
import getInfo from "../model/getInfo";
import fCompute from "../model/fCompute";
import render from "../model/render";
import getSave from "../model/getSave";
import scoreHistory from "../model/class/scoreHistory";
import { Level } from "../model/constNum";
import { idString } from "../model/type/type";

export default class phiB19 {
    constructor(ctx: Context, config: Config) {
        
        ctx.command('phi.pgr', '获取B19').option('best', '-b <val:natural> 输出bN', { fallback: 21 }).action(async ({ session, options }) => {
            // 我不知道
            if (await send.isBan(session, 'b19')) {
                return;
            }

            let save = await send.getsave_result(session)
            if (!save) {
                return;
            }


            let nnum = Number(options.best)
            if (!nnum) {
                nnum = 33
            }

            nnum = Math.max(nnum, 33)
            nnum = Math.min(nnum, config.B19MaxNum)

            let plugin_data = getPluginData.get(session.userId)


            if (!config.isGuild)
                send.send_with_At(session, "正在生成图片，请稍等一下哦！\n//·/w\\·\\\\", false, 5)


            try {
                await buildingRecord(session, new PhigrosUser(save.sessionToken))

                save = await send.getsave_result(session)

                if (!save) {
                    return;
                }

            } catch (err) {
                send.send_with_At(session, err)
                logger.error(err)

            }

            let save_b19 = await save.getB19(nnum)

            let money = save.gameProgress.money
            let gameuser = {
                avatar: getInfo.idgetavatar(save.gameuser.avatar) || 'Introduction',
                ChallengeMode: (save.saveInfo.summary.challengeModeRank - (save.saveInfo.summary.challengeModeRank % 100)) / 100,
                ChallengeModeRank: save.saveInfo.summary.challengeModeRank % 100,
                rks: save.saveInfo.summary.rankingScore,
                data: `${money[4] ? `${money[4]}PiB ` : ''}${money[3] ? `${money[3]}TiB ` : ''}${money[2] ? `${money[2]}GiB ` : ''}${money[1] ? `${money[1]}MiB ` : ''}${money[0] ? `${money[0]}KiB ` : ''}`,
                selfIntro: save.gameuser.selfIntro,
                backgroundUrl: await fCompute.getBackground(save.gameuser.background),
                PlayerId: fCompute.convertRichText(save.saveInfo.PlayerId),
            }

            let data = {
                phi: save_b19.phi,
                b19_list: save_b19.b19_list,
                gameuser,
                PlayerId: gameuser.PlayerId,
                Rks: Number(save.saveInfo.summary.rankingScore).toFixed(4),
                Date: save.saveInfo.updatedAt,
                ChallengeMode: (save.saveInfo.summary.challengeModeRank - (save.saveInfo.summary.challengeModeRank % 100)) / 100,
                ChallengeModeRank: save.saveInfo.summary.challengeModeRank % 100,
                background: getInfo.getill(getInfo.illlist[Number((Math.random() * (getInfo.illlist.length - 1)).toFixed(0))], 'blur'),
                theme: plugin_data?.plugin_data?.theme || 'star',
                nnum: nnum,
            }

            send.send_with_At(session, await render(ctx, "b19", data) + (Math.abs(save_b19.com_rks - save.saveInfo.summary.rankingScore) > 0.1 ? `请注意，当前版本可能更改了计算规则\n计算rks: ${save_b19.com_rks}\n存档rks: ${save.saveInfo.summary.rankingScore}` : ''))
        })

        ctx.command('phi.a', '获取B30').option('best', '-b <val:natural> 输出bN', { fallback: 30 }).action(async ({ session, options }) => {

            if (await send.isBan(session, 'arcgrosB19')) {
                return;
            }

            let save = await send.getsave_result(session)
            if (!save) {
                return;
            }


            let nnum = options.best
            nnum = nnum ? Number(nnum) - 1 : 32
            if (!nnum) { nnum = 32 }

            nnum = Math.max(nnum, 30)
            nnum = Math.min(nnum, config.B19MaxNum)

            let save_b19 = await save.getB19(nnum)

            let money = save.gameProgress.money
            let gameuser = {
                avatar: getInfo.idgetavatar(save.gameuser.avatar) || 'Introduction',
                ChallengeMode: (save.saveInfo.summary.challengeModeRank - (save.saveInfo.summary.challengeModeRank % 100)) / 100,
                ChallengeModeRank: save.saveInfo.summary.challengeModeRank % 100,
                rks: save.saveInfo.summary.rankingScore,
                data: `${money[4] ? `${money[4]}PiB ` : ''}${money[3] ? `${money[3]}TiB ` : ''}${money[2] ? `${money[2]}GiB ` : ''}${money[1] ? `${money[1]}MiB ` : ''}${money[0] ? `${money[0]}KiB ` : ''}`,
                selfIntro: save.gameuser.selfIntro,
                backgroundUrl: await fCompute.getBackground(save.gameuser.background),
                PlayerId: save.saveInfo.PlayerId,
            }
            let plugin_data = getPluginData.get(session.userId)

            let data = {
                phi: save_b19.phi,
                b19_list: save_b19.b19_list,
                gameuser,
                PlayerId: fCompute.convertRichText(save.saveInfo.PlayerId),
                Rks: Number(save.saveInfo.summary.rankingScore).toFixed(4),
                Date: save.saveInfo.updatedAt,
                ChallengeMode: (save.saveInfo.summary.challengeModeRank - (save.saveInfo.summary.challengeModeRank % 100)) / 100,
                ChallengeModeRank: save.saveInfo.summary.challengeModeRank % 100,
                background: getInfo.getill(getInfo.illlist[Number((Math.random() * (getInfo.illlist.length - 1)).toFixed(0))], 'blur'),
                theme: plugin_data?.plugin_data?.theme || 'star',
                nnum: nnum,
            }

            send.send_with_At(session, await render(ctx, 'arcgrosB19', data))
        })

        ctx.command('phi.score <message:text>', '单曲分数').action(async ({ session }, arg = "") => {

            // 获取指令前缀
            const prefix:string = session.resolve(session.app.koishi.config.prefix)[0] ?? ''

            // 接下来我不知道
            if (await send.isBan(session, 'singlescore')) {
                return;
            }

            const save = await send.getsave_result(session)

            if (!save) {
                return;
            }


            let song = arg

            if (!song) {
                send.send_with_At(session, `请指定曲名哦！\n格式：${prefix}phi score <曲名>`)
                return;
            }

            if (!(getInfo.fuzzysongsnick(song)[0])) {
                send.send_with_At(session, `未找到 ${song} 的有关信息哦！`)
                return;
            }

            let songId = getInfo.fuzzysongsnick(song)[0]
            let songName = getInfo.idgetsong(songId)

            let Record = save.gameRecord
            let ans = Record[songId]

            if (!ans) {
                send.send_with_At(session, `我不知道你关于[${songName}]的成绩哦！可以试试更新成绩哦！\n格式：${prefix}phi update`)
                return;
            }



            /**获取历史成绩 */
            let HistoryData = await getSave.getHistory(session.userId)



            if (HistoryData) {
                HistoryData = HistoryData[songId]
            }

            let history = []

            if (HistoryData) {
                for (let i in HistoryData) {
                    for (let j in HistoryData[i]) {
                        const tem = scoreHistory.extend(songId, i as any, HistoryData[i][j])
                        tem.date_new = fCompute.date_to_string(tem.date_new) as any
                        history.push(tem)
                    }
                }
            }

            history.sort((a, b) => new Date(b.date_new).getTime() - new Date(a.date_new).getTime())

            history.splice(16)


            let data = {
                songName: songName,
                PlayerId: save.saveInfo.PlayerId,
                avatar: getInfo.idgetavatar(save.saveInfo.summary.avatar),
                Rks: Number(save.saveInfo.summary.rankingScore).toFixed(2),
                Date: save.saveInfo.updatedAt,
                ChallengeMode: (save.saveInfo.summary.challengeModeRank - (save.saveInfo.summary.challengeModeRank % 100)) / 100,
                ChallengeModeRank: save.saveInfo.summary.challengeModeRank % 100,
                scoreData: {},
                history: history,
                illustration: getInfo.getill(songId),
            }


            let songsinfo = getInfo.info(songId)
            for (let i in Level) {
                if (!songsinfo.chart[Level[i]]) break
                data.scoreData[Level[i]] = {}
                data.scoreData[Level[i]].difficulty = songsinfo['chart'][Level[i]]['difficulty']
            }

            for (let i in ans) {
                if (!songsinfo['chart'][Level[i]]) break
                if (ans[i]) {
                    ans[i].acc = ans[i].acc.toFixed(4) as any
                    ans[i].rks = ans[i].rks.toFixed(4) as any
                    data.scoreData[Level[i]] = {
                        ...ans[i],
                        suggest: save.getSuggest(songId, Number(i), 4),
                    }
                } else {
                    data.scoreData[Level[i]] = {
                        Rating: 'NEW',
                    }
                }
            }
            data.Rks = Number(save.saveInfo.summary.rankingScore).toFixed(4)


            send.send_with_At(session, await render(ctx, 'score', data))
            return;
        })

        ctx.command('phi.suggest <message:text>', '获取推分建议').action(async ({ session }, arg) => {

            if (await send.isBan(session, 'suggest')) {
                return;
            }

            let save = await send.getsave_result(session)

            if (!save) {
                return;
            }

            /**处理范围要求 */
            let { range, isask, scoreAsk } = fCompute.match_request(arg)

            /**取出信息 */
            let Record = save.gameRecord

            /**计算 */
            let data = []

            for (let i in Record) {
                let id = i as idString
                let song = getInfo.idgetsong(id)
                if (!song) {
                    logger.warn('[phi-plugin]', id, '曲目无信息')
                    continue
                }
                let info = getInfo.info(id)
                let record = Record[id]
                for (let lv in [0, 1, 2, 3]) {
                    if (!info.chart[Level[lv]]) continue
                    let difficulty = info.chart[Level[lv]].difficulty
                    if (range[0] <= difficulty && difficulty <= range[1] && isask[lv]) {
                        if ((!record[lv] && !scoreAsk.NEW)) continue
                        if (record[lv] && !scoreAsk[record[lv].Rating.toUpperCase()]) continue
                        if (!record[lv]) {
                            record[lv] = {} as any
                        }
                        record[lv].suggest = save.getSuggest(id, Number(lv), 4)
                        if (record[lv].suggest.includes('无')) {
                            continue
                        }
                        data.push({ ...record[lv], ...info, illustration: getInfo.getill(id, 'low'), difficulty: difficulty, rank: Level[lv] })
                    }
                }
            }

            if (data.length > config.listScoreMaxNum) {
                send.send_with_At(session, `谱面数量过多(${data.length})大于设置的最大值(${config.listScoreMaxNum})，只显示前${config.listScoreMaxNum}条！`)
            }

            data.splice(config.listScoreMaxNum)

            data = data.sort(cmpsugg())

            let plugin_data = getPluginData.get(session.userId)

            send.send_with_At(session, await render(ctx, 'list', {
                head_title: "推分建议",
                song: data,
                background: getInfo.getill(getInfo.illlist[fCompute.randBetween(0, getInfo.illlist.length - 1)]),
                theme: plugin_data?.plugin_data?.theme || 'star',
                PlayerId: save.saveInfo.PlayerId,
                Rks: Number(save.saveInfo.summary.rankingScore).toFixed(4),
                Date: save.saveInfo.updatedAt,
                ChallengeMode: (save.saveInfo.summary.challengeModeRank - (save.saveInfo.summary.challengeModeRank % 100)) / 100,
                ChallengeModeRank: save.saveInfo.summary.challengeModeRank % 100,
            }))
        })

    }
}


function cmpsugg() {
    return function (a, b) {
        function com(difficulty, suggest) {
            return difficulty + Math.min(suggest - 98, 1) * Math.min(suggest - 98, 1) * difficulty * 0.089
        }
        let s_a = Number(a.suggest.replace("%", ''))
        let s_b = Number(b.suggest.replace("%", ''))
        return com(a.difficulty, s_a) - com(b.difficulty, s_b)
        // return (Number(a.suggest.replace("%", '')) - a.rks) - (Number(b.suggest.replace("%", '')) - b.rks)
    }
}
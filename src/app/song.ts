import { Context, is } from "koishi";
import { Config } from "..";
import send from "../model/send";
import getInfo from "../model/getInfo";
import getPic from "../model/getPic";
import { Level, LevelNum } from "../model/constNum";
import fCompute from "../model/fCompute";
import render from "../model/render";
import Chart from "../model/class/Chart";
import { logger } from "../components/Logger";
import { getNotes } from "../model";
import { idString } from "../model/type/type";


export default class phiSong {
    constructor(ctx: Context, config: Config) {
        ctx.command('phi.song <message:text>', '查看歌曲信息').action(async ({ session }, arg = "") => {

            // 获取指令前缀
            const prefix:string = session.resolve(session.app.koishi.config.prefix)[0] ?? ''

            if (await send.isBan(session, 'song')) {
                return;
            }

            if (!arg) {
                send.send_with_At(session, `请指定曲名哦！\n格式：${prefix}phi song <曲名>`)
                return;
            }
            let ids = getInfo.fuzzysongsnick(arg)
            if (ids[0]) {
                let msgRes = ''
                if (!ids[1]) {
                    msgRes += await getPic.GetSongsInfoAtlas(ctx, ids[0])
                    send.send_with_At(session, msgRes)
                } else {
                    for (let i in ids) {
                        msgRes += await getPic.GetSongsInfoAtlas(ctx, ids[i])
                    }
                    send.send_with_At(session, msgRes)
                }
            } else {
                send.send_with_At(session, `未找到${arg}的相关曲目信息QAQ`)
            }
        })

        ctx.command('phi.ill <message:text>', '查看曲绘信息').action(async ({ session }, arg = "") => {

            // 获取指令前缀
            const prefix:string = session.resolve(session.app.koishi.config.prefix)[0] ?? ''

            if (await send.isBan(session, 'ill')) {
                return;
            }

            if (!arg) {
                send.send_with_At(session, `请指定曲名哦！\n格式：${prefix}phi ill <曲名>`)
                return;
            }
            let ids = getInfo.fuzzysongsnick(arg)
            if (ids[0]) {
                let msgRes = ''
                if (!ids[1]) {
                    msgRes += await getPic.GetSongsIllAtlas(ctx, ids[0])
                    send.send_with_At(session, msgRes)
                } else {
                    for (let i in ids) {
                        msgRes += await getPic.GetSongsIllAtlas(ctx, ids[i])
                    }
                    send.send_with_At(session, msgRes)
                }
            } else {
                send.send_with_At(session, `未找到${arg}的相关曲目信息QAQ`)
            }
        })

        ctx.command('phi.rand <message:text>', '随机曲目').action(async ({ session }, arg = "") => {
            /**随机定级范围内曲目 */

            // 获取指令前缀
            const prefix:string = session.resolve(session.app.koishi.config.prefix)[0] ?? ''

            if (await send.isBan(session, 'randmic')) {
                return;
            }

            let isask = [1, 1, 1, 1]

            arg = arg.toUpperCase()
            if (arg.includes('AT') || arg.includes('IN') || arg.includes('HD') || arg.includes('EZ')) {
                isask = [0, 0, 0, 0]
                if (arg.includes('EZ')) { isask[0] = 1 }
                if (arg.includes('HD')) { isask[1] = 1 }
                if (arg.includes('IN')) { isask[2] = 1 }
                if (arg.includes('AT')) { isask[3] = 1 }
            }
            arg = arg.replace(/((\s*)|AT|IN|HD|EZ)*/g, "")
            let rank = arg.split('-')
            let top: number
            let bottom: number

            /**是否指定范围 */
            if (rank[0]) {
                if (rank[0].includes('+')) {
                    if (rank[1]) {
                        send.send_with_At(session, `含有 '+' 的难度不支持指定范围哦！\n${prefix}phi rand <定数>+ <难度(可多选)>`, true)
                        return;
                    } else {
                        bottom = Number(rank[0].replace('+', ''))
                        top = 100
                    }
                } else if (rank[0].includes('-') && !rank[1]) {
                    bottom = Number(rank[0].replace('-', ''))
                    if (bottom != bottom) {
                        send.send_with_At(session, `${rank[0]} 不是一个定级哦\n${prefix}phi rand <定数>- <难度(可多选)>`, true)
                        return;
                    } else {
                        bottom = 0
                        top = Number(rank[0])
                    }
                } else {
                    bottom = Number(rank[0])
                    if (rank[1]) {
                        top = Number(rank[1])
                        if (bottom != bottom || top != top) {
                            send.send_with_At(session, `${rank[0]} - ${rank[1]} 不是一个定级范围哦\n${prefix}phi rand <定数1> - <定数2> <难度(可多选)>`, true)
                            return;
                        }
                        if (top < bottom) {
                            /**swap */
                            top = top + bottom
                            bottom = top - bottom
                            top = top - bottom
                        }
                    } else {
                        bottom = Number(rank[0])
                        if (bottom != bottom) {
                            send.send_with_At(session, `${rank[0]} 不是一个定级哦\n#${prefix}phi rand <定数> <难度(可多选)>`, true)
                            return;
                        } else {
                            top = bottom
                        }
                    }
                }
            } else {
                top = 100
                bottom = 0
            }

            if (top % 1 == 0 && !arg.includes(".0")) top += 0.9

            let idList = []
            for (let i in getInfo.ori_info) {
                let id = i as idString
                for (let level in Level) {
                    if (isask[level] && getInfo.ori_info[id]['chart'][Level[level]]) {
                        let difficulty = getInfo.ori_info[id]['chart'][Level[level]]['difficulty']
                        if (difficulty >= bottom && difficulty <= top) {
                            idList.push({
                                ...getInfo.ori_info[id]['chart'][Level[level]],
                                rank: Level[level],
                                illustration: getInfo.getill(id),
                                song: getInfo.ori_info[id]['song'],
                                illustrator: getInfo.ori_info[id]['illustrator'],
                                composer: getInfo.ori_info[id]['composer'],
                            })
                        }
                    }
                }
            }

            if (!idList[0]) {
                send.send_with_At(session, `未找到 ${bottom} - ${top} 的 ${isask[0] ? `${Level[0]} ` : ''}${isask[1] ? `${Level[1]} ` : ''}${isask[2] ? `${Level[2]} ` : ''}${isask[3] ? `${Level[3]} ` : ''}谱面QAQ!`)
                return;
            }

            let result = idList[fCompute.randBetween(0, idList.length - 1)]

            send.send_with_At(session, await render(ctx, 'rand', result))
            return;

        })

        ctx.command('phi.alias <message:text>', '查看曲目别名').action(async ({ session }, arg = "") => {
            if (await send.isBan(session, 'alias')) {
                return;
            }

            let song = getInfo.fuzzysongsnick(arg)
            if (song[0] || arg in getInfo.ori_info) {
                let id = song[0] || arg as idString
                let info = getInfo.info(id)
                let nick = '======================\n已有别名：\n'
                for (let i in getInfo.nicklist[id]) {
                    nick += `${getInfo.nicklist[id][i]}\n`
                }
                send.send_with_At(session, `name: ${info.song}\nid: ${info.id}\n` + await getPic.GetSongsIllAtlas(ctx, id) + nick)
            } else {
                send.send_with_At(session, `未找到${arg}的相关曲目信息QAQ！`, true)
            }
        })

        ctx.command('phi.randClg <message:text>', '随机课题').action(async ({ session }, arg = "") => {
            if (await send.isBan(session, 'randClg')) {
                return;
            }

            let songReg = /[\(（].*[\)）]/
            let songReq = ""
            // console.info(arg.match(songReg))
            if (arg.match(songReg)) {
                songReq = arg.match(songReg)[0].replace(/[\(\)（）]/g, "")
                arg = arg.replace(arg.match(songReg)[0], "")
            }

            let songAsk = fCompute.match_request(songReq)

            // console.info(songAsk, songReq)

            let { isask, range } = fCompute.match_request(arg, 48)

            let NumList = []
            for (let i = range[0]; i <= range[1]; i++) {
                NumList.push(i)
            }

            let chartList: { [key: string]: Chart[] } = {}
            for (let dif in getInfo.info_by_difficulty) {
                if (Number(dif) < range[1]) {
                    for (let i in getInfo.info_by_difficulty[dif]) {
                        let chart = getInfo.info_by_difficulty[dif][i]
                        let difficulty = Math.floor(chart.difficulty)
                        if (isask[LevelNum[chart.rank]] && chartMatchReq(songAsk, chart)) {
                            if (chartList[difficulty]) {
                                chartList[difficulty].push(chart)
                            } else {
                                chartList[difficulty] = [chart]
                            }
                        }
                    }
                }
            }

            NumList = fCompute.randArray(NumList)


            let res = randClg(NumList.shift(), { ...chartList })
            while (!res && NumList.length) {
                res = randClg(NumList.shift(), { ...chartList })
            } if (res) {

                let songs = []

                let plugin_data = getNotes.get(session.userId)

                for (let i in res) {
                    let info = getInfo.info(res[i].id)
                    songs.push({
                        id: info.id,
                        song: info.song,
                        rank: res[i].rank,
                        difficulty: res[i].difficulty,
                        illustration: getInfo.getill(info.id),
                        ...info.chart[res[i].rank]
                    })
                }

                send.send_with_At(session, await render(ctx, 'clg', {
                    songs,
                    tot_clg: Math.floor(res[0].difficulty) + Math.floor(res[1].difficulty) + Math.floor(res[2].difficulty),
                    background: getInfo.getill(getInfo.illlist[Number((Math.random() * (getInfo.illlist.length - 1)).toFixed(0))], 'common'),
                    theme: plugin_data?.plugin_data?.theme || 'star',
                }))
            } else {
                send.send_with_At(session, `未找到符合条件的谱面QAQ！`)
            }

            return;


        })

        ctx.command('phi.com <message:text>', '计算等效rks').action(async ({ session }, arg = "") => {
            
            // 获取指令前缀
            const prefix:string = session.resolve(session.app.koishi.config.prefix)[0] ?? ''

            if (await send.isBan(session, 'comrks')) {
                return;
            }

            let data = arg.split(' ')
            let dif = Number(data[0])
            let acc = Number(data[1])
            if (data && acc && dif > 0 && dif <= getInfo.MAX_DIFFICULTY && acc > 0 && acc <= 100) {
                send.send_with_At(session, `dif: ${dif} acc: ${acc}\n计算结果：${fCompute.rks(Number(acc), Number(dif))}`, true)
                return;
            } else {
                send.send_with_At(session, `格式错误QAQ！\n格式：${prefix}phi com <定数> <acc>`)
                return;
            }
        })

        ctx.command('phi.tips', '随机tips').action(async ({ session }) => {
            if (await send.isBan(session, 'tips')) {
                return;
            }

            send.send_with_At(session, getInfo.tips[fCompute.randBetween(0, getInfo.tips.length - 1)])
        })

        ctx.command('phi.new', '新区速递').action(async ({ session }) => {
            if (await send.isBan(session, 'new')) {
                return;
            }
            let ans = '新曲速递：\n'
            for (let i in getInfo.updatedSong) {
                let info = getInfo.info(getInfo.updatedSong[i])
                ans += `${info.song}\n`
                for (let j in info.chart) {
                    ans += `  ${j} ${info.chart[j].difficulty} ${info.chart[j].combo}\n`
                }
            }

            ans += '\n定数&谱面修改：\n'
            for (let song in getInfo.updatedChart) {
                let tem = getInfo.updatedChart[song]
                ans += song + '\n'
                for (let level in tem) {
                    ans += `  ${level}:\n`
                    if (tem[level].isNew) {
                        delete tem[level].isNew
                        for (let obj in tem[level]) {
                            ans += `    ${obj}: ${tem[level][obj][0]}\n`
                        }
                    } else {
                        for (let obj in tem[level]) {
                            ans += `    ${obj}: ${tem[level][obj][0]} -> ${tem[level][obj][1]}\n`
                        }
                    }
                }
            }

            if (ans.length > 500) {
                send.send_with_At(session, '新曲速递内容过长，请试图查阅其他途径！')
                return;
            }

            send.send_with_At(session, ans)
        })
    }
}

function randClg(clgNum: number, chartList: { [key: string]: Chart[] }): Chart[] {
    let difList = null;
    let rand1 = [], rand2 = []
    // console.info(getInfo.MAX_DIFFICULTY)
    for (let i = 1; i <= Math.min(getInfo.MAX_DIFFICULTY, clgNum - 2); i++) {
        // console.info(i, chartList[i])
        if (chartList[i]) {
            rand1.push(i)
            rand2.push(i)
        }
    }
    rand1 = fCompute.randArray(rand1);
    rand2 = fCompute.randArray(rand2);
    // console.info(clgNum, rand1, rand2)
    for (let i in rand1) {
        // console.info(rand1[i])
        for (let j in rand2) {
            let a = rand1[i]
            let b = rand2[j]
            if (a + b >= clgNum) continue
            let c = clgNum - a - b
            let tem = {}
            tem[a] = 1
            tem[b] ? ++tem[b] : tem[b] = 1
            tem[c] ? ++tem[c] : tem[c] = 1
            let flag = false
            for (let i in tem) {
                if (!chartList[i] || tem[i] > chartList[i].length) {
                    flag = true
                    break
                }
            }
            if (flag) continue
            difList = [a, b, c]
            break;
        }
        if (difList) break;
    }
    if (!difList) {
        return;
    }
    // console.info(difList)
    let ans = []
    for (let i in difList) {
        if (!chartList[difList[i]]) {
            logger.error(difList[i], chartList)
        }
        let tem = chartList[difList[i]].splice(fCompute.randBetween(0, chartList[difList[i]].length - 1), 1)[0]
        ans.push(tem)
    }
    // console.info(clgNum, ans)
    return ans;
}

function chartMatchReq(ask: { isask: boolean[], range: number[] }, chart: Chart) {
    if (ask.isask[LevelNum[chart.rank]]) {
        if (chart.difficulty >= ask.range[0] && chart.difficulty <= ask.range[1]) {
            return true
        }
    }
    return false
}
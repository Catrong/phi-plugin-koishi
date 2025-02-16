import { Context, Session } from 'koishi'
import { config } from '../../components/Config'
import { getInfo, send, render, fCompute, getPic } from '../../model'
import { logger } from '../../components/Logger'
import { idString } from '../../model/type/type'


let songsId = getInfo.illlist
let songweights = {} //存储每首歌曲被抽取的权重

//曲目初始洗牌
shuffleArray(songsId)

let gamelist = {}
const eList = {}

export default class guessIll {
    /**猜曲绘 */
    static async start(ctx: Context, session: Session, gameList) {
        let { guildId } = session
        // 获取指令前缀
        const prefix:string = session.resolve(session.app.koishi.config.prefix)[0] ?? ''
        if (gamelist[guildId]) {
            send.send_with_At(session, "请不要重复发起哦！", true)
            return true
        }
        if (songsId.length == 0) {
            send.send_with_At(session, '当前曲库暂无有曲绘的曲目哦！更改曲库后需要重启哦！')
            return;
        }

        if (!songweights[guildId]) {
            songweights[guildId] = {}

            //将每一首曲目的权重初始化为1
            songsId.forEach(id => {
                songweights[guildId][id] = 1
            })
        }

        let song = getRandomSong(session)
        let songs_info = getInfo.info(song)

        let cnnt = 0
        while (songs_info.can_t_be_guessill) {
            ++cnnt
            if (cnnt >= 50) {
                logger.error(`[phi guess]抽取曲目失败，请检查曲库设置`)
                send.send_with_At(session, `[phi guess]抽取曲目失败，请检查曲库设置`)
                return
            }
            song = getRandomSong(session)
            songs_info = getInfo.info(song)
        }

        gamelist[guildId] = songs_info.song
        gameList[guildId] = { gameType: "guessIll" }
        eList[guildId] = session

        let w_ = randint(100, 140)
        let h_ = randint(100, 140)
        let x_ = randint(0, 2048 - w_)
        let y_ = randint(0, 1080 - h_)
        let blur_ = randint(9, 14)

        let data = {
            illustration: getInfo.getill(songs_info.id),
            width: w_,
            height: h_,
            x: x_,
            y: y_,
            blur: blur_,
            style: 0,
        }

        const known_info: any = {}
        const remain_info = ['chapter', 'bpm', 'composer', 'length', 'illustrator', 'chart']
        /**
         * 随机给出提示
         * 0: 区域扩大
         * 1: 模糊度减小
         * 2: 给出一条文字信息
         * 3: 显示区域位置
         */
        let fnc = [0, 1, 2, 3]
        logger.info(data)

        send.send_with_At(session, `下面开始进行猜曲绘哦！回答可以直接发送哦！每过${config.GuessTipCd}秒后将会给出进一步提示。发送 ${prefix}phi ans 结束游戏`)
        if (config.GuessRecall)
            await send.send_with_At(session, await render(ctx, 'guess', data), false, config.GuessTipCd)
        else
            await send.send_with_At(session, await render(ctx, 'guess', data))

        /**单局时间不超过4分半 */
        const time = config.GuessTipCd
        for (let i = 0; i < Math.min(270 / time, 30); ++i) {


            for (let j = 0; j < time; ++j) {
                await fCompute.sleep(1000)
                if (gamelist[guildId]) {
                    if (gamelist[guildId] != songs_info.song) {
                        await gameover(ctx, session, data)
                        return true
                    }
                } else {
                    await gameover(ctx, session, data)
                    return true
                }
            }
            let remsg = [] //回复内容
            let tipmsg = '' //这次干了什么
            const index = randint(0, fnc.length - 1)

            switch (fnc[index]) {
                case 0: {
                    area_increase(100, data, fnc)
                    tipmsg = `[区域扩增!]`
                    break
                }
                case 1: {
                    blur_down(2, data, fnc)
                    tipmsg = `[清晰度上升!]`
                    break
                }
                case 2: {
                    gave_a_tip(known_info, remain_info, songs_info, fnc)
                    tipmsg = `[追加提示!]`
                    break
                }
                case 3: {
                    data.style = 1
                    fnc.splice(fnc.indexOf(3), 1)
                    tipmsg = `[全局视野!]`
                    break
                }
            }
            if (known_info.chapter) tipmsg += `\n该曲目隶属于 ${known_info.chapter}`
            if (known_info.bpm) tipmsg += `\n该曲目的 BPM 值为 ${known_info.bpm}`
            if (known_info.composer) tipmsg += `\n该曲目的作者为 ${known_info.composer}`
            if (known_info.length) tipmsg += `\n该曲目的时长为 ${known_info.length}`
            if (known_info.illustrator) tipmsg += `\n该曲目曲绘的作者为 ${known_info.illustrator}`
            if (known_info.chart) tipmsg += known_info.chart
            remsg = [tipmsg]
            remsg.push(await render(ctx, 'guess', data))

            session = eList[guildId]

            if (gamelist[guildId]) {
                if (gamelist[guildId] != songs_info.song) {
                    await gameover(ctx, session, data)
                    return true
                }
            } else {
                await gameover(ctx, session, data)
                return true
            }

            if (config.GuessRecall)
                send.send_with_At(session, remsg, false, config.GuessTipCd + 1)
            else
                send.send_with_At(session, remsg)

        }

        for (let j = 0; j < time; ++j) {
            await fCompute.sleep(1000)
            if (gamelist[guildId]) {
                if (gamelist[guildId] != songs_info.song) {
                    await gameover(ctx, session, data)
                    return true
                }
            } else {
                await gameover(ctx, session, data)
                return true
            }
        }

        session = eList[guildId]

        const t = gamelist[guildId]
        delete eList[guildId]
        delete gamelist[guildId]
        delete gameList[guildId]
        await send.send_with_At(session, "呜，怎么还没有人答对啊QAQ！只能说答案了喵……")

        await send.send_with_At(session, await getPic.GetSongsInfoAtlas(ctx, t))
        await gameover(ctx, session, data)

        return true
    }

    /**玩家猜测 */
    static async guess(ctx: Context, session: Session, msg: string, gameList) {
        const { guildId } = session
        if (gamelist[guildId]) {
            eList[guildId] = session
            if (typeof msg === 'string') {
                const ans = msg.replace(/[#/](我)?猜(\s*)/g, '')
                const song = getInfo.fuzzysongsnick(ans, 0.95)
                if (song[0]) {
                    for (let i in song) {
                        if (gamelist[guildId] == song[i]) {
                            const t = gamelist[guildId]
                            delete gamelist[guildId]
                            delete gameList[guildId]
                            send.send_with_At(session, '恭喜你，答对啦喵！ヾ(≧▽≦*)o', true)
                            await session.send(await getPic.GetSongsInfoAtlas(ctx, t))
                            return true
                        }
                    }
                    if (song[1]) {
                        send.send_with_At(session, `不是 ${ans} 哦喵！≧ ﹏ ≦`, true, 5)
                    } else {
                        send.send_with_At(session, `不是 ${song[0]} 哦喵！≧ ﹏ ≦`, true, 5)
                    }
                    return false
                }
            }
        }
        return false
    }

    static async ans(ctx: Context, session: Session, gameList) {
        const { guildId } = session
        if (gamelist[guildId]) {
            const t = gamelist[guildId]
            delete gamelist[guildId]
            delete gameList[guildId]
            await session.send('好吧，下面开始公布答案。')
            await session.send(await getPic.GetSongsInfoAtlas(ctx, t))
            return true
        }
        return false
    }

    /** 洗牌 **/
    static async mix(session: Session) {
        const { guildId } = session

        if (gamelist[guildId]) {
            await send.send_with_At(session, `当前有正在进行的游戏，请等待游戏结束再执行该指令`)
            return false
        }

        // 曲目初始洗牌
        shuffleArray(songsId)

        songweights[guildId] = songweights[guildId] || {}

        // 将权重归1
        songsId.forEach(song => {
            songweights[guildId][song] = 1
        })

        await send.send_with_At(session, `洗牌成功了www`, true)
        return true
    }
}



/**游戏结束，发送相应位置 */
async function gameover(ctx: Context, session: Session, data) {
    data.ans = data.illustration
    data.style = 1
    await send.send_with_At(session, await render(ctx, 'guess', data))
}

/**
 * RandBetween
 * @param {number} top 随机值上界
 */
function randbt(top, bottom = 0) {
    return Number((Math.random() * (top - bottom)).toFixed(0)) + bottom
}

/**
 * 区域扩增
 * @param {number} size 增大的像素值
 * @param {object} data 
 * @param {Array} fnc 
 */
function area_increase(size, data, fnc) {
    if (data.height < 1080) {
        if (data.height + size >= 1080) {
            data.height = 1080
            data.y = 0
        } else {
            data.height += size
            data.y = Math.max(0, data.y - size / 2)
            data.y = Math.min(data.y, 1080 - data.height)
        }
    }
    if (data.width < 2048) {
        if (data.width + size >= 2048) {
            data.width = 2048
            data.x = 0
            fnc.splice(fnc.indexOf(0), 1)
        } else {
            data.width += size
            data.x = Math.max(0, data.x - size / 2)
            data.x = Math.min(data.x, 2048 - data.width)
        }
    } else {
        logger.error('err')
        return true
    }
    return false
}

/**
 * 降低模糊度
 * @param {number} size 降低值
 */
function blur_down(size, data, fnc) {
    if (data.blur) {
        data.blur = Math.max(0, data.blur - size)
        if (!data.blur) fnc.splice(fnc.indexOf(1), 1)
    } else {
        logger.error('err')
        return true
    }
    return false
}

/**
 * 获得一个歌曲信息的提示
 * @param {object} known_info 
 * @param {Array} remain_info 
 * @param {object} songs_info 
 * @param {Array} fnc
 */
function gave_a_tip(known_info, remain_info, songs_info, fnc) {
    if (remain_info.length) {
        const t = randbt(remain_info.length - 1)
        const aim = remain_info[t]
        remain_info.splice(t, 1)
        known_info[aim] = songs_info[aim]

        if (!remain_info.length) fnc.splice(fnc.indexOf(2), 1)

        if (aim === 'chart') {
            let charts = []
            for (let i in songs_info[aim]) {
                charts.push(i)
            }
            let t1 = charts[randint(0, charts.length - 1)]

            known_info[aim] = `\n该曲目的 ${t1} 谱面的`

            switch (randint(0, 2)) {
                case 0: {
                    /**定数 */
                    known_info[aim] += `定数为 ${songs_info[aim][t1]['difficulty']}`
                    break
                }
                case 1: {
                    /**物量 */
                    known_info[aim] += `物量为 ${songs_info[aim][t1]['combo']}`
                    break
                }
                case 2: {
                    /**谱师 */
                    known_info[aim] += `谱师为 ${songs_info[aim][t1]['charter']}`
                    break
                }
            }
        }
    } else {
        logger.error('Error: remaining info is empty')
        return true
    }
    return false
}


//将数组顺序打乱
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = randint(0, i)
        const temp = arr[i]
        arr[i] = arr[j]
        arr[j] = temp //交换位置
    }
    return arr
}

//定义生成指定区间带有指定小数位数随机数的函数
function randfloat(min, max, precision = 0) {
    let range = max - min
    let randomOffset = Math.random() * range
    let randomNumber = randomOffset + min + range * 10 ** -precision

    return precision === 0 ? Math.floor(randomNumber) : randomNumber.toFixed(precision)
}

//定义生成指定区间整数随机数的函数
function randint(min, max) {
    const range = max - min + 1
    const randomOffset = Math.floor(Math.random() * range)
    return (randomOffset + min) % range + min
}

//定义随机抽取曲目的函数
function getRandomSong(session: Session):idString {
    //对象解构提取groupid
    const { guildId } = session

    //计算曲目的总权重
    const totalWeight = Object.values(songweights[guildId]).reduce((total, weight) => total as any + weight, 0)

    //生成一个0到总权重之间带有16位小数的随机数
    const randomWeight = randfloat(0, totalWeight, 16)

    let accumulatedWeight = 0
    for (const [song, weight] of Object.entries(songweights[guildId])) {
        accumulatedWeight += weight as any
        if (accumulatedWeight >= randomWeight) {
            songweights[guildId][song] *= 0.4 //权重每次衰减60%
            return song as idString
        }
    }

    //如果由于浮点数精度问题未能正确选择歌曲，则随机返回一首
    return songsId[randint(0, songsId.length - 1)]
}

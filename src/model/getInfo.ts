import getFile from './getFile'
import { DlcInfoPath, imgPath, infoPath, oldInfoPath, originalIllPath, ortherIllPath } from '../components/pluginPath'
import path from 'path'
import SongsInfo from './type/SongsInfo'
import fs from 'fs'
import { Level, MAX_DIFFICULTY } from './constNum'
import { config } from '../components/Config'
import Chart from './class/Chart'
import { idString, songString, levelKind, noteKind } from './type/type'
import { Context, Session } from 'koishi'




/**头像id */
getFile.csvReader(path.join(infoPath, 'avatar.csv'))
    .then((avatar) => {
        /**信息文件 */
        getFile.csvReader(path.join(infoPath, 'info.csv')).then((info) => {
            getFile.csvReader(path.join(infoPath, 'difficulty.csv')).then((difficulty) => {
                getFile.csvReader(path.join(oldInfoPath, 'difficulty.csv')).then((oldDifficulty) => {
                    getInfo.setCsvInfo(avatar, info, difficulty, oldDifficulty)

                })
            })

        })

    })



export default class getInfo {

    /**默认别名,以id为key */
    static nicklist: { [key: idString]: string[] } = getFile.FileReader(path.join(infoPath, 'nicklist.yaml'))
    /**以别名为key */
    static songnick: { [key: string]: idString[] } = {};

    /**扩增曲目信息 */
    static DLC_Info: { [key: string]: string[] } = {}

    /**头像id */
    static avatarid: { [key: string]: string } = {}

    /**Tips [] */
    static tips: string[] = getFile.FileReader(path.join(infoPath, 'tips.yaml'))

    /**原版信息 */
    static ori_info: { [key: idString]: any } = {}
    /**通过id获取曲名 */
    static songById: { [key: idString]: songString } = {}
    /**原曲名称获取id */
    static idBySong: { [key: songString]: idString } = {}
    /**含有曲绘的曲目列表，id */
    static illlist: idString[] = []
    /**按dif分的info */
    static info_by_difficulty: { [key: string]: Chart[] } = {}

    static updatedSong: idString[] = []

    static updatedChart: { [key: idString]: { [key in levelKind]?: { [key in (noteKind | 'difficulty' | 'combo')]?: number[] } } } = {}

    /**SP信息 */
    static sp_info: { [key: string]: any } = getFile.FileReader(path.join(infoPath, 'spinfo.json'))

    /**难度映射 */
    static Level: string[] = Level

    /**最高定数 */
    static MAX_DIFFICULTY: number = 0

    /**所有曲目id列表 */
    static idlist: string[] = []

    /**jrrp */
    static word: { [key: string]: string } = getFile.FileReader(path.join(infoPath, 'jrrp.json'))

    static setCsvInfo(csv_avatar: { name: string, id: string }[], CsvInfo: any, Csvdif: any, oldDif: any) {
        for (let id in this.nicklist) {
            for (let j in this.nicklist[id]) {
                if (this.songnick[this.nicklist[id][j]]) {
                    this.songnick[this.nicklist[id][j]].push(id as idString)
                } else {
                    this.songnick[this.nicklist[id][j]] = [id as idString]
                }
            }
        }

        let files = fs.readdirSync(DlcInfoPath).filter(file => file.endsWith('.json'))
        files.forEach(async (file) => {
            this.DLC_Info[path.basename(file, '.json')] = getFile.FileReader(path.join(DlcInfoPath, file))
        })


        for (let i in this.sp_info) {
            if (this.sp_info[i]['illustration_big']) {
                this.illlist.push(this.sp_info[i].song)
            }
        }

        /**头像id */
        for (let i in csv_avatar) {
            this.avatarid[csv_avatar[i].id] = csv_avatar[i].name
        }

        /**
         * @typedef {Object} notesInfoObject
         * @property {number} m MaxTime
         * @property {[number,number,number,number][]} d note分布 [tap,drag,hold,flick,tot]
         * @property {[number,number,number,number]} t note统计 [tap,drag,hold,flick]
         */
        /**
         * note统计
         * @type {{[x:idString]:{[x:string]:notesInfoObject}}}
         */
        let notesInfo = getFile.FileReader(path.join(infoPath, 'notesInfo.json'))

        
        interface csvInfoObject {
            id: idString;
            song: songString;
            composer: string;
            illustrator: string;
            EZ?: string;
            HD?: string;
            IN?: string;
            AT?: string | null;
        }
        let Jsoninfo = getFile.FileReader(path.join(infoPath, 'infolist.json'))

        /**
         * note统计
         * @type {{[x:idString]:{[x:string]:notesInfoObject}}}
         */
        let oldNotes = getFile.FileReader(path.join(oldInfoPath, 'notesInfo.json'))
        let OldDifList = []
        for (let i in oldDif) {
            OldDifList[oldDif[i].id] = oldDif[i]
        }
        this.updatedSong = []
        this.updatedChart = {}
        // console.info(CsvInfo, Csvdif, Jsoninfo)
        for (let i in CsvInfo) {
            let id: idString = CsvInfo[i].id
            this.songById[id] = CsvInfo[i].song
            this.idBySong[CsvInfo[i].song] = id

            /**比较新曲部分 */
            if (!OldDifList[id]) {
                this.updatedSong.push(id)
            }

            this.ori_info[id] = Jsoninfo[id]
            if (!Jsoninfo[id]) {
                this.ori_info[id] = { song: CsvInfo[i].song, chapter: '', bpm: '', length: '', chart: {} }
                console.info(`[phi-plugin]曲目详情未更新：${CsvInfo[i].song}`)
            }
            this.ori_info[id].song = CsvInfo[i].song
            this.ori_info[id].id = id
            this.ori_info[id].composer = CsvInfo[i].composer
            this.ori_info[id].illustrator = CsvInfo[i].illustrator
            this.ori_info[id].chart = {}
            for (let j in this.Level) {
                const level = this.Level[j]
                if (CsvInfo[i][level]) {

                    /**比较新曲部分 */
                    if (OldDifList[id]) {
                        if (!OldDifList[id][level] || OldDifList[id][level] != Csvdif[i][level] || JSON.stringify(oldNotes[id][level].t) != JSON.stringify(notesInfo[id][level].t)) {
                            let tem = {}
                            if (!OldDifList[CsvInfo[i].id][level]) {
                                Object.assign(tem, { ...notesInfo[id][level].t, difficulty: Csvdif[i][level], isNew: true })
                            } else {
                                if (OldDifList[id][level] != Csvdif[i][level]) {
                                    Object.assign(tem, { difficulty: [OldDifList[id][level], Csvdif[i][level]] })
                                }
                                if (oldNotes[id][level].t[0] != notesInfo[id][level].t[0]) {
                                    Object.assign(tem, { tap: [oldNotes[id][level].t[0], notesInfo[id][level].t[0]] })
                                }
                                if (oldNotes[id][level].t[1] != notesInfo[id][level].t[1]) {
                                    Object.assign(tem, { drag: [oldNotes[id][level].t[1], notesInfo[id][level].t[1]] })
                                }
                                if (oldNotes[id][level].t[2] != notesInfo[id][level].t[2]) {
                                    Object.assign(tem, { hold: [oldNotes[id][level].t[2], notesInfo[id][level].t[2]] })
                                }
                                if (oldNotes[id][level].t[3] != notesInfo[id][level].t[3]) {
                                    Object.assign(tem, { flick: [oldNotes[id][level].t[3], notesInfo[id][level].t[3]] })
                                }
                                let oldCombo = oldNotes[id][level].t[0] + oldNotes[id][level].t[1] + oldNotes[id][level].t[2] + oldNotes[id][level].t[3]
                                let newCombo = notesInfo[id][level].t[0] + notesInfo[id][level].t[1] + notesInfo[id][level].t[2] + notesInfo[id][level].t[3]
                                if (oldCombo != newCombo) {
                                    Object.assign(tem, { combo: [oldCombo, newCombo] })
                                }
                            }
                            if (!this.updatedChart[id]) {
                                this.updatedChart[id] = {}
                            }
                            this.updatedChart[id][level] = tem
                            // console.log(this.updatedChart)
                        }
                    }

                    if (!this.ori_info[id].chart[level]) {
                        this.ori_info[id].chart[level] = {}
                    }
                    this.ori_info[id].chart[level].charter = CsvInfo[i][level]
                    this.ori_info[id].chart[level].difficulty = Number(Csvdif[i][level])
                    this.ori_info[id].chart[level].tap = notesInfo[id][level].t[0]
                    this.ori_info[id].chart[level].drag = notesInfo[id][level].t[1]
                    this.ori_info[id].chart[level].hold = notesInfo[id][level].t[2]
                    this.ori_info[id].chart[level].flick = notesInfo[id][level].t[3]
                    this.ori_info[id].chart[level].combo = notesInfo[id][level].t[0] + notesInfo[id][level].t[1] + notesInfo[id][level].t[2] + notesInfo[id][level].t[3]
                    this.ori_info[id].chart[level].maxTime = notesInfo[id][level].m
                    this.ori_info[id].chart[level].distribution = notesInfo[id][level].d

                    /**最高定数 */
                    this.MAX_DIFFICULTY = Math.max(this.MAX_DIFFICULTY, Number(Csvdif[i][level]))
                }
            }
            this.illlist.push(id)
            this.idlist.push(id)
        }


        if (this.MAX_DIFFICULTY != MAX_DIFFICULTY) {
            console.error('[phi-plugin] MAX_DIFFICULTY 常量未更新，请回报作者！', MAX_DIFFICULTY, this.MAX_DIFFICULTY)
        }

        for (let id in this.ori_info) {
            for (let level in this.ori_info[id].chart) {
                let info = this.ori_info[id]
                if (this.info_by_difficulty[info.chart[level].difficulty]) {
                    this.info_by_difficulty[info.chart[level].difficulty].push({
                        id: info.id,
                        rank: level,
                        ...info.chart[level],
                    })
                } else {
                    this.info_by_difficulty[info.chart[level].difficulty] = [{
                        id: info.id,
                        rank: level,
                        ...info.chart[level],
                    }]
                }
            }
        }

    }


    /**
     * 返回原曲信息
     * @param {} [id=undefined] 原曲id
     * @returns {SongsInfo}
     */
    static info(id: idString): SongsInfo {
        let result = { ...this.ori_info, ...this.sp_info }
        let info = result[id]
        if (!info) {
            return null
        }
        return {
            /**id */
            id: info.id,
            /**曲目 */
            song: info.song,
            /**小型曲绘 */
            illustration: info.illustration,
            /**原版曲绘 */
            illustration_big: this.getill(info.id),
            /**是否不参与猜字母 */
            can_t_be_letter: info.can_t_be_letter || true,
            /**是否不参与猜曲绘 */
            can_t_be_guessill: info.can_t_be_guessill || true,
            /**章节 */
            chapter: info.chapter,
            /**bpm */
            bpm: info.bpm,
            /**作曲 */
            composer: info.composer,
            /**时长 */
            length: info.length,
            /**画师 */
            illustrator: info.illustrator,
            /**特殊信息 */
            spinfo: info.spinfo,
            /**谱面详情 */
            chart: info.chart
        }


    }

    /**
     * 返回所有曲目信息
     * @returns 
     */
    static all_info() {
        return { ...this.ori_info, ...this.sp_info }
    }

    /**
    * 根据参数模糊匹配返回id数组
    * @param {string} mic 别名
    * @param {number} [Distance=0.85] 阈值 猜词0.95
    * @returns 原曲id数组，按照匹配程度降序
    */
    static fuzzysongsnick(mic: string, Distance: number = 0.85): idString[] {
        const fuzzyMatch = (str1: string, str2: string) => {
            if (str1 == str2) {
                return 1
            }
            //首先第一次去除空格和其他符号，并转换为小写
            const pattern = /[\s~`!@#$%^&*()\-=_+\]{}|;:'",<.>/?！￥…（）—【】、；‘：“”，《。》？↑↓←→]/g
            const formattedStr1 = str1.replace(pattern, '').toLowerCase()
            const formattedStr2 = str2.replace(pattern, '').toLowerCase()

            //第二次再计算str1和str2之间的JaroWinkler距离
            const distance = this.jaroWinklerDistance(formattedStr1, formattedStr2)

            //如果距离大于等于某个阈值，则认为匹配
            //可以根据实际情况调整这个阈值
            return distance
        }

        /**按照匹配程度排序 */
        let result = []

        let allinfo = this.all_info()

        for (let std in this.songnick) {
            let dis = fuzzyMatch(mic, std)
            if (dis >= Distance) {
                for (let i in this.songnick[std]) {
                    result.push({ id: this.songnick[std][i], dis: dis })
                }
            }
        }
        for (let id in allinfo) {
            let std = allinfo[id].song
            let dis = fuzzyMatch(mic, std)
            if (dis >= Distance) {
                result.push({ id: id, dis: dis })
            }
        }

        result = result.sort((a, b) => b.dis - a.dis)

        let all = []
        for (let i in result) {

            if (all.includes(result[i].song)) continue //去重
            /**如果有完全匹配的曲目则放弃剩下的 */
            if (result[0].dis == 1 && result[i].dis < 1) break


            all.push(result[i].id)
        }

        return all
    }

    //采用Jaro-Winkler编辑距离算法来计算str间的相似度，复杂度为O(n)=>n为较长的那个字符出的长度
    static jaroWinklerDistance(s1: string, s2: string): number {
        let m = 0 //匹配的字符数量

        //如果任任一字符串为空则距离为0
        if (s1.length === 0 || s2.length === 0) {
            return 0
        }

        //字符串完全匹配，距离为1
        if (s1 === s2) {
            return 1
        }

        let range = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1, //搜索范围
            s1Matches = new Array(s1.length),
            s2Matches = new Array(s2.length)

        //查找匹配的字符
        for (let i = 0; i < s1.length; i++) {
            let low = (i >= range) ? i - range : 0,
                high = (i + range <= (s2.length - 1)) ? (i + range) : (s2.length - 1)

            for (let j = low; j <= high; j++) {
                if (s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j]) {
                    ++m
                    s1Matches[i] = s2Matches[j] = true
                    break
                }
            }
        }

        //如果没有匹配的字符，那么捏Jaro距离为0
        if (m === 0) {
            return 0
        }

        //计算转置的数量
        let k = 0, n_trans = 0
        for (let i = 0; i < s1.length; i++) {
            if (s1Matches[i] === true) {
                let j
                for (j = k; j < s2.length; j++) {
                    if (s2Matches[j] === true) {
                        k = j + 1
                        break
                    }
                }

                if (s1[i] !== s2[j]) {
                    ++n_trans
                }
            }
        }

        //计算Jaro距离
        let weight = (m / s1.length + m / s2.length + (m - (n_trans / 2)) / m) / 3,
            l = 0,
            p = 0.1

        //如果Jaro距离大于0.7，计算Jaro-Winkler距离
        if (weight > 0.7) {
            while (s1[l] === s2[l] && l < 4) {
                ++l
            }

            weight = weight + l * p * (1 - weight)
        }

        return weight
    }


    /**
     * id获取曲绘，返回地址
     * @param id id
     * @param kind 清晰度
     * @return 网址或文件地址
    */
    static getill(id: idString, kind: 'common' | 'blur' | 'low' = 'common'): string {
        // console.info(id)
        let songsinfo = this.all_info()[id]
        let ans = songsinfo?.illustration_big
        let reg = /^(?:(http|https|ftp):\/\/)((?:[\w-]+\.)+[a-z0-9]+)((?:\/[^/?#]*)+)?(\?[^#]+)?(#.+)?$/i
        if (ans && !reg.test(ans)) {
            ans = path.join(ortherIllPath, ans)
        } else if (this.ori_info[id] || this.sp_info[id]) {
            if (this.ori_info[id]) {
                if (fs.existsSync(path.join(originalIllPath, id + '.png'))) {
                    ans = path.join(originalIllPath, id + '.png')
                } else if (fs.existsSync(path.join(originalIllPath, "ill", id + '.png'))) {
                    if (kind == 'common') {
                        ans = path.join(originalIllPath, "ill", id + '.png')
                    } else if (kind == 'blur') {
                        ans = path.join(originalIllPath, "illBlur", id + '.png')
                    } else if (kind == 'low') {
                        ans = path.join(originalIllPath, "illLow", id + '.png')
                    }
                } else {
                    if (kind == 'common') {
                        ans = `${config.onLinePhiIllUrl}/ill/${id + '.png'}`
                    } else if (kind == 'blur') {
                        ans = `${config.onLinePhiIllUrl}/illBlur/${id + '.png'}`
                    } else if (kind == 'low') {
                        ans = `${config.onLinePhiIllUrl}/illLow/${id + '.png'}`
                    }
                }
            } else {
                if (fs.existsSync(path.join(originalIllPath, "SP", id + '.png'))) {
                    ans = path.join(originalIllPath, "SP", id + '.png')
                } else {
                    ans = `${config.onLinePhiIllUrl}/SP/${id}.png`
                }
            }
        }
        if (!ans) {
            ans = path.join(imgPath, 'phigros.png')
        }
        return ans;
    }

    /**
     * 返回章节封面 url
     * @param {string} name 标准章节名
     */
    static getChapIll(name: string) {
        if (fs.existsSync(path.join(originalIllPath, "chap", `${name}.png`))) {
            return path.join(originalIllPath, "chap", `${name}.png`)
        } else {
            return `https://gitee.com/Steveeee-e/phi-plugin-ill/raw/main/chap/${name}.png`
        }
    }

    /**
     * 通过id获得头像文件名称
     * @param id 
     * @returns file name
     */
    static idgetavatar(id: string) {
        if (this.avatarid[id]) {
            return this.avatarid[id]
        } else {
            return 'Introduction'
        }
    }

    /**
     * 根据曲目id获取原名
     * @param id 曲目id
     * @returns 原名
     */
    static idgetsong(id: idString): songString {
        id.replace(/\.0$/, '')
        return this.songById[id]
    }

    /**
     * 通过原曲曲目获取曲目id
     * @param song 原曲曲名
     * @returns 曲目id
     */
    static SongGetId(song: songString): idString {
        return this.idBySong[song]
    }

    /** 
     * 获取指令前缀
     * @returns
     */
    static getCmdPrefix(ctx: Context, session: Session, removeSpace: boolean = false): string {
        let command = ctx.$commander.get('phi')
        return (session.resolve(session.app.koishi.config.prefix)[0] ?? '') + command.displayName.replace(/\./g, ' ') + command.declaration + (removeSpace ? '' : ' ')
    }

}
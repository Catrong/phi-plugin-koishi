import { Context, Schema } from 'koishi'
import { } from 'koishi-plugin-puppeteer'
import * as components from './components/index'
import * as app from './app/index'
import { getInfo } from './model'

export const name = 'phi-plugin'

export const inject = {
    required: ['puppeteer', 'database'],
}

export interface Config {
    /**渲染设置 */
    /**在线曲绘来源 */
    onLinePhiIllUrl: string,
    /**下载曲绘源 */
    downIllUrl: string,
    /**渲染精度 */
    renderScale: number,
    /**渲染质量 */
    randerQuality: number,
    /**渲染超时时间 */
    timeout: number,
    /**等待超时时间 */
    waitingTimeout: number,
    /**并行渲染数量 */
    renderNum: number,
    /**B19最大限制 */
    B19MaxNum: number,
    /**历史成绩单日数量 */
    HistoryDayNum: number,
    /**历史成绩展示天数 */
    HistoryDateNum: number,
    /**历史成绩展示数量 */
    HistoryScoreNum: number,
    /** /list 最大数量 */
    listScoreMaxNum: number,
    /**系统设置 */
    /**自动更新曲绘 */
    autoPullPhiIll: boolean,
    /**频道模式 */
    isGuild: boolean,
    /**绑定二维码 */
    TapTapLoginQRcode: boolean,
    /**命令头 */
    cmdhead: string,
    /**曲库类型 */
    songSet: number,
    /**猜曲绘设置 */
    /**提示间隔 */
    GuessTipCd: number,
    /**猜曲绘撤回 */
    GuessRecall: boolean,
    /**开字母设置 */
    /**字母条数 */
    LetterNum: number,
    /**发送曲绘 */
    LetterIllustration: string,
    /**翻开字母CD */
    LetterRevealCd: number,
    /**回答CD */
    LetterGuessCd: number,
    /**提示CD */
    LetterTipCd: number,
    /**最长时长 */
    LetterTimeLength: number,
    /**提示猜歌设置 */
    /**提示CD */
    GuessTipsTipCD: number,
    /**提示条数 */
    GuessTipsTipNum: number,
    /**最长时长 */
    GuessTipsTimeout: number,
    /**额外时间 */
    GuessTipsAnsTime: number,
    /**其他设置 */
    /**段位认证tk */
    VikaToken?: string
    // /**自定义设置 */
    // /**自定义别名设置 */
    // nickconfig?: { [key: string]: string[] },
    // /**自定义曲目设置 */
    // custominfo?: { [key: string]: { song: string, composer: string, illustration_big: string, illustrator: string, bpm: string, length: string, chapter: string, spinfo: string, can_t_be_guessill: boolean, can_t_be_letter: boolean, chart: { [key: string]: { difficulty: string, combo: string, charter: string, rgba: string } } } }
}

export const Config: Schema<Config> = Schema.intersect([
    /**渲染设置 */
    Schema.object({
        /**在线曲绘来源 */
        onLinePhiIllUrl: Schema.union([
            // Schema.const("https://gitee.com/Steveeee-e/phi-plugin-ill/raw/main").description("Gitee"),
            Schema.const("https://github.com/Catrong/phi-plugin-ill/blob/main").description("Github"),
            Schema.const("https://github.moeyy.xyz/https://raw.githubusercontent.com/Catrong/phi-plugin-ill/main").description("Github代理"),
            Schema.string().description("Custom").default("https://github.moeyy.xyz/https://raw.githubusercontent.com/Catrong/phi-plugin-ill/main")
        ]).default("https://github.moeyy.xyz/https://raw.githubusercontent.com/Catrong/phi-plugin-ill/main").description("在线曲绘来源"),
        /**下载曲绘源 */
        downIllUrl: Schema.union([
            // Schema.const("https://gitee.com/Steveeee-e/phi-plugin-ill/raw/main").description("Gitee"),
            Schema.const("https://github.com/Catrong/phi-plugin-ill.git").description("Github"),
            Schema.const("https://github.moeyy.xyz/https://github.com/Catrong/phi-plugin-ill.git").description("Github代理"),
            Schema.string().description("Custom").default("https://github.moeyy.xyz/https://github.com/Catrong/phi-plugin-ill.git")
        ]).default("https://github.moeyy.xyz/https://github.com/Catrong/phi-plugin-ill.git").description("下载曲绘源"),
        /**渲染精度 */
        renderScale: Schema.number().min(50).max(200).step(1).role('slider').default(100).description("渲染精度"),
        /**渲染质量 */
        randerQuality: Schema.number().min(50).max(100).step(1).role('slider').default(100).description("渲染质量"),
        /**渲染超时时间 */
        timeout: Schema.number().min(1000).max(120000).default(10000).description("渲染超时时间，超时后重启puppeteer，单位ms"),
        /**等待超时时间 （废弃） */
        waitingTimeout: Schema.number().min(1000).max(120000).default(10000).description("等待超时时间，超时后退出渲染队列，单位ms"),
        /**并行渲染数量 */
        renderNum: Schema.number().min(1).max(10).default(1).description("并行渲染数量"),
        /**B19最大限制 */
        B19MaxNum: Schema.number().min(33).max(1000).default(33).description("用户可以获取B19图片成绩的最大数量"),
        /**历史成绩单日数量 */
        HistoryDayNum: Schema.number().min(2).max(10000).default(10).description("/update 展现历史成绩的单日最大数量，至少为2"),
        /**历史成绩展示天数 */
        HistoryDateNum: Schema.number().min(1).max(100).default(10).description("/update 展现历史成绩的最大天数"),
        /**历史成绩展示数量 */
        HistoryScoreNum: Schema.number().min(10).max(10000).default(10).description("/update 展现历史成绩的最大数量"),
        /** /list 最大数量 */
        listScoreMaxNum: Schema.number().min(3).max(9999).default(300).description("/list 展现成绩的最大数量，建议为3的倍数"),
    }).description("渲染设置"),
    /**系统设置 */
    Schema.object({
        /**自动更新曲绘 */
        autoPullPhiIll: Schema.boolean().default(false).description("开启后手动更新插件时自动更新曲绘文件"),
        /**频道模式 */
        isGuild: Schema.boolean().default(false).description("（适用于频道）开启后文字版仅限私聊，关闭文字版图片，文字版将折叠为长消息"),
        /**绑定二维码 */
        TapTapLoginQRcode: Schema.boolean().default(true).description("登录TapTap绑定是否发送二维码，开启仅发送二维码，关闭直接发送链接"),
        /**命令头 */
        cmdhead: Schema.string().default("").description("命令正则匹配开头，不包含#/，支持正则表达式，\'\\\' 请双写( \\s --> \\\\s )，最外层可以不加括号"),
        /**曲库 */
        songSet: Schema.union([
            Schema.const(0).description("原版曲库"),
            Schema.const(1).description("原版+自定义"),
            Schema.const(2).description("仅自定义"),
        ]).default(0).description("使用曲库的模式，若启用自定义则重名的以自定义为准"),
    }).description("系统设置"),
    /**猜曲绘设置 */
    Schema.object({
        /**提示间隔 */
        GuessTipCd: Schema.number().min(1).max(120).default(15).description("猜曲绘提示间隔，单位：秒"),
        /**猜曲绘撤回 */
        GuessRecall: Schema.boolean().default(true).description("是否在下一条提示发出的时候撤回上一条"),
    }).description("猜曲绘设置"),
    /**开字母设置 */
    Schema.object({
        /**字母条数 */
        LetterNum: Schema.number().min(1).max(99).default(8).description("开字母条数"),
        /**发送曲绘 */
        LetterIllustration: Schema.union(["水印版", "原版", "不发送"]).default("水印版").description("猜对后是否发送以及发送什么曲绘，Phigros水印版需要占用渲染资源，不发图片更快"),
        /**翻开字母CD */
        LetterRevealCd: Schema.number().min(0).max(120).default(0).description("开字母的全局间隔时间，单位：秒"),
        /**回答CD */
        LetterGuessCd: Schema.number().min(0).max(120).default(0).description("回答的全局间隔时间，单位：秒"),
        /**提示CD */
        LetterTipCd: Schema.number().min(0).max(120).default(0).description("提示的全局间隔时间，单位：秒"),
        /**最长时长 */
        LetterTimeLength: Schema.number().min(10).max(360000).default(600).description("开字母的最长时长，单位：秒"),
    }).description("开字母设置"),
    /**提示猜歌设置 */
    Schema.object({
        /**提示CD */
        GuessTipsTipCD: Schema.number().min(0).max(120).default(5).description("提示猜歌提示的冷却时间间隔，单位：秒"),
        /**提示条数 */
        GuessTipsTipNum: Schema.number().min(0).max(17).default(7).description("提示猜歌的提示条数（除曲绘外），若总提示条数小于设定条数则将会发送全部提示"),
        /**最长时长 */
        GuessTipsTimeout: Schema.number().min(30).max(600).default(600).description("提示猜歌的最长时长，单位：秒"),
        /**额外时间 */
        GuessTipsAnsTime: Schema.number().min(5).max(600).default(30).description("发送曲绘后多久公布答案，单位：秒"),
    }).description("提示猜歌设置"),
    /**其他设置 */
    Schema.object({
        VikaToken: Schema.string().role('secret').description("token 填写后请重载插件"),
    }).description("其他设置"),
    /**自定义设置 */
    // Schema.object({
    //     nickconfig: Schema.dict(Schema.array(String).role('table')).role('table'),
    // }).description("自定义别名设置"),
    // Schema.object({
    //     custominfo: Schema.dict(Schema.object({
    //         song: Schema.string(),
    //         composer: Schema.string(),
    //         illustration_big: Schema.path(),
    //         illustrator: Schema.string(),
    //         bpm: Schema.string(),
    //         length: Schema.string(),
    //         chapter: Schema.string(),
    //         spinfo: Schema.string(),
    //         can_t_be_guessill: Schema.boolean().default(true),
    //         can_t_be_letter: Schema.boolean().default(true),
    //         chart: Schema.dict(Schema.object({
    //             difficulty: Schema.string(),
    //             combo: Schema.string(),
    //             charter: Schema.string(),
    //             rgba: Schema.string(),
    //         })).role('table'),
    //     })),
    // }).description("自定义曲目设置"),

])

export async function apply(ctx: Context, config: Config) {
    ctx.plugin(components, config)
    ctx.plugin(app, config)
}

import { Context } from "koishi";

export const i18nList = {
    /**这里被管理员禁止使用这个功能了呐QAQ！ */
    beGroupBan: 'beGroupBan',
    /**请先绑定sessionToken哦！\n如果不知道自己的sessionToken可以尝试扫码绑定嗷！\n获取二维码：/phi bind qrcode\n帮助：/phi tk help\n格式：/phi bind <sessionToken> */
    haveToBind: 'haveToBind',
    /**请先更新数据哦！\n格式：/phi update */
    haveToUpdate: 'haveToUpdate',
    /**喂喂喂！你还没输入sessionToken呐！\n扫码绑定：/phi bind qrcode\n普通绑定：/phi bind <sessionToken> */
    haveToInputToken: 'haveToInputToken',
    /**没有找到{0}的有关信息QAQ！ */
    notFoundSong: 'notFoundSong',
    /**当前存在其他未结束的游戏嗷！如果想要开启新游戏请 /phi ans 结束进行的游戏嗷！ */
    haveAnotherGame: 'haveAnotherGame',
    letter: {
        /**已经在玩开字母啦！如果想要重新开始请先/phi ans结束本局游戏哦！ */
        haveAnotherGame: 'letterHaveAnotherGame',
        /**现在还没有进行的开字母捏，快输入"/phi letter"开始一局吧！ */
        notFoundGame: 'letterNotFoundGame',
        /**没有找到对应的曲库嗷！ */
        notFoundSong: 'letterNotFoundSong',
        /**出你字母已开始！*/
        start: 'letterStart',
        /**出你字母已结束！*/
        gameOver: 'letterGameOver',
        /**当前考试范围：{0}\n已翻开字母：{1}\n{2} */
        body: 'letterBody',
        /**每次只能翻开一个字母哦！ */
        onlyCanOpenOne: 'letterOnlyCanOpenOne',
        /**这个字母已经被翻开了哦！ */
        haveBeOpened: 'letterHaveBeOpened',
        /**未猜测的曲目里没有这个字母嗷！ */
        notHaveThisLetter: 'letterNotHaveThisLetter',
        /**已翻开字母{0} */
        open: 'letterOpen',
        /**请输入一个数字哦！\n例：n.1 df */
        guessMsgNoNum: 'letterGuessMsgNoNum',
        /**没有第{0}首歌啦！ */
        guessNumIg: 'letterGuessNumIg',
        /**第{0}首歌不是{1}嗷！ */
        guessFalse: 'letterGuessFalse',
        /**恭喜你答对了！第{0}首歌是{1}！ */
        guessTrue: 'letterGuessTrue',
        /**已经帮你随机翻开一个字符[ {0} ]了捏 ♪（＾∀＾●）ﾉ */
        getTip: 'letterGetTip',
    }
}

export function apply(ctx: Context) {
    ctx.i18n.define('zh-CN', {
        beGroupBan: '这里被管理员禁止使用这个功能了呐QAQ！',
        haveToBind: '请先绑定sessionToken哦！\n如果不知道自己的sessionToken可以尝试扫码绑定嗷！\n获取二维码：{prefix}phi bind qrcode\n帮助：{prefix}phi tk help\n格式：{prefix}phi bind <sessionToken>',
        haveToUpdate: '请先更新数据哦！\n格式：{prefix}phi update',
        haveToInputToken: '喂喂喂！你还没输入sessionToken呐！\n扫码绑定：{prefix}phi bind qrcode\n普通绑定：{prefix}phi bind <sessionToken>',
        notFoundSong: '没有找到{0}的有关信息QAQ！',
        haveAnotherGame: '当前存在其他未结束的游戏嗷！如果想要开启新游戏请 {prefix}phi ans 结束进行的游戏嗷！',

        letterHaveAnotherGame: '已经在玩开字母啦！如果想要重新开始请先{prefix}phi ans结束本局游戏哦！',
        letterNotFoundGame: '现在还没有进行的开字母捏，快输入"{prefix}phi letter"开始一局吧！',
        letterStart: '出你字母已开始！回复"/nX.XXXX"命令猜歌，例如："/n1.Reimei";发送{prefix}open X来翻开字母(不区分大小写，不需要指令头)，如{prefix}open A;发送{prefix}phi ans结束并查看答案哦！',
        letterNotFoundSong: '没有找到对应的曲库嗷！',
        letterGameOver: '全部歌曲已开启！出你字母已结束！',
        letterBody: '当前考试范围：{0}\n已翻开字母：{1}\n{2}',
        letterOnlyCanOpenOne: '每次只能翻开一个字母哦！',
        letterHaveBeOpened: '这个字母已经被翻开了哦！',
        letterNotHaveThisLetter: '未猜测的曲目里没有这个字母嗷！',
        letterOpen: '已翻开字母{0}',
        letterGuessMsgNoNum: '请输入一个数字哦！\n例：n1.df',
        letterGuessNumIg: '没有第{0}首歌啦！看清楚再回答啊喂！￣へ￣',
        letterGuessFalse: '第{0}首歌不是{1}www，要不再想想捏？≧ ﹏ ≦',
        letterGuessTrue: '恭喜你答对了！第{0}首歌是{1}！ヾ(≧▽≦*)o',
        letterGetTip: '已经帮你随机翻开一个字符[ {0} ]了捏 ♪（＾∀＾●）ﾉ',

    })

}
import { Context, Session } from "koishi";
import { getInfo } from "../model";

export const i18nList = {
    common: {
        /**这里被管理员禁止使用这个功能了呐QAQ！ */
        beGroupBan: 'beGroupBan',
        /**请先绑定sessionToken哦！\n如果不知道自己的sessionToken可以尝试扫码绑定嗷！\n获取二维码：/phi bind qrcode\n帮助：/phi tk help\n格式：/phi bind <sessionToken> */
        haveToBind: 'haveToBind',
        /**请先更新数据哦！\n格式：/phi update */
        haveToUpdate: 'haveToUpdate',
        /**没有找到{0}的有关信息QAQ！ */
        notFoundSong: 'notFoundSong',
        /**正在生成图片，请稍等一下哦！\n//·/w\\·\\ */
        renderingImg: 'renderingImg',
        /**谱面数量过多({0})大于设置的最大值({1})，只显示前{1}条！ */
        listToLong: 'listToLong',
        /**请私聊使用嗷 */
        turnToPrivate: 'turnToPrivate',
        /**请指定曲名哦！\n格式：/phi {cmd} <曲名> */
        haveToInputName: 'haveToInputName',
        /**含有 '+' 的难度不支持指定范围哦！ */
        plusAndRange: 'plusAndRange',
        /**{0} 不是一个数字哦\n */
        notNum: 'notNum',
    },
    bind: {
        /**喂喂喂！你还没输入sessionToken呐！\n扫码绑定：/phi bind qrcode\n普通绑定：/phi bind <sessionToken> */
        haveToInputToken: 'bindHaveToInputToken',
        /**绑定sessionToken错误QAQ!\n错误的tk:{0}\n扫码绑定：/phi bind qrcode\n普通绑定：/phi bind <sessionToken> */
        errToken: 'bindErrToken',
        /**\n请点击链接或扫码进行登录嗷！请勿使用他人的链接。请注意，登录TapTap可能造成账号及财产损失，请在信任Bot来源的情况下扫码登录。 */
        QRCode: 'bindQRCode',
        /**登录二维码已扫描，请确认登录 */
        QRCodeBeUsed: 'bindQRCodeBeUsed',
        /**操作超时，请重试！ */
        QRCodeTimeout: 'bindQRCodeTimeout',
        /**获取sessionToken失败QAQ！请确认您的Phigros已登录TapTap账号！\n错误信息：{0} */
        QRCodeFail: 'bindQRCodeFail',
        /**请注意保护好自己的sessionToken呐！如果需要获取已绑定的sessionToken可以私聊发送 /phi sessionToken 哦！ */
        tipProtectToken: 'bindTipProtectToken',
        /**正在绑定中，请稍等一下哦！\n >_< */
        ing: 'bindIng',
        /**更新失败，请检查你的sessionToken是否正确！\n错误信息：{0} */
        failed: 'bindFailed',
        /**解绑会导致历史数据全部清空呐QAQ！真的要这么做吗？（确认/取消） */
        unbind: 'bindUnbind',
        /**确认 */
        unbindKeyWord: 'bindUnbindKeyWord',
        /**解绑成功 */
        unbindSuccess: 'bindUnbindSuccess',
        /**已取消 */
        unbindCancel: 'bindUnbindCancel',
        /**请注意，本操作将会删除Phi-Plugin关于您的所有信息QAQ！（确认/取消） */
        clear: 'bindClear',
        /**更新了{0}份成绩 */
        updated: 'bindUpdated',
        /**未收集到新成绩 */
        noUpdate: 'bindNoUpdate',
        /**检测到新的sessionToken，将自动更换绑定。如果需要删除统计记录请 /phi unbind 进行解绑哦！ */
        newToken: 'bindNewToken',
        /**以下曲目无信息，可能导致b19显示错误\n */
        noInfo: 'bindNoInfo',
        /**绑定失败！QAQ\n */
        downloadError: 'bindDownloadError',
        /**保存存档失败！\n */
        saveError: 'bindSaveError',
    },
    game: {
        /**当前存在其他未结束的游戏嗷！如果想要开启新游戏请 /phi ans 结束进行的游戏嗷！ */
        haveAnotherGame: 'haveAnotherGame',
    },
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
    },
    b19: {
        /**没有找到{0}的有关信息QAQ！ */
        notFoundSong: 'b19NotFoundSong',
        /**我不知道你关于[{name}]的成绩哦！可以试试更新成绩哦！\n格式：/phi update */
        songNoScore: 'b19SongNoScore',
    },
    download: {
        /**已经有一个更新任务在进行中了哦！请稍后再试！ */
        another: 'downloadAnother',
        /**更新完毕！ */
        finish: 'downloadFinish',
        /**开始下载曲绘文件 */
        illBegin: 'downloadIllBegin',
        /**曲绘文件更新失败QAQ! */
        illFail: 'downloadIllFail',
        /**曲绘文件已经是最新版本\n最后更新时间：{0} */
        alreadyNew: 'downloadIllAlreadyNew',
        /**phi-plugin-ill\n最后更新时间：{0} */
        illNew: 'downloadIllNew',
        /**连接超时：{0} */
        illFailTimeout: 'downloadIllFailTimeout',
        /**连接失败：{0} */
        illFailFetch: 'downloadIllFailFetch',
        /**存在冲突：\n{0}\n请手动解决冲突后再次尝试更新，或者执行/强制更新，放弃本地修改 */
        illFailOverwrite: 'downloadIllFailOverwrite',
    },
    song: {
        /**未找到 {0} - {1} 的 {2}谱面QAQ! */
        notFoundRange: 'songNotFoundRange',
        /**未找到符合条件的谱面QAQ！ */
        notFoundClg: 'songNotFoundClg',
        /**dif: {0} acc: {1}\n计算结果：{2} */
        comRult: 'songComRult',
        /**格式错误QAQ！\n格式：/phi com <定数> <acc> */
        comErr: 'songComErr',
        /**新曲速递：\n */
        new1: 'songNew1',
        /**定数&谱面修改：\n */
        new2: 'songNew2',
        /**新曲速递内容过长，请试图查阅其他途径！ */
        newToLong: 'songNewToLong',
    },
    userinfo: {
        /**您的data数为： */
        data: 'userinfoData',
    }
}

export function apply(ctx: Context) {
    let bindTip = `\n获取登录二维码：{prefix}bind qrcode\n普通绑定格式：{prefix}bind &lt;sessionToken&gt;\n帮助：{prefix}tk help`
    ctx.i18n.define('zh-CN', {
        beGroupBan: `这里被管理员禁止使用这个功能了呐QAQ！`,
        haveToBind: `请先绑定sessionToken哦！\n如果不知道自己的sessionToken可以尝试扫码绑定嗷！` + bindTip,
        haveToUpdate: `请先更新数据哦！\n格式：{prefix}update`,
        notFoundSong: `没有找到{0}的有关信息QAQ！`,
        haveAnotherGame: `当前存在其他未结束的游戏嗷！如果想要开启新游戏请 {prefix}ans 结束进行的游戏嗷！`,
        renderingImg: `正在生成图片，请稍等一下哦！\n//·/w\\·\\\\`,
        listToLong: `谱面数量过多({0})大于设置的最大值({1})，只显示前{1}条！`,
        turnToPrivate: `请私聊使用嗷`,
        haveToInputName: `请指定曲名哦！\n格式：{prefix}{cmd} &lt;曲名&gt;`,
        plusAndRange: `含有 '+' 的难度不支持指定范围哦！`,
        notNum: `{0} 不是一个数字哦`,


        bindHaveToInputToken: `喂喂喂！你还没输入sessionToken呐！` + bindTip,
        bindErrToken: `绑定sessionToken错误QAQ!\n错误的tk:{0}` + bindTip,
        bindQRCode: `\n请点击链接或使用最新版TapTap扫码进行登录嗷！请勿使用他人的链接。请注意，登录TapTap可能造成账号及财产损失，请在信任Bot来源的情况下扫码登录。`,
        bindQRCodeBeUsed: `登录二维码已扫描，请确认登录`,
        bindQRCodeTimeout: `操作超时，请重试！`,
        bindQRCodeFail: `获取sessionToken失败QAQ！请确认您的Phigros已登录TapTap账号！\n错误信息：{0}`,
        bindTipProtectToken: `请注意保护好自己的sessionToken呐！如果需要获取已绑定的sessionToken可以私聊发送 {prefix}sessionToken 哦！`,
        bindIng: `正在更新中，请稍等一下哦！\n &gt;_&lt;`,
        bindFailed: `更新失败，请检查你的sessionToken是否正确！\n错误信息：{0}`,
        bindUnbind: `解绑会导致历史数据全部清空呐QAQ！真的要这么做吗？（确认/取消）`,
        bindUnbindKeyWord: `确认`,
        bindUnbindSuccess: `成功`,
        bindUnbindCancel: `已取消`,
        bindClear: `请注意，本操作将会删除Phi-Plugin关于您的所有信息QAQ！（确认/取消）`,
        bindUpdated: `更新了{0}份成绩`,
        bindNoUpdate: `未收集到新成绩`,
        bindNewToken: `检测到新的sessionToken，将自动更换绑定。如果需要删除统计记录请 {prefix}unbind 进行解绑哦！`,
        bindNoInfo: `以下曲目无信息，可能导致b19显示错误\n`,
        bindDownloadError: `绑定失败！QAQ\n`,
        bindSaveError: `保存存档失败！\n`,

        letterHaveAnotherGame: `已经在玩开字母啦！如果想要重新开始请先{prefix}ans结束本局游戏哦！`,
        letterNotFoundGame: `现在还没有进行的开字母捏，快输入"{prefix}letter"开始一局吧！`,
        letterStart: `出你字母已开始！回复"/nX.XXXX"命令猜歌，例如："/n1.Reimei";发送/open X来翻开字母(不区分大小写，不需要指令头)，如/open A;发送/ ans结束并查看答案哦！`,
        letterNotFoundSong: `没有找到对应的曲库嗷！`,
        letterGameOver: `全部歌曲已开启！出你字母已结束！`,
        letterBody: `当前考试范围：{0}\n已翻开字母：{1}\n{2}`,
        letterOnlyCanOpenOne: `每次只能翻开一个字母哦！`,
        letterHaveBeOpened: `这个字母已经被翻开了哦！`,
        letterNotHaveThisLetter: `未猜测的曲目里没有这个字母嗷！`,
        letterOpen: `已翻开字母{0}`,
        letterGuessMsgNoNum: `请输入一个数字哦！\n例：n1.df`,
        letterGuessNumIg: `没有第{0}首歌啦！看清楚再回答啊喂！￣へ￣`,
        letterGuessFalse: `第{0}首歌不是{1}www，要不再想想捏？≧ ﹏ ≦`,
        letterGuessTrue: `恭喜你答对了！第{0}首歌是{1}！ヾ(≧▽≦*)o`,
        letterGetTip: `已经帮你随机翻开一个字符[ {0} ]了捏 ♪（＾∀＾●）ﾉ`,

        b19NotFoundSong: `没有找到{0}的有关信息QAQ！`,
        b19SongNoScore: `我不知道你关于[{name}]的成绩哦！可以试试更新成绩哦！\n格式：{prefix}update`,

        downloadAnother: `已经有一个更新任务在进行中了哦！请稍后再试！`,
        downloadFinish: `更新完毕！`,
        downloadIllBegin: `开始下载曲绘文件`,
        downloadIllFail: `曲绘文件更新失败QAQ!`,
        downloadIllAlreadyNew: `曲绘文件已经是最新版本\n最后更新时间：{0}`,
        downloadIllNew: `phi-plugin-ill\n最后更新时间：{0}`,
        downloadIllFailTimeout: `\n连接超时：{0}`,
        downloadIllFailFetch: `\n连接失败：{0}`,
        downloadIllFailOverwrite: `\n存在冲突：\n{0}\n请手动解决冲突后再次尝试更新，或者执行/强制更新，放弃本地修改`,

        songNotFoundRange: `未找到 {0} - {1} 的 {2}谱面QAQ!`,
        songNotFoundClg: `未找到符合条件的谱面QAQ！`,
        songComRult: `dif: {0} acc: {1}\n计算结果：{2}`,
        songComErr: `格式错误QAQ！\n格式：{prefix}com &lt;定数&gt; &lt;acc&gt;`,
        songNew1: `新曲速递：\n`,
        songNew2: `\n定数&谱面修改：\n`,
        songNewToLong: `新曲速递内容过长，请试图查阅其他途径！`,

        userinfoData: `您的data数为：`,
    })

}
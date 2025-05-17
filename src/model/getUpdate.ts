import { Context, Session } from "koishi";
import PhigrosUser from "../lib/PhigrosUser";
import getSave from "./getSave";
import send from "./send";
import { logger } from "../components/Logger";
import Save from "./class/Save";
import getPluginData from "./getPluginData";
import getInfo from "./getInfo";
import { Level } from "./constNum";
import { i18nList } from "../components/i18n";

/**
     * 更新存档
     * @param session 
     * @param User 
     * @returns [rks变化值，note变化值]，失败返回 false
     */
export default async function buildingRecord(ctx: Context, session: Session, User: PhigrosUser): Promise<number[]> {
    let old = await getSave.getSave(session.userId)

    if (old) {
        if (old.sessionToken) {
            if (old.sessionToken == User.sessionToken) {
                // send.send_with_At(e, `你已经绑定了该sessionToken哦！将自动执行update...\n如果需要删除统计记录请 ⌈/${Config.getUserCfg('config', 'cmdhead')} unbind⌋ 进行解绑哦！`)
            } else {
                send.send_with_At(session, session.text(i18nList.bind.newToken, { prefix: getInfo.getCmdPrefix(ctx, session) }))

                await getSave.add_user_token(session.userId, User.sessionToken)
                old = await getSave.getSave(session.userId)

            }
        }
    }

    try {
        let save_info = await User.getSaveInfo()
        if (old && old.modifiedAt == save_info.modifiedAt.iso) {
            return [0, 0]
        }
        let err = await User.buildRecord()
        if (err.length) {
            send.send_with_At(session, session.text(i18nList.bind.noInfo) + err.join('\n'))
        }
    } catch (err) {
        send.send_with_At(session, session.text(i18nList.bind.downloadError) + err)
        logger.error(err)
        return null
    }

    try {
        await getSave.putSave(session.userId, User)
    } catch (err) {
        send.send_with_At(session, session.text(i18nList.bind.saveError) + err)
        logger.error(err)
        return null
    }


    let now = new Save(User)
    // await now.init()
    /**更新 */
    let history = await getSave.getHistory(session.userId)
    history.update(now)
    getSave.putHistory(session.userId, history)


    let pluginData = await getPluginData.get(session.userId)

    /**note数量变化 */
    let add_money = 0

    let task = pluginData?.plugin_data?.task
    if (task) {
        for (let id in now.gameRecord) {
            for (let i in task) {
                if (!task[i]) continue
                if (!task[i].finished && getInfo.songById[id] == task[i].song) {
                    let level = Level.indexOf(task[i].request.rank)
                    if (!now.gameRecord[id][level]) continue
                    switch (task[i].request.type) {
                        case 'acc': {
                            if (now.gameRecord[id][level].acc >= task[i].request.value) {
                                pluginData.plugin_data.task[i].finished = true
                                pluginData.plugin_data.money += task[i].reward
                                add_money += task[i].reward
                            }
                            break
                        }
                        case 'score': {
                            if (now.gameRecord[id][level].score >= task[i].request.value) {
                                pluginData.plugin_data.task[i].finished = true
                                pluginData.plugin_data.money += task[i].reward
                                add_money += task[i].reward
                            }
                            break
                        }
                    }
                }
            }
        }
    }
    await getPluginData.put(session.userId, pluginData)

    /**rks变化 */
    let add_rks = old ? now.saveInfo.summary.rankingScore - old.saveInfo.summary.rankingScore : 0
    return [add_rks, add_money]
}
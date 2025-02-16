import { Context } from 'koishi'
import path from 'node:path'
import { infoPath } from '../components/pluginPath'
import getFile from '../model/getFile'
import render from '../model/render'
import getInfo from '../model/getInfo'
import send from '../model/send'

export default class phiHelp {

    constructor(ctx: Context) {
        ctx.command('phi.help', '查看帮助', { authority: 0 }).action(async ({ session }) => {

            // 获取指令前缀
            const prefix:string = session.resolve(session.app.koishi.config.prefix)[0] ?? ''
            if (await send.isBan(session, 'help')) {
                return;
            }
            const variables = { prefix:prefix };
            let helpGroup = await getFile.FileReader(path.join(infoPath, 'help.json'), "JSON" ,variables);
            
            session.send(await render(ctx, "help", {
                helpGroup: helpGroup,
                cmdHead: null,
                isMaster: (session as any)?.user?.authority == 4,
                background: getInfo.getill(getInfo.illlist[Math.floor(Math.random() * getInfo.illlist.length)]),
                theme: 'star'
            }))
            return;
            // return '1';
        })
    }
}
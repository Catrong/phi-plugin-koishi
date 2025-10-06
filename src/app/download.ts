import { Context, Session } from 'koishi'
import { Config } from '..'
import { logger } from '../components/Logger';
import lodash from "lodash";
import fs from "fs";
import { cachePath } from '../components/pluginPath';
import { exec, execSync } from 'child_process';
import { i18nList } from '../components/i18n';


let uping = false
let isUp = false
let oldCommitId = ""

export default class phiDownload {
    constructor(ctx: Context, config: Config) {
        ctx.command('phi.downill', '下载illust', { authority: 4 }).action(async ({ session }) => {
            /** 检查是否正在更新中 */
            if (uping) {
                await session.send(i18nList.download.another);
                return;
            }

            /** 检查git安装 */
            if (!(await checkGit(session))) return;

            const isForce = 1


    if (!fs.existsSync(`${cachePath}/original_ill/.git`)) {
        /**执行安装 */
        await clone(session, config);
    } else {
        /** 检查仓库是否有效 */
        if (!(await checkRepository())) {
            logger.warn("检测到损坏的git仓库，将重新克隆");
            // 删除损坏的仓库目录
            try {
                fs.rmSync(`${cachePath}/original_ill`, { recursive: true, force: true });
            } catch (err) {
                logger.error("删除损坏仓库失败：" + err);
            }
            await clone(session, config);
        } else {
            /** 执行更新 */
            await runUpdate(session, config);
        }
    }            /** 是否成功 */
            if (isUp) {
                await session.send(i18nList.download.finish);
            }
        })
    }
}



async function clone(session: Session, config: Config) {
    let command = `git clone ${config.downIllUrl} ${cachePath}/original_ill/ --depth=1`;

    session.send(session.text(i18nList.download.illBegin));

    uping = true;
    let ret: any = await execSyncGit(command);
    uping = false;
    if (ret.error) {
        logger.error(session.text(i18nList.download.illFail));
        gitErr(ret.error, ret.stdout, session);
        return false;
    }

    /** 获取插件提交的最新时间 */
    let time = await getTime();

    if (/(Already up[ -]to[ -]date|已经是最新的)/.test(ret.stdout)) {
        await session.send(session.text(i18nList.download.alreadyNew, [time]));
    } else {
        await session.send(session.text(i18nList.download.illNew, [time]));
        isUp = true;
        /** 获取phi-plugin-ill的更新日志 */
        let log: any = await getLog(session, config);
        await session.send(log ? log.join("\n") : "");
    }

    logger.info(`最后更新时间：${time}`);

    return true;

}

/**
     * 处理更新失败的相关函数
     * @param {string} err
     * @param {string} stdout
     * @returns
     */
async function gitErr(err, stdout, session: Session) {
    let msg = session.text(i18nList.download.illFail);
    let errMsg = err.toString();
    stdout = stdout.toString();

    if (errMsg.includes("Timed out")) {
        let remote = errMsg.match(/'(.+?)'/g)[0].replace(/'/g, "");
        await session.send(msg + session.text(i18nList.download.illFailTimeout, [remote]));
        return;
    }

    if (/Failed to connect|unable to access/g.test(errMsg)) {
        let remote = errMsg.match(/'(.+?)'/g)[0].replace(/'/g, "");
        await session.send(msg + session.text(i18nList.download.illFailFetch, [remote]));
        return;
    }

    if (errMsg.includes("be overwritten by merge")) {
        await session.send(
            msg + session.text(i18nList.download.illFailOverwrite, [errMsg])
        );
        return;
    }

    if (stdout.includes("CONFLICT")) {
        await session.send(
            msg + session.text(i18nList.download.illFailOverwrite, [errMsg + stdout,]),
        );
        return;
    }

    await session.send([errMsg, stdout]);
}

/**
 * 更新
 * @returns
 */
async function runUpdate(session: Session, config: Config) {

    try {
        var gitCfg = fs.readFileSync(`${cachePath}/original_ill/.git/config`, "utf8")

        gitCfg = gitCfg.replace(/url\s*=\s*(.*)/, `url = ${config.downIllUrl}`)

        fs.writeFileSync(`${cachePath}/original_ill/.git/config`, gitCfg, "utf8")
    } catch (err) {
        logger.error(err)
    }


    let repoPath = `${cachePath}/original_ill/`;
    let command = [
        `git -C ${repoPath} fetch --all --prune`,
        `git -C ${repoPath} reset --hard origin/main`,
        `git -C ${repoPath} clean -fd`
    ].join(" && ");
    session.send("正在更新曲绘文件，请勿重复执行");

    try {

        /** 获取上次提交的commitId，用于获取日志时判断新增的更新日志 */
        oldCommitId = await getcommitId();
        uping = true;
        let ret: any = await execSyncGit(command);
        uping = false;

        if (ret.error) {
            logger.error(`曲绘文件更新失败QAQ!`);
            gitErr(ret.error, ret.stdout, session);
            return false;
        }
        /** 获取插件提交的最新时间 */
        let time = await getTime();

        if (/(Already up[ -]to[ -]date|已经是最新的)/.test(ret.stdout)) {
            await session.send(`曲绘文件已经是最新版本\n最后更新时间：${time}`);
        } else {
            await session.send(`phi-plugin-ill\n最后更新时间：${time}`);
            isUp = true;
            /** 获取phi-plugin-ill的更新日志 */
            let log: any = await getLog(session, config);
            await session.send(log ? log.join("\n") : "");
        }

        logger.info(`最后更新时间：${time}`);

        return true;
    } catch (error) {
        uping = false;
        logger.error(error.toString());
        session.send(error.toString());
        return false;
    }

}

/**
 * 获取phi-plugin-ill的更新日志
 * @param {string} plugin 插件名称
 * @returns
 */
async function getLog(session: Session, config: Config) {
    // 首先检查仓库是否有提交历史
    let checkCmd = `git -C ${cachePath}/original_ill/ rev-list --count HEAD`;
    try {
        let count = await execSync(checkCmd, { encoding: "utf-8" });
        if (parseInt(lodash.trim(count)) === 0) {
            logger.warn("仓库暂无提交历史，跳过日志获取");
            return ["新克隆的仓库，暂无更新日志"];
        }
    } catch (error) {
        logger.warn("无法检查仓库提交历史：" + error.toString());
        return false;
    }

    let cm = `git -C ${cachePath}/original_ill/ log -20 --oneline --pretty=format:"%h||[%cd]  %s" --date=format:"%m-%d %H:%M"`;

    let logAll;
    try {
        logAll = await execSync(cm, { encoding: "utf-8" });
    } catch (error) {
        logger.error(error.toString());
        session.send(error.toString());
    }

    if (!logAll) return false;

    logAll = logAll.split("\n");

    let log = [];
    for (let str of logAll) {
        str = str.split("||");
        if (oldCommitId && str[0] == oldCommitId) break;
        if (str[1] && str[1].includes("Merge branch")) continue;
        if (str[1]) log.push(str[1]);
    }
    if (!config.isGuild) {
        log.push("更多详细信息，请前往github查看\nhttps://github.com/Catrong/phi-plugin-ill");
    }

    let line = log.length;

    if (line <= 1) return "";

    session.send(`最近更新日志：\n${log.join("\n")}`);

    return log;
}

/**
 * 获取上次提交的commitId
 * @param {string} plugin 插件名称
 * @returns
 */
async function getcommitId() {
    let cm = `git -C ${cachePath}/original_ill/ rev-parse --short HEAD`;

    try {
        let commitId = await execSync(cm, { encoding: "utf-8" });
        commitId = lodash.trim(commitId);
        return commitId;
    } catch (error) {
        logger.warn("无法获取commit ID，可能是空仓库或仓库损坏");
        return "";
    }
}

/**
 * 获取本次更新插件的最后一次提交时间
 * @param {string} plugin 插件名称
 * @returns
 */
async function getTime() {
    // 首先检查仓库是否有提交历史
    let checkCmd = `git -C ${cachePath}/original_ill/ rev-list --count HEAD`;
    try {
        let count = await execSync(checkCmd, { encoding: "utf-8" });
        if (parseInt(lodash.trim(count)) === 0) {
            return "新仓库，暂无提交记录";
        }
    } catch (error) {
        return "无法获取仓库信息";
    }

    let cm = `git -C ${cachePath}/original_ill/ log -1 --oneline --pretty=format:"%cd" --date=format:"%m-%d %H:%M"`;

    let time = "";
    try {
        time = await execSync(cm, { encoding: "utf-8" });
        time = lodash.trim(time);
    } catch (error) {
        logger.error(error.toString());
        time = "获取时间失败";
    }
    return time;
}

/**
 * 异步执行git相关命令
 * @param {string} cmd git命令
 * @returns
 */
async function execSyncGit(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { windowsHide: true }, (error, stdout, stderr) => {
            resolve({ error, stdout, stderr });
        });
    });
}

/**
 * 检查git是否安装
 * @returns
 */
async function checkGit(session: Session) {
    try {
        let ret = await execSync("git --version", { encoding: "utf-8" });
        if (!ret || !ret.includes("git version")) {
            await session.send("请先安装git");
            return false;
        }
        return true;
    } catch (error) {
        await session.send("请先安装git");
        return false;
    }
}

/**
 * 检查仓库是否有效
 * @returns
 */
async function checkRepository() {
    try {
        // 检查是否是git仓库
        await execSync(`git -C ${cachePath}/original_ill/ rev-parse --git-dir`, { encoding: "utf-8" });
        return true;
    } catch (error) {
        return false;
    }
}
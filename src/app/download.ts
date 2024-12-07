import { Context, Session } from 'koishi'
import { Config } from '..'
import { createRequire } from "module";
import { logger } from '../components/Logger';
import lodash from "lodash";
import fs from "fs";
import { cachePath } from '../components/pluginPath';



const require = createRequire(import.meta.url);
const { exec, execSync } = require("child_process");

let uping = false
let isUp = false
let oldCommitId = ""

export default class phiDownload {
    constructor(ctx: Context, config: Config) {
        ctx.command('phi.downill', '下载illust', { authority: 4 }).action(async ({ session }) => {
            /** 检查是否正在更新中 */
            if (uping) {
                await session.send("已有命令更新中..请勿重复操作");
                return;
            }

            /** 检查git安装 */
            if (!(await checkGit(session))) return;

            const isForce = 1


            if (!fs.existsSync(`${cachePath}/original_ill/.git`)) {
                /**执行安装 */
                await clone(session, config);
            } else {
                /** 执行更新 */
                await runUpdate(session, config);
            }

            /** 是否成功 */
            if (isUp) {
                await session.send("更新完毕")
            }
        })
    }
}



async function clone(session: Session, config: Config) {
    let command = `git clone https://gitee.com/Steveeee-e/phi-plugin-ill.git ${cachePath}/original_ill/ --depth=1`;

    session.send("开始下载曲绘文件");

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

}

/**
     * 处理更新失败的相关函数
     * @param {string} err
     * @param {string} stdout
     * @returns
     */
async function gitErr(err, stdout, session: Session) {
    let msg = "更新失败！";
    let errMsg = err.toString();
    stdout = stdout.toString();

    if (errMsg.includes("Timed out")) {
        let remote = errMsg.match(/'(.+?)'/g)[0].replace(/'/g, "");
        await session.send(msg + `\n连接超时：${remote}`);
        return;
    }

    if (/Failed to connect|unable to access/g.test(errMsg)) {
        let remote = errMsg.match(/'(.+?)'/g)[0].replace(/'/g, "");
        await session.send(msg + `\n连接失败：${remote}`);
        return;
    }

    if (errMsg.includes("be overwritten by merge")) {
        await session.send(
            msg +
            `存在冲突：\n${errMsg}\n` +
            "请解决冲突后再更新，或者执行#强制更新，放弃本地修改"
        );
        return;
    }

    if (stdout.includes("CONFLICT")) {
        await session.send([
            msg + "存在冲突\n",
            errMsg,
            stdout,
            "\n请解决冲突后再更新，或者执行#强制更新，放弃本地修改",
        ]);
        return;
    }

    await session.send([errMsg, stdout]);
}

/**
 * 更新
 * @returns
 */
async function runUpdate(session: Session, config: Config) {

    let command = `git -C ${cachePath}/original_ill/ pull --no-rebase`;
    command = `git -C ${cachePath}/original_ill/ checkout . && ${command}`;
    session.send("正在更新曲绘文件，请勿重复执行");

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
}

/**
 * 获取phi-plugin-ill的更新日志
 * @param {string} plugin 插件名称
 * @returns
 */
async function getLog(session: Session, config: Config) {
    let cm = `cd ${cachePath}/original_ill/ && git log  -20 --oneline --pretty=format:"%h||[%cd]  %s" --date=format:"%m-%d %H:%M"`;

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
        if (str[0] == oldCommitId) break;
        if (str[1].includes("Merge branch")) continue;
        log.push(str[1]);
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

    let commitId = await execSync(cm, { encoding: "utf-8" });
    commitId = lodash.trim(commitId);

    return commitId;
}

/**
 * 获取本次更新插件的最后一次提交时间
 * @param {string} plugin 插件名称
 * @returns
 */
async function getTime() {
    let cm = `cd ${cachePath}/original_ill/ && git log -1 --oneline --pretty=format:"%cd" --date=format:"%m-%d %H:%M"`;

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
    let ret = await execSync("git --version", { encoding: "utf-8" });
    if (!ret || !ret.includes("git version")) {
        await session.send("请先安装git");
        return false;
    }
    return true;
}
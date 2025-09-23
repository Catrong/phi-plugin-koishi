import { Logger } from "koishi";


let Log = new Logger('phi-plugin')

export class logger {
    static info(...msg: any[]) {
        Log.info(msg.join('\n'))
    }
    static error(...msg: any[]) {
        Log.error(msg.join('\n'))
    }
    static warn(...msg: any[]) {
        Log.warn(msg.join('\n'))
    }
}

export function apply() {
}
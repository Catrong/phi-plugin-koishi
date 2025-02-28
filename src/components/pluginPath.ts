import { Context } from 'koishi'
import path from 'path'


/**插件根目录 */
export const pluginPath = __dirname.replace(/\\/g, '/').replace(/\/(src|lib)\/components/, '')
const _path = process.cwd().replace(/\\/g, '/')

/**插件名 */
export const pluginName = path.basename(path.join(pluginPath, '../../'))
/**src 根目录 */
export const pluginRoot = __dirname.replace(/\\/g, '/').replace(/\/components/, '')

/**插件资源目录 */
export const pluginResources = path.join(pluginPath, 'resources')

export const htmlPath = path.join(pluginResources, 'html')


/**曲绘资源、曲目信息路径 */
export const infoPath = path.join(pluginResources, 'info')

/**额外曲目名称信息（开字母用） */
export const DlcInfoPath = path.join(pluginResources, 'info', 'DLC')

/**上个版本信息 */
export const oldInfoPath = path.join(pluginResources, 'info', 'oldInfo')

/**默认图片路径 */
export const imgPath = path.join(pluginResources, 'html', 'otherimg')

/**用户图片路径 */
export const ortherIllPath = path.join(pluginResources, 'otherill')

/**音频资源 */
export const guessMicPath = path.join(pluginResources, 'splited_music')

/**数据路径 */
export let dataPath: string

/**用户娱乐数据路径 */
export let pluginDataPath: string

/**用户存档数据路径 */
export let savePath: string

/**备份路径 */
export let backupPath: string

/**临时文件路径 */
export let tempPath: string

/**缓存路径 */
export let cachePath: string

/**原画资源 */
export let originalIllPath: string

export function apply(ctx: Context) {
    dataPath = path.join(ctx.baseDir, 'data', 'Catrong@phi-plugin')
    pluginDataPath = path.join(dataPath, 'pluginData')
    savePath = path.join(dataPath, 'saveData')
    backupPath = path.join(dataPath, 'backup')
    tempPath = path.join(ctx.baseDir, 'temp', 'Catrong@phi-plugin')
    cachePath = path.join(ctx.baseDir, 'cache', 'Catrong@phi-plugin')
    originalIllPath = path.join(cachePath, 'original_ill')
}


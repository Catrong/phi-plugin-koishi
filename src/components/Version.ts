
import fs from 'fs'
import { pluginPath } from './pluginPath'
const README_path = `${pluginPath}/README.md`

let changelogs = []
/**v 0.0.0 */
let currentVersion: string = 'Koishi'

// try {
//     if (fs.existsSync(README_path)) {
//         let README = fs.readFileSync(README_path, 'utf8') || ''
//         let reg = /https:\/\/img.shields.io\/badge\/%E7%89%88%E6%9C%AC-(.*)-9cf\?style=for-the-badge/.exec(README)
//         if (reg) {
//             currentVersion = 'v' + reg[1]
//         }
//     }
// } catch (err) { }

let Version = {
    get ver() {
        return currentVersion
    }
}
export default Version

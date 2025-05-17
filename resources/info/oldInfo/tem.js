import getFile from '../../../model/getFile.js';

let json = await getFile.FileReader('./notesInfo.json');
let newJson = {};
for (const id in json) {
    newJson[id]  = {}
    for (const lv in json[id]) {
        let tem = json[id][lv]
        newJson[id][lv] = {t:[tem.tap, tem.drag, tem.hold, tem.flick]}
    }
}
console.log(newJson)
getFile.SetFile('./notesInfo.json', newJson)
import fs from 'node:fs';
import csv from 'csvtojson';
import path from 'node:path';
import YAML from 'yaml';
import { logger } from '../components/Logger';



export default class getFile {

    /**
     * 读取文件
     * @param filePath 完整路径
     * @param style 强制设置文件格式
     * @param variables 需要替换的变量对象（例如：{ username: 'John' }）
     */
    static FileReader(filePath: string, style: string | 'JSON' | 'YAML' | 'TXT' = undefined, variables: Object = {}) {
        try {
            if (!fs.existsSync(filePath)) { return false }
            
            if (!style) {
                style = path.extname(filePath).toUpperCase().replace('.', '');
            }

            let fileContent = '';
            switch (style) {
                case 'JSON': {
                    fileContent = fs.readFileSync(filePath, 'utf8');
                    const parsedContent = JSON.parse(fileContent);
                    return this.replaceVariables(parsedContent, variables); // 替换占位符
                }
                case 'YAML': {
                    fileContent = fs.readFileSync(filePath, 'utf8');
                    const parsedContent = YAML.parse(fileContent);
                    return this.replaceVariables(parsedContent, variables); // 替换占位符
                }
                case 'TXT': {
                    fileContent = fs.readFileSync(filePath, 'utf8');
                    return this.replaceVariables(fileContent, variables); // 替换占位符
                }
                default: {
                    fileContent = fs.readFileSync(filePath, 'utf8');
                    return this.replaceVariables(fileContent, variables); // 替换占位符
                }
            }
        } catch (error) {
            logger.warn(`[phi-plugin][${filePath}] 读取失败`);
            logger.warn(error);
            return false;
        }
    }

    /**
     * 替换文本中的占位符
     * @param content 内容
     * @param variables 需要替换的变量对象
     */
    static replaceVariables(content: any, variables: Object) {
        // 如果没有传入 variables，直接返回原始内容
        if (Object.keys(variables).length === 0) {
            return content;
        }

        if (typeof content === 'string') {
            // 如果是字符串，替换占位符
            return content.replace(/{(\w+)}/g, (_, key) => variables[key] || `{${key}}`);
        }

        if (typeof content === 'object') {
            // 如果是对象，递归替换
            for (let key in content) {
                content[key] = this.replaceVariables(content[key], variables);
            }
        }

        return content;
    }

    static async csvReader(filePath: string) {
        return await csv().fromFile(filePath)
    }


    /**
     * 存储文件
     * @param {string} filepath 文件名，含后缀
     * @param {any} data 目标数据
     * @param {string|'TXT'|'JSON'|'YAML'} [style=undefined] 强制指定保存格式
     */
    static SetFile(filepath: string, data: any, style: string | 'JSON' | 'YAML' | 'TXT' = undefined) {
        try {
            const fatherPath = path.dirname(filepath)
            const fileName = path.basename(filepath)
            // console.info(filepath, fatherPath, fileName)
            if (!fs.existsSync(fatherPath)) {
                // 递归创建目录
                fs.mkdirSync(fatherPath, { recursive: true });
            }
            if (!style) {
                style = path.extname(filepath).toUpperCase().replace('.', '')
            }
            switch (style) {
                case 'JSON': {
                    fs.writeFileSync(filepath, JSON.stringify(data), 'utf8')
                    break
                }
                case 'YAML': {
                    fs.writeFileSync(filepath, YAML.stringify(data), 'utf8')
                    break
                }
                case 'TXT': {
                    fs.writeFileSync(filepath, data, 'utf8')
                }
                default: {
                    // Logger.error(`[phi-plugin][Set]不支持的文件格式`, style, filepath)
                    fs.writeFileSync(filepath, data, 'utf8')
                    break
                }
            }
            return true
        } catch (error) {
            // console.info(error)
            logger.warn(`[phi-plugin]写入文件 ${filepath} 时遇到错误`)
            logger.warn(error)
            return false
        }
    }


    static DelFile(path: string) {
        try {
            if (!fs.existsSync(`${path}`)) { return false }
            fs.unlink(`${path}`, (err) => {
                if (err) throw err
            })
            return true
        } catch (error) {
            logger.warn(`[phi-plugin][${path}] 删除失败`)
            logger.warn(error)
            return false
        }
    }

}

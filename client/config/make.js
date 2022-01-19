/*
 * @Author: your name
 * @Date: 2019-11-01 16:19:17
 * @LastEditTime: 2021-12-31 14:10:23
 * @LastEditors: Please set LastEditors
 * @Description: 使用js-yaml将yaml配置文件转为json数据文件，实现多语言；每种语言对应json后缀
 */


// 引入js-yaml
const yaml = require('js-yaml');
const fs = require('fs');

// 语言切切换配置
// "_en" 英文
// "_tch" 繁体中文
const config = {
    "_en": 1,
    "_tch": 2
}

const argv = process.argv
// 获取文件名
var filePath = argv[2];

// 文件后缀
var LANG = argv[3];
var INDEX = 0;

if (LANG) {
    if (!config[LANG]) {
        return console.log("参数不存在")
    }
    INDEX = config[LANG]
} else {
    LANG = '';
}

try {

    // json转yaml
    /* var jsonStr = fs.readFileSync('../data/aplication.json', 'utf8');
    var jsonObj = JSON.parse(jsonStr);
    var doc = yaml.dump(jsonObj); */

    // yaml转json
    var jsonFile = yaml.safeLoad(fs.readFileSync('./aplication.yml', 'utf8'));

    traverseTree(jsonFile, '', INDEX);
    jsonFile = JSON.stringify(jsonFile);
    // console.log(jsonFile);

    fs.writeFile(filePath, jsonFile, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("make success!");
    });

} catch (e) {
    console.log(e);
}


/**
 * @name: traverseTree
 * @msg: 递归遍历json对象所有节点，并通过‘|’分隔符切换语言
 * @param {object} jsonObj
 * @param {string} key
 * @param {number} el
 * @return: null
 */
function traverseTree(jsonObj, key, el) {
    if (jsonObj !== null && typeof jsonObj == "object") {
        Object.entries(jsonObj).forEach(([key, value]) => {

            if (value) {
                var jsonArr = value.toString().split("|");
                if (jsonArr.length > 1) {
                    jsonObj[key] = jsonArr[el];
                }
            }
            traverseTree(value, key, el);
        });
    }
    else {
        // jsonObj is a number or string
        // console.log(key, jsonObj)
    }
}

/****************************************/
/** 本地文件存储
 * 
 * 
 * 
/****************************************/
/* 
 */

/* electronIPC通信 */
try {
	var electron_ipc = require('electron').ipcRenderer;
} catch (error) {
	console.log("it is not electron>>", error)
}


var DEVICE_ID = "";
// 通过ipc事件调用
async function NodeToDllExec(req) {
    /**
     * 调用本地DLL
     * 通过ipc事件调用 exe 调用 dll
     */
    if (req.mode.indexOf("ecp_pser") != -1) {
        let logReq = req.tranData;
        console.log("P端 >> ", logReq);
        // ecp_pser_infopassthrough只调整这一个P端请求接口的数据，进行Unicode加密
        if (req.mode == "ecp_pser_infopassthrough") {
            req.tranData = SysCNtoUnicode(JSON.stringify(req.tranData))
        }
    } else {
        console.log("本地DLL >> ", req);
    }
    electron_ipc.send('nodeToDll-exec-Main', JSON.stringify(req));
    return new Promise((resolve, reject) => {
        electron_ipc.once('nodeToDll-exec-Renderer', (event, ans) => {
            let tempStr = ans;
            try {
                let result = JSON.parse(tempStr)
                
                if (req.mode.indexOf("ecp_pser") != -1) {
                    console.log("P端 << ", result);
                } else {
                    console.log("本地DLL << ", result);
                }

                resolve(result)
            } catch (error) {
                // 特殊处理
                let code = tempStr.substr(tempStr.indexOf("code")+7, 1);
                let mode = tempStr.substring(tempStr.indexOf("mode")+7, tempStr.indexOf("msg")-3);
                let msg = tempStr.substring(tempStr.indexOf("msg")+6, tempStr.length-2);
                let result = {"code": code, "mode": mode, "msg": msg};
                
                if (req.mode.indexOf("ecp_pser") != -1) {
                    console.log("P端 << ", result);
                } else {
                    console.log("本地DLL << ", result);
                }

                resolve(result)
            }
        });
    });
}

// 通过ipc事件调用 日志调用专用
/* async function NodeToDllExec_Logger(req) {
    electron_ipc.send('nodeToDll-exec-Main', JSON.stringify(req));
    return new Promise((resolve, reject) => {
        electron_ipc.once('nodeToDll-exec-Renderer', (event, ans) => {
            let tempStr = ans;
            let result = JSON.parse(tempStr)
            resolve(result)
        });
    });
} */

initLogger();
// 日志信息
function initLogger() {
    /* 业务日志,重写console.log方法，将log保存 */
    console.log = async (param1, param2) => {
    	if (param2 == undefined) {
    		param2 = '';
    	}
    	console.info(param1, param2);

    	if (typeof (param1) == 'object') {
    		param1 = JSON.stringify(param1);
    	}
    	if (typeof (param2) == 'object') {
    		param2 = JSON.stringify(param2);
    	}
    	let str = param1 + param2
    	/* // 身份证和姓名脱敏
    	if(!isNull(IDCARD_INFO[5])||!isNull(IDCARD_INFO[0])){
    		ReplaceForIdCardAndNameD(str,IDCARD_INFO[5],IDCARD_INFO[0]);
    	} */
        SystemBaseApi.loggerInfo_IPC(str);
    }
}

// 解析报文参数为object
function parsingParam(param) {
    var obj = new Object();
    param = param.split("&");
    for (var i in param) {
        var index = param[i].indexOf("=");
        var key = param[i].substr(0, index);
        var value = param[i].substr(index + 1, param[i].length);
        obj[key] = value
    }
    if(obj.resultCode==undefined){
        obj.resultCode=9999;
        obj.errorInfo=obj[""];
    }
    return obj;
}

// 中文转unicode
function SysCNtoUnicode(str) {
    function left_zero_4(str) {
        if (str != null && str != '' && str != 'undefined') {
            if (str.length == 2) {
                return '00' + str;
            }
        }
        return str;
    }
    var value='';
    for (var i = 0; i < str.length; i++) {
        value += left_zero_4(parseInt(str.charCodeAt(i)).toString(16));
    }
    return value;
}

const SystemBaseApi = {
    

    /****************************************/
    /** 语言播放
     *  使用微软ActiveX语音功能
     * 
     * 
    /****************************************/
    async SST_VoiceSpeak(word) {
        electron_ipc.send('systemSpeech-exec-Main', word);
        return new Promise((resolve, reject) => {
            electron_ipc.once('systemSpeech-exec-Renderer', (event, ans) => {
                resolve(ans)
            });
        });
    },

    /**
     * 系统延时函数 ms
     */
    async SST_Delay(ms) {
        return new Promise(function (resolve, reject) {
        let timeoutInt = setTimeout(()=>{
            clearTimeout(timeoutInt);
            resolve();
        }, ms);
        })
    },

    /**
     * 日志
     */
    loggerInfo_IPC(log) {
        try {
            electron_ipc.send('logger-info-Main', log);
        } catch (error) {
            console.error(error);
        }
    },
    // 写入前端业务日志文件
    /* async SST_RecordLogs(data) {
        let myDate = new Date();
        let year = myDate.getFullYear();
        let month = myDate.getMonth() + 1;
        let date = myDate.getDate();
        month = month < 10 ? '0' + month : month;
        date = date < 10 ? '0' + date : date;
        let today = year + '' + month + '' + date;
        let req = {
            "mode": "ecp_localdev_log_record",
            "data": data,
            "filePath": "../ecpmbview/logs/swt_" + today + ".log"
        }
        let result = await NodeToDllExec_Logger(req);
        return result;
    }, */



    // 设置当前系统时间
    async SST_SystemSettimer(time) {
        // 时间格式: 20210918121212
        let req = {
            "mode": "ecp_localdev_system_settimer",
            "timer": time
        }
        let result = await NodeToDllExec(req);
        return result;
    },
    // 运行cmd命令
    async SST_SystemRuncmd(word) {
        // 运行格式： .\wkhtmltopdf.exe .\pdf.html pdf.pdf
        let req = {
            "mode": "ecp_localdev_system_runcmd",
            "cmd": word
        }
        let result = await NodeToDllExec(req);
        return result;
    },
    //检测打印机是否存在
    async SST_CheckPrintExist() {
        // 打印机名称模糊查询
        let printerName = 'HP Color|HP Color LaserJet Pro';
        let req = {
            "mode": "ecp_localdev_print_checkprintexist",
            "printName": printerName
        }
        let result = await NodeToDllExec(req);
        return result;
    },
    // 启动本地应用程序
    async SST_StartLockExe(exePath) {
        let req = {
            "mode": "ecp_localdev_system_runexe",
            "exeFilePath": exePath
        }
        let result = await NodeToDllExec(req);
        return result;
    },
    // 结束应用程序
    async SST_EndProcess(exePath) {
        let req = {
            "mode": "ecp_localdev_system_killprogress",
            "exeFilePath": exePath
        }
        let result = await NodeToDllExec(req);
        return result;
    },
    // 写入配置文件
    async SST_iniFileWrite(key, val) {
        let req = {
            "mode": "ecp_localdev_inifile_writedata",
            "appName": "system",
            "keyName": key,
            "data": val,
            "filePath": "../ecpmbview/ECP_LocalStorage.ini"
        };
        let result = await NodeToDllExec(req);
        return result;
    },
    // 读取配置文件
    async SST_iniFileRead(key) {
        let req = {
            "mode": "ecp_localdev_inifile_readdata",
            "appName": "system",
            "keyName": key,
            "filePath": "../ecpmbview/ECP_LocalStorage.ini"
        };
        let result = await NodeToDllExec(req);
        return result;
    },

    // 写入终端配置文件
    /* SST_iniSetFileWrite(key, val) {
        var result = "";
        result = LocalFileStorage.INIFile_WriteData("system", key, val, "../ecpmbview/CfgDevice.ini");
        return parsingParam(result);
    },
    // 读取终端配置文件
    SST_iniSetFileRead(key) {
        var result = "";
        result = LocalFileStorage.INIFile_ReadData("system", key, "../ecpmbview/CfgDevice.ini");
        var data = parsingParam(result).data;
        return (data);
    }, */

    // 写入MyWatch配置文件
    async SST_iniMyWatchWrite(key, val) {
        let req = {
            "mode": "ecp_localdev_inifile_writedata",
            "appName": "updateOCX",
            "keyName": key,
            "data": val,
            "filePath": "../ECPWatch/ATMControl.ini"
        };
        let result = await NodeToDllExec(req);
        return result;
    },
    // 读取MyWatch配置文件
    async SST_iniMyWatchRead(key) {
        let req = {
            "mode": "ecp_localdev_inifile_readdata",
            "appName": "updateOCX",
            "keyName": key,
            "filePath": "../ECPWatch/ATMControl.ini"
        };
        let result = await NodeToDllExec(req);
        return result;
    },

    //写本地文件
    async WriteLocalFile(key, data) {
        let req = {
            "mode": "ecp_localdev_file_writefile",
            "data": data,
            "filePath": "../ecpmbview/clientData/" + key + ".txt"
        }
        let result = await NodeToDllExec(req);
        return result;
    },
    //读本地文件
    async ReadLocalFile(key) {
        let path = "../ecpmbview/clientData/" + key + ".txt";
        console.log(path);
        let req = {
            "mode": "ecp_localdev_file_readfile",
            "filePath": path
        }
        let result = await NodeToDllExec(req);
        return result;
    },
    //删除本地文件
    async DeleteLoaclFile(key) {
        let req = {
            "mode": "ecp_localdev_file_deletefile",
            "filePath": "../ecpmbview/clientData/" + key + ".txt"
        }
        let result = await NodeToDllExec(req);
        return result;
    },
    // 获取目录所有文件名称
    async SST_GetFileLists(path) {
        if (!path) {
            path = "../ecpmbview/clientData/";
        }
        let req = {
            "mode": "ecp_localdev_file_getfilelists",
            "filePath": path
        }
        let result = await NodeToDllExec(req);
        // let res = result.split('|');
        return result;
    },

    /* // 写入授权信息
    SST_iniClientAuthWrite(key, val) {
        var result = "";
        console.log("key:", key);
        console.log("val:", val);
        result = LocalFileStorage.INIFile_WriteData("client", key, val, "./clientAuth.ini");
        console.log(result);
        return parsingParam(result);
    },
    // 读取授权信息
    SST_iniClientAuthRead(key) {
        var result = "";
        result = LocalFileStorage.INIFile_ReadData("client", key, "./clientAuth.ini");
        var data = parsingParam(result).data;
        console.log(result);
        return (data);
    }, */
    /* // 获取PC信息
    SST_GetPCInfo() {
        var result = "hello";
        result = LocalFileStorage.Computer_GetInfo();
        var data = parsingParam(result);
        return (data);
    }, */
    // Base64转图片
    /* SST_Base64ToPic(base64data) {
        var result = '';
        result = LocalFileStorage.Base64_SaveLocalPic(base64data, "./print.jpg");
        var status = parsingMessage(result).status;
        var message = parsingMessage(result).message;
        console.log(result);
        return ({ "code": status, "msg": message });
    }, */
    // Base64转图片
    async SST_Base64ToPath(base64data, Path) {
        let req = {
            "mode": "ecp_localdev_base64_savepic",
            "base64Data": base64data,
            "filePath": Path
        };
        let result = await NodeToDllExec(req);
        return result;
    },
    // 图片转Base64
    async SST_GetPicBase64(pi, path) {
        let req = {
            "mode": "ecp_localdev_base64_getpicdata",
            "compressFlag": pi,
            "filePath": path
        };
        let result = await NodeToDllExec(req);
        return result;
    },
    //图片合成PDF文件
    async SST_PicToDF(path1, path2, path3, path4) {
        //第一参数固定传0，第二个参数多个图片路径以|分割。且固定需传3个图片路径
        //返回生成pdf文件路径
        let req = {
            "mode": "ecp_localdev_pdf_createfile",
            "picPath": path1 + '|' + path2 + '|' + path3 + '|' + path4
        }
        let result = await NodeToDllExec(req);
        return result;
    },
    //PDF文件获取base64数据
    async SST_PDFGetBase64Data(path) {
        //传入pdf文件路径
        let req = {
            "mode": "ecp_localdev_pdf_getbase64data",
            "filePath": path
        }
        let result = await NodeToDllExec(req);
        return result;
    },
    //图片缩放
    async SST_ECPPicResize(base64data, width, hight) {
        let req = {
            "mode": "ecp_localdev_pic_resize",
            "base64Data": base64data,
            "width": width,
            "height": hight
        }
        console.log("图片压缩：宽：" + width + " 高：" + hight);
        console.log("返回结果：", result)
        let result = await NodeToDllExec(req);
        return result;        
    },
    // 保存本地打印文件
    async SST_SavePrintFile(htmlData, htmlFile) {
        /* var result = "";
        result = LocalFileStorage.SavePrintFile(htmlData, htmlFile);
        var status = parsingMessage(result).status;
        console.log(result);
        return (status); */
        let req = {
            "mode": "ecp_localdev_print_savefile",
            "data": htmlData,
            "filePath": htmlFile
        }
        let result = await NodeToDllExec(req);
        return result;
    },
    //base64 数据解密
    // 照片数据需要转换为二进制码
    async SST_DeBase64Data(base64data){
        let req = {
            "mode": "ecp_localdev_base64_dedata",
            "data": base64data
        };
        let result = await NodeToDllExec(req);
        /* if (param.result == 0) {
            var data = param.data;
            return (data);
        } else {
            console.log('照片为空或照片格式错误')
            return '';
        } */
        return result;
    },
    //HEX转码中文
    /* SST_ECPHECASCTOSTR(HEX){
        var result = "";
        result = LocalFileStorage.ECPHECASCTOSTR(HEX);
        var param = parsingParam(result);
        if (param.result == 0) {
            var data = param.message;
            return (data);
        } else {
            console.log('读取二代社保卡转码失败')
            return '';
        }
    }, */
    /****************************************/
    /** sm4算法加解密
     * 
     * 
     * 
    /****************************************/
    //sm4算法加密
    async SST_SM4EnData(data, key) {
        console.log("sm4算法加密")
        console.log({ "data": data, "key": key })
        //参数1数据，参数2密钥
        let req = {
            "mode": "ecp_localdev_sm4_endata",
            "data": data,
            "key": key
        }
        let result = await NodeToDllExec(req);
        return result;
    },
    //sm4算法解密
    async SST_SM4DeData(data, key) {
        console.log("sm4算法解密")
        console.log({ "data": data, "key": key })
        //参数1数据，参数2密钥
        let req = {
            "mode": "ecp_localdev_sm4_dedata",
            "data": data,
            "key": key
        }
        let result = await NodeToDllExec(req);
        return result;
    },
    /**
     * 校验密钥
     * @param {Object} key
     * @param {Object} checkVal
     */
    SST_checkKey(key, checkVal) {
        if (SST_SM4EnData("00000000000000000000000000000000", key).substr(0, 16) == checkVal) {
            console.log("校验通过")
            return true;
        }
        console.log("key：" + key)
        console.log("checkVal：" + checkVal)
        console.log("校验失败")
        return false;
    },




    /****************************************/
    /** P端通信
     * 
     * 
     * 
    /****************************************/
    async SST_FunInfoPassthrough(tranCode, tranData) {        
        let req = {
            "mode": "ecp_pser_infopassthrough",
            "type": "01",
            "devId": DEVICE_ID,
            "tranCode": tranCode,
            "tranData": tranData,
        }
        let result = await NodeToDllExec(req);
        let data = result.msg;
        return parsingParam(data);
    },
    // 设备注册
    async SST_FunDevRegister(deviceid,tranCode, tranData) {
        let req = {
            "mode": "ecp_pser_deviceregister",
            "type": "02",
            "devId": deviceid,
            "tranCode": tranCode,
            "tranData": tranData,
        }
        let result = await NodeToDllExec(req);
        let data = result.msg;
        return parsingParam(data);
    },
    // 获取主控密钥
    async SST_FunGetZmk(tranCode, tranData) {
        let req = {
            "mode": "ecp_pser_getzmk",
            "type": "03",
            "devId": DEVICE_ID,
            "tranCode": tranCode,
            "tranData": tranData,
        }
        let result = await NodeToDllExec(req);
        let data = result.msg;
        return parsingParam(data);
    },
    // 获取工作密钥
    async SST_FunGetMacAndPin(tranCode, tranData) {
        let req = {
            "mode": "ecp_pser_getmacandpin",
            "type": "04",
            "devId": DEVICE_ID,
            "tranCode": tranCode,
            "tranData": tranData,
        }
        let result = await NodeToDllExec(req);
        let data = result.msg;
        return parsingParam(data);
    },
    // 上传设备状态
    async SST_StatusUpload(tranCode, tranData) {
        let req = {
            "mode": "ecp_pser_statusupload",
            "type": "01",
            "devId": DEVICE_ID,
            "tranCode": tranCode,
            "tranData": tranData,
        }
        let result = await NodeToDllExec(req);
        let data = result.msg;
        return parsingParam(data);
    },
    //尾箱设置
    async SST_CardSetting(tranCode, tranData) {
        let req = {
            "mode": "ecp_pser_cardsetting",
            "type": "01",
            "devId": DEVICE_ID,
            "tranCode": tranCode,
            "tranData": tranData,
        }
        let result = await NodeToDllExec(req);
        let data = result.msg;
        return parsingParam(data);
    },
    //机构签到/签退
    async SST_FunOrgSign(tranCode, tranData) {
        let req = {
            "mode": "ecp_pser_orgsign",
            "type": "01",
            "devId": DEVICE_ID,
            "tranCode": tranCode,
            "tranData": tranData,
        }
        let result = await NodeToDllExec(req);
        let data = result.msg;
        return parsingParam(data);
    },
    
    // 应用升级
    async SST_GetSoftVersion(tranCode, tranData) {
        let req = {
            "mode": "ecp_pser_getsoftversion",
            "type": "01",
            "devId": DEVICE_ID,
            "tranCode": tranCode,
            "tranData": tranData,
        }
        let result = await NodeToDllExec(req);
        let data = result.msg;
        return parsingParam(data);
    },
    async SST_SET_DEVICE_ID(devID){
        DEVICE_ID =devID
    }
    
}

export default SystemBaseApi
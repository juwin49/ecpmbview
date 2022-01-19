<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2022-01-10 15:04:08
 * @LastEditTime: 2022-01-14 11:03:30
-->
<template>
    <div>
        <pinpad :show="false" ref="Pinpad"></pinpad>
        <make-card ref="MakeCard"></make-card>
    </div>
</template>
<script>
import MakeCard from '~/components/device/makeCard.vue'
import Pinpad from '~/components/device/pinpad.vue'



var RETURN_SUCCESS = "1000"

export default {
    layout:'blank',
    components: {
        Pinpad,
        MakeCard
	},
    data(){
		return {
            DEVICE_ID: "",
            // 业务流水号
            BUSIFLOWNO: "",
            // CA请求数据
            CA_REQ_DATA: {},
            /*************************************************************
             * 写入交通M1
             * 
             **************************************************************/
            // 交通数据
            TRAFFIC_DATA: {},
            trafficFlag: '',
            traffic_Sum: 3,
            traffic_Num: 0,
            //M1卡片是否已初始化
            // IS_INIT_TRAFFIC_M1false,
            //初始化校验密钥
            CHECK_INIT_KEY: "00FFFFFFFFFFFF",
            //公交M1块地址
            TRAFFIC_ADDRESS: '',
            //公交M1块密钥
            KEY_STRING: '',
            //卡片类型
            TRAFFIC_CARD_TYPE: "",
            CSN: "",
            //失败次数
            ERROR_TIME: 0,
            //需要解密字符的长度，解密后的字符长度必须和它一样
            codeDataLength: 0,
        }
    },
    async mounted(){

        // await this.initFun();
    },
    methods:{

        /*************************************************************
         * 初始化函数
         * 
         **************************************************************/
        async initFun() {

            this.DEVICE_ID = (await this.$SystemBaseApi.SST_iniFileRead("devID")).msg;
            console.log("****************当前调用统一写卡库****************")
            if (!this.DEVICE_ID) {
                return ({ "code": "-1", "msg": "无法获取设备编号" });
            }
            this.BUSIFLOWNO = (await this.$SystemBaseApi.SST_iniFileRead("busiFlowNo")).msg;
            if (!this.BUSIFLOWNO) {
                return ({ "code": "-1", "msg": "获取业务流水号失败" });
            }
            return 0;
        },


        /*************************************************************
         * 解析金融数据
         * 
         **************************************************************/
        async writeFinancialFun(param) {

            var init = await this.initFun();
            if (init != 0) {
                return init;
            }

            // 需要解密处理的标签
            // 【8000+8400+57（GDI0101）+9F1F（GDI0101）+9F61（DGI0102）+8501+8201+8202+8203+8204+8205+8020】
            var DecodeFlag = ['8000', '8400', '0101', '0102', '8501', '8201', '8202', '8203', '8204', '8205', '8020'];

            console.log("原始数据：", param)
            console.log(param.length)

            // 处理数据
            var DATA = '';
            // 处理到的位置
            var INDEX = 0;

            // 数量
            var indexNum = param.substring(INDEX, INDEX += 8);
            DATA += indexNum;

            // 文件版本标识
            var version = param.substring(INDEX, INDEX += 2)
            if (version != '01') {
                return ({ "code": "-1", "msg": "文件版本标识不为01" })
            }
            DATA += version;

            //KMU密钥32个字符
            var KMU = param.substring(INDEX, INDEX += 32)

            // 打开密码键盘
            await this.$refs.Pinpad.openMachine();
            // KMU解密
            var res = await this.getDecodData('8000', KMU);
            if (res.code != 0) {
                return res
            }
            KMU = res.body;
            DATA += KMU

            //64个固定的00000（-检测）
            var zero64 = param.substring(INDEX, INDEX += 64)
            var arr = zero64.split('')
            for (var i in arr) {
                if (arr[i] != 0) {
                    return ({ "code": "-1", "msg": "64个固定0 有不为0" })
                }
            }
            DATA += zero64

            var YUK = param.substring(INDEX, INDEX += 8);
            DATA += YUK

            //后续数据长度-16进制 11F7转成10进制=4599；4599*2=9198
            var length = param.substring(INDEX, INDEX += 8)
            DATA += length
            // 后续长度计算
            var FOLLOW_INDEX = INDEX;

            //EMV标识（-检测）
            var EMV = param.substring(INDEX, INDEX += 12)
            if (EMV != '303030454D56') {
                return ({ "code": "-1", "msg": "EMV标识错误" + EMV })
            }
            DATA += EMV

            //长度
            length = param.substring(INDEX, INDEX += 8)
            DATA += length

            //AID个数（-检测）
            var AID_NUM = param.substring(INDEX, INDEX += 2)
            if (AID_NUM != '01') {
                return ({ "code": "-1", "msg": "AID个数不为01" })
            }
            DATA += AID_NUM

            //AID（-检测）
            var AID = param.substring(INDEX, INDEX += 18)
            if (AID != '08A000000333010101') {
                return ({ "code": "-1", "msg": "AID标识错误" })
            }
            DATA += AID

            //长度
            length = param.substring(INDEX, INDEX += 12)
            DATA += length


            //DGI个数 0034转成10进制=52
            var DGI_NUM = param.substring(INDEX, INDEX += 4)
            DATA += DGI_NUM
            var DGI_LEN = parseInt(DGI_NUM, 16)
            console.log("DGI长度 ", DGI_LEN)

            // 0101 002C 702A 57 287D2A5190467171288F2488469D54B5757A5294FFA6A893A0532AF3CEA2E8B4C31F29A3E4FCA2313A
            // （4个Tag字符+4个Len（2C转10进制44 44*2=88）+Value）
            // 【8000+8400+57（GDI0101）+9F1F（GDI0101）+9F61（DGI0102）+8501+8201+8202+8203+8204+8205+8020】

            // 银行卡号
            var BankCardNum = '';
            for (var i = 0; i < DGI_LEN; i++) {
                var flag = param.substring(INDEX, INDEX += 4);
                var lenHex = param.substring(INDEX, INDEX += 4);
                var len = parseInt(lenHex, 16) * 2;
                var code = param.substring(INDEX, INDEX += len);

                // 需要解密数据
                if (DecodeFlag.indexOf(flag) != -1) {
                    // console.log('需要解密标识:', flag)
                    // console.log('需要解密16进制长度:' + lenHex, '字符长度' + len)
                    // console.log('需要解密数据:', code)
                    // 0101\0102特殊处理
                    if (flag == '0101') {
                        // 57\9F1F
                        var tagflag = '57';
                        if (code.substring(4, code.length).indexOf(tagflag) != -1) {

                            // 截取长度
                            var sublen = code.substring(4 + tagflag.length, 6 + tagflag.length);
                            // 补上前面2个字符
                            sublen = parseInt(sublen, 16) * 2;

                            var tag = code.substr(6 + tagflag.length, sublen);

                            // 解密tag
                            var res = await this.getDecodData(tagflag, tag);
                            if (res.code != 0) {
                                return (res.msg)
                            }
                            // 获取的数据经过两次ascii转字符就可以获取卡号数据
                            var ascii = this.AsciitoString(res.body);
                            tag = this.AsciitoString(ascii);

                            // 获取银行卡号
                            BankCardNum = tag.substring(0, tag.indexOf('D'));
                            console.log("获取银行卡号:", BankCardNum)
                            // 解密后的tag
                            var subLenHex = this.PrefixInteger((tag.length / 2).toString(16).toUpperCase(), 2);
                            tag = code.substring(4, 4 + tagflag.length) + subLenHex + tag;

                            var tag9F1F = code.substring(6 + tagflag.length + sublen, code.length);
                            // 9F1F
                            // var tagflag = '9F1F';
                            // if (code.substring(sublen, code.length).indexOf(tagflag) != -1) {
                            //     console.log(code.substring(sublen, code.length))
                            // }

                            var taglenHex = (tag + tag9F1F).length;
                            taglenHex = this.PrefixInteger((taglenHex / 2).toString(16).toUpperCase(), 2);
                            code = code.substring(0, 2) + taglenHex + tag + tag9F1F;
                            // console.log('tag57:', tag)
                            // console.log('tag9F1F:', tag9F1F)
                            // console.log('code:', code)

                        } else {
                            return ({ "code": "-1", "msg": "tag57不存在" })
                        }
                    } else if (flag == '0102') {
                        // 9F61
                        var tagflag = '9F61';
                        if (code.substring(4, code.length).indexOf(tagflag) != -1) {

                            // 截取长度
                            var sublen = code.substring(4 + tagflag.length, 6 + tagflag.length);
                            // 补上前面2个字符
                            sublen = parseInt(sublen, 16) * 2;

                            var tag = code.substr(6 + tagflag.length, sublen);
                            var res = await this.getDecodData(tagflag, tag);
                            if (res.code != 0) {
                                return (res.msg)
                            }
                            // 解密后的tag
                            tag = res.body;
                            var subLenHex = this.PrefixInteger((tag.length / 2).toString(16).toUpperCase(), 2);
                            tag = code.substring(4, 4 + tagflag.length) + subLenHex + tag;
                            var tagbehind = code.substring(6 + tagflag.length + sublen, code.length);

                            var taglenHex = (tag + tagbehind).length;
                            taglenHex = this.PrefixInteger((taglenHex / 2).toString(16).toUpperCase(), 2);
                            code = code.substring(0, 2) + taglenHex + tag + tagbehind;
                            // console.log('tag9F61:', tag)
                            // console.log('tagbehind:', tagbehind)
                            // console.log('code:', code)
                        } else {
                            return ({ "code": "-1", "msg": "tag9F61不存在" })
                        }
                    } else {
                        var res = await this.getDecodData(flag, code);
                        if (res.code != 0) {
                            return (res.msg)
                        }
                        code = res.body;
                    }
                    len = code.length;
                    lenHex = (len / 2).toString(16).toUpperCase();
                    lenHex = this.PrefixInteger(lenHex, 4);

                    // console.log('获取密文16进制长度:', lenHex)
                } else {
                    // 判断银行卡号是否一致
                    if (flag == '0201') {
                        // 获取银行卡号
                        var bankNum = code.substr(code.indexOf('5A0A') + 4, 20);
                        var inF = bankNum.indexOf('F');
                        if (inF != -1) {
                            bankNum = bankNum.substring(0, inF)
                        }
                        if (bankNum != BankCardNum) {
                            return ({ "code": "-1", "msg": "上下文银行卡号不一致" })
                        }

                    }
                }

                DATA += flag;
                DATA += lenHex;
                DATA += code;
            }

            // 把最后的字符追加上去
            DATA += param.substring(INDEX, param.length)
            console.log("把最后的字符追加上去", param.substring(INDEX, param.length))


            // 重新计算后续长度
            DATA = this.followLenCount(DATA, FOLLOW_INDEX, 8);

            console.log("金融数据处理完成:", DATA)

            try {
                // 关闭密码键盘
                await this.$refs.Pinpad.closeMachine();
                // 写入金融数据
                // SST_SendC_iWritePbocApp(this.BUSIFLOWNO, this.DEVICE_ID, DATA);
                await this.$refs.MakeCard.unifiwritepboc(this.BUSIFLOWNO, this.DEVICE_ID, DATA);
                return ({ "code": "0", "msg": "写入金融数据成功" });
            } catch (error) {
                return ({ "code": "-1", "msg":error })
            }

        },
        // 金融接口
        async writeFinancialData(param) {
            let writeFinancialResult = await this.writeFinancialFun(param)
            if (writeFinancialResult.code != 0) {
                throw (writeFinancialResult.msg);
            }
        },
        // 金融个人化返回事件
        /* SST_RespiWritePbocApp(param) {
            console.log("金融个人化返回事件<<", param)
            param = parsingParam(param)
            // 调用写卡返回的处理函数 ID 写卡返回类型，0：金融，1：社保
            var res = 'result=' + param.result + '&ID=0&message=金融个人化返回事件:' + param.message;
            SST_PrintWriteCard(res);
        }, */

        /*************************************************************
         * 解析社保数据
         * 
         **************************************************************/
        async writeSocialData(param) {

            var init = await this.initFun();
            if (init != 0) {
                return init;
            }

            var obj = JSON.parse(param)[0];

            console.log(obj);

            /*
                "mfEf0502": "",//卡的类别
                "mfEf0503": "",//规范版本
                "mfEf0504": "",//初始化机构编号
                "mfEf0505": "",//发卡日期
                "mfEf0506": "",//卡有效期
                "aaz500": "",//社保卡卡号
            */
            /* 
                SSSE_EF05_02		卡的类别
                SSSE_EF05_03		规范版本
                SSSE_EF05_04		初始化机构编号
                SSSE_EF05_05		发卡日期
                SSSE_EF05_06		卡有效期
                SSSE_EF05_07		卡号
            */
            var SSSEEF05 = ['', obj.mfEf0502, obj.mfEf0503, obj.mfEf0504, obj.mfEf0505, obj.mfEf0506, obj.aaz500];

            /* 
                "aae135": "",//公民身份号码
                "aac003": "",//姓名
                "aac004": "",//性别
                "aac005": "",//民族
                "aac022": "",//出生地
                "aac006": "",//出生日期
            */
            /* 
                SSSE_EF06_08		身份证号码
                SSSE_EF06_09		姓名
                SSSE_EF06_4E		姓名扩展
                SSSE_EF06_0A		性别
                SSSE_EF06_0B		民族
                SSSE_EF06_0C		出生地
                SSSE_EF06_0D		出生日期
            */
            var SSSEEF06 = [obj.aae135, obj.aac003, obj.aac004, obj.aac005, obj.aac022, obj.aac006];

            /* 
                "aac009": "",//户口类别
                "bab304": "",//常住户口所在地地址
            */
            /* 
                DF01_EF05_20		户口类别
                DF01_EF05_21		户口所在地地址
            */
            var DF01EF05 = [obj.aac009, obj.bab304];

            /* 
                "aae006": "",//通讯地址
                "aab201": "",//城市编码
                "aae005": "",//联系电话
            */
            /* 
                DF01_EF06_23		常住所在地地址
                DF01_EF06_24		常住所在地行政区划代码
                DF01_EF06_28		联系电话
            
            */
            var DF01EF06 = [obj.aae006, obj.aab201, obj.aae005];

            /* 
                "baz204": "",//写入芯片照片
            */
            /* 
                SSSE_EF08_01		照片 
            */
            // var SSSEEF08 = [obj.baz204];
            // 照片数据需要转换为二进制码
            var binData = (await this.$SystemBaseApi.SST_DeBase64Data(obj.baz204)).msg
            var SSSEEF08 = [binData];


            var code = 'SSSEEF05|01|02|03|04|05|06|07|$'
                + 'SSSEEF06|08|09|0A|0B|0C|0D|$'
                + 'DF01EF05|20|21|$'
                + 'DF01EF06|23|24|28|$'
                + 'SSSEEF08|01|$';
            var data = 'SSSEEF05|' + SSSEEF05.join('|') + '|$'
                + 'SSSEEF06|' + SSSEEF06.join('|') + '|$'
                + 'DF01EF05|' + DF01EF05.join('|') + '|$'
                + 'DF01EF06|' + DF01EF06.join('|') + '|$'
                + 'SSSEEF08|' + SSSEEF08.join('|') + '|$';


            // 写入社保数据
            /** 
             * pCardId 卡识别码前24位
             * pSerial 交易流水号
             * pDeviceNo 设备编号
            * */
            console.log("写入社保接口>>", obj.baz849 + ',' + this.BUSIFLOWNO + ',' + this.DEVICE_ID + ',' + code + ',' + data)
            // SST_SendC_iWriteSocialSecurityApp(obj.baz849, this.BUSIFLOWNO, this.DEVICE_ID, code, data);
            this.CA_REQ_DATA = {
                "xm": obj.aac003,	      //姓名
                "kh": obj.aaz500,	      //卡号
                "shbzhm": obj.aae135,	  //社会保障卡号码
                "xzqhdm": obj.aab201,	  //发卡地区行政区划代码
                "busiFlowNo": this.BUSIFLOWNO, //交易流水号
            }        
            try {
                // 写入社保数据
                await this.$refs.MakeCard.unifiwritessse(obj.baz849, this.BUSIFLOWNO, this.DEVICE_ID, code, data);
                // 写CA公钥
                let param = await this.$refs.MakeCard.unifigetpublickey('123456');

                // 签名公钥
                var qmgy = param;
                var req = this.CA_REQ_DATA;
                req['qmgy'] = qmgy;	      //签名公钥
                req['sf'] = "SM2";	      //算法

                param = await this.$SystemBaseApi.SST_FunInfoPassthrough(this.$SysCfg.TRAN_CODES["makeCard"]["CaAuth"], req)

                if (!param.errorInfo && param.resultCode == RETURN_SUCCESS) {
                    var data = JSON.parse(param.resultData);
                    data = data[0];
                    if (data.state != 0) {
                        /* var res = 'result=-11&ID=1&message=CA认证接口报错，错误编码：' + data.errorcode;
                        console.log(res)
                        // SST_PrintWriteCard(res);
                        return 0; */
                        throw ("CA认证接口报错，错误编码："+data.errorInfo);
                    }
                    /**
                        写入CA证书
                        glypin	管理员PIN
                        qmzs	签名证书
                        jmzs	加密证书
                        jmmy	加密密钥
                        zkmy	主控密钥 
                    */
                    //     data.zkmy="00112233445566778899AABBCCDDEEFF";
                    //     data.glypin = "12345678"
                    // SST_SendC_iWriteCAInfo(data.glypin, SST_DeBase64Data(data.qmzs), SST_DeBase64Data(data.jmzs), SST_DeBase64Data(data.jmmy), data.zkmy);
                    
                    let qmzs = (await this.$SystemBaseApi.SST_DeBase64Data(data.qmzs)).msg;
                    let jmzs = (await this.$SystemBaseApi.SST_DeBase64Data(data.jmzs)).msg;
                    let jmmy = (await this.$SystemBaseApi.SST_DeBase64Data(data.jmmy)).msg;
                    // 统一写卡组件，写CA
                    let result = await this.$refs.MakeCard.unifiwritecainfo(data.glypin, qmzs, jmzs, jmmy, data.zkmy);
                    return result;
                } else {
                    throw ("请求CA认证接口失败:"+param.errorInfo);
                    /* var res = 'result=-11&ID=1&message=请求CA认证接口失败:' + param.errorInfo;
                    SST_PrintWriteCard(res);
                    return 0; */
                }
            } catch (error) {
                console.log("方法 writeSocialData() 写社保数据报错 >> ", error)
                throw (error);
            }

        },






        
        // 社保个人化返回事件
        /* SST_RespiWriteSocialSecurityApp(param) {
            console.log("社保个人化返回事件<<", param)
            param = parsingParam(param)
            // 调用写卡返回的处理函数 ID 写卡返回类型，0：金融，1：社保

            if (param.result != 0) {
                var res = 'result=' + param.result + '&ID=1&message=社保个人化返回事件:' + param.message;
                SST_PrintWriteCard(res);
                return 0;
            }

            // 获取CA公钥
            SST_SendC_iGetPublicKeyExt('123456');

        }, */
        // 获取CA公钥数据返回事件（异步）
        /* SST_RespiGetPublicKeyExt(param) {
            console.log("获取CA公钥数据返回事件<<", param)
            param = parsingParam(param)

            if (param.result != 0) {
                var res = 'result=' + param.result + '&ID=1&message=获取CA公钥数据返回事件:' + param.message;
                SST_PrintWriteCard(res);
                return 0;
            }
            // 签名公钥
            var qmgy = param.message;
            var req = CA_REQ_DATA;
            req['qmgy'] = qmgy;	      //签名公钥
            req['sf'] = "SM2";	      //算法
            console.log("请求CA认证>>", req)
            tools.InfoPassthrough("CaAuth", TRAN_CODES["makeCard"]["CaAuth"], req);

        }, */
        /* InfoPassthrough_CaAuth(param) {
            console.log("请求CA认证<<", param)
            if (!param.errorInfo && param.resultCode == RETURN_SUCCESS) {
                var data = JSON.parse(param.resultData);
                data = data[0];
                if (data.state != 0) {
                    var res = 'result=-11&ID=1&message=CA认证接口报错，错误编码：' + data.errorcode;
                    SST_PrintWriteCard(res);
                    return 0;
                }
                
                // 写入CA证书
                // glypin	管理员PIN
                // qmzs	签名证书
                // jmzs	加密证书
                // jmmy	加密密钥
                // zkmy	主控密钥 
                
        //     data.zkmy="00112233445566778899AABBCCDDEEFF";
        //     data.glypin = "12345678"
                SST_SendC_iWriteCAInfo(data.glypin, SST_DeBase64Data(data.qmzs), SST_DeBase64Data(data.jmzs), SST_DeBase64Data(data.jmmy), data.zkmy);
            } else {
                var res = 'result=-11&ID=1&message=请求CA认证接口失败:' + param.errorInfo;
                SST_PrintWriteCard(res);
                return 0;
            }
        }, */
        // CA个人化返回事件
        /* SST_RespiWriteCAInfo(param) {
            console.log("CA个人化返回事件<<", param)
            param = parsingParam(param)
            var res = 'result=' + param.result + '&ID=1&message=CA个人化返回事件:' + param.message;
            SST_PrintWriteCard(res);
        }, */

        // 写交通
        writeTrafficData() {
            // 判断银行卡号是否存在
            if (!BANK_CODE) {
                return ({ "code": "-1", "msg": "银行卡号无法读取" });
            }
            var init = initFun();
            if (init != 0) {
                return init;
            } else {
                SST_TransitM1GetCardCSN();
            }
        },


        // 公交M1获取CSN返回事件
        SST_RespM1GetCSN(param) {
            console.log("公交M1获取CSN返回事件<<", param)
            param = parsingParam(param)
            if (param.result != 0) {
                SST_TrafficWriteResultFun(param);
                return 0;
            }
            // M1公交UID,卡物理卡号，长度 8-16 个字符
            var csn = param.message;
            TRAFFIC_DATA.csn=csn;
            CSN=csn;
            //判断卡片是否初始化，假如未初始化进行初始化，初始化进行开卡申请
            judgeM1Init(CHECK_INIT_KEY);
            
            

        },
        // M1卡初始化申请
        trafficInitApply(){
            // M1卡初始化申请
            var req = {
                "csn": CSN,
                "isActive":"Y",//是否需要激活
                "cityCode":AREA_TRAFFIC["海口"],//终端所属城市代码
                "bankCardId":BANK_CODE,//银行卡号
                "busiFlowNo": this.BUSIFLOWNO
            }
            console.log("M1卡初始化申请接口>>", req)
            param = tools.InfoPassthroughEx("trafficInitApply", TRAN_CODES["bankBusiness"]["trafficInitApply"], req);
            console.log("M1卡初始化申请接口<<", param)
            if (param.resultCode == RETURN_SUCCESS) {
                var data = JSON.parse(param.resultData);
                // 交通数据
                /* 
                csn	UID, 卡物理卡号，长度 8 - 16 个字符
                sysId	系统 Id，IC 卡系统唯一
                cardId	行业卡号, IC 卡发行卡号
                writeCardInfos	写卡内容列表
                keys	扇区密钥列表
                sysTime	系统时间 */
                TRAFFIC_DATA = data[0];
                TRAFFIC_CARD_TYPE = TRAFFIC_TYPES[data[0].cardType];
                // 写卡操作
                var trafficData = TRAFFIC_DATA.writeCardInfos; //参数1：扇区数据
                var trafficCode = TRAFFIC_DATA.keys; //参数2：扇区密钥
                console.log("扇区数据:" + trafficData + "扇区密钥:" + trafficCode)
                SST_TransitM1WriteCard(trafficData, trafficCode)
            } else {
                SST_TrafficWriteResultFun({ "result": "-1", "message": "请求M1卡初始化申请接口失败" + param.errorInfo });
                return 0;
            }	
        },
        // 公交M1写卡事件
        SST_RespM1WriteCard(param) {
            console.log("公交M1写卡事件<<", param)
            param = parsingParam(param)
            if (param.result != 0) {
                SST_TrafficWriteResultFun(param);
                trafficFlag = 'FAILED'
                trafficVerify();
                return 0;
            } else {
                trafficFlag = 'SUCCESS'
                trafficVerify();
                return 0;
            }
        },
        trafficVerify() {
            // 公交写卡确认
            var req = {
                "bankCardId": BANK_CODE,	//UID,卡物理卡号，长度 8-16 个字符
                "sysId": TRAFFIC_DATA.sysId,	//系统 Id
                "result": trafficFlag,	//写卡结果
                "busiFlowNo": this.BUSIFLOWNO,	//交易流水号
            }
            console.log("公交写卡确认接口>>", req)
            var param = tools.InfoPassthroughEx("trafficWriteVerify", TRAN_CODES["bankBusiness"]["trafficWriteVerify"], req);
            console.log("公交写卡确认接口<<", param)
            if (param.resultCode == RETURN_SUCCESS) {
                // M1卡操作申请
                //不用申请直接成功
                //trafficM1Operation();
                //语音提示
                var msg =  "写入交通成功,卡类型为"+TRAFFIC_CARD_TYPE;
                
                SST_TrafficWriteResultFun({ "result": '0', "message": msg });
                return 0;
            } else {
                if (traffic_Num < traffic_Sum) {
                    traffic_Num++;
                    trafficVerify();
                } else {
                    SST_TrafficWriteResultFun({ "result": "-1", "message": "请求公交写卡确认接口失败" + param.errorInfo });
                    return 0;
                }
            }
        },
        // M1卡操作申请
        trafficM1Operation() {

            var keyCode = TRAFFIC_DATA.keys;
            var keyArr_Read = {};
            var keyArr_Write = {};
            for (var i = 0; i < keyCode.length; i += 34) {
                var keyStr = keyCode.substring(i, i + 34)
                console.log(keyStr)
                var key = keyStr.substring(0, 2);
                var readValue = keyStr.substring(2, 14);
                var writeValue = keyStr.substring(22, 34);
                keyArr_Read[key] = readValue;
                keyArr_Write[key] = writeValue;
            }
            TRAFFIC_ADDRESS = '00010104010501060619';
            var keyAddress = ['00', '01', '06'];
            KEY_STRING = ''
            for (var k in keyAddress) {
                KEY_STRING += keyAddress[k] + keyArr_Read[keyAddress[k]]
            }
            // 读取M1信息
            SST_TransitM1ReadBlockData(TRAFFIC_ADDRESS, KEY_STRING);
        },


        // 公交M1读块信息事件
        SST_RespM1ReadBlockData(param) {
            console.log("公交M1读块信息事件<<", param)
            param = parsingParam(param)
            if (param.result != 0 && param.message != "[1070](校验扇区:0密钥失败)") {
                if(ERROR_TIME >3){
                    //当读块信息失败3次
                    SST_TrafficWriteResultFun(param);
                    return 0;   		
                }
                ERROR_TIME=ERROR_TIME+1;
                SST_TransitM1ReadBlockData(TRAFFIC_ADDRESS, KEY_STRING);
                return 0;
            }
            // 块信息
            var cardInfo = param.message;
            TRAFFIC_DATA.cardInfo = cardInfo;
            if(IS_INIT_TRAFFIC_M1==false&&TRAFFIC_DATA.cardInfo.substr(0,12)=="877288898366"){
                //已被初始化
                console.log("已被初始化，keyA=",CHECK_INIT_KEY);
                IS_INIT_TRAFFIC_M1=true;
                //直接去取M1扇区的密钥进行写卡
                getM1KEY();

            }else if(IS_INIT_TRAFFIC_M1==false&&CHECK_INIT_KEY=="00A0A1A2A3A4A5"){
                console.log("未初始化,进行初始化-------->");
                IS_INIT_TRAFFIC_M1=true;
                // 写入交通M1
                trafficInitApply();	
            }else if(IS_INIT_TRAFFIC_M1==false){
                CHECK_INIT_KEY="00A0A1A2A3A4A5";
                judgeM1Init(CHECK_INIT_KEY);
            }else{
                // M1卡操作申请
                var req = {
                    "csn": TRAFFIC_DATA.csn,	//UID,卡物理卡号，长度 8-16 个字符
                    "cardInfo": cardInfo,	//卡基本信息
                    "isAuto":"Y",
                    "cityCode": AREA_TRAFFIC["海口"],	//城市编码
                    "busiFlowNo": this.BUSIFLOWNO,	//交易流水号
                }
                console.log("M1卡操作申请>>", req)
                param = tools.InfoPassthroughEx("trafficM1Operation", TRAN_CODES["bankBusiness"]["trafficM1Operation"], req);
                console.log("M1卡操作申请<<", param)
                if (param.resultCode == RETURN_SUCCESS) {
                    var data = JSON.parse(param.resultData);
                    data = data[0];
                    /* 
                    csn	UID,卡物理卡号，长度 8-16 个字符
                    sysId	系统 Id，IC 卡系统唯一
                    bizType	业务类型
                    opType 	操作类型
                    writeCardInfos	写卡内容列表
                    keys	扇区密钥列表 
                    fee	业务产生的费用
                    readBlackIndex 	读取扇区块的内容
                    sysTime	系统时间 */
            
                    // 更新sysId
                    TRAFFIC_DATA.sysId = data.sysId;
                    //卡类型，成功提示使用
                    TRAFFIC_CARD_TYPE = TRAFFIC_TYPES[data.cardType];
                    var opType = data.opType;
                    // 写卡操作
                    if (opType == 'WRITECARD') {
                        SST_TransitM1WriteBlockData(data.writeCardInfos, data.keys)
                    }
                    // 读卡操作
                    else if (opType == 'READCARD') {
                        SST_TransitM1ReadBlockData(data.writeCardInfos, data.keys)
                    } else {
                        SST_TrafficWriteResultFun({ "result": "-1", "message": "请求M1卡操作申请状态不存在:" + opType });
                        return 0;
                    }
            
                } else {
                    SST_TrafficWriteResultFun({ "result": "-1", "message": "请求M1卡操作申请失败" + param.errorInfo });
                    return 0;
                }		
            }
        },
        // 公交M1写块信息事件
        SST_RespM1WriteBlockData(param) {
            traffic_Num = 0;
            console.log("公交M1写块信息事件<<", param)
            param = parsingParam(param)
            if (param.result != 0) {
                SST_TrafficWriteResultFun(param);
                trafficFlag = 'FAILED'
                trafficConfirm();
                return 0;
            } else {
                trafficFlag = 'SUCCESS'
                trafficConfirm();
                return 0;
            }
        },
        trafficConfirm() {
            // 卡操作写卡确认
            var req = {
                "bankCardId": BANK_CODE,	//UID,卡物理卡号，长度 8-16 个字符
                "sysId": TRAFFIC_DATA.sysId,	//系统 Id
                "result": trafficFlag,	//写卡结果
                "busiFlowNo": this.BUSIFLOWNO,	//交易流水号
            }
            console.log("卡操作写卡确认接口>>", req)
            var param = tools.InfoPassthroughEx("trafficWriteConfirm", TRAN_CODES["bankBusiness"]["trafficWriteConfirm"], req);
            console.log("卡操作写卡确认接口<<", param)
            if (param.resultCode == RETURN_SUCCESS) {
                var msg = "写入交通成功,卡类型为"+TRAFFIC_CARD_TYPE;
                SST_TrafficWriteResultFun({ "result": '0', "message": msg });
                return 0;
            } else {
                if (traffic_Num < traffic_Sum) {
                    traffic_Num++;
                    trafficConfirm();
                } else {
                    SST_TrafficWriteResultFun({ "result": "-1", "message": "请求卡操作写卡确认接口失败" + param.errorInfo });
                    return 0;
                }
            }
        },
        // 读卡信息
        trafficReadInfo() {
            // 读卡信息
            var req = {
                "csn": TRAFFIC_DATA.csn,	//UID,卡物理卡号，长度 8-16 个字符
                "sysId": TRAFFIC_DATA.sysId,	//系统 Id
                "readCardInfo": TRAFFIC_DATA.cardInfo,	//读卡内容列表
                "busiFlowNo": this.BUSIFLOWNO,	//交易流水号
            }
            console.log("读卡信息接口>>", req)
            var param = tools.InfoPassthroughEx("trafficReadInfo", TRAN_CODES["bankBusiness"]["trafficReadInfo"], req);
            console.log("读卡信息接口<<", param)
            if (param.resultCode == RETURN_SUCCESS) {

            } else {
                SST_TrafficWriteResultFun({ "result": "-1", "message": "请求读卡信息接口失败" + param.errorInfo });
                return 0;
            }
        },

        // 敏感数据解密
        async getDecodData(tagflag, codeData) {
            this.codeDataLength = codeData.length;
            var req = {
                "Tag": tagflag,
                "secretData": codeData,
                "busiFlowNo": this.BUSIFLOWNO
            };
            // console.log("敏感数据解密接口>>", req)
            // var param = tools.InfoPassthroughEx("sensDec", TRAN_CODES["bankBusiness"]["sensDec"], req);
            // console.log("敏感数据解密接口<<", param)

            let param = await this.$SystemBaseApi.SST_FunInfoPassthrough(this.$SysCfg.TRAN_CODES["bankBusiness"]["sensDec"], req)


            if (!param.errorInfo && param.resultCode == RETURN_SUCCESS) {

                // 需要解密数据
                var data = JSON.parse(param.resultData);
                // 密码键盘解密
                /* var res = pinpad_DeJRData(data[0].decryptData);
                if (res.status == 0) {
                    var decode = res.message;
                    decode=this.removeFootStr(decode,'0',codeDataLength);
                    return ({ "code": "0", "body": decode });
                } else {
                    console.log("密码键盘解密失败");
                    return ({ "code": "-1", "msg": "密码键盘解密失败" });
                } */
                try {
                    var decode = await this.$refs.Pinpad.decryptdata(data[0].decryptData);
                    decode = this.removeFootStr(decode,'0', this.codeDataLength);
                    return ({ "code": "0", "body": decode });
                } catch (error) {
                    // 关闭密码键盘
                    await this.$refs.Pinpad.closeMachine();
                    console.log("密码键盘解密失败");
                    return ({ "code": "-1", "msg": "密码键盘解密失败" });
                }
            } else {
                // 关闭密码键盘
                await this.$refs.Pinpad.closeMachine();
                return ({ "code": "-1", "msg": "请求敏感数据解密接口失败" + param.errorInfo });
            }
        },
        /**
         * 指定的字符串移除末尾制定字符
         * @param {Object} str 指定的字符串
         * @param {Object} char 需要移除的字符
         */
        removeFootStr(str,char,dedLength){
            var needRemoveLength =str.length- dedLength;
            var needRemoveStr="";
            for(var i=0;i<needRemoveLength;i++){needRemoveStr=needRemoveStr+char}
            if(str.substring(str.length-needRemoveLength,str.length)==needRemoveStr){
                str=str.substring(0,str.length-needRemoveLength);
                console.log("去零后的字符串："+str);
                return str;
            }
            console.log("字符串未去零");
            return str;
        },


        // 计算后续长度
        // data 数据，index 节点位置，len 长度位数
        followLenCount(data, index, len) {
            var front = data.substring(0, index - len);
            var affter = data.substring(index, data.length)
            var followLen = this.PrefixInteger((affter.length / 2).toString(16).toUpperCase(), len)
            return (front + followLen + affter);
        },


        // 自动补零
        PrefixInteger(num, m) {
            return (Array(m).join(0) + num).slice(-m);
        },


        // 16进制Ascii转字符串
        AsciitoString(data) {
            var arr = data.split('');
            var i = 0;
            var Str = '';
            while (i < arr.length) {
                // 取两个为一个元素，转为字符串
                var s = arr[i] + arr[i + 1];
                i += 2;
                // 转为10进制
                s = parseInt(s, 16)
                // 忽略0 NUL
                if (s != 0) {
                    // 转为字符串
                    s = String.fromCharCode(parseInt(s));
                    Str += s;
                }
            }
            return Str;
        },


        /**
         * 解析接口SI.02.01.31返回的keys
         */
        analysisKEYS(data){
            var officKeys=["00","01","02","03","04","05","06","07","08","09","0A","0B","0C","0D","0E","0F"];
            var keysJSON={}
            var index=0;
            var tem_val="";
            for(var i in data){
                if(i==0){continue;}
                var tem_key=data[i-1]+data[i];
                if(tem_key==officKeys[index]){
                    //按给出的扇区来获取对应的key
                    if(index==0){index=index+1;continue;}
                    keysJSON[officKeys[index-1]]=tem_val.substr(0,tem_val.length-1);
                    index=index+1;
                    tem_val="";
                    continue;
                }else{
                    //将不是key下标的key值内容存起来
                    tem_val=tem_val+data[i];
                }
                if(i==(data.length-1)){
                    //最后一个数据，存起来
                    keysJSON[officKeys[index-1]]=tem_val;
                }
                
            }
            console.log("接口SI.02.01.31解析出的keys列表",keysJSON)
            return keysJSON;			
        },

        // 读取M1扇区KEYS
        getM1KEY() {
            // 读取M1扇区KEYS
            var req = {
                "csn": TRAFFIC_DATA.csn,	//UID,卡物理卡号，长度 8-16 个字符
                "sectors":"0,1,6", //需要用到的扇区编号
                "busiFlowNo": this.BUSIFLOWNO,	//交易流水号
            }
            console.log("读取M1扇区KEYS>>", req)
            var param = tools.InfoPassthroughEx("trafficReadInfo", TRAN_CODES["bankBusiness"]["getM1KEY"], req);
            console.log("读取M1扇区KEYS<<", param)
            if (param.resultCode == RETURN_SUCCESS) {
                var data = JSON.parse(param.resultData);
                trafficM1OperationForSpe(analysisKEYS(data[0].keys))
            } else {
                SST_TrafficWriteResultFun({ "result": "-1", "message": "请求读取M1扇区KEYS接口失败" + param.errorInfo });
                return 0;
            }
        },
        // M1卡操作申请-特殊情况
        trafficM1OperationForSpe(keyArr_Read) {
            TRAFFIC_ADDRESS = '00010104010501060619';
            var keyAddress = ['00', '01', '06'];
            KEY_STRING = '';
            for (var k in keyAddress) {
                KEY_STRING += keyAddress[k] + keyArr_Read[keyAddress[k]]
            }
            // 读取M1信息
            SST_TransitM1ReadBlockData(TRAFFIC_ADDRESS, KEY_STRING);
        },

        //判断M1是否初始化
        judgeM1Init(keyString){
            TRAFFIC_ADDRESS = '0001';
            SST_TransitM1ReadBlockData(TRAFFIC_ADDRESS, keyString);	
        },



    },
}

</script>

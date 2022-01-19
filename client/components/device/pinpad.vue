<template>
    <div v-if="show!=false" class="identity-wrap">
        <div class="identity-box">
            <div class="identity-title">{{moduleName}}</div>
            <div class="identity-content">
                <div class="identity-insert gif-wrap">
                    <img :src="enterPassword_Gif" />
                    <p>{{promptInfo}}</p>
                    <!-- <p style="color:#6f6f6f;">{{ pinpadShowSign.join(" ") }}</p> -->
                    <p style="color:#6f6f6f;">{{ pinpadShowSign }}</p>
                </div>
                <Loading :showLoading="showLoading" :loadingText="loadingText" />
            </div>
        </div>

    </div>
</template>
<script>
    import Loading from '~/components/common/loading.vue'

    export default {
        layout: 'blank',
        components: {
            Loading,
        },
        props: {
            cardId: [String],
            info: [String],
            show: [Boolean],
        },
        data() {
            return {
                moduleName: '密码键盘',
                enterPassword_Gif: require('~/assets/img/base/输入密码.gif'),
                enterPasswordAgain_Gif: require('~/assets/img/base/再次输入密码.gif'),
                loadingText: '',
                showLoading: false,
                intervalTimer: '',
                readingMsg:(require(`~/data/${this.$store.state.select_language}.json`)).device.pinpad,
                promptInfo: '',
                // pinpadShowSign: ['—','—','—','—','—','—'],
                pinpadShowSign: "— — — — — —",
                pinpadKeyArr: [],
                isClose: false,
            }
        },
        async mounted() {

            if (this.show != false) {
                await this.init()
            }
            this.promptInfo = this.info;
        },
        destroyed() {
            if (this.intervalTimer) {
                clearInterval(this.intervalTimer)
            }
            if (!this.isClose && this.show!=false) {
                this.closeMachine();
            }
        },
        methods: {
            //页面跳转
            jumpto(url) {
                this.$router.push(url)
            },
            //初始页面
            async init() {
                await this.openMachine();
                await this.startupActiveKey(this.cardId)
                // 监听按键
                await this.getInputValue();
                // 获取密码
                let pinblock = await this.getpinblock();
                // this.showLoading = true;
                // this.loadingText = this.readingMsg.loadingtext;
                await this.closeMachine()
                this.isClose=true
                // await this.$SystemBaseApi.SST_Delay(1000);
                // this.showLoading = false;
                this.$emit('pinpadSuccess', pinblock)
            },
            async webSocketSendMsg(data) {
                return await this.$wsc.sendMsg(data)
            },
            // 启动密文输入
            async startupActiveKey(cardID) {
                // this.promptInfo = this.readingMsg.enterPassword;
                await this.setenmethod();
                // await this.setkeyfunction("1");
                await this.setaccount(cardID);
                await this.activateworkkey("2", "2");
                await this.pinstart();
                this.$SystemBaseApi.SST_VoiceSpeak(this.promptInfo)
            },
            // 获取密码密文
            async getInputValue () {
                return new Promise((resolve, reject) => {
                    if (this.intervalTimer) {
                        clearInterval(this.intervalTimer)
                    }
                    this.intervalTimer = setInterval(async () => {
                        let data = await this.scoutkeypress();
                        if (data != '') {
                            console.info(data)

                            if (data == "2A") {
                                this.pinpadKeyArr.push('*');
                            }
                            // 返回
                            else if (data == "1B") {
                                this.pinpadKeyArr = [];
                                if (this.pinpadKeyArr.length == 0) {
                                    this.pinpadShowSign = "— — — — — —";
                                }
                            }
                            // 退格
                            else if (data == "08") {
                                // 删除最后一个元素
                                this.pinpadKeyArr.pop()
                            }
                            // 显示*号
                            let signStr = "— — — — — —";
                            let signArr = signStr.split(" ");
                            for (let i in this.pinpadKeyArr) {
                                signArr[i] = '✽';
                                /* let signArr = this.pinpadShowSign.split(" ");
                                signArr[i] = '✽';
                                this.pinpadShowSign = signArr.join(" "); */
                                // $(".password-box>span").eq(i).html('✽');
                            }
                            this.pinpadShowSign = signArr.join(" ");

                            // 确认
                            if (this.pinpadKeyArr.length>=6 && data=="0D") {
                                this.pinpadKeyArr = [];
                                console.info("成功")
                                clearInterval(this.intervalTimer)
                                resolve('0')
                            }
                        }
                    },200)
                })
                
            },
            //打开设备
            async openMachine() {
                // 密码键盘
                return await this.webSocketSendMsg({
                    "mode": "ecp_pinpad_opendev"
                })
            },
            //关闭设备
            async closeMachine() {
                return await this.webSocketSendMsg({
                    "mode": "ecp_pinpad_closedev"
                })
            },
            //检测设备
            async checkMachine() {
                return await this.webSocketSendMsg({
                    "mode": "ecp_pinpad_checkdev"
                })
            },
            //下载主密钥；mainKeyIndex-主密钥索引号
            async downloadMkey(index, mainkey) {
                // '{"mode":"ecp_pinpad_downloadMkey","mainKeyIndex":"0","mainKey":"3c58376d166d004ee20191341526286f"}ecpend',
                let req = {
                    "mode": "ecp_pinpad_downloadMkey",
                    "mainKeyIndex": index,
                    "mainKey": mainkey
                }
                await this.webSocketSendMsg(req);
            },
            //下载工作密钥；mainKeyIndex-主密钥索引；workKeyIndex-工作密钥索引；ucKey-密钥值（注意：主密钥号跟工作密钥号不能重复）
            //keyType密钥类型：1-数据运算密钥；2-PIN密钥；3-MAC密钥
            //返回：kcv校验值
            async downloadUCkey(index_M, index_W, type, key) {
                // '{"mode":"ecp_pinpad_downloadUCkey","mainKeyIndex":"0","workKeyIndex":"1","keyType":"2","ucKey":"F802027D0F0E2A68914A1A3CE45A9AD6"}ecpend',
                let req = {
                    "mode": "ecp_pinpad_downloadUCkey",
                    "mainKeyIndex": index_M,
                    "workKeyIndex": index_W,
                    "keyType": type,
                    "ucKey": key
                };
                await this.webSocketSendMsg(req);
            },
            //设置加密方式；7-国密SM4
            async setenmethod() {
                // '{"mode":"ecp_pinpad_setenmethod","index":"7"}ecpend',
                let req = {
                    "mode": "ecp_pinpad_setenmethod",
                    "index": "7"
                }
                await this.webSocketSendMsg(req);
            },
            //设置键盘工作方式；(1-输入完不加送回车键值;2-输入完自动加送回车键值)
            async setkeyfunction(index) {
                // '{"mode":"ecp_pinpad_setkeyfunction","index":"1"}ecpend',
                let req = {
                    "mode": "ecp_pinpad_setkeyfunction",
                    "index": index
                };
                await this.webSocketSendMsg(req);
            },
            //启动或结束键盘输入；index-1结束 index-2 启动键盘输入
            async keyboardcontrol(index) {
                // '{"mode":"ecp_pinpad_keyboardcontrol","index":"2"}ecpend',
                let req = {
                    "mode": "ecp_pinpad_keyboardcontrol",
                    "index": index
                }
                await this.webSocketSendMsg(req);
            },
            //监测键盘输入（循环调用-明文方式返回键盘按键值；pin输入时返回*）
            async scoutkeypress() {
                // '{"mode":"ecp_pinpad_scoutkeypress"}ecpend',
                let req = {
                    "mode": "ecp_pinpad_scoutkeypress"
                }
                return await this.webSocketSendMsg(req);
            },
            //设置主账号
            //凯明杨密钥键盘：银行卡号右起取16位。
            async setaccount(account) {
                // '{"mode":"ecp_pinpad_setaccount","account":"648090430403"}ecpend',
                // 旭子密钥键盘：银行卡号去掉最后一位校验位，右起取12位；主账号：6214586480904304034；传入值为：648090430403
                account = account.substr(-13, 12)
                await this.webSocketSendMsg({
                    "mode": "ecp_pinpad_setaccount",
                    "account": account
                });
            },
            //激活密钥；mainKeyIndex-主密钥索引；workKeyIndex-工作密钥索引
            async activateworkkey(index_M, index_W) {
                //  '{"mode":"ecp_pinpad_activateworkkey","mainKeyIndex":"0","workKeyIndex":"1"}ecpend',
                await this.webSocketSendMsg({
                    "mode": "ecp_pinpad_activateworkkey",
                    "mainKeyIndex": index_M,
                    "workKeyIndex": index_W
                });
            },
            //启动pin输入；pinLen-pin长度;addMode-算法方式（暂用1）;timeout=超时时间单位秒
            async pinstart() {
                // '{"mode":"ecp_pinpad_pinstart","pinLen":"6","addMode":"1","timeout":"60"}ecpend',
                await this.webSocketSendMsg({
                    "mode": "ecp_pinpad_pinstart",
                    "pinLen": "6",
                    "addMode": "1",
                    "timeout": "60"
                });
            },
            //获取密文pinblock
            async getpinblock() {
                // '{"mode":"ecp_pinpad_getpinblock"}ecpend',
                return await this.webSocketSendMsg({
                    "mode": "ecp_pinpad_getpinblock"
                });
            },
            //解密敏感数据
            async decryptdata(data) {
                // '{"mode":"ecp_pinpad_decryptdata","enData":"8D59B12C2BFC2B952E9536E83C87026E51CBB38361557EEF22042BDD8C4F9DF777F5A6BC8573549D2083E00F4693163D1B120A31994E7B5F0A255876CD989ACF98F2BCEF6DFB41F6829509CA0541370245503AB36700765C81993CF3A0027311C4107E30B92D103C7A63F0C06B643512C285A2421811F03D862EFC6CA9B2D69691D2BAB1DBC5939B3D6E1AC9250A44B57B773F4E683D99DCB1AAB008ABEFC43A"}ecpend',
                return await this.webSocketSendMsg({
                    "mode": "ecp_pinpad_decryptdata",
                    "keyIndex": "1",
                    "enData": data
                });
            },


        },
        computed: {
            receiveDate() {
                return this.$store.state.wsc_process
            }
        },
        watch: {
            receiveDate() {
                if (this.$store.state.wsc_process) {
                    // console.log(this.$store.state.wsc_process,3434)
                    return
                }
            }
        }
    }
</script>
<style scoped>

.identity-wrap{
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    position: absolute;
    z-index: 2;
}

.identity-box {
    background: hsla(130, 20%, 97%, 0.6);
    display: flex;
    position: relative;
    flex-direction: column;
    left: 50%;
    top: 56%;
    transform: translate(-50%, -50%);
    width: 65vw;
    height: 41vw;
}
.identity-content {
    position: relative;
    height: 100%;
}
.identity-box p {
    font-size: 28px;
    font-weight: 600;
    text-align: center;
    padding: 3px;
}
.identity-title {
    background: linear-gradient(to top, rgb(216, 0, 15) 0%,rgb(168, 28, 28) 100%);
    height: 50px;
    line-height: 50px;
    text-align: center;
    color: #fff;
    font-weight: bold;
}
.gif-wrap{
    width: 100%;
    height: 100%;
}
.identity-insert.gif-wrap {
    position: relative;
    display: flex;
    z-index: 2;
    flex-direction: column;
    left: 50%;
    top: 50%;
    -webkit-transform: translate(-50%,-50%);
    transform: translate(-50%,-50%);
    width: 400px;
    height: 300px;
}
.identity-wrap img{
    width: 100%;
    object-fit:fill;
}
.dosomething{
    position: absolute;
    width: 100%;
    top: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
.dosomething  .hainan-button{
    display: block;
    width: 150px;
    height: 40px;
    line-height: 40px;
    margin:5px 10px;
    text-align: center;
    color: #fff;
    border-radius: 5px;
	background-image: linear-gradient(to bottom right, #ff3643 , #d6000e);
    z-index: 4;
}

</style>
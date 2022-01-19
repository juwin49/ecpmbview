<template>
    <div></div>
</template>
<script>
    import Loading from '~/components/common/loading.vue'

    export default {
        layout: 'blank',
        components: {
            Loading,
        },
        props: {
            Ptermid: {
                type: Object,
                default: () => {
                    return {}
                }
            }
        },
        data() {
            return {
                moduleName: '制卡',
                promptInfo: '',
                loadingText: '',
                showLoading: true,
                intervalGetInfo: '',
                cardInfo: {},
                insertCardL: true,
            }
        },
        mounted() {
        },
        methods: {
            //页面跳转
            jumpto(url) {
                this.$router.push(url)
            },


            /* '---------------发卡机打印机-----------------ecpend', */
            // 打开设备
            async printerOpendev() {
                return await this.$wsc.sendMsg({"mode": "ecp_print_opendev"})
            },
            //获取设备状态
            async printerGetdevstatus() {
               return await this.$wsc.sendMsg({"mode": "ecp_print_getdevstatus"})
            },
            // 打印机进卡
            async printerCardin() {
               return await this.$wsc.sendMsg({"mode": "ecp_print_cardin"})
            },
            //设置打印文字，格式：x坐标,y坐标,字体,字号,是否加粗,数据，（以逗号进行分割） "320,200,宋体,12,0,      张三"
            async printerSetprttext(text) {
               return await this.$wsc.sendMsg({ "mode": "ecp_print_setprttext","textData":text})
            },
            //设置打印图片，格式：x坐标,y坐标,宽,高,照片路径,（以逗号进行分割）"40,15,236,295,C/ECPATMMB/pic.jpg"
            async printerSetprtpic(text) {
              return  await this.$wsc.sendMsg({"mode": "ecp_print_setprtpic","picData": text})
            },
            //启动打印
            async printerStartprint() {
               return await this.$wsc.sendMsg({"mode": "ecp_print_startprint"})
            },
            // 打印机出卡
            async printerCardout() {
               return await this.$wsc.sendMsg({"mode": "ecp_print_cardout"})
            },
            //回收卡片（发卡过程出现问题可调用该接口进行废卡回收）
            async printerRecovCard() {
               return await this.$wsc.sendMsg({"mode": "ecp_print_recovCard"})
            },
            //启动用户卡回收
            async printerStartRecovCard() {
                return await this.$wsc.sendMsg({"mode": "ecp_print_usCardPullIn"})
            },
            // 关闭打印机
            async printerClosedev() {
                return await this.$wsc.sendMsg({"mode": "ecp_print_closedev"})
            },



            /* '---------------读写卡-----------------ecpend',*/
            //检测卡片是否有金融应用
            async checkbankapp() {
                return await this.$wsc.sendMsg({"mode": "ecp_card_checkbankapp"})
            },
            //获取卡片非接数据
            async getcontactdata() {
               return  await this.$wsc.sendMsg({"mode": "ecp_card_getcontactdata"})
            },
            //读取卡片55域EMV数据
            async reademvdata() {
               return await this.$wsc.sendMsg({"mode": "ecp_card_reademvdata"})
            },
            //读取卡片社保基本信息数据
            async readsssebasdata() {
               return await this.$wsc.sendMsg({"mode": "ecp_card_readsssebasdata"})
            },
            //读取卡片金融55域EMV数据
            async readpbocemvdata() {
              return  await this.$wsc.sendMsg({ "mode": "ecp_card_readpbocemvdata"})
            },
            //获取卡片内部认证数据
            async getinsideauthdata() {
                return await this.$wsc.sendMsg({"mode": "ecp_card_getinsideauthdata"})
            },
            //分布式写卡，写金融应用
            async dispwritepboc(data) {
               return await this.$wsc.sendMsg({"mode": "ecp_card_dispwritepboc","writeData": data})
            },
            //分布式写卡，写社保应用
            async dispwritessse(data) {
               return await this.$wsc.sendMsg({"mode": "ecp_card_dispwritessse","writeData": data})
            },
            /****************************************/
            /** 写卡统一接口
             * iType 1-接触式操作卡；2-非接触式操作卡；3-自动寻卡，优先接触式操作；4-自动寻卡，优先非接触式操作
             * pCardId 卡识别码前24位
             * pSerial 交易流水号
             * pDeviceNo 设备编号
            /****************************************/
            //统一写卡组件，写金融应用
            async unifiwritepboc(pSerial, pDeviceNo, pPbocData) {
                let req = {
                    "mode": "ecp_card_unifiwritepboc",
                    "type": "1",
                    "serial": pSerial,
                    "deviceNo": pDeviceNo,
                    "pbocData": pPbocData
                }
                return await this.$wsc.sendMsg(req)
            },
            //统一写卡组件，写社保应用
            async unifiwritessse(pCardId, pSerial, pDeviceNo, pFileAddr, pFileInfo) {
                let req = {
                    "mode": "ecp_card_unifiwritessse",
                    "type": "1",
                    "cardId": pCardId,
                    "serial": pSerial,
                    "deviceNo": pDeviceNo,
                    "fileAddr": pFileAddr,
                    "fileInfo": pFileInfo
                };
                return await this.$wsc.sendMsg(req)
            },
            //统一写卡组件，获取公钥
            async unifigetpublickey(pPIN) {
                // iPublicKeyType 1-签名公钥；2-加密公钥；3-临时公钥
                // pPIN 用户个人密码
                let req = {
                    "mode": "ecp_card_unifigetpublickey",
                    "type": "1",
                    "publicKeyType": "1",
                    "pin": pPIN
                }
                return await this.$wsc.sendMsg(req)
            },
            //统一写卡组件，写CA
            async unifiwritecainfo(pNewAdminPIN, pSCertificate, pECertificate, pEKey, pPrimaryKey) {
                /** 
                 * 写卡片CA接口
                 * iType ：1-接触式操作卡；2-非接触式操作卡；3-自动寻卡，优先接触式操作；4-自动寻卡，优先非接触式操作。
                 * pOldUserPIN 一般为123456。
                 * pOldAdminPIN 一般为12345678。
                 * pNewUserPIN 新用户个人密码。
                 * pNewAdminPIN 新管理员个人密码。
                 * pSCertificate 签名证书。
                 * pECertificate 加密证书。
                 * pEKey 加密密钥。
                 * pPrimaryKey 主控密钥，长度32位。
                 */
                let pOldUserPIN = '123456';
                let pOldAdminPIN = '12345678';
                let pNewUserPIN = '123456';
                let req = {
                    "mode": "ecp_card_unifiwritecainfo",
                    "type": "1",
                    "oldUserPIN": pOldUserPIN,
                    "oldAdminPIN": pOldAdminPIN,
                    "newUserPIN": pNewUserPIN,
                    "newAdminPIN": pNewAdminPIN,
                    "sCertificate": pSCertificate,
                    "eCertificate": pECertificate,
                    "eKey": pEKey,
                    "primaryKey": pPrimaryKey
                }
                return await this.$wsc.sendMsg(req);
            },
            //公交M1，获取卡片csn
            async m1getcardcsn() {
                return await this.$wsc.sendMsg({"mode": "ecp_card_m1getcardcsn"})
            },
            //公交M1，写卡
            async m1writecard(data, code) {
               return await this.$wsc.sendMsg({"mode": "ecp_card_m1writecard","writeDatas": data,"writeKeys": code})
            },
            //公交M1，读块数据
            async m1readblockdata(data, code) {
               return  await this.$wsc.sendMsg({"mode": "ecp_card_m1readblockdata","blockIndex": data,"sectorKeys": code})
            },
            //公交M1，写块数据
            async m1writeblockdata(data, code) {
               return await this.$wsc.sendMsg({"mode": "ecp_card_m1writeblockdata","writeBlockData": data,"sectorKeys": code})
            },
            //读EF06文件，获取双向鉴权数据
            async readgetauthdata() {
               return await this.$wsc.sendMsg({"mode": "ecp_card_readgetauthdata"})
            },
            //读EF06文件，读取EF06数据；data-P端返回的加密机数据
            async readgetef06data(data) {
               return await this.$wsc.sendMsg({"mode": "ecp_card_readgetef06data", "data": data})
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
    overflow: scroll;
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
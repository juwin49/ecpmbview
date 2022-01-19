<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2021-12-31 10:53:56
 * @LastEditTime: 2021-12-31 10:59:09
-->
<template>
    <div class="identity-wrap">
        <div class="identity-box">
            <div class="identity-title">{{moduleName}}</div>
            <div>
                <div class="identity-insert gif-wrap" >
                        <div class="progress-bar">
                           <div  class="progress-insert" :style="{width:progressWidth}">
                               <p>{{progressWidth}}</p>
                           </div>
                        </div>
                    <div class="progress-bottom">{{progressIndex?progressPart[progressIndex-1]:progressPart[progressIndex]}}</div>
                </div>
                <make-card  ref="MakeCard"></make-card>
                <errorInfo :showError = "showError"  :errorText="errorText"/>
                <Loading :showLoading="showLoading" :loadingText="loadingText" />
            </div>
        </div>
        <write-card-business ref="writeCardBus" />
        <div class="dosomething">
            <div class="hainan-button" @click="jumpto('/')">回主页</div>
            <div class="hainan-button" @click="init()">初始化页面</div>
            <!-- <div class="hainan-button" @click="checkcardIn()">检测卡进入(循环)</div>
            <div class="hainan-button" @click="readcardInfo()">读取卡信息</div>
            <div class="hainan-button" @click="sendCardToP()">联网核查身份证信息</div>
            <div class="hainan-button" @click="closeMachine()">关闭设备&退出</div> -->
        </div>
        
    </div>
</template>
<script>
import errorInfo from '~/components/common/errorinfo.vue'
import Loading from '~/components/common/loading.vue'
import MakeCard from '~/components/device/makeCard.vue'
import writeCardBusiness from '~/components/business/writeCardBusiness.vue'
import {dateFormat,parsingParam,prefixInteger,strMul} from '~/components/common/utils'


var RETURN_SUCCESS = "1000"
var PASSWORD_AGING = "2999"

    export default {
        layout: 'blank',
        components: {
            Loading,
            MakeCard,
            errorInfo,
            writeCardBusiness
        },
        props: {
            Ptermid: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            //同号换卡需要写金融数据为1，异号补卡不需要写金融数据为0
            A_isMakeFina:{
                type:Number,
                default:1
            }
        },
        data() {
            return {
                DEVICE_ID:this.$store.state.deviceID,
                BUSIFLOWNO:this.$store.state.service_result.busiFlowNo,    
                PRINTER_NUMBER:'1',
                havefina:0,  //卡片是否已经写了金融数据
                moduleName: '制卡',
                loadingText: '',
                showLoading: true,
                showError:false,
                errorText:'请稍后...',
                progressIndex:0,
                progressWidth:'',
                progressPart: ["获取制卡数据，请稍后...", "写入社保数据中，请稍后...(大约需要3-5分钟)", "写入金融数据中，请稍后...", "验证卡片信息中，请稍后...", "印制卡片中，请稍后...", "数据回盘中，请稍后...", "回盘登记中，请稍后...", "制卡成功"],
                cardIdInfo:{},
                getDataTag:{ "thisTimes": 0, "maxTimes": 3, "RTimes": 20000 },   //数据轮训次数
                cardIdMakedInfo:{},  //写卡社保数据
                cardFinMakedInfo:{},    //写卡金融数据
                cardFinGetInfo:{},       //获取补卡金融数据
                printCardInfo:{}         //打印卡数据

            }
        },
        mounted() {
            this.$nextTick(() => {
                this.init()
            })
        },
        methods: {
            //页面跳转
            jumpto(url) {
                this.$router.push(url)
            },
            //初始页面
            async init() {
                this.showLoading = false
                try{
                    await this.$refs.MakeCard.printerOpendev()   //打开发卡打印机
                  //  await this.$refs.MakeCard.printerGetdevstatus()  
                   await this.getCardIdData()
                }catch(res){
                    this.showErrorFun(res)
                }
            },
            //错误显示
            showErrorFun(msg){
                this.showError = true;
                this.errorText = msg
              //  this.$emit('makecardBusinessSuccess',false);           
            },
            //进度条进度
            processLong(){
                let piece = Math.ceil(100/this.progressPart.length) //向上取整
                this.progressWidth =(piece*(this.progressIndex+1)>100)?'100%':(piece*(this.progressIndex+1)+'%')
                this.progressIndex++
            },
            //错误退卡及关闭打印机
            async closePrintMachine(){
                try{
                        await this.$refs.MakeCard.printerRecovCard()
                        await this.$refs.MakeCard.printerClosedev()
                    }catch(res){
                        this.showErrorFun(res)
                    }
            },
            //补卡获取社保卡数据
            async getCardIdData(){
                 this.processLong()
                 let baz806 = ""
                 //01，新制卡 ，03挂失补卡异号 ,04信息变更补换卡,07同卡号制卡
                 if (this.A_isMakeFina) {
                        baz806 = "07"
                } else {
                        baz806 = "03"
                }
                 let req={
                     aae135:this.$store.state.idt_card_info.IdNum,
                     baz806:baz806, 
                     busiFlowNo:this.$store.state.service_result.busiFlowNo
                 }
                 let param = await this.$SystemBaseApi.SST_FunInfoPassthrough(this.$SysCfg.TRAN_CODES["makeCard"]["getReissueCardInfo"], req)
                 if(param.resultCode==1000||param.resultCode=='1000'){
                     this.cardIdInfo = JSON.parse(param.resultData)[0]
                     this.setCardIdImg(this.cardIdInfo)
                 }else if(param.resultCode =='2999'){
                      //密钥过期并重新获取密钥    ****方法其他地方调用，记得实测
                    // ReGetMacANDPin(getCardIdData) 
                     console.info('****','重新获取密钥') 
                 }else{
                     if (this.getDataTag.thisTimes < this.getDataTag.maxTimes) {
                        /** 失败错误加1 **/
                        setTimeout(()=> {
                            this.getDataTag.thisTimes++
                            this.getCardIdData();
                        }, this.getDataTag.RTimes)
                    } else {
                        this.showErrorFun(param.errorInfo)
                    }
                 }
                 
            },
            //社保卡图片数据处理 bac200照片;baz204写入芯片照片;aac005民族
           async setCardIdImg(cardData){
                if(cardData.bac200){
                     if (cardData.baz204 == "" || cardData.baz204 == " " || cardData.baz204 == undefined) {
                         this.showErrorFun( "写卡数据缺少照片")
                        return 
                     } else if (cardData.aac005 == "" || cardData.aac005 == " " || cardData.aac005 == undefined || cardData.aac005.length != 2) {
                         this.showErrorFun( "写卡数据民族代码有误")
                        return 
                     }
                    let res =await this.$SystemBaseApi.SST_Base64ToPath(cardData.bac200, "C:\\ECPATMMB\\print.jpg") //----把图片从base64转化成图片格式,并保存到C盘 ****方法别处调用，记得实测
                  
                  // let res = {code:'0',msg:'****'}
                    if (res.code == 0) {
                        if (cardData.baz204.length>10923) {
                            this.showErrorFun("用户数据baz204图片较大，请联系社保卡管处理后再进行制卡")
                            return					
                        }
                        //社保数据不需要照片
                        this.cardIdInfo.bac200 = ""
                        // makeCardDataObject = cardInfoMesAss(cardData)
                         this.cardIdInfo.busiFlowNo = this.$store.state.service_result.busiFlowNo
                         this.cardIdInfo.isPhoto = '1'
                         this.cardIdInfo.aab201 = cardData.aab201.replace(/462099/, "462000")  //替换城市编码，--有疑问，记得实测
                         this.cardIdInfo.mfEf0504 = cardData.mfEf0504.replace(/462099/, "462000")  //替换初始化机构编号，--有疑问，记得实测
                        let result = "[" + JSON.stringify(this.cardIdInfo) + "]"
                            //写社保数据
                            this.writeCardData(result)

                    } else {
                         this.showErrorFun('社保卡图片数据处理: '+res.msg)
                    }
                 }else{
                     let nowtimeInt = parseInt(dateFormat(new Date().getTime(), 'yyyyMMdd')),
                     year7 = (parseInt(this.$store.stateidt_card_info.birthday) + 70000);
                     if(year7<nowtimeInt){
                         this.showErrorFun("用户已满7岁,必须得有照片")

                         return
                     }else{
                         //社保数据不需要照片
                           this.cardIdInfo.bac200 = ""
                          //未满7岁，不需要保存照片
                          this.cardIdInfo.isPhoto = '0'
                          this.cardIdInfo.busiFlowNo = this.$store.state.service_result.busiFlowNo
                          this.cardIdInfo.aab201 = cardData.aab201.replace(/462099/, "462000")  //替换城市编码，--有疑问，记得实测
                          this.cardIdInfo.mfEf0504 = cardData.mfEf0504.replace(/462099/, "462000")  //替换初始化机构编号，--有疑问，记得实测
                            //写社保数据
                             let result = "[" + JSON.stringify(this.cardIdInfo) + "]"
                             this.writeCardData(result)
                     }

                 }
            },
            //写社保数据
            async writeCardData(data){
                this.processLong() //进度条
                try{
                     await this.$refs.MakeCard.printerCardin()
                    // code返回非零，msg返回硬件错误信息；code返回0，msg返回0时表示存在金融应用，msg返回1时表示不存在金融应用
                     this.havefina= await this.$refs.MakeCard.checkbankapp() 
                     //个人化社保IC卡  ****方法别处调用，记得实测
                    this.writeICSocial(data)
                }catch(res){
                    await this.closePrintMachine()
                    this.showErrorFun('写社保数据失败:'+ res)
                }
            },
            //个人化社保IC卡
           async writeICSocial(data){ 
                // 统一写卡库
                try{
                    await this.$refs.writeCardBus.writeSocialData(data)  //解析社保数据，并写卡
                    await this.PrintWriteCard(1);
                }catch(res){
                     this.showErrorFun('解析社保卡失败:'+res) 
                      await this.closePrintMachine()
                }
            },

            //写卡成功执行，writeType写卡类型，0为金融数据，1为社保数据
           async PrintWriteCard(writeType){  
                //A_isMakeFina 是否写金融数据 0：不写，1：写
                    if (this.A_isMakeFina && writeType == 0) {
                        //初始化复位卡片，并读取写卡信息，最后打印
                        this.readBankCode();     
                    }
                    else if (this.A_isMakeFina && writeType == 1) {
                        // 请求金融数据  同卡号换卡获取IC卡数据（仅支持同卡号）
                         //0-可读卡，1-不可读卡（暂不支持，损坏换卡），2-挂失卡
                       await this.sameCardChangeICData("2");
                    }
                    else {
                        //初始化复位卡片，并读取写卡信息，最后打印
                        this.readBankCode()
                    }         
            },

            //补卡获取金融数据  同卡号换卡获取IC卡数据（仅支持同卡号）
                //OperType，0-可读卡，1-不可读卡（暂不支持，损坏换卡），2-挂失卡
            async sameCardChangeICData(OperType){
                this.processLong()
                // req内容从获取社保卡信息中得来，获取完社保卡信息后需保存为全局变量
                let req={
                    "PrimaryAcctNum": this.$store.state.SOC_SEC_CARD_INFO.PrimaryAcctNum,
                    "CardSeqId": prefixInteger(this.$store.state.SOC_SEC_CARD_INFO.CardSeqId, 3),
                    "PosEntryModeCode":this.$SysCfg.SERVICE_SITE_INPUT_CODE[0]["handwork"] + this.$SysCfg.SERVICE_SITE_INPUT_CODE[1]["notPin"],
                    "Track2Data": "",  
                    "Track3Data": "",
                    "EmvVal": "",
                    "OperType": OperType,
                    "CustomName": this.$store.state.idt_card_info.CustomName,
                    "IdType": "01",
                    "IdNum": this.$store.state.idt_card_info.IdNum,
                    "busiFlowNo": this.$store.state.service_result.busiFlowNo
                }

                    let res = await this.$SystemBaseApi.SST_FunInfoPassthrough(this.$SysCfg.TRAN_CODES["bankBusiness"]["sameCardChangeICData"],req)
                    if(res.resultCode == RETURN_SUCCESS){
                        this.cardFinGetInfo = JSON.parse(res.resultData)[0]
                        //写金融数据
                        //ps：预制卡肯定不会写金融数据
                        setTimeout(()=> {
                            this.writeICPBOC(this.cardFinGetInfo.Data);
                        }, 200);
                    }else if(res.resultCode==PASSWORD_AGING){
                        //密钥过期并重新获取密钥
                        //ReGetMacANDPin(sameCardChangeICData)
                    }else{
                       this.showErrorFun('补卡获取金融数据:'+res.errorInfo) 
                      await this.closePrintMachine()
                    }               
            },
        //个人化金融IC卡
        async writeICPBOC(data) {
                // 统一写卡库
                try{
                    await this.$refs.writeCardBus.writeFinancialData(data)
                    await this.PrintWriteCard(0);
                }catch(res){
                     this.showErrorFun('金融IC卡失败:'+res) 
                    await this.closePrintMachine()
                }
                
        },
        //获取P端内部认证信息
        async readBankCode() {
            this.processLong() 
            try{
                
                this.cardIdMakedInfo = parsingParam(await this.$refs.MakeCard.readsssebasdata())   //读取写卡社保数据
                this.cardFinMakedInfo = parsingParam( await this.$refs.MakeCard.readpbocemvdata())  //读取写卡金融数据


                /* ATR大于26位截取后26位 */
                this.cardIdMakedInfo.ATR = this.cardIdMakedInfo.ATR.length > 26 ? this.cardIdMakedInfo.ATR.substring(this.cardIdMakedInfo.ATR.length - 26) : this.cardIdMakedInfo.ATR;
                this.$store.commit('SET_CARD_ID_MAKED_INFO', this.cardIdMakedInfo )
                this.$store.commit('SET_CARD_FIN_MAKED_INFO',  this.cardFinMakedInfo)
               await this.cardInsideAuth()
            }catch(res){
                this.showErrorFun('读取写卡数据失败:'+res)
               await this.closePrintMachine()
            }    
        },


        //P端卡片数据内部认证
        async cardInsideAuth(){
             this.processLong()
            // this.cardIdMakedInfo = parsingParam(this.cardIdMakedInfo)
            // this.cardFinMakedInfo = parsingParam(this.cardFinMakedInfo)
            let NBRZ = '0000000000000000',
                NBXX = '0000000000000000',
	            wbrz = '0000000000000000',
	            wbxx = '0000000000000000'
            let req = {
                "aaa027": this.cardIdMakedInfo.KSBM.substr(0, 6),//发卡地行政区划代码
                "kfwxx": this.cardIdMakedInfo.ATR,//卡复位信息
                "sfbs": "03",//算法标识 01:DES 02:SSF33 03:SM4
                "baz849": this.cardIdMakedInfo.KSBM,//卡识别码 取前24位
                "nbrz": NBRZ,//内部认证过程因子
                "nbxx": NBXX,//内部认证鉴别所需的原始信息
                "wbrz": wbrz,//外部认证过程因子
                "wbxx": wbxx,//外部认证鉴别所需的原始信息
                "busiFlowNo": this.$store.state.service_result.busiFlowNo,//交易流水号
            }

            let res = await this.$SystemBaseApi.SST_FunInfoPassthrough(this.$SysCfg.TRAN_CODES["makeCard"]["cardInsideAuth"],req)
                    if(res.resultCode == RETURN_SUCCESS){
                        //打印
                        this.printCard()

                    }else if(res.resultCode==PASSWORD_AGING){
                        //密钥过期并重新获取密钥
                        //ReGetMacANDPin(sameCardChangeICData)
                    }else{
                       this.showErrorFun('P端卡片数据内部认证:'+res.errorInfo) 
                       await this.closePrintMachine()
                    }        

        },

        //打印版面
		async printCard(){
               this.processLong() 
               try{
                    await this.$refs.MakeCard.printerSetprttext(`167.5,172,宋体,11,0,姓名  ${this.cardIdInfo.aac003}${strMul(" ", 24)}`)
                    await this.$refs.MakeCard.printerSetprttext(`167.5,225,宋体,11,0,社会保障号码  ${this.cardIdInfo.aae135}${strMul(" ", 36)}`)
                    await this.$refs.MakeCard.printerSetprttext(`167.5,279,宋体,11,0,卡号  ${this.cardIdInfo.aaz500}${strMul(" ", 24)}`)
                    await this.$refs.MakeCard.printerSetprttext(`167.5,331,宋体,11,0,发卡日期  ${this.cardIdInfo.mfEf0505.substr(0, 4)}年${this.cardIdInfo.mfEf0505.substr(4, 2)}月${strMul(" ", 24)}`)
                    
                   //有金融模块需要打印银行卡号
                    if(this.A_isMakeFina){
                            if (this.cardFinMakedInfo.sBankNO == undefined || this.cardFinMakedInfo.sBankNO == null) {
                                this.showErrorFun("打印机读卡器异常", "打印机读55域，无法读取到银行卡号");
                                return
                            }
                            await this.$refs.MakeCard.printerSetprttext(`96,447,Arial,21,0,${this.cardFinMakedInfo.sBankNO.substr(0, 6)} ${this.cardFinMakedInfo.sBankNO.substr(6)}${strMul(" ", 40)}`)
                        }
                    await this.$refs.MakeCard.printerSetprtpic(`47.5,125,118,295,C:\\ECPATMMB\\print.jpg`);
                    //启动打印   
                    await this.$refs.MakeCard.printerStartprint();
                    this.reissueCardCounteroffer()
               }catch(res){
                   this.showErrorFun(res)
                  await this.closePrintMachine()
               }

        },

        //补卡回盘
       async reissueCardCounteroffer() {
             this.processLong() 
            let req = {
                "aae135": this.$store.state.idt_card_info.IdNum,//身份证号
                "aae010": this.cardFinMakedInfo.sBankNO,//银行卡号
                "baz806": this.cardIdInfo.baz806,//卡状态
                "baz827": "成功",//制卡失败原因
                "baz926": "1",//卡成功标识
                "mfEf0501": this.cardIdMakedInfo.KSBM,//卡的识别码
                "cardResetCode": this.cardIdMakedInfo.ATR,//卡复位信息
                "cardats": "",//ATS 信息 右补空格
                "csn": "",
                "orderid": "",
                "baz849": this.cardIdInfo.baz849,
                "busiFlowNo": this.$store.state.service_result.busiFlowNo
            }
            let res = await this.$SystemBaseApi.SST_FunInfoPassthrough(this.$SysCfg.TRAN_CODES["makeCard"]["reissueCardCounteroffer"],req)
                    if(res.resultCode == RETURN_SUCCESS){
                        //回盘登记
                        this.counterofferReq()

                    }else if(res.resultCode==PASSWORD_AGING){
                        //密钥过期并重新获取密钥
                        //ReGetMacANDPin(sameCardChangeICData)
                    }else{
                       this.showErrorFun('补卡回盘失败：'+res.errorInfo) 
                      await this.closePrintMachine()
                    }  

        },
        //回盘登记
       async counterofferReq(){
             this.processLong() 
            let req = {
                "IdType": '01',
                "IdNum": this.$store.state.idt_card_info.IdNum,
                "CustomName": this.$store.state.idt_card_info.CustomName,
                "PrimaryAcctNum": this.cardFinMakedInfo.sBankNO,
                "CardSeqId": prefixInteger(this.$store.state.SOC_SEC_CARD_INFO.CardSeqId, 3),
                "SBSBM": this.cardIdMakedInfo.KSBM,
                "busiFlowNo":this.$store.state.service_result.busiFlowNo
            } 
               let res = await this.$SystemBaseApi.SST_FunInfoPassthrough(this.$SysCfg.TRAN_CODES["bankBusiness"]["counterofferReq"],req)
                    if(res.resultCode == RETURN_SUCCESS){
                        this.$emit('makecardBusinessSuccess',true)
                        this.processLong() 

                    }else if(res.resultCode==PASSWORD_AGING){
                        //密钥过期并重新获取密钥
                        //ReGetMacANDPin(sameCardChangeICData)
                    }else{
                       this.showErrorFun("回盘登记失败："+res.errorInfo) 
                      await this.closePrintMachine()
                    }  

        }
        
        },
        beforeDestroy() {
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
    .identity-wrap {
        height: 100vh;
        width: 100vw;
        background-image: url('~/assets/img/bg-bak.png');
        background-size: 100% 100%;
        background-repeat: no-repeat;
    }

    .identity-box {
        background: hsla(130, 20%, 97%, 0.6);
        position: absolute;
        left: 50%;
        top: 58%;
        transform: translate(-50%, -50%);
        width: 65vw;
        height: 42vw;
    }

    .identity-box p {
        font-size: 28px;
        font-weight: 600;
        text-align: center;
        padding: 3px;
    }

    .identity-title {
        background: linear-gradient(to top, rgb(216, 0, 15) 0%, rgb(168, 28, 28) 100%);
        height: 50px;
        line-height: 50px;
        text-align: center;
        color: #fff;
        font-weight: bold;
    }

    .identity-insert {
        position: absolute;
        z-index: 2;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width:70%;
        display: flex;
        justify-content: center;
        text-align: center;
        flex-direction: column;

    }

    .identity-wrap img {
        width: 100%;
        height: 100%;
        object-fit: fill;
    }

    .dosomething {
        position: absolute;
        width: 100%;
        top: 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .dosomething .hainan-button {
        display: block;
        width: 150px;
        height: 40px;
        line-height: 40px;
        margin: 5px 10px;
        text-align: center;
        color: #fff;
        border-radius: 5px;
        background-image: linear-gradient(to bottom right, #ff3643, #d6000e);
        z-index: 4;
    }
    .progress-bar{
        position: relative;
        display: inline-block;
        vertical-align: middle;
        width:100%;
        height:30px;
        line-height: 30px;
        box-sizing: border-box;
        border-radius: 100px;
        background-color: #e2cfcf;
        overflow: hidden;
    }
    .progress-insert{
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        background-color: #f56c6c;
        text-align: right;
        border-radius: 100px;
        line-height: 1;
        white-space: nowrap;
        transition: width .6s ease;
    }
    .progress-bar p{
        float: right;
        color: #fff;
        padding-right: 5px;
        font-size: 20px;
        line-height:25px;
    }
    .progress-bottom{
        padding: 15px;
    }
</style>
<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2021-12-28 14:46:53
 * @LastEditTime: 2022-01-13 11:22:36
-->

<template>
    <div class="identity-page">
        <!-- <Header /> -->
        <identity-face-business @identityFaceBusinessSuccess="identityFaceBusinessResule"  v-if="showIndex==0"/>
        <!-- <finger-recognition @fingerRecognitionSuccess="getFingerPrintResule" v-if="showIndex==2"  /> -->

        <pinpad :show="true" @pinpadSuccess="pinpadResule" :info="promptInfo" :card-id="cardId" v-if="showIndex==1"></pinpad>
        <div class="identity-box" v-if="showIndex==3">
            <div class="identity-title">社保卡金融信息确认</div>
            <div class="missing" v-if="formData.length>0">
                <div class="missing-block" :key="index" v-for="(item, index) in formData">
                    <div class="col-xs-6 missing-text-right"> {{ item.label }}  </div>
                    <div class="col-xs-6"> {{ item.text }}  </div> 
                </div>
                <button @click="showIndex = 4" class="sys-btn missing-btn-right">确定</button>
                <button @click="gotoHomePage()" class="sys-btn">取消</button>
            </div>
        </div>
        <div class="identity-box" v-if="showIndex==4">
            <div class="missing-play col-xs-12"><span style="color:red;font-size: 25px;">{{ PayInfo }}</span></div>
            <div class="missing-play col-xs-12">
                <button @click="cardInfoConfirmBtn()" class="sys-btn">
                    <span>本卡支付</span>
                </button>
            </div>
        </div>
        <receipt-printer :print-vals="printVals" :print-template="printTemplate" @printTicketSuccess="printTicketResule" v-if="showIndex==5"></receipt-printer>
        <div class="identity-box" v-if="showIndex==6">
            <div class="missing-play col-xs-12"><span style="color: red;font-size: 40px;font-weight: 800;line-height: 10;">书面挂失成功</span></div>           
        </div>

        <div class="identity-box" v-if="showIndex==8"></div>

        <errorInfo :showError="errorText!=''"  :errorText="errorText"/>
        <Loading :showLoading="loadingText!=''" :loadingText="loadingText" />

        <make-card-business :A_isMakeFina="isMakeFina" v-if="showIndex==7"/>

        <business-collection-business  ref="businessCollectionBusiness"></business-collection-business>

    </div>
</template>
<script>
// import Header from '~/components/common/header.vue'
import Pinpad from '~/components/device/pinpad.vue'
import IdentityFaceBusiness from '~/components/business/identityFaceBusiness.vue'
import errorInfo from '~/components/common/errorinfo.vue'
import Loading from '~/components/common/loading.vue'
import ReceiptPrinter from '~/components/device/receiptPrinter.vue'
import {dateFormat} from '~/components/common/utils'
import MakeCardBusiness from '~/components/business/makeCardBusiness.vue'
import businessCollectionBusiness from '~/components/business/businessCollectionBusiness.vue'


/**接口返回代码 **/
var RETURN_SUCCESS ='1000';
var PASSWORD_AGING = '2999';

/** 卡状态 **/
//0 - 正常
var CARD_STATE_COMMON = 0;
//1 - 口头挂失
var CARD_STATE_VIVA_LOSS= 1;
//2 - 书面挂失
var CARD_STATE_WRITTEN_LOSS = 2;

/* 制卡状态*/
//0-初始状态：C端发起补换卡申请
var MAKE_CARD_TYPEY_INIT = 0;
//1-申请成功：C端发起获取IC卡数据
var MAKE_CARD_TYPEY_REQUEST_SUCCESS = 1;
//2-换卡成功：C端写卡并发起社保回盘
var MAKE_CARD_TYPEY_CHANGE_SUCCESS = 2;
//3-制卡成功：C端发起社保回盘
var MAKE_CARD_MAKE_SUCCESS = 3;
//4-社保回盘成功：C端发起银行回盘
var MAKE_CARD_RETURN_SUCCESS = 4;
//5-银行回盘成功：C端吐卡
var MAKE_CARD_BANK_RETURN_SUCCESS = 5;
/**是否写金融**/
//写金融
var MAKE_FINA = "1";
//不写金融
var UN_MAKE_FINA = "0";

export default {
    layout:'blank',
    components: {
        // Header,
        // fingerRecognition,
        IdentityFaceBusiness,
        errorInfo,
        Pinpad,
        Loading,
        ReceiptPrinter,
        dateFormat,
        MakeCardBusiness,
        businessCollectionBusiness,
	},
    props: {
        isLost: [Boolean],//true 是挂失业务，false 是补业务
        isMakeFina: [Number],//是否写金融 0：不写，1：写 //不写金融数据为同号换卡//写金融数据为异号换卡
    },
    data(){
		return {
            showIndex: 0,
            // showIndex: 0,
            errorText: "",
            loadingText: "",
            readingMsg:(require(`~/data/${this.$store.state.select_language}.json`)).device.pinpad,
            Cost: 15, //工本费：默认15，二代换三代不要钱
            Balance: 0, // 余额
            status: "",
            formData: [],
            activation_status: "",
            PayInfo: "",
            PayType: "0", //0：本卡扣款 1：其他本行卡扣款（暂不支持）
	        isReSend: 0, //是否重发 0：未重发 ，1：重发
            cardId: "",
            promptInfo: "",
            printVals: [],
            printTemplate: {
                "templateType":"",//模板类型 0：补换卡 1：挂失
                "num":"",//挂失卡号
                "oldNum":"",//旧卡号
                "name":"",//户名
                "type":"",//证件类型
                "idNum":"",//证件号码：
                "business":"",//业务类型
                "reason":"",//换卡原因/挂失方式
                "cost":"",//换卡工本费/挂失手续费
                "success":"",//社保处理标志
                "devId":"",//交易终端
                "busiFlowNo":"",//流水号
                "time":"",//交易时间
                "tickImgUrl":"",
            },
        }
    },
    async mounted(){

    },
    methods:{
        gotoHomePage() {
            this.$router.push('/')
        },
        async identityFaceBusinessResule(v) {

            //卡类型 1-空白卡2-预制卡只有发卡功能需要传输
            //isMakeFina== 0 异号预制卡 isMakeFina== 1 同号空白卡
            await this.$refs.businessCollectionBusiness.setBusinessDataVal("cardType", this.isMakeFina=="0"?"2":"1");
            //发卡结果 发卡是否成功（0成功，1废卡槽，2未出卡）只有发卡功能需要传输
            await this.$refs.businessCollectionBusiness.setBusinessDataVal("resultCode","2");
            //换卡原因	Char		Y	0损坏换卡（暂不支持）2-正常换卡（三代换三代）3挂失换卡（“二代/三代”换三代）4换代换卡（二代换三代）免工本费只有涉及换卡功能需要传输
            await this.$refs.businessCollectionBusiness.setBusinessDataVal("changeRes","3");            
            ////当前状态 当前状态：0-初始状态   1-申请成功（挂失申请成功后）   2-换卡成功（获取IC卡数据成功后）   3-制卡成功  4-社保回盘成功 5-银行回盘成功（同号补换卡才需要这个状态）只有发卡功能需要传输
            await this.$refs.businessCollectionBusiness.setBusinessDataVal("status","0"); 
            if(v){
                // this.showIndex=1
                this.showIndex=3
                await this.queSocSecCardInfo();

                /* this.errorText = "人脸比对成功"
                setTimeout(() => {
                    this.errorText=""
                    this.$router.push('/')
                }, 5000) */
            }else{
                // this.$router.push('/')
                 console.log('跳错误页')
            }
        },
        async pinpadResule(pin) {
            if (pin) {
                console.log("密码:", pin)
                if (this.isLost) {
                    // 挂失
                    await this.repLoseInWrite(pin)
                } else {
                    // 补卡
                    await this.reprintAndChangeReq(pin)
                }
                /* this.showIndex=3
                this.loadingText = this.readingMsg.loadingtext;
                await this.$SystemBaseApi.SST_Delay(1000);
                this.loadingText = '';
                this.showIndex=2 */

            }
        },
        async printTicketResule(v) {

        },
        /**
         * 限制长度补零
         * @param {*} num 数值
         * @param {*} len 长度
         */
        prefixInteger(num, len) {
            return (Array(len).join(0) + num).slice(-len);
        },
        //查询社保卡信息
        async queSocSecCardInfo(){
            let req = {
                "IdType": "01",//证件类型
                "IdNum": this.$store.state.idt_card_info.IdNum,//身份证号
                "CustomName": this.$store.state.idt_card_info.CustomName,//姓名
                "CheckType": "1",//查询类型      1-挂失	 2-补换卡申请	3-获取制卡数据
                "PrimaryAcctNum": "0",//卡号       默认：0  
                "CardSeqId": this.prefixInteger('0' + this.$store.state.service_result.KXLH, 3),//卡序号 		默认：0           
                "busiFlowNo": this.$store.state.service_result.busiFlowNo//流水号
            }
            let param = await this.$SystemBaseApi.SST_FunInfoPassthrough(this.$SysCfg.TRAN_CODES["bankBusiness"]["queSocSecCardInfo"], req)
            if (!param.errorInfo && param.resultCode == "1000") {
                //银行卡信息
                var data = JSON.parse(param.resultData);
                // SOC_SEC_CARD_INFO = data[0];
                // 缓存社保卡信息
                this.$store.commit('SOC_SEC_CARD_INFO',  data[0]);
                
                // 卡号
                // BANK_CODE = SOC_SEC_CARD_INFO.PrimaryAcctNum
                //金融激活标志位
                //0：未激活 1：已激活
                // JHZT=SOC_SEC_CARD_INFO.JHZT;
                // 显示
                this.Balance = this.$store.state.SOC_SEC_CARD_INFO.Balance <= 0 ? 0.00 : this.$store.state.SOC_SEC_CARD_INFO.Balance;
                //授权理由
                // REASON=SOC_SEC_CARD_INFO.Reason;
                // 挂失状态
                // var status = '';
                // var formData = [];
                //当为异号时，需要保存旧卡数据，进行业务数据采集
                /* if(this.isMakeFina==UN_MAKE_FINA){
                    //旧卡卡号
                    OLD_CARD_NO = this.$store.state.SOC_SEC_CARD_INFO.PrimaryAcctNum;
                    //旧卡序列号
                    OLD_CARD_SN= this.$store.state.SOC_SEC_CARD_INFO.CardSeqId;				
                } */
                // 制卡状态
                let CARD_ZKZT = this.$store.state.SOC_SEC_CARD_INFO.ZKZT;
                //制卡状态（用于业务采集）
                // let CARD_STATUS = CARD_ZKZT;
                //当社保处理失败，需要重新提交申请
                //0：处理失败
                //1：处理成功
                //2：还未处理
                if((this.$store.state.SOC_SEC_CARD_INFO.SBCGBZ==0||this.$store.state.SOC_SEC_CARD_INFO.SBCGBZ==2)&&this.$store.state.SOC_SEC_CARD_INFO.ZWRZ!=1){
                    CARD_ZKZT=MAKE_CARD_TYPEY_INIT;
                    this.isReSend=1;
                }

                // 挂失业务
                if (this.isLost) {
                    if( parseInt(this.$store.state.SOC_SEC_CARD_INFO.Balance)<25
                        && this.$store.state.SOC_SEC_CARD_INFO.JHZT=="1"){
                        this.errorInfo="银行卡号"+this.$store.state.SOC_SEC_CARD_INFO.PrimaryAcctNum+"余额不足25，无法进行挂失，请转账25元到本卡";
                        // gotoErrorTarget("提示",errMsg);

                    }
                    // 挂失业务
                    // var pageData = showData.loss;
                    this.Cost = 10;
                    if (this.$store.state.SOC_SEC_CARD_INFO.GSZT == CARD_STATE_COMMON) {
                        this.status = '正常';
                    } else if (this.$store.state.SOC_SEC_CARD_INFO.GSZT == CARD_STATE_VIVA_LOSS) {
                        this.status = '口头挂失';
                        //gotoErrorTarget("提示","当前社保卡已经挂失，无需重复挂失");
                    } else if (this.$store.state.SOC_SEC_CARD_INFO.GSZT == CARD_STATE_WRITTEN_LOSS) {
                        this.status = '书面挂失';
                        // gotoErrorTarget("提示","当前社保卡已经挂失，无需重复挂失");
                         this.errorInfo = "当前社保卡已经挂失，无需重复挂失"
                    }
                    this.PayInfo = '书面挂失需要收取'+this.Cost+'元手续费，请选择支付方式';
                    this.activation_status='激活';
                    if(this.$store.state.SOC_SEC_CARD_INFO.JHZT=="0"){
                        this.PayInfo = '书面挂失需要收取'+this.Cost+'元手续费，请选择支付方式（卡片未激活将不收取手续费）';
                        this.activation_status='未激活';
                    }

                    
                } else {
                    //判断是否需要指纹认证
                    //0:不进行指纹认证
                    //1：进行指纹认证
                    if(this.$store.state.SOC_SEC_CARD_INFO.ZWRZ==1){
                        //当先前业务失败，需要指纹认证，重新设置gotoUrl
                        // setGotoUrl();
                        // 测试
                        console.log("当先前业务失败，需要指纹认证，重新设置gotoUrl")
                    }
                    
                    /* 制卡状态
                    0-初始状态：C端发起补换卡申请
                    1-申请成功：C端发起获取IC卡数据
                    2-换卡成功：C端写卡并发起社保回盘
                    3-制卡成功：C端发起社保回盘
                    4-社保回盘成功：C端发起银行回盘
                    5-银行回盘成功：C端吐卡
                    */
                    if (CARD_ZKZT == MAKE_CARD_TYPEY_REQUEST_SUCCESS) {
                        
                        if (this.isMakeFina == MAKE_FINA) {
                            console.log("同号换卡获取金融数据")
                            //同号换卡
                            //需要获取金融数据
                            this.sameCardChangeICData();
                            return 0;
                        } else {
                            console.log("异号换卡获不用取金融数据")
                            //异号换卡
                            // 跳转下一业务
                            // gotoRoute(gotoUrl);
                            this.showIndex=7;
                            return 0;
                        }
                    } else if (CARD_ZKZT == MAKE_CARD_TYPEY_INIT || this.$store.state.SOC_SEC_CARD_INFO.GSZT == CARD_STATE_COMMON || CARD_ZKZT == MAKE_CARD_BANK_RETURN_SUCCESS || (CARD_ZKZT == MAKE_CARD_RETURN_SUCCESS && this.isMakeFina == UN_MAKE_FINA)) {
                        // 补卡业务
                        // this.pageData = showData.missing;

                        if (this.$store.state.SOC_SEC_CARD_INFO.GSZT == CARD_STATE_COMMON) {

                            this.status = '正常';

                            // gotoErrorTarget("提示","当前社保卡状态正常，需先进行挂失业务，才可进行补卡");
                            this.errorText="提示:"+"当前社保卡状态正常，需先进行挂失业务，才可进行补卡"

                        } else if (this.$store.state.SOC_SEC_CARD_INFO.GSZT == CARD_STATE_VIVA_LOSS) {
                            this.status = '口头挂失';
                        } else if (this.$store.state.SOC_SEC_CARD_INFO.GSZT == CARD_STATE_WRITTEN_LOSS) {
                            this.status = '书面挂失';
                        }
                    
                        this.PayInfo = '补卡需要收取'+this.Cost+'元工本费(当前挂失状态下，已收取过工本费用的则不再重复收取)';
                        this.activation_status='激活';
                        if(this.$store.state.SOC_SEC_CARD_INFO.JHZT=="0"){
                            this.PayInfo = '补卡需要收取'+this.Cost+'元工本费（卡片未激活将不收取工本费）';
                            this.activation_status='未激活';
                        }
                    } else {
                        if (this.isMakeFina == MAKE_FINA) {
                            console.log("同号换卡获取金融数据")
                            //同号换卡
                            //需要获取金融数据
                            this.sameCardChangeICData();
                            return 0;
                        } else {
                            console.log("异号换卡获不用取金融数据")
                            //异号换卡
                            // 跳转下一业务
                            // gotoRoute(gotoUrl);
                            this.showIndex=7;
                            return 0;
                        }
                    }
                    
                }
                // 展示查询社保卡信息
                this.formData = [
                    { "label": "姓    名： ", "text": this.$store.state.idt_card_info.CustomName },
                    { "label": "身份证号： ", "text": this.$store.state.idt_card_info.IdNum },
                    { "label": "银行账号： ", "text": this.$store.state.SOC_SEC_CARD_INFO.PrimaryAcctNum },
                    { "label": "状    态： ", "text": this.status },
                    { "label": "激活状态： ", "text": this.activation_status }
                ];

            } else {
                this.errorText="获取社保卡信息失败:"+ param.errorInfo
            }
        },
        // 支付
        cardInfoConfirmBtn() {

            if (this.Balance<this.Cost && this.isReSend==0 && this.$store.state.SOC_SEC_CARD_INFO.JHZT=="1" ) {
                // 余额不足
            } else {
                console.log("本卡支付");
                // 银行卡号
                let cardID = this.$store.state.SOC_SEC_CARD_INFO.PrimaryAcctNum.substring(0, 19);
                // 开启密码键盘
                // SST_pinpad_MWOpen(cardID);
                this.showIndex=1
                this.cardId = cardID;
                this.promptInfo = this.readingMsg.enterPassword;
            }
        },
        //读取卡片信息
        async readCardInfo(){
            this.cardIdMakedInfo = parsingParam(await this.$refs.MakeCard.readsssebasdata())   //读取写卡社保数据
            this.cardFinMakedInfo = parsingParam( await this.$refs.MakeCard.readpbocemvdata())  //读取写卡金融数据


            /* ATR大于26位截取后26位 */
            this.cardIdMakedInfo.ATR = this.cardIdMakedInfo.ATR.length > 26 ? this.cardIdMakedInfo.ATR.substring(this.cardIdMakedInfo.ATR.length - 26) : this.cardIdMakedInfo.ATR;
            this.$store.commit('SET_CARD_ID_MAKED_INFO', this.cardIdMakedInfo )
            this.$store.commit('SET_CARD_FIN_MAKED_INFO',  this.cardFinMakedInfo)
            return 0;
        },
        async repLoseInWrite(RETURN_PIN) {
            // 挂失申请
            var req = {
                "PrimaryAcctNum": this.$store.state.SOC_SEC_CARD_INFO.PrimaryAcctNum,//主帐号
                "PosEntryModeCode": this.$SysCfg.SERVICE_SITE_INPUT_CODE[0]["handwork"] + this.$SysCfg.SERVICE_SITE_INPUT_CODE[1]["havePin"],//服务点输入方式码
                "PinData": RETURN_PIN,//密码
                "IdNum": this.$store.state.idt_card_info.IdNum,//证件号码
                "IdType": "01",//证件类型
                "CustomName": this.$store.state.idt_card_info.CustomName,//姓名
                "PayType": this.PayType,//扣款类型
                "GSFS": "2",//挂失方式 默认：2 书面挂失
                "GSSXF": this.Cost,//挂失手续费
                "JHZT":this.$store.state.SOC_SEC_CARD_INFO.JHZT,//核心激活状态 0：未激活 1：已激活
                "busiFlowNo": this.$store.state.service_result.busiFlowNo
            };
            let param = await this.$SystemBaseApi.SST_FunInfoPassthrough(this.$SysCfg.TRAN_CODES["bankBusiness"]["repLoseInWrite"], req)

            //制卡状态，书面挂失还处于初始状态
            // CARD_STATUS = MAKE_CARD_TYPEY_INIT;    	
            if (!param.errorInfo && param.resultCode == "1000") {
                var data = JSON.parse(param.resultData);
                //凭条打印模板
                this.printTemplate={
                    "tickImgUrl":this.$store.state.tickImgUrl,//单色图路径
                    "templateType":1,//模板类型 0：补换卡 1：挂失
                    "num":data[0].PrimaryAcctNum,//挂失卡号
                    "oldNum":"",//旧卡号
                    "name":this.$store.state.idt_card_info.CustomName,//户名
                    "type":"身份证",//证件类型
                    "idNum":this.$store.state.idt_card_info.IdNum,//证件号码：
                    "business": "挂失申请",//业务类型
                    "reason": "书面挂失",//换卡原因/挂失方式
                    "cost":data[0].GSSXF + "元",//换卡工本费/挂失手续费
                    "success":data[0].SBCGBZ == 0 ? "失败" : "成功",//社保处理标志
                    "devId":this.$store.state.deviceID,//交易终端
                    "busiFlowNo":this.$store.state.service_result.busiFlowNo,//流水号
                    "time":dateFormat(new Date().getTime(), 'yyyy-MM-dd hh:mm:ss'),//交易时间               
                }
                // 挂失成功
                this.showIndex = 5;
                this.showIndex = 6;
                 
                await this.$refs.businessCollectionBusiness.setBusinessDataVal("isSucceed","1");  
                await this.$refs.businessCollectionBusiness.businessCollection();       

            } else if (param.errorInfo.indexOf("密码") != -1 && param.errorInfo.indexOf("次数") == -1) {
                //有可能是密码错误
                // work[1].msg = "<br><div class='password-box'><label style='color:red'>输入密码有误&nbsp;</label><br><br><label>请输入密码&nbsp;</label><span>—</span><span>—</span><span>—</span><span>—</span><span>—</span><span>—</span></div>";
                // 启动密文输入
                // SST_MW_StartPinPress();
                //重新回到输密码的流程
                // clock("work_ID",work[1]);

                this.showIndex=8
                await this.$SystemBaseApi.SST_Delay(1000)
                // 银行卡号
                let cardID = this.$store.state.SOC_SEC_CARD_INFO.PrimaryAcctNum.substring(0, 19);
                // 开启密码键盘
                // SST_pinpad_MWOpen(cardID);
                this.cardId = cardID;
                this.promptInfo = this.readingMsg.enterPassword;
                this.showIndex=1

            } else if(param.resultCode == '2999'){
                //密钥过期并重新获取密钥
                // ReGetMacANDPin(repLoseInWrite)
            } else {
                // businessCollection("0")
                
                await this.$refs.businessCollectionBusiness.setBusinessDataVal("isSucceed","0");    

                await this.$refs.businessCollectionBusiness.setBusinessDataVal("errorInfo",param.errorInfo);
                //错误消息提示
                // gotoErrorTarget("书面挂失失败",param.errorInfo);
                this.errorText="书面挂失失败:"+ param.errorInfo
                
                await this.$refs.businessCollectionBusiness.businessCollection();
            }
        },
        //补卡换卡申请
        async reprintAndChangeReq(RETURN_PIN){
            // 	0损坏换卡（暂不支持）
            //	2-正常换卡（三代换三代）
            //	3挂失换卡（“二代/三代”换三代）
            //	4换代换卡（二代换三代）免工本费
            var ChangeRes = "3";
            // 补卡换卡申请
            var req = {
                "PrimaryAcctNum": this.$store.state.SOC_SEC_CARD_INFO.PrimaryAcctNum,//主帐号
                "CustomName": this.$store.state.idt_card_info.CustomName,//姓名
                "PinData": RETURN_PIN,
                "PosEntryModeCode": this.$SysCfg.SERVICE_SITE_INPUT_CODE[0]["handwork"] + this.$SysCfg.SERVICE_SITE_INPUT_CODE[1]["havePin"],//服务点输入方式码
                "CardSeqId": this.prefixInteger(this.$store.state.SOC_SEC_CARD_INFO.CardSeqId, 3),
                "Track2Data": "",
                "Track3Data": "",
                "EmvVal": "",
                "IdType": "01",
                "IdNum": this.$store.state.idt_card_info.IdNum,//证件号码
                "ChangeRes": ChangeRes,
                "PayType": this.PayType,
                "THHKBZ": this.isMakeFina,
                "Cost": this.Cost,
                "JHZT":this.$store.state.SOC_SEC_CARD_INFO.JHZT,//核心激活状态 0：未激活 1：已激活
                "busiFlowNo": this.$store.state.service_result.busiFlowNo
            };
            // console.log("补卡换卡申请>>", req)
            let param = await this.$SystemBaseApi.SST_FunInfoPassthrough(this.$SysCfg.TRAN_CODES["bankBusiness"]["reprintAndChangeReq"], req)
            if (!param.errorInfo && param.resultCode == RETURN_SUCCESS) {
                // //关闭密码键盘
                // pinpadclose();         	
                var data = JSON.parse(param.resultData);

                //凭条打印模板
                this.printTemplate={
                    "tickImgUrl":this.$store.state.tickImgUrl,//单色图路径
                    "templateType":0,//模板类型 0：补换卡 1：挂失
                    "num":data[0].PrimaryAcctNum,//挂失卡号
                    "oldNum":data[0].PrimaryAcctNum,//旧卡号
                    "name":this.$store.state.idt_card_info.CustomName,//户名
                    "type":"身份证",//证件类型
                    "idNum":this.$store.state.idt_card_info.IdNum,//证件号码：
                    "business": "社保卡同号补卡",//业务类型
                    "reason": "挂失同号补卡",//换卡原因/挂失方式
                    "cost":data[0].GSSXF + "元",//换卡工本费/挂失手续费
                    "success":data[0].SBCGBZ == 0 ? "失败" : "成功",//社保处理标志
                    "devId":this.$store.state.deviceID,//交易终端
                    "busiFlowNo":this.$store.state.service_result.busiFlowNo,//流水号
                    "time":dateFormat(new Date().getTime(), 'yyyy-MM-dd hh:mm:ss'),//交易时间               
                }                
                //卡号
                var PrimaryAcctNum = data[0].PrimaryAcctNum;

                //社保成功标志 0失败 1成功
                var SBCGBZ = data[0].SBCGBZ;
                //错误原因
                var ErrRes = data[0].ErrRes;

                /* //工本费
                Cost = data[0].Cost;
                repecipt.business = this.isMakeFina == MAKE_FINA ? "社保卡同号补卡" : "社保卡换号补卡";
                repecipt.reason = this.isMakeFina == MAKE_FINA ? "挂失同号补卡" : "挂失换号补卡";
                repecipt.oldNum = data[0].PrimaryAcctNum;//主账号
                repecipt.cost = data[0].Cost + "元";//挂失手续费
                repecipt.success = data[0].SBCGBZ == 0 ? "失败" : "成功"
                repecipt.falut = data[0].ErrRes
                repecipt.oiffNum = "";//业务流水号
                repecipt.time = tools.dateFormat("YYYY-mm-dd HH:MM:SS", new Date())
                //打印凭条
                SST_printTicker(1, repecipt); */

                this.showIndex=5;

                if (SBCGBZ == 0) {
                    if(this.isReSend==0){
                        // gotoErrorTarget("提示",ErrRes);
                        this.errorText="提示:"+ErrRes
                        return 0;
                    }
                    // this.errorText="提示:"+ErrRes+"，已经重发"
                }
                await this.$refs.businessCollectionBusiness.setBusinessDataVal("status","1");  
                //制卡状态，申请成功
                // CARD_STATUS = MAKE_CARD_TYPEY_REQUEST_SUCCESS;
                //异号换卡	
                if (this.isMakeFina == UN_MAKE_FINA) {
                    // 跳转下一业务
                    // gotoRoute(gotoUrl);
                    console.log("异号换卡")
                    this.showIndex=7;
                }
                //同号换卡
                else if (this.isMakeFina == MAKE_FINA) {
                    //需要获取金融数据
                    this.sameCardChangeICData();
                    console.log("同号换卡")
                }

            } else if (param.errorInfo.indexOf("密码") != -1 && param.errorInfo.indexOf("次数") == -1) {
                /* //有可能是密码错误
                work[1].msg = "<br><div  class='password-box password-error'><label class='password-error-lab'>输入密码有误&nbsp;</label><br><br><label>请输入密码&nbsp;</label><span>—</span><span>—</span><span>—</span><span>—</span><span>—</span><span>—</span></div>";
                // 启动密文输入
                SST_MW_StartPinPress();
                //重新回到输密码的流程
                clock("work_ID",work[1]); */

                this.showIndex=8
                await this.$SystemBaseApi.SST_Delay(1000)

                // 银行卡号
                let cardID = this.$store.state.SOC_SEC_CARD_INFO.PrimaryAcctNum.substring(0, 19);
                // 开启密码键盘
                // SST_pinpad_MWOpen(cardID);
                this.cardId = cardID;
                this.promptInfo = this.readingMsg.enterPassword;
                this.showIndex=1
            } else {
                //错误消息提示
                // gotoErrorTarget("补卡换卡申请失败",param.errorInfo);
                this.errorText="补卡换卡申请失败:"+param.errorInfo
            }

        },
        //同号获取IC卡数据
        sameCardChangeICData() {

            this.showIndex=7;
            /* //0-可读卡，1-不可读卡（暂不支持，损坏换卡），2-挂失卡
            var OperType = "2";
            // 同卡号换卡获取IC卡数据（获取金融数据）
            var req = {
                "PrimaryAcctNum": BANK_CODE,
                "CardSeqId": prefixInteger(SOC_SEC_CARD_INFO.CardSeqId, 3),
                "PosEntryModeCode": SERVICE_SITE_INPUT_CODE[0]["handwork"] + SERVICE_SITE_INPUT_CODE[1]["notPin"],
                "Track2Data": VALUE_57,
                "Track3Data": "",
                "EmvVal": "",
                "OperType": OperType,
                "CustomName": IDCARD_INFO[0],
                "IdType": "01",
                "IdNum": IDCARD_INFO[5],
                "busiFlowNo": BUSI_FLOW_NO
            };
            // 业务调整金融数据再写完社保后请求
            FINANCIAL_REQ = req; */
        },

        
    },
    watch:{


    }
}
</script>
<style scoped>
    .identity-page{
        height: 100vh;
        width: 100vw;
        background-image: url('~/assets/img/bg-bak.png');
        background-size: 100% 100%;
        background-repeat: no-repeat;
        position: relative;
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


    .missing {
        padding: 0px 30px;
        font-weight: 400;
        font-size: 28px;
        text-align: center;
        margin-top: 40px;
        color: #505050;
    }
    .missing-block {
        height: 50px;
        text-align: left;
    }
    .missing .col-xs-6 {
        width: 40%;
        float: left;
    }

    .missing-text-right {
        text-align: right;
    }

    .missing-btn-right {
        margin-right: 10vw !important;
    }

    .missing-play {
        margin-top: 40px;
        margin-bottom: 40px;
        text-align: center;
    }

    .missing-play button {
        height: 70px;
        font-size: 30px;
    }



    .sys-btn{
        display: inline-block;
        height: 48px;
        line-height: 48px;
        padding: 0 28px;
        background-color: #d7000f;
        color: #fff;
        white-space: nowrap;
        text-align: center;
        font-size: 22px;
        border: none;
        border-radius: 2px;
        cursor: pointer;
    }

</style>




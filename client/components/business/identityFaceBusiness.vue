<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2021-12-28 14:46:53
 * @LastEditTime: 2022-01-11 14:58:18
-->

<template>
    <div class="identity-page">
        <identity  @IdentitySuccess="IdentityResule" v-if="showIndex==0" />
        <face-recognition @faceRecognitionSuccess="faceRecognitionResule"  v-if="showIndex==1" />
        <errorinfo :showError="errorText!=''" :errorText="errorText" />
        
        <business-collection-business  ref="businessCollectionBusiness"></business-collection-business>

    </div>
</template>
<script>

import identity from '~/components/device/identity.vue'
import faceRecognition from '~/components/device/faceRecognition.vue'
import Errorinfo from '~/components/common/errorinfo.vue'
import businessCollectionBusiness from '~/components/business/businessCollectionBusiness.vue'

export default {
    layout:'blank',
    components: {
        Errorinfo,
		identity,
        faceRecognition,
        businessCollectionBusiness,
	},
    data(){
		return {
            showIndex: 0,
            errorText: "",
        }
    },
    mounted(){

    },
    methods:{
        async IdentityResule(v){
            if(v){
                await this.$refs.businessCollectionBusiness.setBusinessDataVal("businessOprName", this.$store.state.idt_card_info.IdNum);
                await this.$refs.businessCollectionBusiness.setBusinessDataVal("businessOprIdCard", this.$store.state.idt_card_info.CustomName);
                let res = await this.netWorkCheck();
                if(res == 0) {
                    
                    // 测试
                    /* this.$store.state.idt_card_info.faceLivePic = "C:\\ECPATMMB\\IDReader\\netWorkCheck.jpg"
                    this.$store.commit('SET_ID_CARD_INFO',this.$store.state.idt_card_info)
                    await this.faceRec()
                    this.$emit('identityFaceBusinessSuccess',true) */

                    this.showIndex=1
                } else {
                    this.$emit('identityFaceBusinessSuccess',false)
                }
            }
        },
        async faceRecognitionResule(v) {
            if(v){
                let res = await this.faceRec()
                if(res == 0) {
                    this.$emit('identityFaceBusinessSuccess',true)
                    return;
                }
            }
            this.$emit('identityFaceBusinessSuccess',false)
        },
        /* P端请求 */
        // 联网核查
        async netWorkCheck() {

            console.info(this.$store.state.idt_card_info)
            // 联网核查
            let req = {
                "BankCode": "402641000014",//核对机构代码 测试先默认：402641000014
                "BusinessCode": "01",//业务种类
                "UserCode": "66660001",//操作用户 测试默认：66660001
                "IdNum": this.$store.state.idt_card_info.IdNum,//身份证号
                "CustomName": this.$store.state.idt_card_info.CustomName,//被核对人姓名
                "ExpireDate": this.$store.state.idt_card_info.expirationEndDate,//身份证有效期截止时间 长期默认为29991231
                'BusiCode': this.$store.state.service_result.busiCode//C端交易功能点编号
            }
            let param = await this.$SystemBaseApi.SST_FunInfoPassthrough(this.$SysCfg.TRAN_CODES["bankBusiness"]["netWorkCheck"], req)
            if (!param.errorInfo && param.resultCode == "1000") {
                var data = JSON.parse(param.resultData);
                console.info(data[0])

                // 联网核查返回照片
                this.$store.state.service_result.networkCheckPath = "C:\\ECPATMMB\\IDReader\\netWorkCheck.jpg";
                await this.$SystemBaseApi.SST_Base64ToPath(data[0].Photo, this.$store.state.service_result.networkCheckPath);

                // BUSI_FLOW_NO = "DXHP000220191204182216657";
                this.$store.state.service_result.busiFlowNo = data[0].busiFlowNo;
                this.$store.commit('SET_SERVICE_RESULT', this.$store.state.service_result);

                /** 将busiFlowNo写入终端配置文件中 **/
                await this.$SystemBaseApi.SST_iniFileWrite("busiFlowNo", this.$store.state.service_result.busiFlowNo)
                /* setTimeout(function () {
                    // 跳转下一业务
                    gotoRoute(gotoUrl);
                }, 1000); */
                return 0;
            } else {
                // gotoErrorTarget("联网核查请求数据失败", param.errorInfo);
                this.errorText="联网核查请求数据失败:"+ param.errorInfo
                return -1;
            }
        },
        // 人脸识别
        async faceRec() {
            // 正式数据
            let req = {
                "IdNum": this.$store.state.idt_card_info.IdNum, //证件号码
                "CustomName": this.$store.state.idt_card_info.CustomName, //姓名
                "IdType": "01", //证件类型 01 居民身份证
                "Img": this.$store.state.idt_card_info.faceProfilePic, //人脸图片
                "ImgType": "0301", //图片类型 默认0301
                "CustProperty": "0500", //客户属性 0500-普通客户，0501-VIP，0502-内部员工
                "IsPeopleBankInterface": "1", //是否调用人行接口 1-是，0-否
                "PinData": "", // 有此参数底层不重发
                "busiFlowNo": this.$store.state.service_result.busiFlowNo
            }
            /* if (A_JHFS == "2" || A_JHFS == 2) {
                req.IdNum = DLR_ID_NUM;
                req.CustomName = DLR_NAME;
            } */
            // 调用人脸识别接口
            let param = await this.$SystemBaseApi.SST_FunInfoPassthrough(this.$SysCfg.TRAN_CODES["bankBusiness"]["faceRec"], req)
            if (!param.errorInfo && param.resultCode == '1000') {

                // 获取PDFBase64
                var path = await this.$SystemBaseApi.SST_PicToDF(this.$store.state.idt_card_info.imgfrontPath, this.$store.state.idt_card_info.imgbackPath, this.$store.state.idt_card_info.faceLivePic, this.$store.state.service_result.networkCheckPath);
                if (path.code == 0) {
                    var pdfBase64 = await this.$SystemBaseApi.SST_PDFGetBase64Data(path.msg);
                    if (path.code == 0) {
                        let PDF_BASE64 = pdfBase64.msg;
                        await this.$refs.businessCollectionBusiness.setBusinessDataVal("idPhoto", PDF_BASE64);                        
                    } else {
                        this.errorText=":"+ pdfBase64.msg
                    }
                } else {
                    this.errorText=":"+ path.msg
                }
                return 0;
            } else {
                this.errorText="调用人脸识别接口失败:"+ param.errorInfo
                return -1;
            }
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

</style>




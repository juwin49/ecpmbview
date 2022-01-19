<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2022-01-04 15:00:19
 * @LastEditTime: 2022-01-11 11:08:30
-->
<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2021-12-28 14:46:53
 * @LastEditTime: 2022-01-04 14:21:49
-->

<template>
    <div>
        <div class="dailog-box" v-if="showIndex==0" >
            <div class="dailog-box-title">柜员授权</div>
            <div class="dailog-box-content">
                <div v-show="errorMsg!=''" class="dailog-box-content-error">{{errorMsg}}</div>
                <div>输入柜员号：</div>
                <input v-model="workno" />
                <div @click="commit" class="button">确定</div>
            </div>
        </div>        
        <finger  @fingerRecognitionSuccess="fingerRecognitionResule" v-if="showIndex==1" />
        <Loading :showLoading="showLoading" :loadingText="loadingText" v-if="showIndex==2"/>
    </div>
</template>
<script>

import finger from '~/components/device/fingerRecognition.vue'
import Loading from '~/components/common/loading.vue'
export default {
    layout:'blank',
    components: {
		finger,
        Loading,
	},
    props: {
        //授权类型
        //1、挂失
        // 2、重复获取金融数据
        // 1、代理制卡
        // 2、代理激活
        // 3、上传图片
        // 4、手机银行签约
        // 7、登陆
        SQType: {
            type: String,
            default: ""
        },
    },    
    data(){
		return {
            showIndex: 0,
            errorMsg:'',
            loadingText:'',
            workno:'',
            showLoading:false,
        }
    },
    mounted(){
        this.init();
        // C端交易功能点编号
        // this.$store.commit('SET_SERVICE_RESULT', {"busiCode": this.$SysCfg.BUSI_CODES["cardBusi"]["repLoseInWrite"]})
        // console.log("C端交易功能点编号 >> ", this.$store.state.service_result)
    },
    methods:{
        //初始化
        init(){
            this.showIndex=0;
            this.errorMsg='';
            this.loadingText='';
        },
        //确定
        async commit(){
            this.showIndex=1;
        },        
        //指纹返回
        async fingerRecognitionResule(v){
            if(v==true){
                let res = await this.fingerAuth();
                if(res == 0) {
                    this.$emit('fingerRecognitionSuccess',true);
                } else {
                     this.showIndex=0;
                }
            }else{
                this.errorMsg=v              
                this.showIndex=0;
            }
        },

        /* P端请求 */
        // 指纹认证
        async fingerAuth() {
            //指纹
            this.showLoading = true;
            this.loadingText = "指纹认证中...";
            this.showIndex=2;
            console.info(this.$store.state.idt_card_info)
            // 指纹授权
            let req = {
                "workno": this.workno,//柜员号
                "finger": this.$store.state.finger_info,//指纹
                "deptno": "",//机构号 默认传空，表示机构号由P端根据设备编码进行配置；不为空，机构号按照C端的传值
                "SQType":this.SQType,//授权类型
                'BusiCode': this.$store.state.service_result.busiCode//C端交易功能点编号
            }
            let param = await this.$SystemBaseApi.SST_FunInfoPassthrough(this.$SysCfg.TRAN_CODES["bankBusiness"]["fingerprints"], req)
            this.showLoading = false;
            if (!param.errorInfo && param.resultCode == "1000") {
                return 0;
            } else {
                this.errorMsg=param.errorInfo
                this.showIndex=0;
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
.dailog-box{
    position: absolute;
    z-index: 3;
    width: 500px;
    height: 300px;
    left: 50%;
    top: 50%;
    transform: translate(-50% , -50%);
    background: linear-gradient(to bottom, rgb(248, 216, 218) 0%,rgb(255, 255, 255) 100%);
    border: 1px solid #dab8b8;
    display: flex;
    flex-direction: column;
}
.dailog-box-title{
    background: linear-gradient(to top, rgb(216, 0, 15) 0%,rgb(168, 28, 28) 100%);
    height: 50px;
    line-height: 50px;
    text-align: center;
    color: #fff;
    font-weight: bold;
}
.dailog-box-content{
    height: 100%;
    margin: 30px;
    font-size: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}
.dailog-box-content-error{
    color: #d6000e;
}
.dailog-box-content input{
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    box-sizing: border-box;
    color: #2f3031;
    display: inline-block;
    font-size: inherit;
    height: 40px;
    line-height: 40px;
    outline: none;
    padding: 0 15px;
    width: 80%;
}
 .button{
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




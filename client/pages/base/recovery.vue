<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2021-12-28 14:46:53
 * @LastEditTime: 2022-01-11 15:02:30
-->

<template>
    <div class="identity-page">
        <Header />

        <div class="identity-box" v-if="showIndex==0">
            <div class="missing-play col-xs-12">
                <button @click="ConfirmBtn('1')" class="sys-btn">
                    <span>同号补卡</span>
                </button>
                
            </div>
            <div class="missing-play col-xs-12">
                <button @click="ConfirmBtn('0')" class="sys-btn">
                    <span>异号补卡</span>
                </button>
                
            </div>
        </div>

        <recover-card-business v-if="showIndex==1" :isLost="false" :isMakeFina="isMakeFina"></recover-card-business>

        <errorInfo :showError="errorText!=''"  :errorText="errorText"/>
        <Loading :showLoading="loadingText!=''" :loadingText="loadingText" />

    </div>
</template>
<script>
import Header from '~/components/common/header.vue'
import recoverCardBusiness from '~/components/business/recoverCardBusiness.vue'
import errorInfo from '~/components/common/errorinfo.vue'
import Loading from '~/components/common/loading.vue'

export default {
    layout:'blank',
    components: {
        Header,
        errorInfo,
        Loading,
        recoverCardBusiness,
	},
    data(){
		return {
            showIndex: 0,
            errorText: "",
            loadingText: "",
            isMakeFina: "",
        }
    },
    async mounted(){


    },
    methods:{
        gotoHomePage() {
            this.$router.push('/')
        },
        ConfirmBtn(isMakeFina) {
            if(this.isMakeFina=="1"){
                //目前传的是升级同号制卡
                this.$store.commit('SET_SERVICE_RESULT', {"busiCode": this.$SysCfg.BUSI_CODES["cardBusi"]["updateSameNumChange"]})
            }else{
                //目前传的是升级异号制卡
                this.$store.commit('SET_SERVICE_RESULT', {"busiCode": this.$SysCfg.BUSI_CODES["cardBusi"]["diffSameNumChange"]})
            }
            this.isMakeFina = isMakeFina;
            this.showIndex = 1;
        }
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




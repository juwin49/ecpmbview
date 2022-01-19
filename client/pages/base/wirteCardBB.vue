<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2021-12-28 14:46:53
 * @LastEditTime: 2022-01-11 11:03:34
-->

<template>
    <div class="identity-page">
        <Header />
        <identity-face-business  v-if="showIndex==0"/>
        <make-card-business @makecardBusinessSuccess="makecardBusinessBusinessResule" v-if="showIndex==6"></make-card-business>
         <!-- <write-card-business v-if="showIndex==6" /> -->
        <errorInfo :showError="errorText!=''"  :errorText="errorText"/>
    </div>
</template>
<script>
import Header from '~/components/common/header.vue'
 import makeCardBusiness from '~/components/business/makeCardBusiness.vue'
import errorInfo from '~/components/common/errorinfo.vue'


export default {
    layout:'blank',
    components: {
        Header,
        makeCardBusiness,
        errorInfo,
	},
    data(){
		return {
            showIndex: 6,
            errorText: "",
        }
    },
    mounted(){
         
    },
    methods:{
        makecardBusinessBusinessResule(v){
            if(v){
                console.log('制卡成功')
            }else{
                console.log('制卡失败')
            }
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

</style>




<template>
    	<div class="header">
			<div class="header-left">
				<div class="header-left-phone">{{cusServe}}: 0898-96588 / 0898-12333</div>
				<div class="header-left-logo"><img :src="titlelogo" /></div>
			</div>
			<div class="header-right">
				<div class="header-right-machineid">设备编号：{{machineId}}</div>
				<div class="header-right-language">
					<div class="header-right-language-ch" :class="languageType==1?'active':''" @click="selectLanguage(1)">中文</div>
					<div class="header-right-language-en" :class="languageType==0?'active':''" @click="selectLanguage(0)">English</div>
				</div>
                <div class="header-time">{{currentTime}}</div>
			</div>
		</div>
</template>
<script>
import {dateFormat} from '~/components/common/utils'
export default {
    data(){
        return  {
            languageType:1,
			cusServe:'客服电话',
			titlelogo:require('~/assets/img/home/logo5.png'),
			machineId: this.$store.state.deviceID,
            currentTime:'',
            intervalC:{}
        }
    },
    mounted(){
        this.intervalC = setInterval(() => { 
            this.currentTime = dateFormat(new Date().getTime(), 'yyyy年MM月dd日 hh:mm:ss')
        },1000) 
    },
    methods:{
        selectLanguage(type){
            this.languageType = type
            if(this.languageType==1){
                this.$store.commit('SET_LANGUAGE', 'chinesepack')
            }else{
                this.$store.commit('SET_LANGUAGE', 'englishpack')
            }
        }

    },
    destroyed() {
        clearInterval(this.intervalC)
    }
   
}
</script>
<style scoped>
.header{
    position: absolute;
    height: 25vh;
    width: 100vw;
    padding: 20px 0;
    display: flex;
    justify-content: space-around;
	font-size: 26px;
    color: #fff;
    z-index: 1;
}
.header-left-phone {  
	padding-bottom: 10px;
}
.header-left-logo{
   width: 370px;
}
.header-left-logo img{
   max-width: 100%;
}
.header-right {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.header-right-language {
    height: 40px;
    line-height: 40px;
	text-align: center;
	color: #a0a0a0;
}
.header-right-language-ch  {
	background-color: #d8d8d8;
    float: left;
    width: 100px;
    text-align: center;
    border-radius: 15px 0 0 15px;
}
.header-right-language-en  {
	background-color: #d8d8d8;
    float: left;
    width: 100px;
    text-align: center;
    border-radius: 0 15px 15px 0;
}
.active{
	background-color: #b91e1e;
    color: #FFF;
}
</style>

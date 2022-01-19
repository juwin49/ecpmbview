<template>
    <div class="error-wrap" v-if="showError">
        <p class="error-counttime">{{countTime}}</p>
        <div class="error-box">
            <p class="error-text">{{errorText}}</p>
        </div>
    </div>
</template>
<script>

export default {
     components: {
	},
    props: {
        showError: {
            type: Boolean,
            default:false
        },
        errorText:{
            type: String,
            default:''
        }
    },
    data(){
        return{
            intervalGetInfo:null,
            countTime:''
        }

    } ,
    mounted(){
        if(this.showError){
            this.countDown(60)
        }

    },
    methods:{
        //倒计时
       countDown(time){
            this.intervalGetInfo =  setInterval(() => {
                this.countTime = time--
                if(time<=0){ 
                    this.countTime = ''
                    clearInterval(this.intervalGetInfo)
                    this.$router.push('/').catch(() => {})
                }
            }, 1000);
    
        }
    } ,
    beforeDestroy() {
        if(this.intervalGetInfo){
            clearInterval(this.intervalGetInfo)
        }
    },
}
</script>
<style scoped>
.error-wrap{
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: linear-gradient(to bottom, rgb(248, 216, 218) 0%,rgb(255, 255, 255) 100%);
    border: 1px solid #dab8b8;
    z-index: 99;
    text-align: center;
}
.error-counttime{
    font-size: 30px;
    float: right;
    font-weight: bold;
    padding: 10px 20px;
    color:rgb(216, 0, 15);
}
.error-box{
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    position: absolute;
}
.error-text{
    font-size: 40px;
    font-weight: bolder;
    padding-top: 20px;
    color:rgb(216, 0, 15)
}
    
</style>
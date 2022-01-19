<template>
    <div class="identity-wrap" >
        <div class="identity-box">
            <div class="identity-title">{{moduleName}}</div>
            <div class="identity-content">
                <div class="identity-insert gif-wrap" v-if="insertCardL">
                    <img :src="idcardGif" />
                    <p>{{promptInfo}}</p>  
                </div>
                <errorInfo :showError = "showError"  :errorText="errorText"/>
                <Loading :showLoading = "showLoading"  :loadingText="loadingText"/>
            </div>
        </div>
        
            <!-- <div class="dosomething">
                <div class="hainan-button" @click="jumpto('/')">回主页</div>
                <div class="hainan-button" @click="init()">初始化页面</div>
                <div class="hainan-button" @click="checkfingerIn()">获取指纹(循环)</div>
                <div class="hainan-button" @click="closeMachine()">关闭设备&退出</div>
            </div> -->
           
    </div>
</template>
<script>
import Loading from '~/components/common/loading.vue'
import errorInfo from '~/components/common/errorinfo.vue'

export default {
    layout:'blank',
    components: {
        Loading,
        errorInfo 
	},
    props: {
        BusiCode: {
            type: String,
            default: ''
        }
    },
	data(){
		return {
            moduleName:'指纹模块',
            insertCardL:false,
            idcardGif:require('~/assets/img/base/fingerPrint/insert_fingerPrint.gif'),
            promptInfo:'',
            loadingText:'',
            showLoading:true,
            intervalGetInfo:'',
            fingerPrintInfo:'',
            showError:false,
            errorText:'',
            readingMsg:require(`~/data/${this.$store.state.select_language}.json`)        
        }
    },
    mounted(){ 
         this.$nextTick(()=>{
             this.init()
         })
    },
    methods:{
        //页面跳转
		jumpto(url){
			this.$router.push(url)
		},
        //模块初始值
        clean(){
           this.loadingText=this.readingMsg.device.fingerRecognition.loadingtext
           this.showLoading=true
           this.insertCardL=true  
           this.showError = false
           this.promptInfo = this.readingMsg.device.fingerRecognition.readFingerprint
        },
        //初始页面
        async init(){
            this.clean()
           await this.openMachine()
           await this.getdevStatus()
            
        },
        //打开设备
        async  openMachine(){
             await this.$wsc.sendMsg({"mode":"ecp_finger_opendev"}).then(()=>{}).catch((res)=>{
                this.showError = true
                this.errorText = JSON.stringify(res)
              })
        },
        
        //获取设备状态
       async  getdevStatus(){
           await   this.$wsc.sendMsg({"mode":"ecp_finger_checkdev"}).then(()=>{
               this.showLoading=false
               this.checkfingerIn()
           }).catch((res)=>{
                this.showError = true
                this.errorText = JSON.stringify(res)
           })
        },

        //获取指纹（循环调用）
        checkfingerIn(){
           if(this.intervalGetInfo){
                clearInterval(this.intervalGetInfo)
           }
           this.intervalGetInfo = setInterval(() => { 
                this.$wsc.sendMsg({"mode":"ecp_finger_getfinger","timeout":"6"}).then((res)=>{
                    this.fingerPrintInfo = res
                    this.$store.commit('SET_FINGER_INFO', this.fingerPrintInfo)
                    this.$emit('fingerRecognitionSuccess',true)
                    this.closeMachine()
                    clearInterval(this.intervalGetInfo)

                }).catch((res)=>{
                     this.showError = true
                     this.errorText = JSON.stringify(res)
                     this.$emit('fingerRecognitionSuccess',this.errorText)
                     clearInterval(this.intervalGetInfo)
                })   
            },6000) // 6秒执行一次  
            
        },

        //关闭设备
        async closeMachine(){
           await this.$wsc.sendMsg({"mode":"ecp_finger_closedev"}).then(()=>{      
          }).catch(()=>{})

        }


    },
    computed: {
        receiveDate () {
            return this.$store.state.wsc_reconnet
        }
    },
    watch:{
        //若websocket重连，需要打开设备并重新发送信息
        receiveDate(){
            if(this.$store.state.wsc_process){
               // console.log(this.$store.state.wsc_process,3434)
                return
            }
        },

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
    top: 55%;
    transform: translate(-50%, -50%);
    width: 65vw;
    height: 42vw;
}
.identity-content {
    position: relative;
    height: 100%;
    overflow: hidden;
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


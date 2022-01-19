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
        
        <div class="dosomething">
            <div class="hainan-button" @click="jumpto('/')">回主页</div>
            <div class="hainan-button" @click="init()">初始化页面</div>
            <div class="hainan-button" @click="checkcardIn()">检测卡进入(循环)</div>
            <div class="hainan-button" @click="readcardInfo()">读取卡信息</div>
            <div class="hainan-button" @click="sendCardToP()">联网核查身份证信息</div>
            <div class="hainan-button" @click="closeMachine()">关闭设备&退出</div>
        </div>
           
    </div>
</template>
<script>
import Loading from '~/components/common/loading.vue'
import errorInfo from '~/components/common/errorinfo.vue'
import {dateFormat} from '~/components/common/utils'

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
            moduleName:'身份证模块',
            insertCardL:false,
            idcardGif:require('~/assets/img/base/identity/insert_idcard.gif'),
            promptInfo:'请把身份证放至感应器',
            loadingText:'',
            showLoading:true,
            intervalGetInfo:'',
            cardInfo:{},
            showError:false,
            errorText:'请稍后...',
            isRequest:false,
            readingMsg:require(`~/data/${this.$store.state.select_language}.json`)
        }
    },
    mounted(){ 
         this.$nextTick(()=>{
             this.init()
         })
    },
    destroyed(){
        if(this.intervalGetInfo){
            clearInterval(this.intervalGetInfo)
        }
    },
    methods:{
        //页面跳转
		jumpto(url){
			this.$router.push(url)
		},
        //模块初始值
        clean(){
           this.loadingText=this.readingMsg.device.identity.loadingtext
           this.showLoading=false
           this.insertCardL=true  
           this.showError = false
        },
        //初始页面
        async init(){
            this.clean()
           await this.openMachine()
           await this.getdevStatus()
            
        },
        //打开设备
        async  openMachine(){
             await   this.$wsc.sendMsg({"mode":"ecp_id2_opendev"}).then(()=>{}).catch(()=>{ })
        },
        
        //获取设备状态
       async  getdevStatus(){
           await   this.$wsc.sendMsg({"mode":"ecp_id2_getdevstatus"}).then(()=>{
                this.checkcardIn()
           }).catch((res)=>{
                this.showError = true
                this.errorText = JSON.stringify(res)
           })
        },
        //检测卡片是否进入（循环调用）
        checkcardIn(){
           this.checkIdCard("ecp_id2_checkcardin");
        },
        //读取卡信息
        async  readcardInfo(){
             this.showLoading=true
             this.loadingText=this.readingMsg.device.identity.readCard
          await  this.$wsc.sendMsg({"mode":"ecp_id2_readcardInfo"}).then((res)=>{

              this.editCard(res) 
         }).catch((res)=>{
            this.showError = true;
            this.showLoading=false;
            this.errorText =JSON.stringify(res);
          })

        },
        //检测卡片是否取走（循环调用）
        checkcardout(){
            this.showLoading=false;
            this.promptInfo=this.readingMsg.device.identity.getourCard;
            this.idcardGif = require('~/assets/img/base/identity/getout_idcard.gif');            
            
            // 测试
            // this.checkIdCard("ecp_id2_checkpulloutcard");
            this.closeMachine();
        }, 
        //检测卡片
        checkIdCard(mode){
           if(this.intervalGetInfo){
                clearInterval(this.intervalGetInfo)
           }
           this.intervalGetInfo = setInterval(() => { 
                if(this.isRequest){
                    return;
                }
                this.isRequest=true;
                this.$wsc.sendMsg({"mode":mode}).then(()=>{
                    this.isRequest=false;
                    clearInterval(this.intervalGetInfo);
                    if(mode=="ecp_id2_checkcardin"){
                        setTimeout(() => {
                            this.readcardInfo();
                        }, 1000);
                    }
                    if(mode=="ecp_id2_checkpulloutcard"){
                        this.closeMachine();
                    }
                }).catch((res)=>{
                    this.isRequest=false;
                })   
            },500) // 0.5秒执行一次  
        },
        //关闭设备
        async closeMachine(){
           await this.$wsc.sendMsg({"mode":"ecp_id2_closedev"}).then(()=>{  
              this.$emit('IdentitySuccess',true);    
          }).catch(()=>{})

        },
        //编辑卡信息并保存
      async  editCard(data){
            let cardArr = data.split("|")
            this.cardInfo.CustomName =cardArr[0]? cardArr[0].split("=")[1]:''  //姓名
            this.cardInfo.Sex = cardArr[1]?cardArr[1].split("=")[1]:'' //性别
            this.cardInfo.nation = cardArr[2]?cardArr[2].split("=")[1]:'' //民族
            this.cardInfo.birthday = cardArr[3]?cardArr[3].split("=")[1]:'' //出生日期
            this.cardInfo.address= cardArr[4]?cardArr[4].split("=")[1]:''  //家庭住址
            this.cardInfo.IdNum = cardArr[5]?cardArr[5].split("=")[1]:''   //身份证号
            this.cardInfo.issuedBy= cardArr[6]?cardArr[6].split("=")[1]:''  //发证机关
            this.cardInfo.expirationStarDate= cardArr[7]?cardArr[7].split("=")[1]:'' //有效日期起
            this.cardInfo.expirationEndDate= cardArr[8]?((cardArr[8].split("=")[1].indexOf("长期") != -1)?'29991231':cardArr[8].split("=")[1]):'' //有效日期至
            this.cardInfo.imgPath = cardArr[9]?cardArr[9].split("=")[1]:'' //图片路径
            this.cardInfo.imgfrontPath= cardArr[10]?cardArr[10].split("=")[1]:'' //正面路径
            this.cardInfo.imgbackPath= cardArr[11]?cardArr[11].split("=")[1]:''  //反面路径
            this.identityJudge()
        },
        //判断身份资格
       async identityJudge(){
            let nowtimeInt = parseInt(dateFormat(new Date().getTime(), 'yyyyMMdd')),
                year16 = (parseInt(this.cardInfo.birthday) + 160000),
                expirationEndDate = parseInt(this.cardInfo.expirationEndDate)
           if(year16>nowtimeInt){
                this.showError = true
                this.errorText ='该业务需年满16岁'
                this.$emit('IdentitySuccess',false)
                return 
            }else if(expirationEndDate<nowtimeInt){
                this.showError = true
                this.errorText ='您的身份证已过期'
                this.$emit('IdentitySuccess',false)
                return 
            }else{
                this.$store.commit('SET_ID_CARD_INFO', this.cardInfo)
               // this.sendCardToP()
               await  this.checkcardout(); 
              
            }

        }

    },
    beforeDestroy() {
        if(this.intervalGetInfo){
            clearInterval(this.intervalGetInfo)
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


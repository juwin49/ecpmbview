<template>
	<section class="container">
        <Header />
		<div class="login-wrap">
            <div class="login-list" v-if="!showSetDevid&&!isfingerAuth">
                <div v-for="(item, index) in prepairList" :key="index" class="login-list-item">
                    <p>{{item.name}}</p>
                    <div class="login-list-item-line">
                        <img :src="item.state==0?imgUrl.imgload:(item.state==1?imgUrl.imgright:imgUrl.imgwrong)"> 
                        <div class="login-item-button"></div>
                    </div>
                </div>
                <div>{{this.errorMsg}}</div>
                <div class="login-botton">
                    <div class="button"  @click="jumpto()">强制跳主页</div>
                    <div class="button" @click="refresh">刷新页面</div>
                </div>

            </div>
            <div class="dailog-box" v-if="showSetDevid&&!isfingerAuth">
                <div class="dailog-box-title">设备注册</div>
                <div class="dailog-box-content">
                    <div v-show="registErrorMsg!=''" class="dailog-box-content-error">{{registErrorMsg}}</div>
                    <div>输入设备编号：</div>
                    <input v-model="devID" />
                    <div @click="setDevID" class="button">注册</div>
                </div>
            </div>
		</div>
         <finger-business :SQType='"7"' @fingerRecognitionSuccess="fingerRecognitionResule" v-if="isfingerAuth"></finger-business>
	</section>
</template>

<script>
import Header from '~/components/common/header.vue'
import fingerBusiness from '~/components/business/fingerRecognitionBusiness.vue'

export default {
	layout:'blank',
	components: {
		Header,
        fingerBusiness
	},
	data(){
		return {
           error:false,
           errorMsg:[],
           devID:'',
           registErrorMsg:'',
           showSetDevid:true,
           isfingerAuth:false,
           ZmkData:{},
           MacAndPinData:{},
           imgUrl:{
               'imgload':require('~/assets/img/loadingAnimation.gif'),
               'imgright':require('~/assets/img/right.png'),
               'imgwrong':require('~/assets/img/wrong.png')
           },
           prepairList:[
               {'name':'连接设备','state':1,'test':''},
               {'name':'设备注册','state':0,'test':''},
               {'name':'密码键盘获取主密钥','state':0,'test':''},
               {'name':'密码键盘获取工作密钥','state':0,'test':''},
               {'name':'打开身份证模块','state':0,'test':''},
               {'name':'打开指纹模块','state':0,'test':''}
           ]
           
        }
	},
	async mounted (){		
        await this.deviceRegister()
      //  await this.initMachine()
	},
	methods:{
        //读取配置文件，判断设备是否已注册
        async deviceRegister(){
            this.showSetDevid = false; 
           let deviceID = await this.$SystemBaseApi.SST_iniFileRead("devID")  
           this.devID = deviceID.code==0?deviceID.msg:''    
            if(this.devID){
                await this.$SystemBaseApi.SST_SET_DEVICE_ID(this.devID);
                this.$store.commit('SET_DEVICEID', this.devID)
                this.prepairList[1].state = 1
                //初始化设备
                await this.initMachine();    
            }else{
                this.showSetDevid = true 
            }
            
        } ,
        //输入设备编号,并注册
       async setDevID(){
            let result =await this.$SystemBaseApi.SST_FunDevRegister(this.devID,this.$SysCfg.TRAN_CODES.system.register, {RegType:"1"})
               if(result.resultCode!=1000&&result.errorInfo.indexOf("已经注册过")=="-1"){
                   this.showSetDevid=true
                   this.error=true 
                   //this.errorMsg.push(result.errorInfo)
                   this.registErrorMsg=result.errorInfo;
                   //this.prepairList[1].state = 2
               }else{
                  this.registErrorMsg=''; 
                  let writeDev = await this.$SystemBaseApi.SST_iniFileWrite("devID", this.devID)
                  writeDev.code==0?'':this.errorMsg.push(writeDev.msg)
                  this.$store.commit('SET_DEVICEID', this.devID)
                  this.prepairList[1].state = 1
                    //初始化设备
                    await this.initMainKey();    
               }
               
        },
        //指纹认证通过
        async fingerRecognitionResule(v){
            if(v){
                 this.showSetDevid=true;
                 this.$router.push('/').catch(err => {})
            }
        },
        //初始化主密钥
        async initMainKey(){
            //读取配置文件是否有主密钥
            let mainKey = await this.$SystemBaseApi.SST_iniFileRead("mainKey")
           // let maincheckValue = await this.$SystemBaseApi.SST_iniFileRead("maincheckValue")
            this.ZmkData = mainKey.code==0&&mainKey.msg?JSON.parse(mainKey.msg):''
           // this.ZmkData.zmkcheckValue =  maincheckValue.code==0?maincheckValue.msg:''
            if(!this.ZmkData.zmk){
                let resultZmk = await this.$SystemBaseApi.SST_FunGetZmk(this.$SysCfg.TRAN_CODES.system.getZmk, [])  
            
               if(resultZmk.resultCode==1000){
                  this.ZmkData = JSON.parse(resultZmk.resultData)[0]
                  this.ZmkData.ECP_mainKeyIndex = '0'
                  //主密钥写入配置文件
                  let writeMainKey = await this.$SystemBaseApi.SST_iniFileWrite("mainKey",JSON.stringify(this.ZmkData))
                  writeMainKey.code==0?'':this.errorMsg.push(writeMainKey.msg)
                  //主密钥下载到键盘
                 await this.downloadMainKey(this.ZmkData)
                }else{
                    this.errorMsg.push(resultZmk.errorInfo)
                    this.prepairList[2].state = 2
                    //this.error=true 
                }
            }else{
                 this.ZmkData.ECP_mainKeyIndex = '0'
                 //主密钥下载到键盘
                await  this.downloadMainKey(this.ZmkData)

            }

        },
        //下载主密钥到密码键盘
       async downloadMainKey(mainKey){
            await this.$wsc.sendMsg({"mode":"ecp_pinpad_downloadMkey","mainKeyIndex":"0","mainKey":mainKey.zmk}).then((res)=>{
                //主密钥校验
                if(res==mainKey.zmkcheckValue){  
                     this.$store.commit('SET_ECP_MAIN_KEY',mainKey.zmk)
                     this.prepairList[2].state = 1
                }else{
                    this.error=true 
                    this.prepairList[2].state = 2
                    this.errorMsg.push("主密钥校验失败")
               }     
            }).catch((res)=>{
                    this.error=true 
                    this.errorMsg.push(res)
                    this.prepairList[2].state = 2
            })

        },
        //初始化工作密钥
       async initUcKey(){
            //读取配置文件是否有工作密钥
            let ucKey = await this.$SystemBaseApi.SST_iniFileRead("ucKey")
            this.MacAndPinData = ucKey.code==0&&ucKey.msg?JSON.parse(ucKey.msg):''
            let  resultMacAndPin =  await this.$SystemBaseApi.SST_FunGetMacAndPin(this.$SysCfg.TRAN_CODES.system.getMacAndPin, []) 
            if(resultMacAndPin.resultCode==1000){
                this.MacAndPinData = JSON.parse(resultMacAndPin.resultData)[0]
                this.MacAndPinData.ECP_workKeyIndex = '1'
                this.MacAndPinData.ECP_keyType = '2'
                //工作密钥写入配置文件
                let writeUcKey = await this.$SystemBaseApi.SST_iniFileWrite("ucKey",JSON.stringify(this.MacAndPinData))
                writeUcKey.code==0?'':this.errorMsg.push(writeUcKey.msg)
                //工作密钥下载到键盘
            await  this.downloadUcKey(this.MacAndPinData)
            }else{
                this.errorMsg.push(resultMacAndPin.errorInfo)
                    this.prepairList[3].state = 2
                this.error=true 
            }
        },
        //下载工作密钥到密码键盘
       async downloadUcKey(ucKey){
            await this.$wsc.sendMsg({"mode":"ecp_pinpad_downloadUCkey","mainKeyIndex":"0","workKeyIndex":"1","keyType":"1","ucKey":ucKey.dataKey}).then((res)=>{
                //传输密钥（datakey）密钥校验
                if(res==ucKey.dataKeyCheckValue){  
                     this.prepairList[3].state = 1
                }else{
                   // this.error=true 
                    this.errorMsg.push("dataKey,传输密钥校验失败")
                    this.prepairList[3].state = 2
               }     
            }).catch((res)=>{
                   // this.error=true 
                    this.errorMsg.push(res)
                    this.prepairList[3].state = 2
            })
            await this.$wsc.sendMsg({"mode":"ecp_pinpad_downloadUCkey","mainKeyIndex":"0","workKeyIndex":"2","keyType":"2","ucKey":ucKey.key}).then((res)=>{
                //pin密钥（key）工作密钥校验
                if(res==ucKey.keycheckValue){  
                     this.prepairList[3].state = 1
                }else{
                  //  this.error=true 
                    this.errorMsg.push("key,pin工作密钥校验失败")
                    this.prepairList[3].state = 2
               }     
            }).catch((res)=>{
                   // this.error=true 
                    this.errorMsg.push(res)
                    this.prepairList[3].state = 2
            })
            await this.$wsc.sendMsg({"mode":"ecp_pinpad_downloadUCkey","mainKeyIndex":"0","workKeyIndex":"3","keyType":"3","ucKey":ucKey.mac}).then((res)=>{
                //mac密钥（mac）工作密钥校验
                if(res==ucKey.maccheckValue){  
                     this.prepairList[3].state = 1
                }else{
                   // this.error=true 
                    this.errorMsg.push("mac,密钥校验失败")
                    this.prepairList[3].state = 2
               }     
            }).catch((res)=>{
                 //   this.error=true 
                    this.errorMsg.push(res)
                    this.prepairList[3].state = 2
            })
            if(this.prepairList[3].state==1){
                this.$store.commit('SET_ECP_MAIN_KEY',ucKey)
            }

        },
        //打开密码键盘
        async pinpadSet(){
            await this.$wsc.sendMsg({"mode":"ecp_pinpad_opendev"}).then(()=>{}).catch((res)=>{
                this.error=true 
                this.errorMsg.push(res)
            })
            if(this.error)return 
            await this.$wsc.sendMsg({"mode":"ecp_pinpad_checkdev"}).then(()=>{}).catch((res)=>{
                this.error=true 
                this.errorMsg.push(res)
            })
            if(this.error)return   
        },
        //打开设备模块及下载主密钥，工作密钥
		async initMachine(){

			await this.$wsc.sendMsg({"mode":"ecp_id2_opendev"}).then(()=>{this.prepairList[4].state = 1}).catch(()=>{this.prepairList[4].state = 2})  //打开身份证模块
		//	await this.$wsc.sendMsg({"mode":"ecp_camera_opendev","width":"640","height":"480","angle":"270"}).then(()=>{}).catch(()=>{})  //打开人脸识别模块
			await this.$wsc.sendMsg({"mode":"ecp_finger_opendev"}).then(()=>{this.prepairList[5].state = 1}).catch(()=>{this.prepairList[5].state = 2})  //打开指纹模块
			//await this.$wsc.sendMsg('{"mode":"ecp_print_opendev"}').then((res)=>{console.log(res.msg)}).catch(()=>{}) //打卡打印模块
            await this.pinpadSet() //打开键盘
            await this.initMainKey()  //下载主密钥
            await this.initUcKey()    //下载工作密钥
            await this.$wsc.sendMsg({"mode":"ecp_pinpad_closedev"}).then(()=>{}).catch(()=>{}) //关闭键盘
            await this.$wsc.sendMsg({"mode":"ecp_id2_closedev"}).then(()=>{}).catch(()=>{})    //关闭身份证模块
            if(this.error){
               // this.$router.push({ path: '/sorry', query: { error: this.errorMsg }}).catch(err => {})
            }else{
                this.$store.commit('SET_DEV_STATE',true);
                this.isfingerAuth=true;
            }
           
		},
        //刷新
        refresh(){
            this.$router.go(0);
        },
        //强制跳主页
        jumpto(){
           // this.$store.commit('SET_DEV_STATE',true)
            this.$router.push({ path: '/', query: { error: this.errorMsg }}).catch(err => {})
        }

	},
    computed: { },
    watch:{}  
}
</script>

<style scoped>
.container{
	height: 100vh;
	width: 100vw;
	background-image: url('~/assets/img/bg-bak.png');
	background-size: 100% 100%;
	background-repeat: no-repeat;
}
.header{
	height: 4vh;
	width: 100vw;
}
.login-wrap{
    width: 85vw;
    height: 85vh;
    opacity: 0.8;
    background: #fff;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    z-index: 2;
}
.login-list {
    display: flex;
    flex-direction: column;
    margin: 50px 50px;
}
.login-list-item {
    display: flex;
    justify-content: space-between;
    font-size: 28px;
    font-weight: bold;
}
.login-list-item img{
    width: 50px;
    height: 50px;
}
.login-botton {
    position: absolute;
    bottom: 35px;
    right: 50px;
    display: flex;
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

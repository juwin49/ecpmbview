<template>

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
        //打印所需的参数
        printVals: {
            type: Array,
            default: []
        },
        printTemplate:{
            type: Object,
            default: {}
        }
    },
	data(){
		return {
            moduleName:'凭条打印模块',
            errorText:'',  
            printTemplates:[
                //补换卡
                [
                    {type:"setstyle",textSize:"2",bold:"1",alignment:"1",lineSpace:"50",leftSpace:"10"},
                    {type:"printline",printData:" "},
                    {type:"printBmp",printData:this.printTemplate.tickImgUrl},
                    {type:"printline",printData:" "},
                    {type:"printline",printData:"一卡通流动制卡机"},
                    {type:"printline",printData:" "},
                    {type:"setstyle",textSize:"1",bold:"0",alignment:"0",lineSpace:"15",leftSpace:"10"},
                    {type:"printline",printDataLeft:"旧卡号：",printDataRight:this.printTemplate.oldNum,isRemSenMsg:true},
                    {type:"printline",printDataLeft:"户名：",printDataRight:this.printTemplate.name},
                    {type:"printline",printDataLeft:"证件类型：",printDataRight:this.printTemplate.type},
                    {type:"printline",printDataLeft:"证件号码：",printDataRight:this.printTemplate.idNum,isRemSenMsg:true},
                    {type:"printline",printDataLeft:"业务类型：",printDataRight:this.printTemplate.business},
                    {type:"printline",printDataLeft:"换卡原因：",printDataRight:this.printTemplate.reason},
                    {type:"printline",printDataLeft:"换卡工本费：",printDataRight:this.printTemplate.cost},
                    {type:"printline",printDataLeft:"社保处理标志：",printDataRight:this.printTemplate.success},
                    {type:"printline",printDataLeft:"交易终端：",printDataRight:this.printTemplate.devId},
                    {type:"printline",printDataLeft:"流水号：",printDataRight:this.printTemplate.busiFlowNo},
                    {type:"printline",printDataLeft:"交易时间：",printDataRight:this.printTemplate.time},
                    {type:"feedline",line:"5"},
                    {type:"cutpaper"},
                ], 
                //挂失   
                [
                    {type:"setstyle",textSize:"2",bold:"1",alignment:"1",lineSpace:"50",leftSpace:"10"},
                    {type:"printline",printData:" "},
                    {type:"printBmp",printData:this.printTemplate.tickImgUrl},
                    {type:"printline",printData:" "},
                    {type:"printline",printData:"一卡通流动制卡机"},
                    {type:"printline",printData:" "},
                    {type:"setstyle",textSize:"1",bold:"0",alignment:"0",lineSpace:"15",leftSpace:"10"},
                    {type:"printline",printDataLeft:"挂失卡号：",printDataRight:this.printTemplate.num,isRemSenMsg:true},
                    {type:"printline",printDataLeft:"户名：",printDataRight:this.printTemplate.name},
                    {type:"printline",printDataLeft:"证件类型：",printDataRight:this.printTemplate.type},
                    {type:"printline",printDataLeft:"证件号码：",printDataRight:this.printTemplate.idNum,isRemSenMsg:true},
                    {type:"printline",printDataLeft:"业务类型：",printDataRight:this.printTemplate.business},
                    {type:"printline",printDataLeft:"挂失方式",printDataRight:this.printTemplate.reason},
                    {type:"printline",printDataLeft:"挂失手续费",printDataRight:this.printTemplate.cost},
                    {type:"printline",printDataLeft:"社保处理标志：",printDataRight:this.printTemplate.success},
                    {type:"printline",printDataLeft:"交易终端：",printDataRight:this.printTemplate.devId},
                    {type:"printline",printDataLeft:"流水号：",printDataRight:this.printTemplate.busiFlowNo},
                    {type:"printline",printDataLeft:"交易时间：",printDataRight:this.printTemplate.time},
                    {type:"feedline",line:"5"},
                    {type:"cutpaper"},
                ],  
            ],
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
        },
        //初始页面
        async init(){
            this.$store.commit('SET_TICK_IMG_URL',"C:\\ECPATMMB\\HNNXLogo.bmp");
            //打开设备
            await this.openMachine();
            //打印凭条
            await this.printTicket();

        },
        //打开设备
        async  openMachine(){
             await   this.$wsc.sendMsg({"mode":"ecp_ticketprt_opendev"}).then(()=>{}).catch((res)=>{
                this.showErrorFun(res);
              })
        },
        //获取设备状态
       async  getdevStatus(){
           await   this.$wsc.sendMsg({"mode":"ecp_ticketprt_getdevstatus"}).then(()=>{
           }).catch((res)=>{
                this.showErrorFun(res);
           })
        },  
        //打印单色图
        async  printBmp(printData){
             await   this.$wsc.sendMsg({"mode":"ecp_ticketprt_printBmp","printData":printData}).then(()=>{}).catch((res)=>{
                this.showErrorFun(res);
              })
        },
        //打印QR二维码;lmargin-左边距（0~27），mside-大小(1~8)
        async  printQR(printData,lmargin,mside){
             await   this.$wsc.sendMsg({"mode":"ecp_ticketprt_printQR","printData":printData,"lmargin":lmargin,"mside":mside}).then(()=>{}).catch((res)=>{
                this.showErrorFun(res);
              })
        },
        //设置打印格式；textSize-文字大小(1~8)，bold-是否加粗(0-不加粗,1-加粗)，alignment-其方式(0-左,1-居中,2-右),lineSpace-行间距,leftSpace-左边距
        async  setstyle(textSize,bold,alignment,lineSpace,leftSpace){
             await   this.$wsc.sendMsg({"mode":"ecp_ticketprt_setstyle","textSize":textSize,"bold":bold,"alignment":alignment,"lineSpace":lineSpace,"leftSpace":leftSpace}).then(()=>{}).catch((res)=>{
                this.showErrorFun(res);
              })
        },                        
        //打印一行：printData-打印数据
        async  printline(printData){
             await   this.$wsc.sendMsg({"mode":"ecp_ticketprt_printline","printData":printData}).then(()=>{}).catch((res)=>{
                this.showErrorFun(res);
              })
        },
        //走纸：line-走纸行数
        async  feedline(line){
            for(var i=0;i<line;i++){
                await this.printline(" ")
            }
            //  await   this.$wsc.sendMsg({"mode":"ecp_ticketprt_feedline","line":line}).then(()=>{}).catch((res)=>{
            //     this.showErrorFun(res);
            //   })
        },                
        //切纸
        async  cutpaper(){
             await   this.$wsc.sendMsg({"mode":"ecp_ticketprt_cutpaper"}).then(()=>{}).catch((res)=>{
                this.showErrorFun(res);
              })
        },


        //关闭设备
        async closeMachine(){
           await this.$wsc.sendMsg({"mode":"ecp_ticketprt_closedev"}).then(()=>{      
          }).catch(()=>{})

        }, 
        
        //打印凭条
        async printTicket(){
            let printDatas= this.printVals;
            console.log("this.printTemplate:"+JSON.stringify(this.printTemplate))
            if(!this.isNull(this.printTemplate)){
                printDatas=this.printTemplates[this.printTemplate.templateType]
                console.log("printDatas:"+JSON.stringify(printDatas))
            }
            for(var i in printDatas){
               switch (printDatas[i].type) {
                   case "printBmp":
                       //打印单色图
                       await this.printBmp(printDatas[i].printData);
                       break;
                   case "printQR":
                       //打印二维码
                       var printData=printDatas[i].printData;
                       var lmargin=printDatas[i].lmargin;
                       var mside=printDatas[i].mside;                       
                       await this.printQR(printData,lmargin,mside);
                       break;                       
                   case "setstyle":
                       //设置字体样式
                       var textSize=printDatas[i].textSize;
                       var bold=printDatas[i].bold;
                       var alignment=printDatas[i].alignment;
                       var lineSpace=printDatas[i].lineSpace;
                       var leftSpace=printDatas[i].leftSpace;
                       await this.setstyle(textSize,bold,alignment,lineSpace,leftSpace);
                       break;
                   case "printline":
                       //打印一行
                       if(this.isNull(printDatas[i].printData)){
                           //当没有单行的打印数据，就是需要打印左右两列的形式
                            if(printDatas[i].isRemSenMsg){
                                //需要对右侧的内容进行脱敏
                                printDatas[i].printDataRight=this.remSenMsg(printDatas[i].printDataRight);
                            }
                            printDatas[i].printData=this.recepitCom2(printDatas[i].printDataLeft,printDatas[i].printDataRight);
                       }
                       await this.printline(printDatas[i].printData);
                       break;
                   case "feedline":
                       //走纸
                       await this.feedline(printDatas[i].line);
                       break;
                   case "cutpaper":
                       //切纸
                       await this.cutpaper();
                       break;                                                                                                    
                   default:
                       break;
               } 
            }
            //关闭设备
            await this.closeMachine();           
            this.$emit('printTicketSuccess',true);
        },
        /**
         * 去除敏感信息
         */
        remSenMsg(str) {
            if(this.isNull(str)){return str}
            var len = str.length
            if (len < 4) {
                return str.substr(0, 1) + this.strMul("*", len - 1)
            } else {
                let firstLen = 1
                for (var i = 1; i < len; i++) {
                    if (2 * i == (len - 2 * i)) {
                        firstLen = i
                        break
                    } else if (2 * i > (len - 2 * i)) {
                        firstLen = i - 1
                        break
                    }
                }
                return str.substr(0, firstLen) + this.strMul("*", len - 2 * firstLen) + str.substr(len - firstLen, firstLen)
            }
        },
        //获取字节长度
            func(str) {
                var num = 0;
                var a = str.split("");
                for (var i = 0; i < a.length; i++) {
                    if (a[i].charCodeAt(0) < 299) {
                        num++;
                    } else {
                        num += 2
                    }
                }
                return num;
            },
            /**
             * 字符串相乘
             * 例如：
             * 		str="123"
             * 		num=3
             * return "123123123"
             * 
             * @param {Object} str 需要相乘的字符串
             * @param {Object} num 需要相乘的数量
             */
            strMul(str, num) {
                return num > 1 ? str +=  this.strMul(str, --num) : str;
            },
            //凭条打印数据组拼
            recepitCom(str) {
                if (str == undefined) {
                    return "";
                }
                var l = this.func(str);
                var num = 23 - l / 2
                str =  this.strMul(" ", num) + str;
                console.log(num);
                console.log(str);
                return str;
            },
            //凭条打印数据组拼
            recepitCom2(left, right) {
                if (left == undefined) {
                    left = "";
                }
                if (right == undefined) {
                    right = "";
                }
                var num = 46 - this.func(left) - this.func(right);
                console.log(num);
                var str = left + this.strMul(" ", num) + right
                console.log(str);
                return str;
            },  
            /** 是否为空 **/
            isNull(str) {
                try {
                    if (str == "" || str == " " || str == null || str == undefined||JSON.stringify(str)==="{}") {
                        return true;
                    } else {
                        return false;
                    }                    
                } catch (error) {
                    return false;
                }

            },
            //错误显示
            showErrorFun(msg){
                this.showError = true;
                this.errorText = JSON.stringify(msg);
                this.$emit('printTicketSuccess',false);           
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


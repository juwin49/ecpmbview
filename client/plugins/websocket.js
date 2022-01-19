/*
* @Description:全局websocket方法定义
* @Author: Juwin49  
* @Date: 2021-12-Tu 08:47:01  
* @Last Modified by:   Juwin49  
* @Last Modified time: 2021-12-Tu 08:47:01  
*/
import Vue from 'vue'

let SocketC = {}  //socket对象
let intervalC  //重连定时器定义
let socketCUrl = process.env.websocket_machine_Url 

//重新连接C端
const reconnetWS =(URL,ws)=>{
        socketCUrl = URL
        console.log('重新连接：',socketCUrl)
      //  SocketC = new WebSocket(socketCUrl)  
        SocketC = new WebSocket(socketCUrl)  
        SocketC.onopen = ()=>{
                console.log('连接',socketCUrl)
               
                if(intervalC){
                  clearInterval(intervalC) 
                }
        }
        SocketC.onerror = ()=>{
            console.log('连接出错：',socketCUrl)
        }
        SocketC.onclose = ()=>{
            console.log('已断开：',socketCUrl)
            clearInterval(intervalC)
            intervalC = setInterval(() => { 
                reconnetWS(socketCUrl)
            },6000) // 6秒执行一次   
        }
}


export default ({App,store,env}, inject) => {
    inject('wsc', {
        ws: SocketC,//websocket对象
        delay:8000,//重连延迟，单位：毫秒
        //设置websocket对象方法
        setWs: (URL) => {
            socketCUrl = URL
            this.ws = new WebSocket(socketCUrl)          
            this.ws.onopen = ()=>{
                console.log('连接',socketCUrl)
               
                if(intervalC){
                   clearInterval(intervalC) 
                }
            }
            this.ws.onerror = ()=>{
                console.log('连接出错：',socketCUrl)  
            }
            this.ws.onclose =()=>{
               // store.commit('SET_WSC_CONNETED', false)
                console.log('已断开：',socketCUrl)
                store.commit('SET_WSC_RECONNET', 1)
                clearInterval(intervalC)
                intervalC = setInterval(() => { 
                    reconnetWS(socketCUrl,this.ws)
                },6000) // 6秒执行一次   
            }

            return new Promise((resolve,reject)=>{
                this.ws.onopen= ()=>{
                    console.log('连接',socketCUrl)
                    if(intervalC){
                        clearInterval(intervalC) 
                    }
                    resolve()
                }
            })
        },
        //设置延迟方法
        setDelay:(newDelay)=>{
            this.delay = newDelay
        },
        //发送websocket信息方法
        sendMsg:(message)=>{   
          return new Promise((resolve,reject)=>{        
                        //定义方法中，发送信息以ecpend结束
                        if (message.mode != "ecp_pinpad_scoutkeypress"
                            && message.mode != "ecp_id2_checkcardin"
                            && message.mode != "ecp_id2_checkpulloutcard"
                            && message.mode != "ecp_camera_getdeteresult" ) {
                            console.log('C端 -->> ', JSON.stringify(message)+'ecpend')
                        }
                        this.ws.send(JSON.stringify(message)+'ecpend')
                        store.commit('SET_WSC_PROCESS', message)
                            this.ws.onmessage =(e)=>{
                                let res = JSON.parse(e.data)
                                if (message.mode != "ecp_pinpad_scoutkeypress"
                                    && message.mode != "ecp_id2_checkcardin"
                                    && message.mode != "ecp_id2_checkpulloutcard"
                                    && message.mode != "ecp_camera_getdeteresult" ) {
                                    console.log('C端 <<-- ',res)
                                }
                                if(res.code=="0"){
                                    resolve(res.msg)
                                }else{
                                   reject(res.msg)
                               }
                            }
          })
        }       
      })   
}
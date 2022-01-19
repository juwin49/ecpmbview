<template>
    <div class="identity-wrap">
        <div class="identity-box">
            <div class="identity-title">{{moduleName}}</div>
            <div class="identity-content">
                <div style="line-height: 700px;" class="identity-insert gif-wrap">
                    <p>{{promptInfo}}</p>
                </div>
                <errorinfo :showError="errorText!=''" :errorText="errorText" />
                <Loading :showLoading="showLoading" :loadingText="loadingText" />
            </div>
        </div>

    </div>
</template>
<script>
    import Loading from '~/components/common/loading.vue'
    import Errorinfo from '../common/errorinfo.vue'

    export default {
        layout: 'blank',
        components: {
            Loading,
            Errorinfo,
        },
        props: {
            Ptermid: {
                type: Object,
                default: () => {
                    return {}
                }
            }
        },
        data() {
            return {
                moduleName: '人脸识别',
                promptInfo: '',
                loadingText: '',
                showLoading: false,
                intervalGetInfo: '',
                cardInfo: {},
                errorText: '',
                showError: false,
                readingMsg: (require(`~/data/${this.$store.state.select_language}.json`)).device.faceRecognition,
                isClose: false,
                isRequest: false,
            }
        },
        async mounted() {
            await this.init()
        },
        destroyed() {
            if (this.intervalGetInfo) {
                clearInterval(this.intervalGetInfo)
            }
            if (!this.isClose) {
                this.closeMachine();
            }
        },
        methods: {
            //页面跳转
            jumpto(url) {
                this.$router.push(url)
            },
            //初始页面
            async init() {
                // this.showLoading = true
                try {
                    // 请进行活体检测
                    this.promptInfo = this.readingMsg.pleaseDetection;
                    this.$SystemBaseApi.SST_VoiceSpeak(this.promptInfo)
                    await this.openMachine()
                    // 人脸照片
                    let faceLivePicPhoto = await this.getDeteResult()
                    // await this.$SystemBaseApi.SST_Base64ToPath(Photo, this.$store.state.idt_card_info.faceProfilePic);

                    await this.$SystemBaseApi.SST_Delay(1000)
                    // 现场照片
                    // this.$store.state.idt_card_info.faceLivePic = "C:\\ECPATMMB\\IDReader\\faceImg.jpg"
                    this.$store.state.idt_card_info.faceLivePic = "C:\\ECPATMMB\\Camera\\detectImage.jpg"
                    // let faceLivePicPhoto = await this.getcapture()
                    // await this.$SystemBaseApi.SST_Base64ToPath(faceLivePicPhoto,  this.$store.state.idt_card_info.faceLivePic);
                    this.$store.commit('SET_ID_CARD_INFO', this.$store.state.idt_card_info)

                    this.promptInfo = this.readingMsg.detectionPassed
                    await this.$SystemBaseApi.SST_VoiceSpeak(this.promptInfo)
                    
                    this.promptInfo = "";
                    this.showLoading = true;
                    this.loadingText = this.readingMsg.recognitionLoading
                    await this.$SystemBaseApi.SST_VoiceSpeak(this.loadingText)

                    this.$emit('faceRecognitionSuccess', true)

                } catch (error) {
                    this.errorText = error;
                    this.$emit('faceRecognitionSuccess', false)
                }
                await this.closeMachine()
                this.isClose = true;
                
                // this.showLoading = false
                /* '---------------双目摄像头-----------------ecpend',
				//angle-旋转角度 0-不旋转；90-顺时针90度；180-顺时针180度；270-顺时针270度
				'{"mode":"ecp_camera_opendev","width":"640","height":"480","angle":"0"}ecpend',
				//启动检测
				'{"mode":"ecp_camera_startdetection"}ecpend',
				//获取检测结果（循环调用）
				'{"mode":"ecp_camera_getdeteresult"}ecpend',
				//获取一帧图像
				'{"mode":"ecp_camera_getcapture"}ecpend',
				'{"mode":"ecp_camera_closedev"}ecpend', */
            },
            //打开设备
            async openMachine() {
                // 打开双目摄像头
                // await this.$wsc.sendMsg('{"mode":"ecp_camera_opendev","left":"100","top":"100","width":"640","height":"480","angle":"0"}').then((res)=>{console.log(res.msg)}).catch(()=>{})
                let res = await this.$wsc.sendMsg({
                    "mode": "ecp_camera_opendev",
                    "left": "250",
                    "top": "180",
                    "width": "520",
                    "height": "370",
                    "angle": "270"
                })
                console.info(res)
                //启动检测
                await this.$wsc.sendMsg({
                    "mode": "ecp_camera_startdetection"
                })
            },
            //获取人脸检测结果（循环调用）
            async getDeteResult() {
                return new Promise((resolve, reject) => {
                    if (this.intervalGetInfo) {
                        clearInterval(this.intervalGetInfo)
                    }
                    this.intervalGetInfo = setInterval(async () => {
                        try {
                            if(!this.isRequest){
                                this.isRequest=true
                                let res = await this.$wsc.sendMsg({"mode": "ecp_camera_getdeteresult"})
                                clearInterval(this.intervalGetInfo)
                                resolve(res);
                            }
                        } catch (error) {
                            console.log('获取人脸检测结果 >> ', error)
                            this.isRequest=false
                            if (error.indexOf("摄像未打开") != -1) {
                                clearInterval(this.intervalGetInfo)
                                // reject(error);
                                await this.init()
                            }
                        }
                    }, 500)
                });
            },
            //获取一帧图像
            async getcapture() {
                let res = await this.$wsc.sendMsg({
                    "mode": "ecp_camera_getcapture"
                });
                return res
                // console.log("获取一帧图像 >> ", res)
            },
            //关闭设备
            async closeMachine() {
                await this.$wsc.sendMsg({
                    "mode": "ecp_camera_closedev"
                })
            },

        },
        computed: {
            receiveDate() {
                return this.$store.state.wsc_process
            }
        },
        watch: {
            receiveDate() {
                if (this.$store.state.wsc_process) {
                    // console.log(this.$store.state.wsc_process,3434)
                    return
                }
            }
        }
    }
</script>
<style scoped>
    .identity-wrap {
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
    }

    .identity-box p {
        font-size: 28px;
        font-weight: 600;
        text-align: center;
        padding: 3px;
    }

    .identity-title {
        background: linear-gradient(to top, rgb(216, 0, 15) 0%, rgb(168, 28, 28) 100%);
        height: 50px;
        line-height: 50px;
        text-align: center;
        color: #fff;
        font-weight: bold;
    }

    .gif-wrap {
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
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        width: 400px;
        height: 300px;
    }

    .identity-wrap img {
        width: 100%;
        object-fit: fill;
    }

    .dosomething {
        position: absolute;
        width: 100%;
        top: 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .dosomething .hainan-button {
        display: block;
        width: 150px;
        height: 40px;
        line-height: 40px;
        margin: 5px 10px;
        text-align: center;
        color: #fff;
        border-radius: 5px;
        background-image: linear-gradient(to bottom right, #ff3643, #d6000e);
        z-index: 4;
    }

</style>
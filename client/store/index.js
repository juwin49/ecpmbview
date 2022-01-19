/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2021-12-31 15:02:19
 * @LastEditTime: 2022-01-12 09:25:22
 */

export const state = () => ({
    deviceID:'',  //设备编号
    wsc_reconnet:0,  //是否重连参数
    wsc_process:{},  //当前已发送的命令，备用：后期实现掉线后重新发送命令使用
    ecp_main_key:{},       //主密钥
    ecp_uc_key:{},         //工作密钥
    device_ready:false, //设备状态                   
    idt_card_info:{},  //身份证信息 CustomName姓名;Sex性别;nation民族;birthday出生日期;address家庭住址;IdNum身份证号;issuedBy发证机关;expirationStarDate有效日期起;expirationEndDate有效日期至;imgPath图片路径;imgfrontPath正面路径;imgbackPath反面路径;
    finger_info:{},     //指纹信息
    show_error_page:false,  //是否需要展示错误页面
    select_language:'chinesepack' , //选择语言
    service_result: {
        busiFlowNo: "88888888888888888", //交易流水号
        busiCode: "",//C端交易功能点编号
        networkCheckPath: "",//联网核查返回照片
        KXLH: "", //卡序号
    },
    tickImgUrl:"C:\\ECPATMMB\\HNNXLogo.bmp",
    // 获取社保卡信息
    SOC_SEC_CARD_INFO: {
        "IdType": "",	// 证件类型
        "IdNum": "",	// 证件号码
        "CustomName": "",	// 姓名
        "CheckType": "",	// 查询类型
        "PrimaryAcctNum": "",	// 社保卡卡号
        "CardSeqId": "",	// 卡序号
        "GSZT": "",	// 挂失状态
        "BaLance": "",	// 余额
        "GSSXF": "",	// 挂失手续费
        "Cost": "",	// 工本费
        "ZKZT": "",	// 制卡状态
        "SBCGBZ": "",	// 社保成功标志
        "ZWRZ": "",	// 是否需要指纹认证
        "Reason": "",	// 指纹授权原因
        "SQType": "",	// 授权类型
        "JHZT": "",	// 核心激活状态
        "QYZT": "",	// IC启用状态
        "BHKType": "",	// 补换卡类型
    },
    // 银行卡数据
    SOC_SEC_BANK_CARD: {
        "PosEntryModeCode": "",//服务点输入方式码
        "Track2Data": "",//二磁道数据
        "Track3Data": "",//三磁道数据
        "EmvVal": "",//基于PBOC借贷记标准的IC卡数据域
        "OperType": "",//操作类型 0-可读卡，1-不可读卡（暂不支持，损坏换卡），2-挂失卡        
    },
    //数据回流数据
    businessData:{
        "busiFlowNo": "",        //交易流水号 交易流水号，监控业务流程
        "businessTime": "",     //办理业务的时间 格式为yyyy-MM-dd HH:mm:ss
        "devId": "",     //设备编码 
        "busiCode": "",      //业务功能 根据附录五提供对应的功能点编号
        "idPhoto": "",       //业务办理成功照片 身份证正反面+现场照片+联网核查返回的照片合成的pdf的base64位字符，pdf大小不大于100K
        "businessOprName": "",       //办理人姓名 
        "businessOprIdCard": "",     //办理人身份证 
        "cardNO": "",        //银行卡号 卡业务办理模块都需要
        "cardSn": "",        //卡序列号 读取银行卡的时候才有数据
        "oldCardNO": "",     //旧卡号 挂失不同号补卡；升级不同号换卡
        "oldCardSn": "",     //旧卡序列号 挂失不同号补卡；升级不同号换卡中读取银行卡的时候才有数据
        "issCardDate": "",       //发卡日期 yyyy-MM-dd，只有发卡功能需要传输
        "expiredate": "",        //卡有效期 yyyy-MM-dd，只有发卡功能需要传输
        "csn": "",       //卡芯片号 只有写交通模块才需要传输
        "orderid": "",       //交通订单号 只有写交通模块才需要传输
        "card_reset_code": "",       //卡复位信息 只有发卡功能需要传输        
        "cardType": "",      //卡类型 1-空白卡2-预制卡只有发卡功能需要传输
        "resultCode": "",        //发卡结果 发卡是否成功（0成功，1废卡槽，2未出卡）只有发卡功能需要传输
        "changeRes": "",     //换卡原因	Char		Y	0损坏换卡（暂不支持）2-正常换卡（三代换三代）3挂失换卡（“二代/三代”换三代）4换代换卡（二代换三代）免工本费只有涉及换卡功能需要传输
        "status": "",        //当前状态 当前状态：0-初始状态   1-申请成功（挂失申请成功后）   2-换卡成功（获取IC卡数据成功后）   3-制卡成功  4-社保回盘成功 5-银行回盘成功（同号补换卡才需要这个状态）只有发卡功能需要传输
        "errorInfo": "",     //错误信息 当resultCode为不成功，此字段一定会有值。当resultCode为成功，此字段为空。
        "isSucceed": "",     //业务办理结果 0-失败 1-成功    
        "mkTime":"", //制卡所需时间        
    },
    //社保数据+
    cardIdMakedInfo:{
        "ATR":"",//ATR
        "KSBM":"",//卡识别码
        "sVersion":"",//卡版本号
        "SBKH":"",//社保卡号

    },
    //金融数据
    cardFinMakedInfo:{
        "sKXLH":"",//卡序列号
        "s57Value":"",//57域
        "sBankNO":"",//银行卡号
        "55Data":"",//55域
    },
})
export const mutations = {
    SET_DEVICEID(state,text){
        state.deviceID= text
    },
    // SET_WSC_CONNETED(state,text){
    //     state.wsc_conneted= text
    // },
    SET_WSC_RECONNET(state, text) {
        state.wsc_reconnet = text
    },
    SET_WSC_PROCESS(state,text){
        state.wsc_process = text
    },
    SET_ECP_MAIN_KEY(state,text){
        state.ecp_main_key = text
    },
    SET_ECP_UC_KEY(state,text){
        state.ecp_uc_key = text
    },
    SET_DEV_STATE(state,text){
        state.device_ready = text
    },
    SET_ID_CARD_INFO(state,text){
        state.idt_card_info = text
    },
    SET_FINGER_INFO(state,text){
        state.finger_info = text
    },
    SET_ERROR_PAGE(state,text){
        state.show_error_page = text
    },
    SET_LANGUAGE(state,text){
        state.select_language=text
    },
    // P端业务返回信息
    SET_SERVICE_RESULT(state,text){
        state.service_result=text
    },
    SOC_SEC_CARD_INFO(state,text){
        state.SOC_SEC_CARD_INFO=text
    },
    SOC_SEC_BANK_CARD(state,text){
        state.SOC_SEC_BANK_CARD=text
    },
    //添加单色图片地址
    SET_TICK_IMG_URL(state,text){
        state.tickImgUrl=text
    },
    //添加社保制卡数据
    SET_CARD_ID_MAKED_INFO(state,text){
        state.cardIdMakedInfo=text
    },
    //添加金融数据
    SET_CARD_FIN_MAKED_INFO(state,text){
        state.cardFinMakedInfo=text
    },    
    //数据回流数据
    SET_BUSINESS_DATA(state,text){
        state.businessData=text
    },        
}
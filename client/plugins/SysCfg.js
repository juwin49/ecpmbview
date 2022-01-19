/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2021-12-24 10:58:30
 * @LastEditTime: 2022-01-04 09:18:32
 */


/**
 * 配置文件
 * 
 */
const SysCfg = {
    //交易功能点编号
    TRAN_CODES: {
        // 系统接口
        "system": {
            // 设备注册
            "register": "ZC.01.01.01",
            // 应用升级
            "softVersion": "CJ.03.01.01",
            // 机构签到/签退
            "orgSign": "CJ.08.01.01",
            // 尾箱管理
            "respCardSet": "CJ.06.01.01",
            // 主密钥
            "getZmk": "KY.01.01.01",
            // 工作密钥
            "getMacAndPin": "KY.02.01.01",
            // 业务办理数据采集接口
            "businessCollection": "CJ.05.01.01",
            //故障信息上送
            "sendFaultInfo": "CJ.09.01.04"
        },
        //卡信息查询
        "cardSelect": {
            //社会保障卡申领进度查询
            "socSecCardReqQue": "LD.01.01.01",
            //社会保障卡制卡失败原因查询
            "socSecCardErrQue": "LD.01.01.02",
            //社会保障卡信息查询
            "socSecCardQue": "LD.01.01.03"
        },
        //银行业务
        "bankBusiness": {
            //人脸识别
            "faceRec": "LD.02.01.01",
            //银行卡激活 
            "activityBankCard": "LD.02.01.02",
            //银行卡挂失
            "socSecCardQue": "LD.02.01.03",
            //银行卡解挂
            "socSecCardQue": "LD.02.01.04",
            //书面挂失（申请）
            "repLoseInWrite": "LD.02.01.05",
            //同卡号换卡获取IC卡数据（仅支持同卡号）
            "sameCardChangeICData": "LD.02.01.06",
            //查询社保卡信息
            "queSocSecCardInfo": "LD.02.01.07",
            //指纹比对接口
            "fingerprints": "LD.02.01.08",
            //敏感数据解密
            "sensDec": "LD.02.01.09",
            //补换卡申请
            "reprintAndChangeReq": "LD.02.01.10",
            //联网核查
            "netWorkCheck": "LD.02.01.11",
            //回盘登记
            "counterofferReq": "LD.02.01.12",
            //客户信息查询
            "clientInfoQuery": "LD.02.01.21",
            //客户信息维护
            "ClinetInfoMaintain": "LD.02.01.22",
            //指纹比对接口（代申领场景）
            "fingerprintsAgency": "LD.02.01.23",
            //更新社保处理标志
            "updateSBCGBZ": "LD.02.01.24",
            // 余额查询
            "queryBalance": "LD.02.01.14",
            // 明细查询
            "detailEnquiry": "LD.02.01.15",
            // 户名查询
            "accountQuery": "LD.02.01.17",
            // 账户验证
            "accountVerification": "LD.02.01.18",
            // 行内转账
            "innerTransfer": "LD.02.01.19",
            // 行内转账
            "trafficInitApply": "LD.02.01.27",
            // 公交写卡确认
            "trafficWriteVerify": "LD.02.01.28",
            // M1卡操作申请
            "trafficM1Operation": "LD.02.01.33",
            // 卡操作写卡确认
            "trafficWriteConfirm": "LD.02.01.34",
            // 读卡信息
            "trafficReadInfo": "LD.02.01.35",
            // 短信发送
            "sendMessage": "LD.02.01.16",
            // 用户特群卡查询
            "userSpQuery": "LD.02.01.36", 	
            // 获取 M1 扇区 KEYA
            "getM1KEY": "LD.02.01.31",
        },
        // 金融交易
        "bankTransaction": {
            // 手机银行开户签约
            "signUpMobileBank": "LD.03.01.01",
            // 手机银行开户签约 查询
            "signUpMobileBankQuery": "LD.03.01.02",
            // 短信签约查询
            "messageSignedQuery": "LD.03.01.03",
            // 短信签约
            "messageSigned": "LD.03.01.04",
            // 客户号查询
            "customerNumberInquiry": "LD.03.01.05",
            // 查询激活状态（验密）
            "queryActivationStatus": "LD.03.01.08",
            // 自助渠道转账签约 (LD.03.01.06)
            "automatedTransit": "LD.03.01.06",
            // 自助渠道转账签约 查询 (LD.03.01.07)
            "automatedTransitQuery": "LD.03.01.07",
            // 小额免密 (LD.03.01.09) 
            "smallDenseFree": "LD.03.01.09",
            // 银联网上支付开通 (LD.03.01.10)
            "unionpayOnlinePayment": "LD.03.01.10",
            // 银联网上支付 查询 (LD.03.01.11)
            "unionpayOnlinePaymentQuery": "LD.03.01.11",
        },
        //自助制卡
        "makeCard": {
            //判断是否符合制卡条件
            "isCanMakeCard": "LD.09.01.01",
            //数据提交 
            "dataSub": "LD.09.03.01",
            //获取写卡信息
            "reqMakeCardInfo": "LD.09.04.01",
            //回盘
            "counteroffer": "LD.09.05.01",
            //判断开户是否成功
            "isOpenAccountSunccess": "LD.09.06.01",
            //补卡获取信息
            "getReissueCardInfo": "LD.09.07.01",
            //获取卡商代码
            "getCardBusiCode": "LD.09.12.01",
            //补卡回盘
            "reissueCardCounteroffer": "LD.09.14.01",
            //补卡判断开户是否成功
            "isReissueCardOpenAccountSunccess": "LD.09.15.01",
            //CA认证
            "CaAuth": "LD.09.18.01",
            //获取交通密钥文件
            "getTrafKey": "LD.09.19.01",
            //加密机报文传输
            "encrRepTran": "LD.09.20.01",
            //卡内部认证
            "cardInsideAuth": "LD.09.21.01",
            //卡鉴权
            "cardAuthticate": "LD.09.22.01",
            //新增判断是否符合制卡条件（本质和符合制卡条件没区别）
            "newIsCanMakeCard": "LD.09.01.01.01",
            //(批量)获取写卡信息
            "reqMakeCardInfos": "LD.08.04.01",
            //(批量)获取写卡信息(无制卡照片)
            "reqMakeCardInfosNotPho": "LD.08.04.01.01",
            //(多个个编)判断是否符合制卡条件
            "isCanMakeCards": "LD.09.01.01.02",
            //查询社保是否生成制卡数据---针对社保异常流程使用
            "getReissueCardInfoError": "LD.09.04.02",
            //社保卡申领状态查询接口
            "cardStatusCheck": "LD.08.02.08",
            //获取二维码
            "getQrCode": "TP.01.01.01",
            //获取二维码图片
            "ollingQrCode": "TP.01.01.02",
        },
        //查询功能
        "check": {
            //查询人员基本信息
            "checkPersonnelInfo": "LD.08.00.01",
            //查询人员参保信息
            "checkPersonnelInsuredInfo": "LD.08.00.02",
            //养老账户查询
            "pensionAccountInquiry": "LD.08.00.03",
            //养老金发放明细
            "pensionAnnuityDetail": "LD.08.00.05",
            //缴费明细查询
            "captureExpendsQuery": "LD.08.00.06",
            //个人医疗账户划拨查询
            "medicalAccountTransferInquiry": "LD.08.00.07",
            //养老历年缴费基数查询
            "pensionContributionBaseInquiry": "LD.08.00.10",
            //个人医疗账户划拨明细查询
            "medicalAccountTransferDetailsInquiry": "LD.08.00.12",
            //参保人身份证号码正常升位
            "idNumberNormalUp": "LD.08.00.13",
            //灵活就业停业
            "fiexibleEmploymentStop": "LD.08.00.14",
            //灵活就业续页
            "fiexibleEmploymentContinue": "LD.08.00.15",
            //调缴费基数
            "captureExpendsBase": "LD.08.00.16",
            //药品目录查询
            "DrugDirectoryQuery": "LD.08.00.24",
            //诊疗项目查询
            "DiagnosisInquiry": "LD.08.00.25",
            //病种项目查询
            "entityProjectQuery": "LD.08.00.26",
            //取消灵活就业人员核定
            "cancelFiexibleEmployment": "LD.08.00.36",
            //定点医疗机构查询
            "designatedMedicalInstitutionQuery": "LD.08.00.27",
            //人脸认证结果
            "faceAuthResult": "LD.08.01.20",
            //查询认证人员资格接口
            "authenticationProxyQuery": "LD.08.01.25",
            //获取getHnocsToken
            "getHnocsToken": "LD.08.02.09",
            //基本医疗实践缴费清单
            "medicalPayment": "LD.08.00.34",
            //养老金收入证明
            "proofOfIcome": "LD.08.02.13",
        },
        //查询功能
        "bankcard": {
            //卡内部认证
            "cardInsideAuth": "LD.08.21.01.01",
            //卡鉴权
            "cardAuthticate": "LD.08.22.01.01",
            //加密机报文传输
            "encrRepTran": "LD.08.20.01.01",
        },
    },

    //C端交易功能点编号
    BUSI_CODES: {
        //卡办理业务
        "cardBusi": {
            //社保卡激活
            // "activityBankCard": this.TRAN_CODES["bankBusiness"]["activityBankCard"],
            "activityBankCard": "LD.02.01.02",
            //书面挂失
            // "repLoseInWrite": this.TRAN_CODES["bankBusiness"]["repLoseInWrite"],
            "repLoseInWrite": "LD.02.01.05",
            //新申领社保卡
            "apply": "CD.01.01.01",
            //挂失同号补卡
            "sameNumReissue": "CD.02.01.01",
            //挂失不同号补卡
            "diffNumReissue": "CD.03.01.01",
            //升级同号换卡
            "updateSameNumChange": "CD.04.01.01",
            //升级不同号换卡
            "diffSameNumChange": "CD.05.01.01",
            //信息变更补换卡
            "dataChange":"CD.10.01.01",
        },
        //社会保障卡信息查询
        "cardSelect": {
            //社会保障卡申领进度查询
            // "socSecCardReqQue": this.TRAN_CODES["cardSelect"]["socSecCardReqQue"],
            "socSecCardReqQue": "LD.01.01.01",
            // //社会保障卡制卡失败原因查询
            // "socSecCardErrQue": this.TRAN_CODES["cardSelect"]["socSecCardErrQue"],
            "socSecCardErrQue": "LD.01.01.02",
            // //社会保障卡信息查询
            // "socSecCardQue": this.TRAN_CODES["cardSelect"]["socSecCardQue"]
            "socSecCardQue": "LD.01.01.03"
        },
        // 金融交易
        "bankTransaction": {
            // 手机银行开户签约
            "signUpMobileBank": "LD.03.01.01",
            // 手机银行开户签约 查询
            "signUpMobileBankQuery": "LD.03.01.02",
            // 短信签约查询
            "messageSignedQuery": "LD.03.01.03",
            // 短信签约
            "messageSigned": "LD.03.01.04",
            // 客户号查询
            "customerNumberInquiry": "LD.03.01.05",
            // 查询激活状态（验密）
            "queryActivationStatus": "LD.03.01.08",
            // 自助渠道转账签约 (LD.03.01.06)
            "automatedTransit": "LD.03.01.06",
            // 自助渠道转账签约 查询 (LD.03.01.07)
            "automatedTransitQuery": "LD.03.01.07",
            // 小额免密 (LD.03.01.09) 
            "smallDenseFree": "LD.03.01.09",
            // 银联网上支付开通 (LD.03.01.10)
            "unionpayOnlinePayment": "LD.03.01.10",
            // 银联网上支付 查询 (LD.03.01.11)
            "unionpayOnlinePaymentQuery": "LD.03.01.11",

        }
    },
    //服务点输入方式码
    SERVICE_SITE_INPUT_CODE: [
        //第1-2位	
        {
            //未指明
            "unspecified": "00",
            //手工
            "handwork": "01",
            //接触式读取磁条
            "contactReadMag": "02",
            //光学码读取
            //（被扫，含芯片信息。二维码支付业务中的被扫模式，
            //交易报文中将传递 F23、F35、F55 等芯片相关信息。）
            "opticeHaveCard": "03",
            //光学码读取（被扫，无卡。二维码支付业务中的被扫模式，
            //交易报文中将不传递 F23、F35、F55 等芯片相关信息。）
            "opticeNotCard": "04",
            //接触式读取集成电路（IC）卡，且信息可靠
            "contactReadIC": "05",
            //ISO保留使用
            "ISOSave": "06",
            //非接触式读取集成电路（IC）卡，且为qUICS应用
            "notContactReadIC_qUICS": "07",
            //接触式读取磁条，且读入信息可靠，第二磁道信息必须出现
            "contactReadMagHaveSec": "90",
            //光学码读取（主扫，含芯片信息。二维码支付业务中的主扫模式，
            //易报文中将传递 F23、F35、F55 等芯片相关信息。）
            "opticeHaveCardMain": "93",
            //光学码读取（主扫，无卡。二维码支付业务中的主扫模式，
            //交易报文中将不传递 F23、F35、F55 等芯片相关信息。）
            "opticeNotCardMain": "94",
            //接触式读取集成电路（IC）卡，且信息不可靠
            "contactReadICUnrel": "97",
            //非接触式读取集成电路（IC）卡，且为UICS借贷记应用
            "notContactReadIC_UICS": "98"
        },
        //第3位	
        {
            //未指明
            "unspecified": "0",
            //交易中包含PIN
            "havePin": "1",
            //接触式读取磁条
            "notPin": "2"
        }
    ],

}
export default SysCfg
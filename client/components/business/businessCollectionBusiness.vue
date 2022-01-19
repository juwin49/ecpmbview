<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2022-01-04 15:00:19
 * @LastEditTime: 2022-01-11 11:08:30
-->
<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2021-12-28 14:46:53
 * @LastEditTime: 2022-01-04 14:21:49
-->

<template>

</template>
<script>
import {dateFormat} from '~/components/common/utils'
export default {
    layout:'business',
    components: {
        dateFormat,
	},
    props: {
        //业务办理结果 0-失败 1-成功    
        isSucceed: {
            type: String,
            default: "0"
        },
    },    
    data(){
		return {
            
        }
    },
    mounted(){

    },
    methods:{

        /* P端请求 */
        // 数据回流
        async businessCollection() {

            // 数据回流
            let req = {
                "busiFlowNo": this.$store.state.service_result.busiCode,        //交易流水号 交易流水号，监控业务流程
                "businessTime": dateFormat(new Date().getTime(), 'yyyy-MM-dd hh:mm:ss'),     //办理业务的时间 格式为yyyy-MM-dd HH:mm:ss
                "devId": this.$store.state.deviceID,     //设备编码 
                "busiCode": this.$SysCfg.TRAN_CODES["system"]["businessCollection"],      //业务功能 根据附录五提供对应的功能点编号
                "idPhoto": this.$store.state.businessData.idPhoto,       //业务办理成功照片 身份证正反面+现场照片+联网核查返回的照片合成的pdf的base64位字符，pdf大小不大于100K
                "businessOprName": this.$store.state.businessData.businessOprName,       //办理人姓名 
                "businessOprIdCard": this.$store.state.businessData.businessOprIdCard,     //办理人身份证 
                "cardNO": this.$store.state.businessData.cardSn,        //银行卡号 卡业务办理模块都需要
                "cardSn": this.$store.state.businessData.cardSn,        //卡序列号 读取银行卡的时候才有数据
                "oldCardNO":this.$store.state.businessData.oldCardNO,     //旧卡号 挂失不同号补卡；升级不同号换卡
                "oldCardSn": this.$store.state.businessData.oldCardSn,     //旧卡序列号 挂失不同号补卡；升级不同号换卡中读取银行卡的时候才有数据
                "issCardDate":  this.$store.state.businessData.issCardDate,       //发卡日期 yyyy-MM-dd，只有发卡功能需要传输
                "expiredate":  this.$store.state.businessData.expiredate,        //卡有效期 yyyy-MM-dd，只有发卡功能需要传输
                "csn":  this.$store.state.businessData.csn,       //卡芯片号 只有写交通模块才需要传输
                "orderid":  this.$store.state.businessData.orderid,       //交通订单号 只有写交通模块才需要传输
                "card_reset_code": this.$store.state.cardIdMakedInfo.ATR,       //卡复位信息 只有发卡功能需要传输
                "cardType": this.$store.state.businessData.cardType,      //卡类型 1-空白卡2-预制卡只有发卡功能需要传输
                "resultCode": this.$store.state.businessData.resultCode,        //发卡结果 发卡是否成功（0成功，1废卡槽，2未出卡）只有发卡功能需要传输
                "changeRes": this.$store.state.businessData.changeRes,     //换卡原因	Char		Y	0损坏换卡（暂不支持）2-正常换卡（三代换三代）3挂失换卡（“二代/三代”换三代）4换代换卡（二代换三代）免工本费只有涉及换卡功能需要传输
                "status": this.$store.state.businessData.status,        //当前状态 当前状态：0-初始状态   1-申请成功（挂失申请成功后）   2-换卡成功（获取IC卡数据成功后）   3-制卡成功  4-社保回盘成功 5-银行回盘成功（同号补换卡才需要这个状态）只有发卡功能需要传输
                "errorInfo": this.$store.state.businessData.errorInfo,     //错误信息 当resultCode为不成功，此字段一定会有值。当resultCode为成功，此字段为空。
                "isSucceed": this.$store.state.businessData.isSucceed,     //业务办理结果 0-失败 1-成功    
                "mkTime":this.$store.state.businessData.mkTime, //制卡所需时间
            }
            let param = await this.$SystemBaseApi.SST_FunInfoPassthrough(this.$SysCfg.TRAN_CODES["system"]["businessCollection"], req)
            this.showLoading = false;
            if (!param.errorInfo && param.resultCode == "1000") {
                this.$emit('businessCollectionSuccess',true);
                return 0;
            } else {
                this.$emit('businessCollectionSuccess',false);
                return -1;
            }
        },
        //设置回流数据的某个值
        async setBusinessDataVal(key,val){
            var businessData = this.$store.state.businessData;
            businessData["key"] = val;
            this.$store.commit("SET_BUSINESS_DATA",businessData);
        },
        //清空回流数据
        async emptyBusinessData(){
            var businessData={
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
            }        
            this.$store.commit(SET_BUSINESS_DATA,businessData);    
        }
    },
    watch:{


    }
}
</script>





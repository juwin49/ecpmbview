<template>
	<section class="container">
        <Header />
		<div class="contain-wrap">
			<div v-for="(item, index) in homeMenu" :key="index" class="contain-wrap-list-item">
				<div  class="contain-wrap-list-item-inner" @click="jumpto(item.url)">
					<img :src="item.img" />
					<p>{{item.name}}</p>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
import Header from '~/components/common/header.vue'


export default {
	layout:'blank',
	components: {
		Header
	},
	data(){
		return {
			languageType:1,
			cusServe:'客服电话',
			titlelogo:require('~/assets/img/home/logo5.png'),
			machineId:'test',
			homeMenu:[
				{img:require('~/assets/img/home/homeMenu_1.png'),name:'新申领制卡',url:'/base/indentityBB'},
				{img:require('~/assets/img/home/lost.png'),name:'挂失',url:'/base/lost'},
				{img:require('~/assets/img/home/homeMenu_3.png'),name:'金融激活',url:'/base/fingerRecognitionBB'},
			    {img:require('~/assets/img/home/homeMenu_2.png'),name:'换代换卡',url:'/base/recovery'},
				{img:require('~/assets/img/home/reissue.png'),name:'挂失补卡',url:'/base/reissue'},
				{img:require('~/assets/img/home/homeMenu_6.png'),name:'管理员模式',url:'/base/wirteCardBB'}
			]
		}
	},
	mounted (){
		this.getPInfo()
	},
	methods:{
		//页面跳转
		jumpto(url){
			this.$router.push(url)
		},
		async getPInfo(){

			/* let json = {"IdType":"01","IdNum":"460100202101010001","CustomName":"陈家錦","CheckType":"1","PrimaryAcctNum":"0","CardSeqId":"000","busiFlowNo":"6301016120220116165817557"};
			json = JSON.stringify(json)
			let unicode = this.$SystemBaseApi.SST_SysCNtoUnicode(json);
			console.info(unicode) */

			// let version = await this.$SystemBaseApi.SST_iniFileRead('version')
			// console.log(version)
			// let tt = await this.$SystemBaseApi.SST_FunGetZmk(this.$SysCfg.TRAN_CODES['system']['getZmk'], {})
			// console.log(tt)

			/* let path1 = "C:\\ECPATMMB\\IDReader\\FrontImg.bmp"
			let path2 = "C:\\ECPATMMB\\IDReader\\RearImg.bmp"
			let path3 = "C:\\ECPATMMB\\IDReader\\netWorkCheck.jpg"
			let path4 = "C:\\ECPATMMB\\IDReader\\netWorkCheck.jpg"
			await this.$SystemBaseApi.SST_PicToDF(path1, path2, path3, path4); */

		}
	}
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
.contain-wrap{
	position: absolute;
	width: 83vw;
	height: 62vh;
	top: 64%;
	left: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	justify-content: space-between;
	flex-direction: row;
	flex-wrap: wrap;

}

.contain-wrap-list-item{
	width: 20vw;
	height: 15vw;
	margin: 10px 20px;
	border-radius: 20px;
	background-image: linear-gradient(to bottom right, #ff3643 , #d6000e);
	color: #fff;
	display: flex;
	text-align: center;
	justify-content: center;
	font-size: 20px;
}

.contain-wrap-list-item img{
	margin-top: 12px;
	width: 100px;
	height: 95px;
}

</style>

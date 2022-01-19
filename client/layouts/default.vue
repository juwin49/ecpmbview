<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2021-12-27 09:20:55
 * @LastEditTime: 2021-12-30 11:29:58
-->
<template>
	<div>
		<nuxt/>
	</div>
</template>
<script>
export default {
	data(){
		return {}
    },
	created(){
		
	},
	async mounted(){
		await this.$wsc.setWs(process.env.websocket_machine_Url).then(()=>{
			//if(!this.$store.state.device_ready){
				this.$router.replace('/login').catch(() => {})
			//}
		}).catch(()=>{
            this.$router.push({ path: '/sorry', query: { error: '设备连接失败' }}).catch(() => {})
		})
	},
	methods:{

	}
}
</script>


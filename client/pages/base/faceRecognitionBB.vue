<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2021-12-28 14:46:53
 * @LastEditTime: 2022-01-11 14:34:41
-->

<template>
    <div class="identity-page">
        <!-- <Header /> -->       
    </div>
</template>
<script>
export default {
    layout:'blank',
    components: {
	},
    data(){
		return {
            showIndex: 2,
        }
    },
    mounted(){ 
        // this.$router.push('/sorry')
    },
    methods:{


    },
    watch:{


    }
}
</script>
<style scoped>
.identity-page{
    height: 100vh;
	width: 100vw;
	background-image: url('~/assets/img/bg-bak.png');
	background-size: 100% 100%;
	background-repeat: no-repeat;
    position: relative;
}

</style>




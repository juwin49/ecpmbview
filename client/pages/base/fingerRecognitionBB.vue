<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2021-12-28 14:46:53
 * @LastEditTime: 2021-12-28 15:10:18
-->

<template>
    <div class="identity-page">
        <Header />
       <identity   @IdentitySuccess="IdentityResule" v-if="showIndex==0" />
       <face-recognition  v-if="showIndex==1" />
       <finger-recognition @fingerRecognitionSuccess="getFingerPrintResule" v-if="showIndex==2"  />
    </div>
</template>
<script>
import Header from '~/components/common/header.vue'
import identity from '~/components/device/identity.vue'
import faceRecognition from '~/components/device/faceRecognition.vue'
import fingerRecognition from '~/components/device/fingerRecognition.vue'


export default {
    layout:'blank',
    components: {
        Header,
		identity,
        faceRecognition,
        fingerRecognition
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
        IdentityResule(v){
            if(v){
                console.log('继续')
              // this.identityShow=false
            //    this.$router.push('/')
               this.showIndex=1
            }else{
                this.$router.push('/')
                 console.log('跳错误页')
               //   this.identityShow=false
            }


        },
        getFingerPrintResule(v){
            if(v){
                console.log('继续')
              // this.identityShow=false
            //    this.$router.push('/')
               this.showIndex=1
            }else{
                this.$router.push('/')
                 console.log('跳错误页')
               //   this.identityShow=false
            }
        }


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




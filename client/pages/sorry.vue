<template>
    <div class="error-page" >
        <Header />
        <div class="error-msg">
            {{error}}
        </div>
    </div>
</template>
<script>
import Header from '~/components/common/header.vue'
export default {
    layout:'blank',
    components: {
		Header
	},
  data(){
      return{
          error:'暂停服务',
          errorPage:false

      }
  },
  mounted(){
      this.error=this.$route.query.error?this.$route.query.error:'暂停服务'
  },
  computed:{
      showErrorPage(){
          return this.$store.state.show_error_page
      }

  },
  watch:{
      showErrorPage(){
          if(!this.$store.state.show_error_page){
               this.$router.push('/')
          }
      }
  }
}
</script>
<style scoped>
.error-page{
    width: 100vw;
    height: 100vh;
    position: relative;
    top: 0;
    left: 0;
    border: 1px solid #dab8b8;
    z-index: 99;
    text-align: center;
	background-image: url('~/assets/img/bg-bak.png');
	background-size: 100% 100%;
	background-repeat: no-repeat;
}
.error-msg{
    position: absolute;
    display: flex;
    color: #fff;
    font-weight: bold;
    font-size: 70px;
    left: 50%;
    top: 50%;
    -webkit-transform: translate(-50%,-50%);
    transform: translate(-50%,-50%);
}

</style>
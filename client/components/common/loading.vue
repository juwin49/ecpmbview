<template>
    <div class="loading-wrap" v-if="showLoading">
        <div class="loading-box">
            <img src="~/assets/img/loadingAnimation.gif">
            <p class="loading-text">{{loadingText}}</p>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        showLoading: {
            type: Boolean,
            default:false
        },
        loadingText:{
            type: String,
            default:''
        }
    },
    data(){
        return{}

    }  
}
</script>
<style scoped>
.loading-wrap{
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.8;
    background: #fff;
    z-index: 99;
    text-align: center;
}
.loading-box{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    display: block;
}
.loading-text{
    font-size: 26px;
    font-weight: 600;
    padding-top: 20px;
}
    
</style>
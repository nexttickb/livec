<template>
    <div class="home-user" style="">
        <div class="head-img" style=""></div>
        <div class="user-info" style="">
            <div class="flex:1">用户名:{{userInfo.id}}</div>
            <div class="flex:1">info:{{userInfo.level}}</div>
        </div>
        <div class="home-bar" style="width:2.5rem;height:2.5rem;">
            <button @click="logout()" class="min-btn">退出</button>
        </div>
    </div>
    
</template>

<script>
export default {
    name: 'UserInfo',
    props: {
    },
    components:{},
    data() {
        return {
			userInfo:{name:'111'}
        }
    },
	mounted:function(){
		var self = this;
		RUNKIT.VoimBus.subscribe('public', (topic, res)=>{
			console.log("subscribe:" + JSON.stringify(res));
			if('userInfo' == res.type){
				self.userInfo = res.data;
			}
		});
	},
    computed: {
    },
    methods: {
        showPage(name, param){
            RUNKIT.APP.showPage(name, param || {}, this.$options.name); 
        },
		logout(){
			RUNKIT.ServerApi.logout();
		},
        goBack(){
            this.showPage('Home');
        }
    }
}
</script>

<style scoped>
.head-img{
	background:url('') no-repeat;
		background-size:100% 100%;
}
</style>

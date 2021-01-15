<template>
    <div class="my-body" style="">
		<div class="page-title bg1" style="">
			<div class="left fa fa-filter" @click="showPage('Contacts')"><</div>
            <div class="title">Search</div>
			<div class="right fa fa-search"></div>
		</div>
		<div style="height:2.6rem;display:flex;padding:0.2rem;">
			<input v-model.lazy="search_key"  placeholder="please input user name" type="text" style="border:1px solid #ccc;border-radius:0.2rem;flex:1;"></input>
		</div>
		<div style="flex:1;overflow-y:scroll">
			<div class="card-list-item" style="height:5rem;display:flex;" v-for="item in resList">
				<div style='width:5rem;height:5rem;'>
					<div style="width:5rem;height:5rem;display:flex;padding:0.3rem;box-sizing: border-box;">
						<div style="flex:1;background:#ccc;border-radius:5rem;" src=""></div>
					</div>
				</div>
				<div style='flex:1;display:flex;flex-direction:column;text-align:left;padding-top: 8px;padding-bottom: 8px;padding-left: 8px;'>
					<div style='flex:1;font-size:1rem;line-height:0.7rem;'>{{item.user_name}}</div>
					<div style='flex:1;font-size:1rem;line-height:0.7rem;'>{{item.user_id}}</div>
				</div>
				<div style='width:5rem;height:5rem;'>
					<div style="width:2rem;font-size:0.5rem;height:1.5rem;line-height:1.5rem;"></div>
					<div style="width:2rem;font-size:0.5rem;height:1.5rem;line-height:1.5rem;"></div>
					<div style="width:5rem;height:1.5rem;padding:0.2rem;box-sizing:border-box;">
						<div  @click="addContact(item.user_id)" style="background:#ccc;color:#fff;border-radius:0.2rem;">Add</div>
					</div>
				</div>
			</div>
		</div>
</div>
</template>

<script>
import UserInfo from '@/components/UserInfo'
import Bottom from '@/components/Bottom'
export default {
    name: 'Home',
    props: {
    },
    components:{UserInfo,Bottom},
    data() {
        return {
			search_key:'',
			userInfo:{},
			loadingMore:false,
			resList:[],
        }
    },
    computed: {
		
    },
	mounted:function(){
		var self = this;
		RUNKIT.VoimBus.subscribe('public', (topic, res)=>{
			
			if('showPage' == res.type){
				if(res.data.name == 'TransferOrder'){
					this.getList();
				}
			}
		});
	},
	watch:{
		"search_key":function(){
			this.doSearch();
		}
	},
    methods: {
        showPage(name, param){
            RUNKIT.APP.showPage(name, param || {}, this.$options.name); 
        },
		doSearch(){
			RUNKIT.ServerApi.send("Messager.findUser", {user_name:this.search_key}, (bl, res)=>{
				console.log('detail:', bl, res);
				this.resList = res.detail;
			});
		},
		async addContact(user_id){
			let res = await RUNKIT.ServerApi.addContacts(user_id);
			alert(res);
			if(res.code == 0)this.showPage('Contacts');
		},
        goBack(){
            this.showPage('Transfer');
        }
    }
}
</script>

<style lang='less'>
@card-height:4.5rem;


.card-list-item{
	height:2.5rem;background:#fff;display:flex;text-align:center;box-sizing: border-box;
	color:#888;
	margin:0.2rem;
	border-box:0.2rem #ccc;
	border-radius:0.2rem;
	box-shadow:0px 0px 0.3rem #ccc;

}


.page-menu{
	height:2.5rem;background:#fff;display:flex;text-align:center;box-sizing: border-box;;
	color:#888;
	.item{
		flex:1;
		.icon{
			height:1.6rem;line-height:1.6rem;font-size:1.2rem;
		}
		.text{
			height:0.6rem;line-height:0.6rem;font-size:0.4rem;
		}
		&:active{
			background:#fff;
		}
	}
}

.page-menu-rl{
	@height:2.5rem;
	@padding:0.8rem;
	height:@height;background:#fff;display:flex;text-align:center;box-sizing: border-box;
	color:#888;
	margin:0.2rem;
	padding:@padding;
	border-box:0.2rem #ccc;
	border-radius:0.2rem;
	box-shadow:0px 0px 0.3rem #ccc;
	.item{
		flex:1;
		display:flex;
		
		.icon{
			width:2.2rem;font-size:1rem;
		}
		.text{
			flex:1;font-size:0.6rem;text-align:left;
		}
		&:active{
			background:#fff;
		}
	}
}
	
</style>

<template>
<div class="bottom">
	<div @click="showPage('Contacts')" class="item">
		<div class="icon contact"></div>
		<div class="text active">Contacts</div>
	</div>
	<div @click="showPage('Chats')" class="item">
		<div class="icon chat"></div>
		<div class="text">Chats</div>
	</div>
	<div @click="showPage('Settings')" class="item">
		<div class="icon setting"></div>
		<div class="text">Settings</div>
	</div>
</div>
</template>

<script>
export default {
    name: 'wer',
    props: {
    },
    components:{},
    data() {
        return {
			nowSelect:''
        }
    },
    computed: {
		
    },
	mounted:()=>{
		var self = this;

		RUNKIT.VoimBus.subscribe('public', (topic, res)=>{
			if('showPage' == res.type){
				console.log('showPage:', res.data, this);
			//	self.nowSelect = res.data.name + '';
			//	self.nowSelect = '';
			}
		});
	},
    methods: {
		showPage(name, param){
            RUNKIT.APP.showPage(name, param || {}, this.$options.name); 
        }
    }
}
</script>

<style lang='less'>

	.bottom{
		height:3.3rem;
		background:#fff;
		display:flex;
		text-align:center;
		box-sizing:border-box;
		box-shadow: 0px 1px 10px #ccc;
		color:#888;
		.item{
			flex:1;
			.icon{
				height:2rem;
			}
			.text{
				height:1.3rem;line-height:0.9rem;font-size:1rem;
			}
			&:active{
				color:#000;
			}
		}
	}
	.chat{
		background:url('../assets/icon/chat.svg') no-repeat center center;
		background-size:79% 79%;
	}
	.contact{
		background:url('../assets/icon/contacts.svg') no-repeat center center;
		background-size:79% 79%;
	}
	.setting{
		background:url('../assets/icon/setting_m.svg') no-repeat center center;
		background-size:79% 79%;
	}
	
</style>

<template>
<div class="rec-box" v-show="show" style="">
	<div class="ctrlProcessWave" style="flex:1;"></div>
	
</div>
</template>

<script>

import Recorder from 'recorder-core'
//音频格式 编码引擎 扩展
import 'recorder-core/src/engine/mp3'
import 'recorder-core/src/engine/mp3-engine'
import 'recorder-core/src/extensions/waveview'

export default {
    name: 'Recorder',
    components: {
    },
    data() {
        return {
			show:0,
			rec:0,
            duration:0,
            powerLevel:0,
            media:{}
        }
    },
    mounted:function(){
		var self = this;
		RUNKIT.VoimBus.subscribe('public', (topic, res)=>{
		});
		this.init();
	},
    computed: {
    },
    methods: {
		init(){
		
		},
        recOpen(){
            var This=this;
            var rec = this.rec = Recorder({
                type:'mp3',
                bitRate:16,
                sampleRate:16000,
                onProcess:function(buffers,powerLevel,duration,sampleRate){
                    This.duration = duration;
                    This.powerLevel = powerLevel;
                    This.wave.input(buffers[buffers.length-1], powerLevel, sampleRate);
                }
            });
            rec.open(function(){
                console.log("已打开", 2);
                This.wave = Recorder.WaveView({elem:".ctrlProcessWave"});
            },function(msg,isUserNotAllow){
                console.log((isUserNotAllow?"UserNotAllow，":"")+"打开失败："+msg,1);
            });
        },
        recStart(){
            if(!this.rec){
                console.log("未打开录音",1);
                return;
            }
            this.rec.start();
            var set=this.rec.set;
            console.log("录制中："+set.type+" "+set.sampleRate+"hz "+set.bitRate+"kbps");
			this.show = 1;
        },
        recStop(cbfunc){
            var This=this;
            var rec=This.rec;
            This.rec=null;
            if(!rec){
                console.log("未打开录音",1);
                return;
            }
            rec.stop((blob,duration)=>{
				this.show = 0;
                this.media = {
                    blob:blob,
					duration:duration,
					rec:rec
                };
				this.recdown64(cbfunc);
            },function(s){
				cbfunc(0);
                console.log("结束出错：" + s,1);
            },true);//自动close
        },
        recplay(src){
            var audio=this.$refs.LogAudioPlayer;
            audio.controls=true;
            if(!(audio.ended || audio.paused)){
                audio.pause();
            };
            audio.onerror=function(e){
                console.log('播放失败[' + audio.error.code + ']' + audio.error.message);
            };
            audio.src=(window.URL||webkitURL).createObjectURL(this.media.blob);
            audio.play();

        },
        recdown(){
		    var downA=document.createElement("A");
            downA.href=(window.URL||webkitURL).createObjectURL(this.media.blob);
            downA.download='test.mp3';
            downA.click();
        },
        recdown64(cbfunc){
            var This=this;
            var reader = new FileReader();
            reader.onloadend = function() {
				cbfunc(reader.result);
            };
            reader.readAsDataURL(this.media.blob);
        }
    }
}
</script>

<style lang='less'>
.rec-box{
	position:absolute;
	height:9rem;
	top:12rem;
	left:3rem;
	right:3rem;
	display:flex;
	background:rgba(0,0,0, 0.5);
	border-radius:0.6rem;
}
</style>



















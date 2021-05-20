<template>
    <div class="magnifier-box" :class="vertical?'vertical':''" :ref="id" @mousemove="mousemove" @mouseover="mouseover" @mouseleave="mouseleave">
        <img ref="img" crossorigin="anonymous" v-show="showImg" :src="imgUrl" alt="">
        <div class="mouse-cover"></div>
        <div class="edit-wrap" v-if="showEdit">
            <span class="rotate-left" @click="rotate('left')"></span>
            <span class="rotate-right" @click="rotate('right')"></span>
            <span class="download" @click="download"></span>
        </div>
        <div id="canvasEl"></div>
    </div>
</template>

<script>
import downloadUtil from '../utils/downloadUtil'
    export default {
        props:{
            scale:{
                type:Number,
                default: 5
            },
            url:{
                type:String,
                required:true
            },
            bigUrl:{
                type:String,
                default:null
            },
            scroll:{
                type:Boolean,
                default:false
            },
            showEdit:{
                type:Boolean,
                default:false
            },
            config: {
                type: Object,
                default: () => ({
                    coverWidth: 80,
                    coverHeight: 80,
                    canvasWidth: 0,
                    canvasHeight: 0,
                })
            },
            scrollElement: {
                type: HTMLDivElement,
                default: () => document.documentElement
            }
        },
        data () {
            return {
                id:null,
                cover:null,
                imgbox:null,
                imgwrap:null,
                orginUrl:null,
                bigImgUrl:null,
                bigOrginUrl:null,
                imgUrl:null,
                img:null,
                canvas:null,
                ctx:null,
                rectTimesX:0,
                rectTimesY:0,
                imgTimesX:0,
                imgTimesY:0,
                init:false,
                step:0,
                bigStep:0,
                vertical:false,
                showImg:true
            }
        },
        created(){
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var str = '';
        for (let i = 0; i < 10; i++) {
                str += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
            this.id = str
            this.imgUrl = this.url
        },
        watch:{
            url:function(val){
                this.imgUrl = val
                this.orginUrl = val
                this.initTime()
            }
        },
        mounted(){
            this.$nextTick(()=>{
                this.initTime()
            })
        },
        methods: {
            initTime(){
                this.init=false
                let box = this.$refs[this.id]
                this.imgbox = box



                let imgsrc = this.imgUrl
                
                // this.img = this.$refs['img']
                this.img = new Image()
                this.img.setAttribute('crossOrigin', 'anonymous');
                this.img.src = imgsrc
                this.img.onload= () => {
                    this.$nextTick().then(() => {
                          //  放大选择框
                        this.imgwrap = box.querySelector('img')

                        this.cover = box.querySelector('.mouse-cover')
                        this.cover.style.width = this.config.coverWidth + 'px'
                        this.cover.style.height = this.config.coverHeight + 'px';
                        this.cover.style.left = '-100%'
                        this.cover.style.top = '-100%'
                        // this.rectTimesX=(this.imgbox.offsetWidth/this.scale)/this.imgwrap.offsetWidth,
                        // this.rectTimesY=(this.imgbox.offsetHeight/this.scale)/this.imgwrap.offsetHeight

                        //  真实图片大小和显示图片大小比例
                        this.imgTimesX = this.img.width/this.imgwrap.offsetWidth,
                        this.imgTimesY = this.img.height/this.imgwrap.offsetHeight
                        // this.vertical = this.img.width<this.img.height

                        if(this.canvas){
                            this.canvas.parentNode.removeChild(this.canvas);
                            this.canvas=null
                        }

                        //  放大的图片canvas

                        this.canvas = document.createElement('canvas')
                        this.canvas.className = 'mouse-cover-canvas'
                        this.canvas.style.position = 'fixed'
                        this.canvas.style.left = this.imgbox.offsetLeft + this.imgbox.offsetWidth+10 + 'px'
                        this.canvas.style.top = this.imgbox.offsetTop + 'px'
                        this.canvas.style.border = '1px solid #eee'
                        this.canvas.style.zIndex = '99999'
                        this.canvas.style.display = "none"

                        this.canvas.width = this.config.coverWidth * this.scale
                        this.canvas.height = this.config.coverHeight * this.scale

                        //  放大选择框与真实图片的比例
                        this.rectTimesWidth = this.config.coverWidth / this.imgwrap.offsetWidth * this.img.width
                        this.rectTimesHeight = this.config.coverHeight / this.imgwrap.offsetHeight * this.img.height

                        document.getElementById('canvasEl').parentNode.append(this.canvas)
                        this.ctx=this.canvas.getContext("2d");
                        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

                        this.init=true
                    })
                }
            },
            initBox(){
                const _this = this
                
                // this.imgwrap = this.imgbox.querySelector('img')
                
                // this.canvas.style.display='none'
                // let box=this.$refs[this.id]
                let imgsrc = this.imgUrl
                    
                this.img = new Image()
                this.img.src = imgsrc
                this.img.onload = () => {

                    // this.showImg=true

                    _this.$nextTick(() => {
                        this.rectTimesWidth = this.config.coverWidth/this.imgwrap.offsetWidth*this.img.width
                        this.rectTimesHeight = this.config.coverHeight/this.imgwrap.offsetHeight*this.img.height
                        this.imgTimesX = this.img.width/this.imgwrap.offsetWidth,
                        this.imgTimesY = this.img.height/this.imgwrap.offsetHeight
                    })
                }
                
            },
            mousemove(e){
                    if(!this.init){
                        return false
                    }
                    this.imgwrap = this.imgbox.querySelector('img')
                    let _this=this
                    //获取实际的offset
                    function offset(curEle){
                        var totalLeft = null,totalTop = null,par = curEle.offsetParent;
                        //首先加自己本身的左偏移和上偏移
                        totalLeft += curEle.offsetLeft;
                        totalTop += curEle.offsetTop
                        //只要没有找到body，我们就把父级参照物的边框和偏移也进行累加
                        while(par){
                            if(navigator.userAgent.indexOf("MSIE 8.0")===-1){
                            //累加父级参照物的边框
                            totalLeft+=par.clientLeft;
                            totalTop+=par.clientTop
                            }
                            
                            //累加父级参照物本身的偏移
                            totalLeft+=par.offsetLeft;
                            totalTop+=par.offsetTop
                            par = par.offsetParent;
                        }
                    
                        return{
                            left:totalLeft,
                            top:totalTop
                        }
                    }

                    function getXY(eve) {
                        // console.log(eve.clientY)
                        return {
                            x : eve.clientX - (_this.cover.offsetWidth/2),
                            y : eve.clientY - (_this.cover.offsetHeight/2) 
                        };
                    }
                    const oEvent = e || event;
                    const pos = getXY(oEvent);
                    const imgwrap = offset(this.imgwrap)
                    // const scrollElement = this.scrollElement || document.documentElement
                    const scrollTop = this.scrollElement.scrollTop

                    const range = {
                        minX:imgwrap.left,
                        maxX:imgwrap.left+this.imgwrap.offsetWidth-this.cover.offsetWidth,
                        minY:imgwrap.top - scrollTop,
                        maxY:imgwrap.top - scrollTop + this.imgwrap.offsetHeight - this.cover.offsetHeight,
                    }
                    const mouseRange = {
                        minX: imgwrap.left,
                        maxX: imgwrap.left + this.imgwrap.offsetWidth,
                        minY: imgwrap.top - scrollTop,
                        maxY: imgwrap.top - scrollTop + this.imgwrap.offsetHeight
                    }

                    // console.log(document.scroll)
                    if(pos.x > range.maxX){
                        pos.x = range.maxX
                    }
                    if(pos.x<range.minX){
                        pos.x = range.minX
                    }
                    if(pos.y>range.maxY){
                        pos.y = range.maxY
                    }
                    if(pos.y<range.minY){
                        pos.y = range.minY
                    }

                    if(oEvent.clientX <= mouseRange.maxX && oEvent.clientX >= mouseRange.minX) {
                        this.cover.style.display='block'
                        this.canvas.style.display='block'
                    }
                    if(oEvent.clientY <= mouseRange.maxY && oEvent.clientY >= mouseRange.minY) {
                        this.cover.style.display='block'
                        this.canvas.style.display='block'
                    }
                    if(oEvent.clientX > mouseRange.maxX || oEvent.clientX < mouseRange.minX) {
                        this.cover.style.display='none'
                        this.canvas.style.display='none'
                    }
                    if(oEvent.clientY > mouseRange.maxY || oEvent.clientY < mouseRange.minY) {
                        this.cover.style.display='none'
                        this.canvas.style.display='none'
                    }

                    
                    this.cover.style.left = pos.x + 'px'
                    this.cover.style.top = pos.y +'px'
                    this.canvas.style.left = pos.x + 'px';
                    this.canvas.style.top = pos.y - this.canvas.offsetHeight + 'px';
                    if(pos.y - this.canvas.offsetHeight < 0) {
                        this.canvas.style.top = pos.y + this.cover.offsetHeight + "px"
                    }
                    this.ctx.clearRect(0,0,this.imgwrap.offsetWidth,this.imgwrap.offsetHeight);
                    const startX = pos.x - (imgwrap.left - document.documentElement.scrollLeft),
                    startY = pos.y - (imgwrap.top - scrollTop)
                    // console.log(startX, startY)
                    // console.log(this.ctx)
                    // this.ctx.drawImage(this.img, 10, 10)
                    // console.log(this.imgwrap.width,this.imgwrap.height)
                    this.ctx.drawImage(
                        this.img,
                        startX*this.imgTimesX,
                        startY*this.imgTimesY, 
                        this.rectTimesWidth, 
                        this.rectTimesHeight,
                        0,
                        0, 
                        this.config.coverWidth * this.scale, 
                        this.config.coverHeight * this.scale
                    );
                
            },
            mouseover(e){
                if(!this.init){
                    return false
                }
                e=e||event
                if(!this.scroll){
                    e.currentTarget.addEventListener("mousewheel",function(ev){
                        ev.preventDefault();
                    },false);

                    e.currentTarget.addEventListener("DOMMouseScroll",function(ev){
                        ev.preventDefault();
                    },false);
                }
                
                this.cover.style.display='block'
                this.canvas.style.display='block'
            },
            mouseleave(){
                if(!this.init){
                    return false
                }
                this.cover.style.display='none'
                this.canvas.style.display='none'
            },
            rotate(direction){
                this.rotateImg(this.img,direction,this.step)
            },
            rotateImg(img,direction){

                if (img == null) return;
                //img的高度和宽度不能在img元素隐藏后获取，否则会出错    
                var height = img.height;
                var width = img.width;
                
                const canvas = document.createElement('canvas')  
                
                const ctx = canvas.getContext('2d');
        
                canvas.width = height;
                canvas.height = width;
                //旋转角度以弧度值为参数    
                if(direction === 'right') {
                    const degree = 90 * Math.PI / 180
                    ctx.rotate(degree);
                    ctx.drawImage(img, 0, -height);
                } else {
                    const degree = -90 * Math.PI / 180
                    ctx.rotate(degree);
                    ctx.drawImage(img, -width, 0)
                }

                const newImg = canvas.toDataURL('image / jpeg')
                // const newImg = ""
                
                this.$nextTick(()=>{
                    this.imgUrl = newImg
                    this.initBox()
                })
            },
            download() {
                downloadUtil.download(this.orginUrl, '')
            }
        }
    }
</script>

<style lang="less" scoped>
    .magnifier-box{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        // overflow: hidden;
        position: relative;
        .edit-wrap{
            position: absolute;
            bottom: 0;
            left: 0;
            right:0;
            margin:0 auto;
            width: 103px;
            z-index: 9999;
            background: rgba(0,0,0,0.4);
            padding: 5px 15px 0 15px;
            border-radius: 15px;
            .rotate-left{
                display: inline-block;
                cursor: pointer;
                width: 16px;
                height: 16px;
                background: url(../assets/images/rotate.png);
                background-size: 100% 100%;
                -moz-transform:scaleX(-1);
                -webkit-transform:scaleX(-1);
                -o-transform:scaleX(-1);
                transform:scaleX(-1);
                /*IE*/
                filter:FlipH;
            }

            .rotate-right{
                margin-left: 10px;
                cursor: pointer;
                display: inline-block;
                width: 16px;
                height: 16px;
                background: url(../assets/images/rotate.png);
                background-size: 100% 100%;
            }
            .download {
                margin-left: 10px;
                cursor: pointer;
                display: inline-block;
                width:16px;
                height: 16px;
                background: url(../assets/images/download.png);
                background-size: 100% 100%;
                color: #fff;
            }
        }
        img{
            max-width: 100%;
            max-height: calc(~'100% - 30px');
        };
        .mouse-cover{
            position: fixed;
            background-color: rgba(0,0,0,0.5);
            cursor:move
        };
        .mouse-cover-canvas{
            position: fixed;
            left:100%;
            top:0;
            width:100%;
            height:100%;
        }
        &.vertical{
            img{
                height: 100%;
                width: auto
            }
        }
    }
</style>


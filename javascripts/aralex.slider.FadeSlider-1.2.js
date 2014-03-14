arale.declare(
	"aralex.slider.FadeSlider",[aralex.Switchable],{
		zIndex:0,
		duration:800,
		auto:true,
		start:0,
		prepare:function(){
			this.domNode.setStyle("position","relative");
			var arr=this._getChildren(this.domNode);
			$A(arr).each(function(v,i){
				v.setStyle({zIndex:this.zIndex-1,position:"absolute",left:0,top:0,opacity:0})
			},this);
			arr[this.start].setStyle({zIndex:this.zIndex,opacity:0.99});
			this.parent(arguments)
		},
		switchViewEffect:function(from,to,callback){
			if(from==to){callback();return}
			var views=this._getChildren(this.domNode),c=views[from],n=views[to];
			var that=this;
			if(this._currentAnim){
				this._currentAnim.clearSubjects();
				this.c&&this.c.setOpacity(0);
				that.n&&that.n.setStyle({zIndex:that.zIndex+1});
				that.c&&that.c.setStyle({zIndex:that.zIndex})
			}
			if(!this._currentAnim){
				this._currentAnim=new $Animator({
					duration:that.duration,
					interval:20,
					onComplete:function(){
						that.n&&that.n.setStyle({zIndex:that.zIndex+1});
						that.c&&that.c.setStyle({zIndex:that.zIndex});
						callback&&callback()
					}
				})
			}
			c.setStyle({zIndex:this.zIndex+1});
			n.setStyle({zIndex:this.zIndex});
			this.c=c;
			this.n=n;
			n.setOpacity(1);
			this._currentAnim.addCSSMotion(c.node,"opacity:1","opacity:0");
			this._currentAnim.play()
		}
	}
);
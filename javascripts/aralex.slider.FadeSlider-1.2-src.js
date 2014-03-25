/** begin ---fadeslider.js---*/
/**
 * @name aralex.slider.FadeSlider
 * @class
 * FadeSlider继承于Switchable，是实现了淡入淡出效果的slider组件。 
 * @author <a href="mailto:shuai.shao@alipay.com">邵帅</a>
 * @extends aralex.Switchable
 * @param {Object} cfg 配置
 * @returns {aralex.slider.FadeSlider} FadeSlider组件对象
 * @example
实例化代码:
 
        var fs = new aralex.slider.FadeSlider ({
            id: "views",
            triggerId: "triggers"
        });
 
DOM结构:
 
        <ul id="fadeView">
            <li><a href="#"><img src="./images/sindex01.jpg" alt="" /></a></li>
            <li><a href="#"><img src="./images/sindex02.jpg" alt="" /></a></li>
            <li><a href="#"><img src="./images/sindex03.jpg" alt="" /></a></li>
            <li><a href="#"><img src="./images/sindex04.jpg" alt="" /></a></li>
        </ul>
        <span id="fadeTrigger"><a href="#">1</a><a href="#">2</a><a href="#">3</a><a href="#">4</a></span>
 */
arale.declare("aralex.slider.FadeSlider", [aralex.Switchable], {
    /** @lends aralex.slider.FadeSlider.prototype */
    
    /**
     * zIndex值。所有的slide将分布在zIndex-1，zIndex和zIndex+1这三个zIndex值上。
     * @type Number
     * @default 0
     */
	zIndex: 0,

    /**
     * 淡出动作的执行时间，以毫秒为单位。
     * @type Number
     * @default 800
     */
	duration: 800,

    /**
     * 是否自动播放
     * @type Boolean
     * @default true
     */
	auto:true,

	start: 0,

    /** @private */
	prepare: function() {
		this.domNode.setStyle("position", "relative");
		var arr = this._getChildren(this.domNode);
		$A(arr).each(function(v, i){
			v.setStyle({zIndex:this.zIndex - 1, position:"absolute", left:0, top:0, opacity: 0});
		}, this);
		arr[this.start].setStyle({zIndex:this.zIndex, opacity: 0.99});
		this.parent(arguments);
	},

    /** @private */
	switchViewEffect: function(from, to, callback) {
        if(from == to) {callback();return;};
		var views = this._getChildren(this.domNode),
		c = views[from], n = views[to];	//current and next

		var that = this;
		if(this._currentAnim) {
			this._currentAnim.clearSubjects();
			this.c && this.c.setOpacity(0);
			that.n && that.n.setStyle({zIndex: that.zIndex + 1});
			that.c && that.c.setStyle({zIndex: that.zIndex});
		}
		if(!this._currentAnim) {
			this._currentAnim = new $Animator({
				duration: that.duration,
				interval: 20,
				onComplete: function() {
					that.n && that.n.setStyle({zIndex: that.zIndex + 1});
					that.c && that.c.setStyle({zIndex: that.zIndex});
					callback && callback();
				}
			});
		}
		c.setStyle({zIndex: this.zIndex + 1});
		n.setStyle({zIndex: this.zIndex});
		this.c = c;
		this.n = n;
		n.setOpacity(1);
		this._currentAnim.addCSSMotion(c.node, "opacity:1", "opacity:0");
		//this._currentAnim.addCSSMotion(n.node, "opacity:0", "opacity:1");
		this._currentAnim.play();
	}
});

/** end ---fadeslider.js---*/
/**Last Changed Author: shuai.shao--Last Changed Date: Wed Sep 14 15:43:07 CST 2011**/
/** begin ---iframeshim.js---*/
/**
 * IframeShim是通用的iframe遮挡解决方案，用来解决select\input\密码控件穿透浮层的问题。
 * @name aralex.utils.IframeShim
 * @class
 * @author <a href="mailto:shuai.shao@alipay.com">shuai.shao@alipay.com</a>
 */
arale.declare('aralex.utils.IframeShim', [aralex.Widget, aralex.View], {
    /** @lends aralex.utils.IframeShim.prototype */

    /**
     * 要遮挡的浮层
     * @type {string | Node | Element}
     */
    element: null,

    /** @ignore */
    shim_: null,

    /**
     * 是否初始化的时候默认显示iframe，默认显示
     * @type {boolean}
     */
    display: true,

    /**
     * 是否启用简单模式。
     * 当使用简单模式时，iframe的宽高利用百分比计算，这样，会忽略border，如果存在border的浮层，那么border部分在IE6将会被select穿透。<br/>
     * 当使用非简单模式时，iframe的宽高计算比较精确，border也可以被iframe遮挡掉，但是每次调用refresh方法对iframe的宽高的调整会引起iframe刷新，在ie6下比较慢，且有声音提示，所以适用于不需要经常调整大小的情况。
     * @type {boolean}
     */
    simpleMode: false,

    /** @ignore */
    postCreate: function() {
        this.element = $(this.element);

        this.refresh();
        this.domNode = this.shim_;

        this.shim_.inject(this.element, "bottom");
        this.display ? this.show() : this.hide();
    },

    /**
     * 调用此函数重新计算iframe大小。
     */
    refresh: function() {
        var style = {
            position: 'absolute',
            zIndex: -1,
            scrolling: 'no',
            border: 'none',
            filter: 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)'
        };
        var $f = this.getIframe_();
        if (this.simpleMode) {
            style.width = '100%';
            style.height = '100%';
            style.top = 0;
            style.left = 0;
        } else {
            var pos = this.element.getStyle("position");
            if(!pos || pos == "static" || pos == "auto") {
                this.element.setStyle("position", "relative");
            }
            var borderLeft = $S(this.element.getStyle("borderLeftWidth")).toInt() || 0;
            var borderRight = $S(this.element.getStyle("borderRightWidth")).toInt() || 0;
            style.left = -borderLeft + 'px';
            style.top = -borderRight + 'px';
            var size = this.element.getViewportSize();
            style.width = size.width + "px";
            style.height = size.height + "px";
        }
        $f.setStyle(style);
    },

    /** @ignore */
    getIframe_: function() {
        if(!this.shim_) {
            var $f = $Node($D.toDom("<iframe></iframe>"));
            this.shim_ = $f;
            $f.node.src = "javascript:'';";
			$f.setStyle('zoom', 1);
        }
        return this.shim_;
    },

    /**
     * 销毁iframe
     */
    dispose: function() {
        this.shim_ && this.shim_.dispose();
    }
});

/** end ---iframeshim.js---*/

/**aralex.utils.IframeShim-1.2**/
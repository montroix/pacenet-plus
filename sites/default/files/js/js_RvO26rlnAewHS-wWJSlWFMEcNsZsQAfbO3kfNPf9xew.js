(function($){
	/* hoverIntent by Brian Cherne */
	$.fn.hoverIntent = function(f,g) {
		// default configuration options
		var cfg = {
			sensitivity: 7,
			interval: 100,
			timeout: 0
		};
		// override configuration options with user supplied object
		cfg = $.extend(cfg, g ? { over: f, out: g } : f );

		// instantiate variables
		// cX, cY = current X and Y position of mouse, updated by mousemove event
		// pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
		var cX, cY, pX, pY;

		// A private function for getting mouse position
		var track = function(ev) {
			cX = ev.pageX;
			cY = ev.pageY;
		};

		// A private function for comparing current and previous mouse position
		var compare = function(ev,ob) {
			ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
			// compare mouse positions to see if they've crossed the threshold
			if ( ( Math.abs(pX-cX) + Math.abs(pY-cY) ) < cfg.sensitivity ) {
				$(ob).unbind("mousemove",track);
				// set hoverIntent state to true (so mouseOut can be called)
				ob.hoverIntent_s = 1;
				return cfg.over.apply(ob,[ev]);
			} else {
				// set previous coordinates for next time
				pX = cX; pY = cY;
				// use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
				ob.hoverIntent_t = setTimeout( function(){compare(ev, ob);} , cfg.interval );
			}
		};

		// A private function for delaying the mouseOut function
		var delay = function(ev,ob) {
			ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
			ob.hoverIntent_s = 0;
			return cfg.out.apply(ob,[ev]);
		};

		// A private function for handling mouse 'hovering'
		var handleHover = function(e) {
			// next three lines copied from jQuery.hover, ignore children onMouseOver/onMouseOut
			var p = (e.type == "mouseover" ? e.fromElement : e.toElement) || e.relatedTarget;
			while ( p && p != this ) { try { p = p.parentNode; } catch(e) { p = this; } }
			if ( p == this ) { return false; }

			// copy objects to be passed into t (required for event object to be passed in IE)
			var ev = jQuery.extend({},e);
			var ob = this;

			// cancel hoverIntent timer if it exists
			if (ob.hoverIntent_t) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); }

			// else e.type == "onmouseover"
			if (e.type == "mouseover") {
				// set "previous" X and Y position based on initial entry point
				pX = ev.pageX; pY = ev.pageY;
				// update "current" X and Y position based on mousemove
				$(ob).bind("mousemove",track);
				// start polling interval (self-calling timeout) to compare mouse coordinates over time
				if (ob.hoverIntent_s != 1) { ob.hoverIntent_t = setTimeout( function(){compare(ev,ob);} , cfg.interval );}

			// else e.type == "onmouseout"
			} else {
				// unbind expensive mousemove event
				$(ob).unbind("mousemove",track);
				// if hoverIntent state is true, then call the mouseOut function after the specified delay
				if (ob.hoverIntent_s == 1) { ob.hoverIntent_t = setTimeout( function(){delay(ev,ob);} , cfg.timeout );}
			}
		};

		// bind the function to the two event listeners
		return this.mouseover(handleHover).mouseout(handleHover);
	};
	
})(jQuery);;

/*
 * Superfish v1.4.8 - jQuery menu widget
 * Copyright (c) 2008 Joel Birch
 *
 * Dual licensed under the MIT and GPL licenses:
 * 	http://www.opensource.org/licenses/mit-license.php
 * 	http://www.gnu.org/licenses/gpl.html
 *
 * CHANGELOG: http://users.tpg.com.au/j_birch/plugins/superfish/changelog.txt
 */

;(function($){
	$.fn.superfish = function(op){

		var sf = $.fn.superfish,
			c = sf.c,
			$arrow = $(['<span class="',c.arrowClass,'"> &#187;</span>'].join('')),
			over = function(){
				var $$ = $(this), menu = getMenu($$);
				clearTimeout(menu.sfTimer);
				$$.showSuperfishUl().siblings().hideSuperfishUl();
			},
			out = function(){
				var $$ = $(this), menu = getMenu($$), o = sf.op;
				clearTimeout(menu.sfTimer);
				menu.sfTimer=setTimeout(function(){
					o.retainPath=($.inArray($$[0],o.$path)>-1);
					$$.hideSuperfishUl();
					if (o.$path.length && $$.parents(['li.',o.hoverClass].join('')).length<1){over.call(o.$path);}
				},o.delay);	
			},
			getMenu = function($menu){
				var menu = $menu.parents(['ul.',c.menuClass,':first'].join(''))[0];
				sf.op = sf.o[menu.serial];
				return menu;
			},
			addArrow = function($a){ $a.addClass(c.anchorClass).append($arrow.clone()); };
			
		return this.each(function() {
			var s = this.serial = sf.o.length;
			var o = $.extend({},sf.defaults,op);
			o.$path = $('li.'+o.pathClass,this).slice(0,o.pathLevels).each(function(){
				$(this).addClass([o.hoverClass,c.bcClass].join(' '))
					.filter('li:has(ul)').removeClass(o.pathClass);
			});
			sf.o[s] = sf.op = o;
			
			$('li:has(ul)',this)[($.fn.hoverIntent && !o.disableHI) ? 'hoverIntent' : 'hover'](over,out).each(function() {
				if (o.autoArrows) addArrow( $('>a:first-child',this) );
			})
			.not('.'+c.bcClass)
				.hideSuperfishUl();
			
			var $a = $('a',this);
			$a.each(function(i){
				var $li = $a.eq(i).parents('li');
				$a.eq(i).focus(function(){over.call($li);}).blur(function(){out.call($li);});
			});
			o.onInit.call(this);
			
		}).each(function() {
			var menuClasses = [c.menuClass];
			if (sf.op.dropShadows  && !($.browser.msie && $.browser.version < 7)) menuClasses.push(c.shadowClass);
			$(this).addClass(menuClasses.join(' '));
		});
	};

	var sf = $.fn.superfish;
	sf.o = [];
	sf.op = {};
	sf.IE7fix = function(){
		var o = sf.op;
		if ($.browser.msie && $.browser.version > 6 && o.dropShadows && o.animation.opacity!=undefined)
			this.toggleClass(sf.c.shadowClass+'-off');
		};
	sf.c = {
		bcClass     : 'sf-breadcrumb',
		menuClass   : 'sf-js-enabled',
		anchorClass : 'sf-with-ul',
		arrowClass  : 'sf-sub-indicator',
		shadowClass : 'sf-shadow'
	};
	sf.defaults = {
		hoverClass	: 'sfHover',
		pathClass	: 'overideThisToUse',
		pathLevels	: 1,
		delay		: 500,
		animation	: {opacity:'show'},
		speed		: 'fast',
		autoArrows	: true,
		dropShadows : true,
		disableHI	: false,		// true disables hoverIntent detection
		onInit		: function(){}, // callback functions
		onBeforeShow: function(){},
		onShow		: function(){},
		onHide		: function(){}
	};
	$.fn.extend({
		hideSuperfishUl : function(){
			var o = sf.op,
				not = (o.retainPath===true) ? o.$path : '';
			o.retainPath = false;
			var $ul = $(['li.',o.hoverClass].join(''),this).add(this).not(not).removeClass(o.hoverClass)
					.find('>ul').hide().css('visibility','hidden');
			o.onHide.call($ul);
			return this;
		},
		showSuperfishUl : function(){
			var o = sf.op,
				sh = sf.c.shadowClass+'-off',
				$ul = this.addClass(o.hoverClass)
					.find('>ul:hidden').css('visibility','visible');
			sf.IE7fix.call($ul);
			o.onBeforeShow.call($ul);
			$ul.animate(o.animation,o.speed,function(){ sf.IE7fix.call($ul); o.onShow.call($ul); });
			return this;
		}
	});

})(jQuery);
;
/*
 SelectNav.js (v. 0.1)
 Converts your <ul>/<ol> navigation into a dropdown list for small screens
 https://github.com/lukaszfiszer/selectnav.js
*/
window.selectnav=function(){return function(p,q){var a,h=function(b){var c;b||(b=window.event);b.target?c=b.target:b.srcElement&&(c=b.srcElement);3===c.nodeType&&(c=c.parentNode);c.value&&(window.location.href=c.value)},k=function(b){b=b.nodeName.toLowerCase();return"ul"===b||"ol"===b},l=function(b){for(var c=1;document.getElementById("selectnav"+c);c++);return b?"selectnav"+c:"selectnav"+(c-1)},n=function(b){g++;var c=b.children.length,a="",d="",f=g-1;if(c){if(f){for(;f--;)d+=r;d+=" "}for(f=0;f<
c;f++){var e=b.children[f].children[0];if("undefined"!==typeof e){var h=e.innerText||e.textContent,i="";j&&(i=-1!==e.className.search(j)||-1!==e.parentElement.className.search(j)?m:"");s&&!i&&(i=e.href===document.URL?m:"");a+='<option value="'+e.href+'" '+i+">"+d+h+"</option>";t&&(e=b.children[f].children[1])&&k(e)&&(a+=n(e))}}1===g&&o&&(a='<option value="">'+o+"</option>"+a);1===g&&(a='<select class="selectnav" id="'+l(!0)+'">'+a+"</select>");g--;return a}};if((a=document.getElementById(p))&&k(a)){document.documentElement.className+=
" js";var d=q||{},j=d.activeclass||"active",s="boolean"===typeof d.autoselect?d.autoselect:!0,t="boolean"===typeof d.nested?d.nested:!0,r=d.indent||"\u2192",o=d.label||"- Navigation -",g=0,m=" selected ";a.insertAdjacentHTML("afterend",n(a));a=document.getElementById(l());a.addEventListener&&a.addEventListener("change",h);a.attachEvent&&a.attachEvent("onchange",h)}}}();;
/*!
	jQuery ColorBox v1.4.3 - 2013-02-18
	(c) 2013 Jack Moore - jacklmoore.com/colorbox
	license: http://www.opensource.org/licenses/mit-license.php
*/
(function(e,t,i){function o(i,o,n){var r=t.createElement(i);return o&&(r.id=Y+o),n&&(r.style.cssText=n),e(r)}function n(e){var t=T.length,i=(A+e)%t;return 0>i?t+i:i}function r(e,t){return Math.round((/%/.test(e)?("x"===t?k.width():k.height())/100:1)*parseInt(e,10))}function h(e,t){return e.photo||e.photoRegex.test(t)}function l(e,t){return e.retinaUrl&&i.devicePixelRatio>1?t.replace(e.photoRegex,e.retinaSuffix):t}function s(e){"contains"in w[0]&&!w[0].contains(e.target)&&(e.stopPropagation(),w.focus())}function a(){var t,i=e.data(N,V);null==i?(K=e.extend({},J),console&&console.log&&console.log("Error: cboxElement missing settings object")):K=e.extend({},i);for(t in K)e.isFunction(K[t])&&"on"!==t.slice(0,2)&&(K[t]=K[t].call(N));K.rel=K.rel||N.rel||e(N).data("rel")||"nofollow",K.href=K.href||e(N).attr("href"),K.title=K.title||N.title,"string"==typeof K.href&&(K.href=e.trim(K.href))}function d(i,o){e(t).trigger(i),at.trigger(i),e.isFunction(o)&&o.call(N)}function c(){var e,t,i,o,n,r=Y+"Slideshow_",h="click."+Y;K.slideshow&&T[1]?(t=function(){clearTimeout(e)},i=function(){(K.loop||T[A+1])&&(e=setTimeout(G.next,K.slideshowSpeed))},o=function(){M.html(K.slideshowStop).unbind(h).one(h,n),at.bind(it,i).bind(tt,t).bind(ot,n),w.removeClass(r+"off").addClass(r+"on")},n=function(){t(),at.unbind(it,i).unbind(tt,t).unbind(ot,n),M.html(K.slideshowStart).unbind(h).one(h,function(){G.next(),o()}),w.removeClass(r+"on").addClass(r+"off")},K.slideshowAuto?o():n()):w.removeClass(r+"off "+r+"on")}function u(i){U||(N=i,a(),T=e(N),A=0,"nofollow"!==K.rel&&(T=e("."+Z).filter(function(){var t,i=e.data(this,V);return i&&(t=e(this).data("rel")||i.rel||this.rel),t===K.rel}),A=T.index(N),-1===A&&(T=T.add(N),A=T.length-1)),m.css({opacity:parseFloat(K.opacity),cursor:K.overlayClose?"pointer":"auto",visibility:"visible"}).show(),j||(j=q=!0,w.css({visibility:"hidden",display:"block"}),E=o(dt,"LoadedContent","width:0; height:0; overflow:hidden").appendTo(v),_=x.height()+C.height()+v.outerHeight(!0)-v.height(),z=y.width()+b.width()+v.outerWidth(!0)-v.width(),D=E.outerHeight(!0),B=E.outerWidth(!0),K.w=r(K.initialWidth,"x"),K.h=r(K.initialHeight,"y"),G.position(),lt&&k.bind("resize."+st+" scroll."+st,function(){m.css({width:k.width(),height:k.height(),top:k.scrollTop(),left:k.scrollLeft()})}).trigger("resize."+st),c(),d(et,K.onOpen),P.add(W).hide(),R.html(K.close).show(),w.focus(),t.addEventListener&&(t.addEventListener("focus",s,!0),at.one(nt,function(){t.removeEventListener("focus",s,!0)})),K.returnFocus&&at.one(nt,function(){e(N).focus()})),G.load(!0))}function f(){!w&&t.body&&(X=!1,k=e(i),w=o(dt).attr({id:V,"class":ht?Y+(lt?"IE6":"IE"):"",role:"dialog",tabindex:"-1"}).hide(),m=o(dt,"Overlay",lt?"position:absolute":"").hide(),L=o(dt,"LoadingOverlay").add(o(dt,"LoadingGraphic")),g=o(dt,"Wrapper"),v=o(dt,"Content").append(W=o(dt,"Title"),H=o(dt,"Current"),F=o("button","Previous"),S=o("button","Next"),M=o("button","Slideshow"),L,R=o("button","Close")),g.append(o(dt).append(o(dt,"TopLeft"),x=o(dt,"TopCenter"),o(dt,"TopRight")),o(dt,!1,"clear:left").append(y=o(dt,"MiddleLeft"),v,b=o(dt,"MiddleRight")),o(dt,!1,"clear:left").append(o(dt,"BottomLeft"),C=o(dt,"BottomCenter"),o(dt,"BottomRight"))).find("div div").css({"float":"left"}),I=o(dt,!1,"position:absolute; width:9999px; visibility:hidden; display:none"),P=S.add(F).add(H).add(M),e(t.body).append(m,w.append(g,I)))}function p(){function i(e){e.which>1||e.shiftKey||e.altKey||e.metaKey||(e.preventDefault(),u(this))}return w?(X||(X=!0,S.click(function(){G.next()}),F.click(function(){G.prev()}),R.click(function(){G.close()}),m.click(function(){K.overlayClose&&G.close()}),e(t).bind("keydown."+Y,function(e){var t=e.keyCode;j&&K.escKey&&27===t&&(e.preventDefault(),G.close()),j&&K.arrowKey&&T[1]&&!e.altKey&&(37===t?(e.preventDefault(),F.click()):39===t&&(e.preventDefault(),S.click()))}),e.isFunction(e.fn.on)?e(t).on("click."+Y,"."+Z,i):e("."+Z).live("click."+Y,i)),!0):!1}var m,w,g,v,x,y,b,C,T,k,E,I,L,W,H,M,S,F,R,P,K,_,z,D,B,N,A,O,j,q,U,$,G,Q,X,J={transition:"elastic",speed:300,width:!1,initialWidth:"600",innerWidth:!1,maxWidth:!1,height:!1,initialHeight:"450",innerHeight:!1,maxHeight:!1,scalePhotos:!0,scrolling:!0,inline:!1,html:!1,iframe:!1,fastIframe:!0,photo:!1,href:!1,title:!1,rel:!1,opacity:.9,preloading:!0,className:!1,retinaImage:!1,retinaUrl:!1,retinaSuffix:"@2x.$1",current:"image {current} of {total}",previous:"previous",next:"next",close:"close",xhrError:"This content failed to load.",imgError:"This image failed to load.",open:!1,returnFocus:!0,reposition:!0,loop:!0,slideshow:!1,slideshowAuto:!0,slideshowSpeed:2500,slideshowStart:"start slideshow",slideshowStop:"stop slideshow",photoRegex:/\.(gif|png|jp(e|g|eg)|bmp|ico)((#|\?).*)?$/i,onOpen:!1,onLoad:!1,onComplete:!1,onCleanup:!1,onClosed:!1,overlayClose:!0,escKey:!0,arrowKey:!0,top:!1,bottom:!1,left:!1,right:!1,fixed:!1,data:void 0},V="colorbox",Y="cbox",Z=Y+"Element",et=Y+"_open",tt=Y+"_load",it=Y+"_complete",ot=Y+"_cleanup",nt=Y+"_closed",rt=Y+"_purge",ht=!e.support.leadingWhitespace,lt=ht&&!i.XMLHttpRequest,st=Y+"_IE6",at=e({}),dt="div";e.colorbox||(e(f),G=e.fn[V]=e[V]=function(t,i){var o=this;if(t=t||{},f(),p()){if(e.isFunction(o))o=e("<a/>"),t.open=!0;else if(!o[0])return o;i&&(t.onComplete=i),o.each(function(){e.data(this,V,e.extend({},e.data(this,V)||J,t))}).addClass(Z),(e.isFunction(t.open)&&t.open.call(o)||t.open)&&u(o[0])}return o},G.position=function(e,t){function i(e){x[0].style.width=C[0].style.width=v[0].style.width=parseInt(e.style.width,10)-z+"px",v[0].style.height=y[0].style.height=b[0].style.height=parseInt(e.style.height,10)-_+"px"}var o,n,h,l=0,s=0,a=w.offset();k.unbind("resize."+Y),w.css({top:-9e4,left:-9e4}),n=k.scrollTop(),h=k.scrollLeft(),K.fixed&&!lt?(a.top-=n,a.left-=h,w.css({position:"fixed"})):(l=n,s=h,w.css({position:"absolute"})),s+=K.right!==!1?Math.max(k.width()-K.w-B-z-r(K.right,"x"),0):K.left!==!1?r(K.left,"x"):Math.round(Math.max(k.width()-K.w-B-z,0)/2),l+=K.bottom!==!1?Math.max(k.height()-K.h-D-_-r(K.bottom,"y"),0):K.top!==!1?r(K.top,"y"):Math.round(Math.max(k.height()-K.h-D-_,0)/2),w.css({top:a.top,left:a.left,visibility:"visible"}),e=w.width()===K.w+B&&w.height()===K.h+D?0:e||0,g[0].style.width=g[0].style.height="9999px",o={width:K.w+B+z,height:K.h+D+_,top:l,left:s},0===e&&w.css(o),w.dequeue().animate(o,{duration:e,complete:function(){i(this),q=!1,g[0].style.width=K.w+B+z+"px",g[0].style.height=K.h+D+_+"px",K.reposition&&setTimeout(function(){k.bind("resize."+Y,G.position)},1),t&&t()},step:function(){i(this)}})},G.resize=function(e){j&&(e=e||{},e.width&&(K.w=r(e.width,"x")-B-z),e.innerWidth&&(K.w=r(e.innerWidth,"x")),E.css({width:K.w}),e.height&&(K.h=r(e.height,"y")-D-_),e.innerHeight&&(K.h=r(e.innerHeight,"y")),e.innerHeight||e.height||(E.css({height:"auto"}),K.h=E.height()),E.css({height:K.h}),G.position("none"===K.transition?0:K.speed))},G.prep=function(t){function i(){return K.w=K.w||E.width(),K.w=K.mw&&K.mw<K.w?K.mw:K.w,K.w}function r(){return K.h=K.h||E.height(),K.h=K.mh&&K.mh<K.h?K.mh:K.h,K.h}if(j){var s,a="none"===K.transition?0:K.speed;E.empty().remove(),E=o(dt,"LoadedContent").append(t),E.hide().appendTo(I.show()).css({width:i(),overflow:K.scrolling?"auto":"hidden"}).css({height:r()}).prependTo(v),I.hide(),e(O).css({"float":"none"}),s=function(){function t(){ht&&w[0].style.removeAttribute("filter")}var i,r,s=T.length,c="frameBorder",u="allowTransparency";j&&(r=function(){clearTimeout($),L.hide(),d(it,K.onComplete)},ht&&O&&E.fadeIn(100),W.html(K.title).add(E).show(),s>1?("string"==typeof K.current&&H.html(K.current.replace("{current}",A+1).replace("{total}",s)).show(),S[K.loop||s-1>A?"show":"hide"]().html(K.next),F[K.loop||A?"show":"hide"]().html(K.previous),K.slideshow&&M.show(),K.preloading&&e.each([n(-1),n(1)],function(){var t,i,o=T[this],n=e.data(o,V);n&&n.href?(t=n.href,e.isFunction(t)&&(t=t.call(o))):t=e(o).attr("href"),t&&h(n,t)&&(t=l(n,t),i=new Image,i.src=t)})):P.hide(),K.iframe?(i=o("iframe")[0],c in i&&(i[c]=0),u in i&&(i[u]="true"),K.scrolling||(i.scrolling="no"),e(i).attr({src:K.href,name:(new Date).getTime(),"class":Y+"Iframe",allowFullScreen:!0,webkitAllowFullScreen:!0,mozallowfullscreen:!0}).one("load",r).appendTo(E),at.one(rt,function(){i.src="//about:blank"}),K.fastIframe&&e(i).trigger("load")):r(),"fade"===K.transition?w.fadeTo(a,1,t):t())},"fade"===K.transition?w.fadeTo(a,0,function(){G.position(0,s)}):G.position(a,s)}},G.load=function(t){var n,s,c,u=G.prep;q=!0,O=!1,N=T[A],t||a(),Q&&w.add(m).removeClass(Q),K.className&&w.add(m).addClass(K.className),Q=K.className,d(rt),d(tt,K.onLoad),K.h=K.height?r(K.height,"y")-D-_:K.innerHeight&&r(K.innerHeight,"y"),K.w=K.width?r(K.width,"x")-B-z:K.innerWidth&&r(K.innerWidth,"x"),K.mw=K.w,K.mh=K.h,K.maxWidth&&(K.mw=r(K.maxWidth,"x")-B-z,K.mw=K.w&&K.w<K.mw?K.w:K.mw),K.maxHeight&&(K.mh=r(K.maxHeight,"y")-D-_,K.mh=K.h&&K.h<K.mh?K.h:K.mh),n=K.href,$=setTimeout(function(){L.show()},100),K.inline?(c=o(dt).hide().insertBefore(e(n)[0]),at.one(rt,function(){c.replaceWith(E.children())}),u(e(n))):K.iframe?u(" "):K.html?u(K.html):h(K,n)?(n=l(K,n),e(O=new Image).addClass(Y+"Photo").bind("error",function(){K.title=!1,u(o(dt,"Error").html(K.imgError))}).one("load",function(){var e;K.retinaImage&&i.devicePixelRatio>1&&(O.height=O.height/i.devicePixelRatio,O.width=O.width/i.devicePixelRatio),K.scalePhotos&&(s=function(){O.height-=O.height*e,O.width-=O.width*e},K.mw&&O.width>K.mw&&(e=(O.width-K.mw)/O.width,s()),K.mh&&O.height>K.mh&&(e=(O.height-K.mh)/O.height,s())),K.h&&(O.style.marginTop=Math.max(K.mh-O.height,0)/2+"px"),T[1]&&(K.loop||T[A+1])&&(O.style.cursor="pointer",O.onclick=function(){G.next()}),ht&&(O.style.msInterpolationMode="bicubic"),setTimeout(function(){u(O)},1)}),setTimeout(function(){O.src=n},1)):n&&I.load(n,K.data,function(t,i){u("error"===i?o(dt,"Error").html(K.xhrError):e(this).contents())})},G.next=function(){!q&&T[1]&&(K.loop||T[A+1])&&(A=n(1),G.load())},G.prev=function(){!q&&T[1]&&(K.loop||A)&&(A=n(-1),G.load())},G.close=function(){j&&!U&&(U=!0,j=!1,d(ot,K.onCleanup),k.unbind("."+Y+" ."+st),m.fadeTo(200,0),w.stop().fadeTo(300,0,function(){w.add(m).css({opacity:1,cursor:"auto"}).hide(),d(rt),E.empty().remove(),setTimeout(function(){U=!1,d(nt,K.onClosed)},1)}))},G.remove=function(){e([]).add(w).add(m).remove(),w=null,e("."+Z).removeData(V).removeClass(Z),e(t).unbind("click."+Y)},G.element=function(){return e(N)},G.settings=J)})(jQuery,document,window);;

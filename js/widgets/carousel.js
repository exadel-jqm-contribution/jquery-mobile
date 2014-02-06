//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Creates carousel from list of images or html-blocks.
//>>label: Carousel
//>>group: Widgets
//>>css.structure: ../css/structure/jquery.mobile.carousel.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

// Author: Anton Artyukh
// deeperton@gmail.com,
//        aartyukh@exadel.com

define( ["jquery", "../jquery.mobile.widget" ], function ( $ ) {
//>>excludeEnd( "jqmBuildExclude" );

(function ( $, undefined ) {

	$.widget( "mobile.carousel", $.mobile.widget, {
		options:{
			indicators: null,
			indicatorsListClass: "ui-carousel-indicators",
			animationDuration: 250,
			useLegacyAnimation: false,
			showIndicator: true,
			startFrom: 0,
			showTitle: true,
			titleIsText: true,
			usejQMSwipes: false,
			theme: 'a',
			createIndicator: null,
			passOnSwipeEvents: false,
			titleBuildIn: true,
			createTitle: null,
			enabled: true
		},
		_list: null,
		_counter: 0,
		_sliding: false,
		_sliding_type: null,
		_checkBindFunction : function(){
			if ( !Function.prototype.bind ) {
				Function.prototype.bind = function (oThis) {
					if ( typeof this !== "function" ) {
						throw new TypeError( "Function.prototype.bind - what is trying to be bound is not callable" );
					}

					var aArgs = Array.prototype.slice.call( arguments, 1 ),
						fToBind = this,
						fNOP = function () {},
						fBound = function () {
							return fToBind.apply( this instanceof fNOP && oThis ? this : oThis,
								aArgs.concat( Array.prototype.slice.call(arguments)) );
						};

					fNOP.prototype = this.prototype;
					fBound.prototype = new fNOP();

					return fBound;
				};
			}
		},
		_create: function() {
			this._checkBindFunction();
			this._list = $( ".ui-carousel-items", this.element );

			this.options = $.extend( this.options, this.element.data( "options" ) );
			this.options = $.extend( this.options, this.element.data() );

			this.element.addClass( "ui-carousel ui-carousel-theme-" + this.options.theme);

			if ( this.options.showIndicator !== false ) {
				if ( this.options.indicators === null ) {
					this.options.indicators = $('<div></div>');
					this.options.indicators.appendTo(this.element);
				} else if (typeof this.options.indicators === "string") {
					this.options.indicators = $(this.options.indicators);
				}

				this.options.indicators.addClass(this.options.indicatorsListClass);
			}

			if ( this.options.createIndicator === null ) {
				this.options.createIndicator = this._createIndicator.bind(this);
			}

			if ( this.options.createTitle === null ) {
				this.options.createTitle = this._create_title.bind(this);
			}

			if ( !this.options.useLegacyAnimation ) {
				this._animation_meta = this._mainAnimationEnd;

				var is_webview_and_iOS7 = navigator.userAgent.match(/(iPad|iPhone);.*CPU.*OS 7_\d.*(Safari)?/i);
				if (is_webview_and_iOS7 !== null) {
					if (is_webview_and_iOS7[2] != 'Safari') {
						this._animation_meta = this._ios7Webview_AnimationEnd;
					}
				}

				var test = this.element.get(0);
				if ( test.style.webkitTransition !== undefined ) {
					this._animation = this._animation_meta( "webkitTransitionEnd" );
				} else if ( test.style.oTransition !== undefined  ) {
					this._animation = this._animation_meta( "oTransitionEnd" );
				} else if ( test.style.otransition !== undefined  ) {
					this._animation = this._animation_meta( "otransitionend" );
				} else if ( test.style.mozTransition !== undefined  ) {
					this._animation = this._animation_meta( "transitionend" );
				} else if ( test.style.transition !== undefined ) {
					this._animation = this._animation_meta( "transitionend" );
				}
			}

			if (this.options.usejQMSwipes) {
				this.bindEvents = this.__bindEvents;
			}

			this._sliding = false;

			this.__index = parseInt(this.options.startFrom, 10) || 0;

			this._preBindEvents();

			this.bindEvents();

			this.refresh();
		},

		_ios7Webview_AnimationEnd: function( event_name ){
			return function( direction, duration, $active, $next, done_cb ){
				var style = this._list[0].style;

				style.webkitTransitionDuration =
			    style.transitionDuration = this.options.animationDuration + 'ms';

			    style.transform =
			    style.webkitTransform = 'translate(-' + this.__offsets[this.__index] + 'px,0)' + 'translateZ(0)';

				setTimeout( function(){
					done_cb({
						data: {
							next: next.id,
							active: active.id
						}
					});
				}, this.options.animationDuration );
			};
		},

		_mainAnimationEnd: function( event_name ){
			return function( $active, $next, done_cb ){
				this._list.one( event_name, {
					next: $next[0].id,
					active: $active[0].id
				}, done_cb);

				var style = this._list[0].style;
				style.webkitTransitionDuration =
			    style.MozTransitionDuration =
			    style.msTransitionDuration =
			    style.OTransitionDuration =
			    style.transitionDuration = this.options.animationDuration + 'ms';

			    style.webkitTransform = 'translate(-' + this.__offsets[this.__index] + 'px,0)' + 'translateZ(0)';
			    style.msTransform =
			    style.MozTransform =
			    style.OTransform = 'translateX(-' + this.__offsets[this.__index] + 'px)';
			};
		},

		// we need simple unique ids for elements, so we use default jQueryMobile
		// uuid for widget and counter
		_UID: function() {
			this._counter++;
			return this.uuid + "-" + this._counter;
		},

		__enabledFramesList: function(active){
			active = active == undefined ? true : false;
			var r = $( "*[data-type='image'], *[data-type='html']", this._list )
			return !!active ? r.filter(":visible") : r;
		},

		refresh: function( data ) {
			var $list;
			if ( data && $.isArray(data) ) {
				// we can't define compliance of frames and new data
				// in new versions we can add optional support for data-items
				// with specific value of frame ids.
				this.clear();

				$list = $( $.map( data, this._addJSON.bind(this) ) );
			} else {
				// check updates in DOM
				$list = $( "*[data-type='image'], *[data-type='html']", this._list );

				$list.each( this._render_frame.bind(this) );
			};

			this.length = function(length){
				return function(){
					return length;
				};
			}( $list.length );

			this.__enabledFramesList = function(list, visible){
				return function(active){
					return !!active ? visible : list;
				}
			}($list, $list.filter(":visible"));

			// setTimeout(function(){
				this.__init();
				this.to(this.__index);
			// }.bind(this), 0);

			return this;
		},

		unBindEvents: function() {
			if ( $.isFunction(this.__swipe) ) {
				this.element.off( "swipeleft", this.__swipeleft );
				this.element.off( "swiperight", this.__swiperight );
				this.element.off( "swipe", this.__swipe );
				this.element.find( ".ui-right-arrow" ).off( "click", this.__swipeleft );
				this.element.find( ".ui-left-arrow" ).off( "click", this.__swiperight );
			}
		},

		__init: function(){
			this._width = this.element.width();
			this.element.css("visibility", 'hidden');

			var count = this.length();

			this.__offsets = new Array( count );

			this.element.find( '.ui-carousel-items' ).width( (this._width * count) + 'px' );

			this._list.find( '.ui-carousel-item' )
				.css( "width", this._width + 'px' )
				.each(function(i, el){
					el.style.left = this.__offsets[i] = i * this._width;
					$(el).data('itemIndex', i);
				}.bind(this));
			this.element.css("visibility", 'visible');
		},

		_preBindEvents: function(){
			this.__swiperight = this.previous.bind( this );
			this.__swipeleft = this.next.bind( this );

			this.__swipe = function( e ) {
				return this.options.passOnSwipeEvents ? !this._sliding : false;
			}.bind( this );

			this.__resize = function( e ) {
				this.__init();
			}.bind( this );
		},

		bindEvents: function(){
			var touch_support = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
				tm_start = 'mousedown',
				tm_move = 'mousemove',
				tm_end = 'mouseup';

			function tstart(ev){
				var touch = {},
					self = ev.data.self,
					t = self._touch = {};
				if ( typeof ev.originalEvent.touches != 'undefined' ){
					touch = ev.originalEvent.touches[0];
				} else {
					touch = ev.originalEvent;
				}
				t.start = {
					x: touch.pageX,
					y: touch.pageY,
					time: +new Date
				};

				t.isScrolling = undefined;

				t.delta = {};

				self.element.on('touchmove mousemove', {self: self}, tmove);
				self.element.on('touchend mouseup', {self: self}, tend);
			};

			function tmove(ev){
				if ( typeof ev.originalEvent.touches != 'undefined' && ev.originalEvent.touches.length > 1 || ev.originalEvent.scale && ev.originalEvent.scale !== 1) {
					return;
				};

				var touch = {},
					self = ev.data.self,
					t = self._touch;
				if ( typeof ev.originalEvent.touches != 'undefined' ){
					touch = ev.originalEvent.touches[0];
				} else {
					touch = ev.originalEvent;
				}
				t.delta = {
					x: touch.pageX - t.start.x,
					y: touch.pageY - t.start.y
				};

				if ( typeof t.isScrolling == 'undefined') {
					t.isScrolling = !!( t.isScrolling || Math.abs(t.delta.x) < Math.abs(t.delta.y) );
				}

				if ( !t.isScrolling ){
					ev.preventDefault();
				}
			};

			function tend(ev){
				var self = ev.data.self,
					t = self._touch;

				var duration = +new Date - t.start.time,
					direction = t.delta.x < 0 ? "next" : "previous";
					isValidSlide = false;

				isValidSlide = Number(duration) < 250 &&
					Math.abs(t.delta.x) > 20 // jQM checks for 30 px
					|| Math.abs(t.delta.x) > self._width/2;

				if ( !t.isScrolling && isValidSlide) {
					self[direction].call(self);
				}
				self.element.off('touchmove mousemove', tmove);
				self.element.off('touchend mouseup', tend);
			};

			this.element.on("touchstart mousedown", {self: this}, tstart);

			$(window).on('resize', this.__resize);

			this.unBindEvents = function(){
				this.element.off("touchstart mousedown", tstart);
			}
		},

		__bindEvents: function() {
			$(window).on('resize', this.__resize);

			this.element.on({
				swiperight: this.__swiperight,
				swipeleft: this.__swipeleft,
				swipe: this.__swipe
			});

			this.element.find( ".ui-right-arrow" ).on( 'click', this.__swipeleft );
			this.element.find( ".ui-left-arrow" ).on( 'click', this.__swiperight );
		},

		_render_frame: function( index, el, data ) {
			var $el = $( el ),
				params = data || $el.data(),
				$item, $indicator,
				el_id = $el.attr("id") || this._UID(),
				is_new_element = $el.data("_processed") === undefined;

			if ( is_new_element ){
				// if source was cloned one element which already exists...
				$el.removeClass("ui-carousel-active");
				$el.addClass( "ui-carousel-item" ).attr( "id", el_id );
			}

			switch ( params.type ) {
				case "image":
					$item = this._wraperBox( $el, params.title || "" );
					this._load_image( params.imageUrl, $item, $el );
					break;
				case "html":
					this._load_html( $el, params.title || "" );
					break;
			}
			if ( this.options.showIndicator ) {
				if ( !is_new_element ) {
					return;
				}
				var indicator_id = this._UID();
				$indicator = this.options.createIndicator( this.options.indicators, params.title || "");

				$indicator.attr( "id", indicator_id ).data( "targetElement", el_id );
				$el.data( "indicator", indicator_id );

				$indicator.on( "click", {
					move: this.to.bind( this )
				}, function ( event ) {
					var id = "#" + $( this ).data( "targetElement" ),
						$el = $(id);
					event.data.move( $el.data('itemIndex') );
				});

				$indicator
					.on( "show", function( event ) {
						$( this ).addClass('ui-carousel-indicator-active ui-radio-on');
					})
					.on( "hide", function( event ) {
						$( this ).removeClass('ui-carousel-indicator-active ui-radio-on');
					});

				// indicators can have actions for show and hide events
				$el
					.on( "hide", function( event ) {
						$( "#" + $(this).data("indicator") ).trigger( "hide" );
					})
					.on( "show" , function( event ) {
						$( "#" + $(this).data("indicator") ).trigger( "show" );
					});
			}
			$el.data("_processed", el_id);
		},

		// one place for wrap frame content
		_wraperBox: function( el, title ) {
			var box;
			if ( $(".ui-carousel-box", el).length === 0 ){
				box = $( "<div></div>" )
					.addClass( "ui-carousel-box" )
					.appendTo( el );
			} else {
				box = $(".ui-carousel-box", el);
			}

			if ( this.options.showTitle ) {
				this.options.createTitle( title, el );
			}

			return box;
		},

		// widget implementation for title renderer
		_create_title: function( title_str, target ) {
			var title = $( ".ui-carousel-title", target );
			var text_function = this.options.titleIsText ? "text" : "html";
			// just update
			if ( title.length > 0 ){
				if ( this.options.titleBuildIn ) {
					$( ".ui-carousel-title-inside", title ).text( title_str );
				} else {
					title.text( title_str );
				}
				return title;
			}
			// create title block
			title = $( "<div></div>" );
			title.addClass( "ui-carousel-title" );
			// by default styles title will occupy whole space on the bottom of frame
			// with this option title will be sized in limited space
			if ( this.options.titleBuildIn ) {
				var el = $( "<div></div>" ).addClass( "ui-carousel-title-inside" );
				el[text_function]( title_str ).appendTo( title );
			} else {
				title[text_function]( title_str );
			}
			// place title at the end of frame.
			title.appendTo( target );
			return title;
		},

		_load_image: function( url, target, parent ) {
			var img,
				error = function () {};
			// check if image exists, then check src attribute, may be we must update image
			if ( $("img", target).length > 0 ) {
				img = $("img:first", target);
				if ( img.attr("src") == url ) {
					parent.trigger( "ready", { item: parent });
					return;
				}
			}
			// simple image pre loader
			img = new Image();
			img.onload = function() {
				target.empty();
				target.css( 'background-image', 'url(' + url + ')' );
				target.data('imageUrl', url);
				parent.trigger( "ready", {
					item: parent
				});
			};

			img.onerror = error;
			img.onabort = error;
			img.src = url;
		},

		_load_html: function( $el, title ) {
			var content, item;

			if ( $(".ui-carousel-box", $el).length !== 0 ){
				// update only for title.
				this._wraperBox( $el, title );
				$el.trigger( "ready" );
				return;
			}
			content = $el.children().detach();
			$el.html( "" );
			item = this._wraperBox( $el, title );
			item.append(content);

			$el.trigger( "ready" );
		},

		_addJSON: function( item ) {
			var el = $( "<div></div>" );

			if ( arguments.length > 1 ){
				// when we use jQuery.each we receiving in first argument INDEX of element
				item = (typeof arguments[0] == 'object' ? arguments[0] : arguments[1])
			}

			item.imageUrl = item.type == "image" ? item.content : "";

			el.data( {
				type: item.type || "html",
				title: item.title || "",
				imageUrl: item.imageUrl || ""
			});
			el.html( (item.type == "image" ? "" : item.content || "") );
			el.appendTo( this._list );
			if ( item.onReady ) {
				el.on( "ready", item.onReady );
			}
			if ( item.onShow ) {
				el.on( "show", item.onShow );
			}
			if (item.onHide) {
				el.on( "hide", item.onHide );
			}
			this._render_frame( this._list.find(".ui-carousel-item").length, el );
			return el;
		},

		add: function( type, title, content, onReady, onShow, onHide) {
			var result = false;
			if ( $.isArray(type) ) {
				$.each( type, this._addJSON.bind(this) );
				result = this;
			} else if ( $.isPlainObject( type ) ) {
				result = this._addJSON( type );
			} else {
				result = this._addJSON({
					type: type,
					content: content,
					title: title,
					onReady: onReady,
					onShow: onShow
				});
			}
			return result;
		},

		next: function() {
			if ( !this._sliding ) {
				this.element.trigger( "beforenext" );
				this.to( this._circle(this.__index + 1) );
				return !!this.options.passOnSwipeEvents;
			}
			return false;
		},

		previous: function() {
			if ( !this._sliding ) {
				this.element.trigger("beforeprev" );
				this.to( this._circle(this.__index - 1) );
				return !!this.options.passOnSwipeEvents;
			}
			return false;
		},

		_circle: function(index) {
			return (this.length() + (index % this.length())) % this.length();
		},

		to: function( index ) {
			this.__index = parseInt( index, 10 ) || 0;
			this.element.trigger( "goto", this.__index );
			this.slide( false, this.__enabledFramesList().eq( this.__index ) );
			return this;
		},

		slide: function( move_type, $next ) {
			if ( this._sliding || !this.options.enabled ) {
				return;
			}

			if ( ['next', 'prev'].indexOf(move_type) === -1 ) {
				// figure out type of slid if we jump to the specific frame
				move_type = $($next).nextAll(".ui-carousel-active").length === 0 ? "next" : "prev";
			}

			var $flist = this.__enabledFramesList(),
				direction = move_type == "next" ? 1 : -1,
				$active = this.__enabledFramesList().filter(".ui-carousel-active");

			// in the beginning we doesn't have any active frames
			if ( $active.length === 0 ) {
				$next.addClass( "ui-carousel-active" ).trigger( "show" );
				// so animation is not necessary
				return true;
			}

			$next.trigger( "beforeshow" );
			this.element.trigger( "slidingstart", move_type );

			var done = function(ev) {

				$("#" + ev.data.active).removeClass( "ui-carousel-active" ).trigger( "hide" );
				$("#" + ev.data.next).addClass( "ui-carousel-active" ).trigger( "show" );
				this._sliding = false;
				this.element.trigger( "slidingdone", this._sliding_type);
			};

			this._animation( $active, $next, done.bind(this) );

			// prevent any sliding before main sliding is done
			this._sliding = true;
			this._sliding_type = move_type;

			return true;
		},

		_animation: function( $active, $next, done_cb ) {
			this._list.animate({
				left: -1*this.__offsets[this.__index]
			},{
				duration: this.options.animationDuration,
				complete: done_cb.bind(this, {
					data:{
						active: $active.attr( "id" ),
						next: $next.attr( "id" )
					}
				})
			});
		},


		getFrame: function( index ) {
			var f = $( ".ui-carousel-item:eq(" + index + ")", this.element );
			if ( f.length === 0 ) {
				return false;
			}
			return f;
		},

		eachItem: function(callback) {
			this._list.find(".ui-carousel-item").each(callback);
			return this;
		},

		remove: function( index, $el ) {
			//debugger;
			if ( typeof index == 'object' ){
				$el = $( index );
				index = $el.data( 'itemIndex' )-0;
			} else {
				index = parseInt( index, 10 );
				if ( $el === undefined ) {
					$el = this._list.find( ".ui-carousel-item" ).eq( index );
				} else {
					index = $el.data( 'itemIndex' )-0;
				}
			}

			var $indicator = $( "#" + $el.data("indicator") );

			// if frame is active we need move carousel to the next frame before remove it.
			if ( index == this.__index ) {
				// and bind last event action
				$el.one( "hide", this.remove.bind(this, $el) );
				this.next();
			} else {
				this._remove( index, $el );
			}
			return this;
		},

		_remove: function( index, el ) {
			console.log( '_remove' );
			var $el = $(el),
				// indicator can be in any part of DOM,
				// so we use only previously saved id for find it.
				$indicator = $( "#" + $el.data("indicator") );
			$el.trigger( "itemremove" ).off();
			$indicator.trigger( "itemremove" ).off();
			$indicator.remove();
			$el.remove();
			this.refresh();
		},

		clear: function( done ) {
			this.element.trigger("clear_all");
			$(".ui-carousel-item", this.element).each(this._remove.bind(this));
			this.refresh();
		},

		_createIndicator: function( list, title) {
			var indicator = $( "<div></div>" );
			indicator.addClass( "ui-carousel-indicator" );
			indicator.attr( "title", title );
			indicator.appendTo( list );
			return indicator;
		}
	});
	$( document ).bind( "pageshow", function( e ) {
		$( document ).trigger( "ui-carouselbeforecreate" );
		var c = $( ":jqmData(role='carousel')", e.target ).carousel();
		$( ":jqmData(role='carousel')", e.target ).carousel( "bindEvents" );
		return c;
	}).bind( "pagehide", function( e ){
		return $( ":jqmData(role='carousel')", e.target ).carousel( "unBindEvents" );
	} );
}( jQuery ));
//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd( "jqmBuildExclude" );

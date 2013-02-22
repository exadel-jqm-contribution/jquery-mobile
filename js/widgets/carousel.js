//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Creates carousel of images or html-blocks.
//>>label: Carousel
//>>group: Widgets
//>>css.structure: ../css/structure/jquery.mobile.carousel.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

define( ["jquery", "../jquery.mobile.widget" ], function ( $ ) {
//>>excludeEnd( "jqmBuildExclude" );
(function ( $, undefined ) {
	$.widget( "mobile.carousel", $.mobile.widget, {
		options:{
			indicators: null,
			indicatorsListClass: "ui-carousel-indicators",
			animationDuration: 250,
			showIndicator: true,
			showTitle: true,
			createIndicator: null,
			titleBuildIn: false,
			createTitle: null,
			enabled: true,
			dependent: false,

		},
		_list: null,
		_counter: 0,
		_create: function() {
			this.element.addClass( "ui-carousel" );
			this._list = $( ".ui-carousel-items", this.element );
			this.options = $.extend( this.options, this.element.data( "options" ) );
			this.options = $.extend( this.options, this.element.data() );

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

			this._bindEvents();
			this.refresh();
			this.to(0);
		},

		_UID: function() {
			this._counter++;
			return this.uuid + "-" + this._counter;
		},

		refresh: function( data ) {
			if ( data && $.isArray(data) ) {
				this.clear();
				$.each( data, this._addJSON.bind(this) );
				this.to(0);
				return;
			}

			$( "*[data-type]", this._list ).each( $.proxy( this._render_frame, this ) );
		},

		_bindEvents: function() {
			this.element.on( "swipeleft", this.next.bind(this) );
			this.element.on( "swiperight", this.previous.bind(this) );
			this.element.find( ".ui-right-arrow" ).on('click', this.next.bind(this));
			this.element.find( ".ui-left-arrow" ).on('click', this.previous.bind(this));
		},

		_render_frame: function( index, el, data ) {
			var $el = $( el ),
				params = data || $el.data(),
				$item, $indicator,
				el_id = this._UID(),
				new_element = $el.data("_processed") == null;

			new_element && $el.addClass( "ui-carousel-item" ).attr("id", el_id);

			switch ( params.type ) {
				case "image":
					$item = this._wraperBox( $el, params.title || "" );
					this._load_image( params.imageUrl, $item, $el );
					break;
				case "html":
					this._load_html( $el, params.title || "" );
					break;
			}
			if ( this.options.showIndicator) {
				if ( !new_element ) {
					return;
				}
				var indicator_id = this._UID();
				$indicator = this.options.createIndicator( this.options.indicators, params.title || "");

				$indicator.attr( "id", indicator_id ).data( "targetElement", el_id );
				$el.data( "indicator", indicator_id );

				if ( !this.options.dependent ) {
					$indicator.on( "click", {
						move: this.slide.bind( this, false )
					}, function ( event ) {
						var id = $( this ).data( "targetElement" );
						event.data.move( $("#" + id), event );
					});
				}

				$indicator
					.on( "show", function( event ) {
						$( this ).addClass('ui-carousel-indicator-active');
					})
					.on( "hide", function( event ) {
						$( this ).removeClass('ui-carousel-indicator-active');
					});

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

		_wraperBox: function( el, title ) {
			var box;
			if ( $(".ui-carousel-box", el).length == 0 ){
				box = $( "<div></div>" )
					.addClass( "ui-carousel-box" )
					.appendTo( el );
			} else {
				box = $(".ui-carousel-box", el);
			}

			this.options.showTitle && this.options.createTitle( title, el );

			return box;
		},

		_create_title: function( title_str, target ) {
			var title = $( ".ui-carousel-title", target );
			// just update
			if ( title.length > 0 ){
				if ( this.options.titleBuildIn ) {
					$( ".ui-carousel-title-inside", title ).text( title_str );
				} else {
					title.text( title_str );
				}
				return title;
			}
			// create title
			title = $( "<div></div>" );
			title.addClass( "ui-carousel-title" );
			if ( this.options.titleBuildIn ) {
				$( "<div></div>" )
					.addClass( "ui-carousel-title-inside" )
					.text(title_str)
					.appendTo(title);
			} else {
				title.text(title_str);
			}
			title.appendTo( target );
			return title;
		},

		_load_image: function( url, target, parent ) {
			var img,
				error = function () {};

			if ( $("img", target).length > 0 ) {
				img = $("img:first", target)
				if ( img.attr("src") == url ) {
					return;
				}
			}

			img = new Image();
			img.onload = function() {
				var $img = $(this);
				$img.addClass( "ui-carousel-content" );
				target.empty();
				$img.appendTo( target );
				parent.trigger( "ready", {
					item: parent
				});
			};

			img.onerror = error;
			img.onabort = error;
			img.src = url;
		},

		_load_html: function( $el, title ) {
			var content = $el.html(),
				item;
			$el.html( "" );
			item = this._wraperBox( $el, title );
			item.html(content);
			$el.trigger( "ready" );
		},

		_addJSON: function( /* , item */ ) {
			// when we use jQuery.each we receiving in first argument INDEX of element
			var item = arguments[arguments.length - 1],
				el = $( "<div></div>" );

			item.imageUrl = item.type == "image" ? item.content : "";

			el.data( {
				type: item.type || "html",
				title: item.title || "",
				imageUrl: item.imageUrl || ""
			});
			el.html( (item.type == "image" ? "" : item.content || "") );
			el.appendTo( this._list );
			item.onReady && el.on( "ready", item.onReady );
			item.onShow && el.on( "show", item.onShow );
			item.onHide && el.on( "hide", item.onHide );
			this._render_frame( this._list.find(".ui-carousel-item").length, el );
			return el;
		},

		add: function( type, title, content, onReady, onShow, onHide) {
			var result = false;
			if ( $.isArray(type) ) {
				$.each(type, this._addJSON.bind(this));
				result = true;
			} else if ( $.isPlainObject(type) ) {
				result = this._addJSON(type);
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

		next: function(e) {
			if ( this.options.dependent && e ) {
				return false;
			}
			return this.slide( "next" );
		},

		previous: function(e) {
			if ( this.options.dependent && e ) {
				return false;
			}
			return this.slide( "prev" );
		},

		slide: function( type, next ) {
			var $active = this.element.find( ".ui-carousel-item.ui-carousel-active" ),
				$next = next || $active[type]( ".ui-carousel-item" );

			if ( $active.length === 0 ) {
				$next.trigger( "beforeshow" );
				$next.addClass( "ui-carousel-active" ).trigger( "show" );
				return true;
			}

			if ( !this.options.enabled ) {
				return false;
			}

			if ( type !== "next" && type !== "prev" ) {
				type = $next.nextAll(".ui-carousel-active").length == 0 ? "next" : "prev";
			}

			var	direction = type == "next" ? 1 : -1,
				fallback = type == "next" ? "first" : "last";

			if ( $next.hasClass("ui-carousel-active") ) {
				return false;
			}

			$next = $next.length ? $next : this.element.find( ".ui-carousel-item" )[fallback]();

			$next.trigger( "beforeshow" );

			$next.css( "left", ( 100 * direction ) + '%' );

			$active.animate( {
				left: ( 100 * direction * -1 ) + '%'
			}, {
				duration: this.options.animationDuration,
				complete: function() {
					$active.removeClass( "ui-carousel-active" ).trigger( "hide" );
					$next.addClass( "ui-carousel-active" ).trigger( "show" );
				},
				step: function( now, fx ) {
					$next.css( "left", (100 * direction + now) + "%" );
				}
			});
			return true;
		},

		to: function( index, e ) {
			if ( this.options.dependent && e ) {
				return false;
			}
			var $el = $( ".ui-carousel-item:eq(" + index + ")", this.element );
			return this.slide( null, $el );
		},

		getFrame: function( index ) {
			var f = $( ".ui-carousel-item:eq(" + index + ")", this.element );
			if ( f.length === 0 ) {
				return false;
			}
			return f;
		},

		length: function() {
			return this._list.find(".ui-carousel-item").length;
		},

		remove: function( index, el ) {
			if ( el == undefined ) {
				el = this._list.find( ".ui-carousel-item:eq(" + index + ")" );
			}
			var $el = $(el),
				$indicator = $( "#" + $el.data("indicator") );

			if ( $el.hasClass("ui-carousel-active") ) {
				$el.one( "hide", this.remove.bind(this, index, $el) );
				this.next();
			} else {
				this._remove( index, el );
			}
			return this;
		},

		_remove: function( index, el ) {
			var $el = $(el),
				$indicator = $( "#" + $el.data("indicator") );
			$indicator.trigger( "itemremove" ).off();
			$el.trigger( "itemremove" ).off();
			$indicator.remove();
			$el.remove();
		},

		clear: function( done ) {
			$(".ui-carousel-item", this.element).each(this._remove.bind(this));
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
		return $( ":jqmData(role='carousel')", e.target ).carousel();
	});
})( jQuery );

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd( "jqmBuildExclude" );

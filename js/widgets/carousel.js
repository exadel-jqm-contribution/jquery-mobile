//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Creates collapsible content blocks.
//>>label: Collapsible
//>>group: Widgets
//>>css.structure: ../css/structure/jquery.mobile.collapsible.css
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
			depended: false
		},
		_list: null,
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

		refresh: function() {
			$( "*[data-type]", this._list ).each( $.proxy( this._render_frame, this ) );
		},

		_bindEvents: function() {
			this.element.on( "swipeleft", this.next.bind(this) );
			this.element.on( "swiperight", this.previous.bind(this) );
			this.element.find( ".ui-right-arrow" ).on('click', this.next.bind(this));
			this.element.find( ".ui-left-arrow" ).on('click', this.previous.bind(this));
		},

		_wraperBox: function( el, title) {
			var box = $( "<div></div>" );
			box.addClass( "ui-carousel-box" );
			box.appendTo( el );

			this.options.showTitle && this._create_title( title, el );

			return box;
		},

		_create_title: function( title_str, target ) {
			var title = $( "<div></div>" ),
				inside = null;
			title.addClass( "ui-carousel-title" );
			if ( this.options.titleBuildIn ) {
				inside = $( "<div></div>" );
				inside.addClass( "ui-carousel-title-inside" );
				inside.text(title_str);
				inside.appendTo(title);
			} else {
				title.text(title_str);
			}
			title.appendTo( target );
			return title;
		},

		_load_image: function( url, target, parent ) {
			var img = new Image(),
				error = function () {};
			img.onload = function() {
				var $img = $(this);
				$img.addClass( "ui-carousel-content" );
				$img.appendTo( target );
				parent.trigger( "ready", {item: parent} );
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

		add: function( type, title, content, onShow) {
			var el = $( "<div></div>" ),
				imageUrl = type == "image" ? content : "";

			el.data( {
				type: type,
				title: title,
				imageUrl: imageUrl
			});
			el.html( (type == "image" ? "" : content) );
			el.appendTo( this._list );
			onShow && el.on( "show", onShow );
			this._render_frame( this._list.length-1, el);
			return el;
		},

		next: function(e) {
			if ( this.options.depended && e ) {
				return;
			}
			this.slide( "next" );
		},

		previous: function(e) {
			if ( this.options.depended && e ) {
				return;
			}
			this.slide( "prev" );
		},

		slide: function( type, next ) {
			var $active = this.element.find( ".ui-carousel-item.ui-carousel-active" ),
				$next = next || $active[type]( ".ui-carousel-item" );

			if ( $active.length === 0 ) {
				$next.trigger( "show" );
				return;
			}

			if ( !this.options.enabled ) {
				return;
			}

			if ( type !== "next" && type !== "prev" ) {
				type = $next.nextAll(".ui-carousel-active").length == 0 ? "next" : "prev";
			}

			var	direction = type == "next" ? 1 : -1,
				fallback = type == "next" ? "first" : "last";

			if ( $next.hasClass( "ui-carousel-active" ) ) {
				return;
			}

			$next = $next.length ? $next : this.element.find( ".ui-carousel-item" )[fallback]();

			$next.trigger( "beforeshow" );

			$next.css( "left", ( 100 * direction ) + '%' );
			$active.animate( {
				left: ( 100 * direction * -1 ) + '%'
			}, {
				duration: this.options.animationDuration,
				complete: function() {
					$active.trigger( "hide" );
					$next.trigger( "show" );
				},
				step: function( now, fx ) {
					$next.css( "left", (100 * direction + now) + "%" );
				}
			});
		},

		to: function ( index, e ) {
			if ( this.options.depended && e ) {
				return;
			}
			var $el = $( ".ui-carousel-item:eq(" + index + ")", this.element );
			this.slide( null, $el );
		},

		getFrame: function ( index ) {
			var f = $( ".ui-carousel-item:eq(" + index + ")", this.element );
			if ( f.length === 0 ) {
				return false;
			}
			return f;
		},

		_render_frame: function( index, el ) {
			var $el = $( el ),
				params = $el.data(),
				item, indicator;
			$el.addClass( "ui-carousel-item" );

			switch ( params.type ) {
				case "image":
					item = this._wraperBox( $el, params.title || "''" );
					this._load_image( params.imageUrl, item, $el );
					break;
				case "html":
					this._load_html( $el, params.title || "" );
					break;
			}
			if ( this.options.showIndicator) {
				indicator = this._createIndicator( this.options.indicators, params.title || "" );
				indicator.data( "slideTo", index );

				if ( !this.options.depended ) {
					indicator.on( "click", {
						move: this.to.bind( this )
					}, function ( event ) {
						var n = $( this ).data( "slideTo" );
						event.data.move( n, event );
					});
				}

				indicator.on( "show", function( event ) {
					$( this ).addClass('ui-carousel-indicator-active');
				});
				indicator.on( "hide", function( event ) {
					$( this ).removeClass('ui-carousel-indicator-active');
				});
				$el.data( "indicator", indicator.get(0) );
				$el.on( "hide", function( event ) {
					$($( this ).data( "indicator" )).trigger( "hide" );
				});
				$el.on( "show" , function( event ) {
					$($( this ).data( "indicator" )).trigger( "show" );
				});
			}

			$el.on( "hide", function( event ) {
				$( this ).removeClass( "ui-carousel-active" );
			});
			$el.on( "show" , function( event ) {
				$( this ).addClass( "ui-carousel-active" );
			});
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

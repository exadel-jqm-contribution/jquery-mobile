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
			options: {
				viewPortWidth: 0,
				viewPortHeight: 0,
				showLinks: true,
				linksBefore: true,
				linksEnabled: true,
				linksSize: 40,
				cycle: true,
				startFrom: 0,
				animationDuration: 240,
				titleTag: "span"
			},
			_cursor: 0,
			_cursor_next: 1,
			_nextItem: false,
			_items: [],
			_links: null,
			_loaded_items: 0,
			_create: function() {
				this.element.addClass( "ui-carousel" );

				this.options = $.extend( this.options, this.element.data( "options" ) );

				if (this.options.viewPortWidth === 0) {
					this.options.viewPortWidth = this.element.width();
				}
				if (this.options.viewPortHeight === 0) {
					this.options.viewPortHeight =
						$.mobile.getScreenHeight() - (this.options.showLinks ? this.options.linksSize : 0);
				}

				this.element.css( "min-height", this.options.viewPortHeight );

				this._links = $( "<div> </div>" );
				if (this.options.showLinks) {
					this._links.addClass( "ui-carousel-links" );
					if (this.options.linksBefore) {
						this._links.prependTo( this.element );
					} else {
						this._links.appendTo( this.element );
					}
				}

				this._bindEvents();

				this.refresh();
				this.moveTo( this.options.startFrom || 0 );
			},

			_bindEvents: function() {
				this.element.on( "swipeleft", this.next.bind(this) );
				this.element.on( "swiperight", this.prev.bind(this) );
			},

			_UID: function() {
				return this.uuid + "-" + this._items.length;
			},

			_wraperBox: function ( box_width_str ) {
				var box = $( "<div />" );
				box.addClass( "ui-carousel-box" );
				box.css( "max-width", box_width_str );
				return box;
			},

			_onCompleteImageLoad: function ( self, $li ) {
				if (this.width > this.height) {
					this.style.width = "95%";
				} else {
					this.style.height = "90%";
				}
				var box = self._wraperBox( this.width );
				if ($li.data( "title" )) {
					var title = $( "<" + self.options.titleTag + " />" ).addClass( "ui-carousel-item-title" );
					title.text( $li.data("title") );
					title.appendTo( box );
				}
				$( this ).appendTo( box );
				$li.html( '' );
				box.appendTo( $li );
				self._loaded_items++;
				$li.trigger( "ready" );
				self._trigger( "itemadd", {
					itemType: "image",
					el: $li
				});
				self._trigger( "itemimageadd", {
					el: $li
				});
			},

			_onFailureImageLoad: function ( imageUrl, $li, type ) {
				this._trigger( "failload", {
					itemType: "image",
					item: imageUrl
				});
				this._trigger( "failimageload", {
					item: imageUrl
				});
				$li.trigger( "failure", {
					type: type
				});
			},

			_image_add: function ( $li ) {
				var img = new Image(),
					imageUrl = $li.data( "imageUrl" );
				img.onload = this._onCompleteImageLoad.bind( img, this, $li );
				img.onerror = this._onFailureImageLoad.bind( this, imageUrl, $li, "error" );
				img.onabort = this._onFailureImageLoad.bind( this, imageUrl, $li, "abort" );
				img.src = imageUrl;
			},

			_raw_html_add: function ( $li ) {
				var $box = this._wraperBox( $li.width() );

				$( "*", $li ).detach().appendTo( $box );
				$box.appendTo( $li );
				$li.trigger( "ready" );
				this._loaded_items++;
			},

			render_slide: function ( i, li ) {
				var $li = $( li ),
					mode = $li.data();

				mode.itemType = mode.itemType || "html";

				var UUID = mode.itemType + this._UID();

				$li.addClass( "ui-carousel-item" );
				$li.attr("id", "item" + UUID);

				this._add_link( $li, UUID );

				switch ( mode.itemType ) {
					case "image":
						this._image_add( $li );
						break;

					case "html":
						this._raw_html_add( $li );
						break;
				}

				$li.addClass('ui-carousel-' + mode.itemType);

				this._items.push( {
					item: $li,
					itemType: mode.itemType
				});
			},

			_add_link: function( $li, uuid) {
				var link = $( "<a>&nbsp;</a>" ),
					link_id = "link" + uuid;
				link.addClass( "ui-carousel-link" ).addClass( "ui-carousel-item-loading" );
				if ( $li.data( "href" ) ) {
					link.attr( "href", $li.data("href") );
				}

				link.attr( "id", link_id );

				$li.on( "ready", {
					link: "#" + link_id
				}, $.proxy( function( event ) {
					$( event.data.link ).removeClass( "ui-carousel-item-loading" );
				}, this));

				$li.on( "show", {
					link: "#" + link_id
				}, $.proxy( function( event) {
					$( event.data.link ).addClass( "ui-carousel-link-selected" );
				}, this));

				if (this.options.linksEnabled) {
					link.on("click", this.moveTo.bind(this, this._items.length));
				}

				link.appendTo( this._links );
			},

			_animate: function( direction, next_item, onReady) {
				var current_item = $("li.ui-carousel-show", this.element);
				if (current_item.length === 0) {
					current_item = $("li.ui-carousel-item:first", this.element);
					current_item.css("right", "0%");
					onReady(null, next_item);
					return;
				}

				switch (direction) {
				case "next":
					next_item.css("right", "-100%");
					$( current_item ).animate({
						right: "100%"
					}, {
						duration: this.options.animationDuration,
						complete: onReady.bind(this, current_item, next_item),
						step: function( now, fx ) {
							next_item.css("right", (now - 100) + "%");
						}
					});
					break;
				case "prev":
					next_item.css("right", "100%");
					$( current_item ).animate({right: "-100%"}, {
						duration: this.options.animationDuration,
						complete: onReady.bind(this, current_item, next_item),
						step: function( now, fx) {
							next_item.css("right", (100 + now) + "%");
						}
					});
					break;
				default:
					next_item.css("right", "-100%");
					$( current_item ).animate({right: "100%"}, {
						duration: this.options.animationDuration,
						complete: onReady.bind(this, current_item, next_item),
						step: function( now, fx) {
							next_item.css("right", (100 - now) + "%");
						}
					});
					break;
				}
			},

			_process_index: function( index ) {
				if (this.options.cycle) {
					index = index > this._loaded_items ? 0 : index;
					index = index < 0 ? this._loaded_items.length : index;
				} else {
					index = index > this._loaded_items ? this._loaded_items - 1 : index;
					index = index < 0 ? 0 : index;
				}
				return index;
			},

			moveTo: function( index, direction, event) {
				if (index === undefined) {
					index = this._cursor_next;
				}

				this._cursor = this._process_index(index);

				var next_item = this.currentFrame();

				this._animate( direction, next_item, $.proxy( function( prev_item, next_item ) {
					$( "li.ui-carousel-item", this.element ).removeClass( "ui-carousel-show" );
					next_item.addClass( "ui-carousel-show" );
					this._links.find( ".ui-carousel-link" ).removeClass( "ui-carousel-link-selected" );
					this._trigger( "moveto", "moveto", this._cursor );
					if ( prev_item ) {
						prev_item.trigger( "hide" );
					}
					next_item.trigger( "show" );
				}, this ) );
			},

			next: function() {
				this._cursor_next = this._cursor + 1;
				this.moveTo( this._cursor_next, "next" );
				this._trigger( "stepnext", "stepnext", this._cursor );
			},

			prev: function() {
				this._cursor_next = this._cursor - 1;
				this.moveTo( this._cursor_next, "prev" );
				this._trigger( "stepprev", this._cursor );
			},

			currentIndex: function() {
				return this._cursor;
			},

			currentFrame: function() {
				return this._items[this._cursor].item;
			},

			frame: function( index ) {
				index = this._process_index( index );
				return this._items[ index ].item;
			},

			setNextFrame: function( frame) {
				if ( typeof frame == "number" ) {
					this._cursor_next = frame - 1;
				}
			},

			refresh: function() {
				$( "li[data-item-type]", this.element ).each( $.proxy( function( index, el ) {
					this.render_slide( index, el );
				}, this ) );
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

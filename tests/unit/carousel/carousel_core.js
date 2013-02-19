/*
 * mobile carousel unit tests
 */
(function($){
	module( "query.mobile.carousel.js" );

	var animation_time = 160;

	asyncTest( "go to next slides", function() {
		expect( 2 );
		var c = $( "#carousel" ),
			$frame = c.carousel( "getFrame", 1 );
		$frame.on( "show", function() {
			ok( $(".ui-carousel-item:eq(1)", c).hasClass("ui-carousel-active"), "current slide must have class .ui-carousel-active" );
			ok( $(".ui-carousel-active", c).length === 1, "only one item has .ui-carousel-active" );
		 	start();
		});
		c.carousel( "next" );
	});

	asyncTest( "go to prev (LAST) slide", function() {
		var c = $( "#carousel2" );
		expect( 2 );
		var $frame = c.carousel( "getFrame", c.carousel( "length" ) - 1 );
		$frame.on( "show", function() {
			ok( $(".ui-carousel-item:last", c).hasClass("ui-carousel-active"), "current slide must have class .ui-carousel-active" );
			ok( !$(".ui-carousel-item:first", c).hasClass("ui-carousel-active"), "second slide can't have class .ui-carousel-active" );
			start();
		});
		c.carousel( "previous" );
	});

	asyncTest( "go to specific slide", function() {
		var c = $( "#carousel3" );
		expect( 1 );
		var $frame = c.carousel( "getFrame", 3 );
		$frame.on( "show", function() {
			ok( $(".ui-carousel-item:eq(3)", c).hasClass("ui-carousel-active"), "current slide (4) must have class .ui-carousel-active" );
			start();
		});
		c.carousel( "to", 3 );
	});

	asyncTest( "wait hide event for specific slide", function() {
		expect( 1 );
		var c = $( "#carousel4" );
		var frame = c.carousel('getFrame', 0);
		c.carousel( "to", 0);
		frame.on( "hide", function(event) {
			ok(true, "fire HIDE event");
			start();
		});
		c.carousel('to', 3);
	});



})( jQuery );

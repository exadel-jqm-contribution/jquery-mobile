/*
 * mobile carousel unit tests
 */
(function($){
	module( "jquery.mobile.carousel.js" );
	var c = $( "#carousel" );
	var animation_time = 30;

	test( "widget must load 2 images and 2 text blocks", function() {
		ok( $("li.ui-carousel-image", c ).length == 2, "2 images" );
		ok( $("li.ui-carousel-html", c ).length == 2, "2 text blocks" );
	});

	asyncTest( "go to next slides", function() {
		expect( 3 );
		c.carousel( "next" );
		setTimeout( function () {
			ok( c.carousel("currentIndex") == 1, "after first NEXT, cursor must by on second slide" );
			ok( $("li.ui-carousel-item:eq(1)", c).hasClass("ui-carousel-show"), "current slide must have class .ui-carousel-show" );
			ok( $("li.ui-carousel-show", c).length === 1, "only one item has .ui-carousel-show" );
		 	start();
		}, animation_time);
	});

	asyncTest( "go to prev slides", function() {
		expect( 3 );
		c.carousel( "prev" );
		setTimeout( function () {
			ok( c.carousel("currentIndex") == 0, "after first PREV, cursor must by on first slide" );
			ok( $("li.ui-carousel-item:eq(0)", c).hasClass("ui-carousel-show"), "current slide must have class .ui-carousel-show" );
			ok( !$("li.ui-carousel-item:eq(1)", c).hasClass("ui-carousel-show"), "second slide can't have class .ui-carousel-show" );
			start();
		}, animation_time);
	});

	asyncTest( "go to specific slide", function() {
		expect( 2 );
		c.carousel( 'moveTo', 3 );
		setTimeout( function () {
			ok( c.carousel("currentIndex") === 3, "current slide == 4" );
			ok( $("li.ui-carousel-item:eq(3)", c).hasClass("ui-carousel-show"), "current slide (4) must have class .ui-carousel-show" );
			start();
		}, animation_time * 2); // we have 2 moves, both have animation.
	});

	asyncTest( "wait show event for specific slide", function() {
		expect( 1 );
		c.carousel('moveTo', 0);
		var frame = c.carousel('frame', 3);
		frame.on( 'show', function(event) {
			ok(true, 'fire show event');
			start();
		});
		c.carousel('moveTo', 3);
	});



})( jQuery );

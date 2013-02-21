/*
 * mobile carousel unit tests
 */
(function($){
	module( "query.mobile.carousel.js" );

	var animation_time = 160;

	asyncTest( "go to next slides", function() {
		expect( 2 );
		var c = $( "#carousel" ).carousel(),
			$frame = c.carousel( "getFrame", 1 );
		$frame.on( "show", function() {
			ok( $(".ui-carousel-item:eq(1)", c).hasClass("ui-carousel-active"), "current slide must have class .ui-carousel-active" );
			ok( $(".ui-carousel-active", c).length === 1, "only one item has .ui-carousel-active" );
		 	start();
		});
		c.carousel( "next" );
	});

	asyncTest( "go to prev (LAST) slide", function() {
		var c = $( "#carousel" ).carousel();
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
		var c = $( "#carousel" ).carousel();
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
		var c = $( "#carousel" ).carousel();
		var frame = c.carousel('getFrame', 0);
		c.carousel( "to", 0);
		frame.on( "hide", function(event) {
			ok(true, "fire HIDE event");
			start();
		});
		c.carousel('to', 3);
	});

	asyncTest( "test beforeshow event", function() {
		expect( 1 );
		var c = $( "#carousel" ).carousel();
		var frame = c.carousel('getFrame', 1);
		c.carousel( "to", 0);
		frame.on( "beforeshow", function(event) {
			ok(true, "fire beforeshow event");
			start();
		});
		c.carousel('to', 1);
	});

	test( "test depended carousel", function() {
		var c = $( "#carousel" ).carousel({depended: true}),
			clickEvent = $.Event("click"),
			touchEvent = $.Event("swiperight");
		ok( !c.carousel("next", clickEvent), "can't move Next by clicking" );
		ok( !c.carousel("previous", clickEvent), "can't move Previous by clicking" );
		ok( !c.carousel("next", touchEvent), "can't move Next by swiperight" );
		ok( !c.carousel("to", 3, clickEvent), "can't move To by clicking" );
		ok( c.carousel("to", 3), "can move To by using API call (without Event Click)" );
		ok( c.carousel("next"), "can move Next by using API call (without Event Click)" );
		ok( c.carousel("previous"), "can move Previous by using API call (without Event Click)" );
	} );

	test( "test owned indicators", function() {
		var owned_indicators = $( "<div><ul></ul></div>" );
		owned_indicators.addClass("owned_indicators").appendTo("#qunit-fixture");
		owned_indicators = owned_indicators.find( "ul:first" );

		var indicator_draw = function( list, title ) {
			var item = $( "<li></li>" ).addClass( "indicator" );
			item.text( title );
			item.appendTo( list );
			return item;
		}

		var c = $("#carousel").carousel({
			indicators: owned_indicators,
			createIndicator: indicator_draw
		});
		equal( $(".owned_indicators li.indicator").length, c.carousel("length"), "count indicators must be equal count of frames" );
	} );

})( jQuery );

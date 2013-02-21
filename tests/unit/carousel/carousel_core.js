/*
 * mobile carousel unit tests
 */
(function($){
	module( "jquery.mobile.carousel.js" );

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
	});

	test( "test owned indicators", function() {
		var owned_indicators = $( "<div><ul></ul></div>" );
		owned_indicators.addClass("owned_indicators").appendTo("#qunit-fixture");
		owned_indicators = owned_indicators.find( "ul:first" );

		var indicator_draw = function( list, title ) {
			var item = $( "<li></li>" ).addClass( "indicator" );
			item.text( title );
			item.appendTo( list );
			return item;
		},
		c = $("#carousel").carousel({
			indicators: owned_indicators,
			createIndicator: indicator_draw
		});
		equal( $(".owned_indicators li.indicator").length, c.carousel("length"), "count indicators must be equal count of frames" );
		ok( $(".owned_indicators", c).length == 0, "indicators must be placed outside carousel" );
	});

	asyncTest( "test CLICKS owned indicators", function() {
		var owned_indicators = $( "<div><ul></ul></div>" );
		owned_indicators.addClass("owned_indicators").appendTo("#qunit-fixture");
		owned_indicators = owned_indicators.find( "ul:first" );
		var indicators_list = [];
		var indicator_draw = function( list, title ) {
			var item = $( "<li></li>" ).addClass( "indicator" );
			item.text( title );
			item.appendTo( list );
			indicators_list.push( item );
			return item;
		}

		var c = $( "#carousel" ).carousel({
			indicators: owned_indicators,
			createIndicator: indicator_draw
		});
		expect( 3 );

		c.carousel( "getFrame", 3 ).on( "show", function(){
			ok( true, "show 4 frame" );
			ok( $(".ui-carousel-item:eq(3)", c ).hasClass("ui-carousel-active"), "show 4 frame (by class)" );
			start();
		});
		c.carousel( "getFrame", 0 ).on( "hide", function(){
			ok( true, "show 4 frame" );
		});
		indicators_list[3].click();
	});

	test( "test owned titles", function() {
		var title_draw = function( text, target ) {
			var item = $( "<h3><span></span></h3>" ).addClass( "title" );
			item.find( "span" ).addClass( "title" ).text( text );
			item.appendTo( target );
			return item;
		}

		var c = $("#carousel").carousel({
			createTitle: title_draw
		});
		equal( $("h3", c).length, c.carousel("length"), "count h3 nodes with titles" );
		equal( $("span.title", c).length, c.carousel("length"), "count h3 nodes with titles" );
	});

	test( "test titleBuildIn title option", function() {
		var c = $("#carousel").carousel({
			titleBuildIn: true
		});

		ok( $(".ui-carousel-title .ui-carousel-title-inside", c).length > 0, "titles render with 2 wraps");
		equal( $(".ui-carousel-title .ui-carousel-title-inside", c).length, c.carousel("length"), "titles render with 2 wraps");
	});

	asyncTest( "clear carousel", function() {
		var c = $("#carousel").carousel();
		c.carousel("clear");
		expect(3);
		setTimeout(function(){
			equal( c.carousel("length"), 0, "remove all frames");
			equal( $(".ui-carousel-item", c).length, 0, "no .ui-carousel-item" );
			equal( $(".ui-carousel-indicator", c).length, 0, "no .ui-carousel-indicator" );
			start();
		}, c.carousel("length") * c.carousel("option", "animationDuration") + 10 );
	});

	asyncTest( "remove active frame", function() {
		expect(6);
		var c = $("#carousel").carousel(),
			current_length = c.carousel( "length" );
			$frame = c.carousel( "getFrame", 0 ),
			$frame2 = c.carousel( "getFrame", 1 );
		$frame.on( "hide", function() {
			ok( true, "active frame hide before remove" );
		});
		$frame.on( "itemremove", function(){
			ok( true, "hidden frame receive event about removing" );
		});
		$frame2.on( "show", function(){
			ok( true, "second frame show before first frame removed" );
		});

		setTimeout(function(){
			equal( c.carousel("length"), current_length - 1, "removed one frame");
			equal( $(".ui-carousel-item", c).length, current_length - 1, "check count .ui-carousel-item" );
			equal( $(".ui-carousel-indicator", c).length, current_length - 1, "check count .ui-carousel-indicator" );
			start();
		}, 2 * c.carousel("option", "animationDuration") + 15 );

		c.carousel("remove", 0);
	});

})( jQuery );

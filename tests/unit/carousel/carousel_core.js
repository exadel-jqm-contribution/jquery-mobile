/*
 * mobile carousel unit tests
 */
(function($){
	module( "jquery.mobile.carousel.js" );

	var animation_time = 160;

	// asyncTest( "go to next slides", function() {
	// 	expect( 2 );
	// 	var c = $( "#carousel" ).clone().appendTo("#list").carousel(),
	// 		$frame = c.carousel( "getFrame", 1 );
	// 	$frame.on( "show", function() {
	// 		ok( $(".ui-carousel-item:eq(1)", c).hasClass("ui-carousel-active"), "current slide must have class .ui-carousel-active" );
	// 		ok( $(".ui-carousel-active", c).length === 1, "only one item has .ui-carousel-active" );
	// 	 	start();
	// 	});
	// 	c.carousel( "next" );
	// });

	// asyncTest( "go to prev (LAST) slide", function() {
	// 	var c = $( "#carousel" ).clone().appendTo("#list").carousel();
	// 	expect( 2 );
	// 	var $frame = c.carousel( "getFrame", c.carousel( "length" ) - 1 );
	// 	$frame.on( "show", function() {
	// 		ok( $(".ui-carousel-item:last", c).hasClass("ui-carousel-active"), "current slide must have class .ui-carousel-active" );
	// 		ok( !$(".ui-carousel-item:first", c).hasClass("ui-carousel-active"), "second slide can't have class .ui-carousel-active" );
	// 		start();
	// 	});
	// 	c.carousel( "previous" );
	// });

	// asyncTest( "go to specific slide", function() {
	// 	var c = $( "#carousel" ).clone().appendTo("#list").carousel();
	// 	expect( 1 );
	// 	var $frame = c.carousel( "getFrame", 3 );
	// 	$frame.on( "show", function() {
	// 		ok( $(".ui-carousel-item:eq(3)", c).hasClass("ui-carousel-active"), "current slide (4) must have class .ui-carousel-active" );
	// 		start();
	// 	});
	// 	c.carousel( "to", 3 );
	// });

	// asyncTest( "go through the list and check events", function() {
	// 	expect( 8 );
	// 	var c = $( "#carousel" ).clone().appendTo("#list").carousel(),
	// 		show = 0, hide = 0, beforenext = 0, beforeshow = 0, slidingstart = 0, slidingdone = 0;
	// 	c.carousel( "eachItem", function(index, el){
	// 		$(el).on( "show", function(){ show++; });
	// 		$(el).on( "hide", function(){ hide++; });
	// 	});

	// 	c.on( "beforeshow", function(){	beforeshow++; });
	// 	c.on( "beforenext", function(){	beforenext++; });
	// 	c.on( "slidingstart", function(){ slidingstart++; });
	// 	c.on( "slidingdone", function(){ slidingdone++;	});

	// 	c.carousel( "getFrame", c.carousel("length") - 1 ).on("hide", function() {
	// 		var length = c.carousel( "length" );
	// 		equal( show, length, "show count must be == count of items" );
	// 		equal( hide, length, "hide count must be == count of items" );
	// 		equal( beforeshow, beforenext, "beforeshow == beforenext" );
	// 		equal( beforeshow, slidingstart, "beforeshow == slidingstart" );
	// 		notEqual( slidingdone, slidingstart, "Because we stops test with SHOW event -- slidingdone != slidingstart" );
	// 		equal( slidingdone, slidingstart-1, "Because we stops test with SHOW event -- slidingdone == slidingstart-1" );
	// 		equal( show, beforeshow, "show == beforeshow" );
	// 		ok( true, "last frame hide" );
	// 		clearInterval( interval );
	// 		start();
	// 	});
	// 	var interval;

	// 	interval = setInterval( function() {
	// 		c.carousel( "next" );
	// 	}, c.carousel( "option", "animationDuration" ) + 80);
	// });

	// asyncTest( "go through the list in reverse order and check events", function() {
	// 	expect( 7 );
	// 	var i = 0,
	// 		c = $( "#carousel" ).clone().appendTo("#list").carousel(),
	// 		show = 0, hide = 0, beforeprev = 0, beforeshow = 0, slidingstart = 0, slidingdone = 0;
	// 	c.carousel( "eachItem", function(index, el){
	// 		$(el).on( "show", function() { show++; });
	// 		$(el).on( "hide", function() { hide++; });
	// 	});

	// 	c.on( "beforeshow", function(){	beforeshow++; });
	// 	c.on( "beforeprev", function(){	beforeprev++; });
	// 	c.on( "slidingstart", function(){ slidingstart++; });
	// 	c.on( "slidingdone", function(){ slidingdone++;	});

	// 	c.carousel( "getFrame", 0).on("show", function() {
	// 		if (++i == 1) return; // ignore initial Show event for first frame
	// 		var length = c.carousel( "length" );
	// 		equal( show-1, length, "show count must be == count of items" );
	// 		equal( hide, length, "hide count must be == count of items" );
	// 		equal( beforeshow, beforeprev, "beforeshow == beforeprev" );
	// 		equal( beforeshow, slidingstart, "beforeshow == slidingstart" );
	// 		notEqual( slidingdone, slidingstart, "Because we stops test with SHOW event -- slidingdone != slidingstart" );
	// 		equal( slidingdone, slidingstart - 1, "Because we stops test with SHOW event -- slidingdone == slidingstart-1" );
	// 		equal( show-1, beforeshow, "show == beforeshow" );
	// 		clearInterval( interval );
	// 		start();
	// 	});
	// 	var interval = setInterval( function() {
	// 		c.carousel( "previous" );
	// 	}, c.carousel( "option", "animationDuration" ) + 80);
	// });

	// test( "test owned indicators", function() {
	// 	var owned_indicators = $( "<div><ul></ul></div>" );
	// 	owned_indicators.addClass("owned_indicators").appendTo("#qunit-fixture");
	// 	owned_indicators = owned_indicators.find( "ul:first" );

	// 	var indicator_draw = function( list, title ) {
	// 		var item = $( "<li></li>" ).addClass( "indicator" );
	// 		item.text( title );
	// 		item.appendTo( list );
	// 		return item;
	// 	},
	// 	c = $("#carousel").clone().appendTo("#list").carousel({
	// 		indicators: owned_indicators,
	// 		createIndicator: indicator_draw
	// 	});
	// 	equal( $(".owned_indicators li.indicator").length, c.carousel("length"), "count indicators must be equal count of frames" );
	// 	ok( $(".owned_indicators", c).length == 0, "indicators must be placed outside carousel" );
	// });

	// asyncTest( "test CLICKS owned indicators", function() {
	// 	expect( 3 );
	// 	var owned_indicators = $( "<div><ul></ul></div>" );
	// 	owned_indicators.addClass("owned_indicators").appendTo("#qunit-fixture");
	// 	owned_indicators = owned_indicators.find( "ul:first" );
	// 	var indicators_list = [],
	// 	indicator_draw = function( list, title ) {
	// 		var item = $( "<li></li>" ).addClass( "indicator" );
	// 		item.text( title );
	// 		item.appendTo( list );
	// 		indicators_list.push( item );
	// 		return item;
	// 	},
	// 	c = $( "#carousel" ).clone().appendTo("#list").carousel({
	// 		indicators: owned_indicators,
	// 		createIndicator: indicator_draw
	// 	});

	// 	c.carousel( "getFrame", 3 ).on( "show", function(){
	// 		ok( true, "show 4 frame" );
	// 		ok( $(".ui-carousel-item:eq(3)", c ).hasClass("ui-carousel-active"), "show 4 frame (by class)" );
	// 		start();
	// 	});
	// 	c.carousel( "getFrame", 0 ).on( "hide", function(){
	// 		ok( true, "show 4 frame" );
	// 	});
	// 	setTimeout(function() {
	// 		indicators_list[3].click();
	// 	}, 0);
	// });

	// test( "test owned titles", function() {
	// 	var title_draw = function( text, target ) {
	// 		var item = $( "<h3><span></span></h3>" ).addClass( "title" );
	// 		item.find( "span" ).addClass( "title" ).text( text );
	// 		item.appendTo( target );
	// 		return item;
	// 	},
	// 	c = $("#carousel").clone().appendTo("#list").carousel({
	// 		createTitle: title_draw
	// 	});
	// 	equal( $("h3", c).length, c.carousel("length"), "count h3 nodes with titles" );
	// 	equal( $("span.title", c).length, c.carousel("length"), "count h3 nodes with titles" );
	// });

	// test( "test titleBuildIn title option", function() {
	// 	var c = $("#carousel").clone().appendTo("#list").carousel({
	// 		titleBuildIn: true
	// 	});

	// 	ok( $(".ui-carousel-title .ui-carousel-title-inside", c).length > 0, "titles render with 2 wraps");
	// 	equal( $(".ui-carousel-title .ui-carousel-title-inside", c).length, c.carousel("length"), "titles render with 2 wraps");
	// });

	// asyncTest( "clear carousel", function() {
	// 	var c = $("#carousel").clone().appendTo("#list").carousel();
	// 	c.carousel("clear");
	// 	expect(3);
	// 	setTimeout(function(){
	// 		equal( c.carousel("length"), 0, "remove all frames");
	// 		equal( $(".ui-carousel-item", c).length, 0, "no .ui-carousel-item" );
	// 		equal( $(".ui-carousel-indicator", c).length, 0, "no .ui-carousel-indicator" );
	// 		start();
	// 	}, 0);
	// });

	asyncTest( "remove active frame", function() {
		expect(6);
		var c = $("#carousel").clone().appendTo("#list").carousel(),
			current_length = c.carousel( "length" ),
			$frame = c.carousel( "getFrame", 0 ),
			$frame2 = c.carousel( "getFrame", 1 ),
			show0 = false;
		$frame.on( "hide", function() {
			ok( true, "active frame hide before remove" );
			show0 = true;
		});
		$frame.on( "itemremove", function(){
			ok( true, "hidden frame receive event about removing" );
		});
		$frame2.on( "show", function(){
			ok( true, "second frame show before first frame removed" );
			if ( !show0 ){
				ok( false, "active frame hide before remove" );
			}
			equal( c.carousel("length"), current_length - 1, "removed one frame");
			equal( $(".ui-carousel-item", c).length, current_length - 1, "check count .ui-carousel-item" );
			equal( $(".ui-carousel-indicator", c).length, current_length - 1, "check count .ui-carousel-indicator" );
			start();
		});
		setTimeout( function(){
			c.carousel("remove", 0);
		}, 0 );
	});

	// asyncTest( "refresh carousel from JSON" , function(){
	// 	expect( 4 );
	// 	var c = $("#carousel").clone().appendTo("#list").carousel();

	// 	var fixture = [
	// 		{
	// 			type: "image",
	// 			title: "Test",
	// 			content: "../../../css/themes/default/images/icons-png/audio-black.png"
	// 		},
	// 		{
	// 			type: "image",
	// 			title: "Test2",
	// 			content: "../../../css/themes/default/images/icons-png/audio-black.png"
	// 		},
	// 		{
	// 			type: "image",
	// 			title: "Test3",
	// 			content: "../../../css/themes/default/images/icons-png/audio-black.png"
	// 		}
	// 	];

	// 	setTimeout( function() {
	// 		equal( c.carousel("length"), fixture.length, "count of new items" );

	// 		equal( c.carousel( "getFrame", 0 ).find("img").attr("src"),
	// 			fixture[0].content,
	// 			"check image src attribute for first frame");
	// 		equal( c.carousel( "getFrame", 1 ).find("img").attr("src"),
	// 			fixture[1].content,
	// 			"check image src attribute for second frame");
	// 		equal( c.carousel( "getFrame", 2 ).find("img").attr("src"),
	// 			fixture[2].content,
	// 			"check image src attribute for 3rd frame");

	// 		start();
	// 	}, c.carousel("length") * c.carousel("option", "animationDuration") + 35);
	// 	c.carousel( "refresh", fixture );
	// });

	// asyncTest( "refresh carousel from JSON with Events" , function(){
	// 	expect( 6 );
	// 	var c = $( "#carousel" ).clone().appendTo("#list").carousel();

	// 	var fixture = [
	// 		{
	// 			type: "image",
	// 			title: "Test",
	// 			content: "../../../css/themes/default/images/icons-png/audio-black.png",
	// 			onReady: function() {
	// 				ok( true, "fire READY for first item" );
	// 			},
	// 			onShow: function() {
	// 				ok( true, "fire SHOW for first item" );
	// 			},
	// 			onHide: function() {
	// 				ok( true, "fire HIDE for first item" );
	// 			}
	// 		},
	// 		{
	// 			type: "image",
	// 			title: "Test2",
	// 			content: "../../../css/themes/default/images/icons-png/audio-black.png",
	// 			onReady: function() {
	// 				ok( true, "fire READY for second item" );
	// 			},
	// 			onShow: function() {
	// 				ok( true, "fire SHOW for second item" );
	// 				start();
	// 			}
	// 		},
	// 		{
	// 			type: "image",
	// 			title: "Test3",
	// 			content: "../../../css/themes/default/images/icons-png/audio-black.png"
	// 		}
	// 	];
	// 	c.carousel( "refresh", fixture );

	// 	setTimeout( function() {
	// 		equal( c.carousel("length"), fixture.length, "count of new items" );
	// 		c.carousel( "next" );
	// 	}, 0);

	// });

	// asyncTest( "check html-type items", function(){
	// 	expect( 3 );

	// 	$( "#test_events" ).on( "click", function(){
	// 		ok( true, "event created before init carousel still exists" );
	// 	});

	// 	var c = $( "#carousel" ).clone().appendTo("#list").carousel();

	// 	$( "#test_events" ).click();
	// 	var $frame = c.carousel( "getFrame", 1 );
	// 	equal( $(".ui-carousel-title", $frame).text(), $frame.data("title"), "check frame title before change" );

	// 	$frame.data( "title", "1" );
	// 	c.carousel( "refresh" );
	// 	setTimeout( function() {
	// 		equal( $(".ui-carousel-title", $frame).text(), $frame.data("title"), "check frame title after change" );
	// 		start();
	// 	}, 160);
	// });

}( jQuery ));

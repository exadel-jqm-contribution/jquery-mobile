/*
 * mobile calendar render unit tests
 */
(function($){
	module( "RENDER jquery.mobile.calendar.js" );

	var today = new Date();
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	today.setMilliseconds(0);

	test( "render", function() {
		var c = $( "#calendar" ).calendar(),
			body = c.find( ".ui-calendar-body table" );

		ok( body.attr("cols"), "table predefine count of columns" );
		equal( body.attr("cols"), 7, "table predefine 7 columns" );
		ok( body.find("thead tr.ui-calendar-controls").length,
			"has row with controls" );
		equal( body.find("thead tr.ui-calendar-controls td").length, 3,
			"has row with 3 groups controls" );
		ok( body.find("thead tr.ui-calendar-controls td").hasClass("ui-calendar-control"),
			"controls has class ui-calendar-control" );
		ok( body.find("thead tr.ui-calendar-controls td.ui-calendar-control:first").hasClass("ui-calendar-controls-prev"),
			"first control is prev button by class ui-calendar-controls-prev" );
		ok( body.find("thead tr.ui-calendar-controls td.ui-calendar-control:last").hasClass("ui-calendar-controls-next"),
			"last control is prev button by class ui-calendar-controls-next" );


	});

	test( "other month days", function(){
		var c = $("#calendar").calendar({
			minDate: new Date( "2013-04-01" ),
			maxDate: new Date( "2013-06-03" ),
			showOtherMonths: true,
			numberOfMonths: 1
		});

		c.calendar( "setCurrentDate", "2013-04-03", "yy-mm-dd" );
		var t = (new Date("2013-05-01 0:00")).getTime(),
			el = c.find(".ui-calendar-time-" + t );
		ok( el.hasClass("ui-calendar-other-month"), "has class ui-calendar-other-month" );
		ok( el.hasClass("ui-ui-calendar-day-off"), "has class ui-ui-calendar-day-off" );
		ok( el.hasClass("ui-calendar-state-disabled"), "has class ui-calendar-state-disabled" );
		ok( !el.hasClass("ui-calendar-day"), "has not class ui-calendar-day" );
		ok( !el.hasClass("ui-calendar-active"), "has not class ui-calendar-active" );
		equal( el.text(), "1", "has text with showOtherMonths == TRUE");
		ok( el.find("span.calendar-state-default").length, "has span with .calendar-state-default showOtherMonths == TRUE");

		t = (new Date("2013-05-04 0:00")).getTime();
		el = c.find(".ui-calendar-time-" + t );
		ok( el.hasClass("ui-calendar-week-end"), "Weekend has class ui-calendar-week-end" );

		c.calendar( "option", "showOtherMonths", false ).calendar( "refresh" );
		el = c.find(".ui-calendar-time-" + t );
		equal( el.text(), $("<p>&nbsp;</p>").text(), "has only space with showOtherMonths == FALSE");
	});

	test( "current month days", function(){
		var c = $("#calendar").calendar({
			minDate: new Date( "2013-04-01" ),
			maxDate: new Date( "2013-06-03" ),
			numberOfMonths: 1
		});

		c.calendar( "setCurrentDate", "2013-04-03", "yy-mm-dd" );
		var t = (new Date("2013-04-06 0:00")).getTime(),
			el = c.find(".ui-calendar-time-" + t );

		ok( el.hasClass("ui-calendar-day"), "has class ui-calendar-day" );
		ok( el.hasClass("ui-calendar-week-end"), "Weekend has class ui-calendar-week-end" );
		ok( !el.hasClass("ui-calendar-other-month"), "has not class ui-calendar-other-month" );
		ok( !el.hasClass("ui-ui-calendar-day-off"), "has not class ui-ui-calendar-day-off" );
		ok( !el.hasClass("ui-calendar-state-disabled"), "has not class ui-calendar-state-disabled" );
	});

	test( "current and today", function() {
		var d1 = new Date( today.getFullYear(), today.getMonth() - 1, today.getDate() ),
			c = $("#calendar").calendar({
				minDate: new Date( today.getFullYear(), today.getMonth() - 1, today.getDate() ),
				maxDate: new Date( today.getFullYear(), today.getMonth() + 1, today.getDate() ),
				numberOfMonths: 1
			});
		var t = today.getTime(),
			el = c.find(".ui-calendar-time-" + t );

		ok( el.hasClass("ui-calendar-day"), "has class ui-calendar-day" );
		ok( el.hasClass("ui-calendar-active"), "has class ui-calendar-active" );
		ok( el.hasClass("ui-calendar-today"), "has class ui-calendar-today" );
		equal( el.data("year"), today.getFullYear(), "has Year in tag data" );
		equal( el.data("month"), today.getMonth(), "has Month in range [0..11] in tag data" );
		equal( el.data("date"), today.getDate(), "has Date in tag data" );

		el = el.find("a");
		ok( el.length, "has a tag as body");
		ok( el.hasClass("ui-calendar-state-default"), "has a tag with class ui-calendar-state-default" );
		ok( el.hasClass("ui-calendar-state-highlight"), "has a tag with class ui-calendar-state-highlight" );
		ok( el.hasClass("ui-calendar-state-active"), "has a tag with class ui-calendar-state-active" );

		ok( el.hasClass("ui-link"), "has a tag with class ui-link" );
		equal( el.text(), today.getDate(), "has a tag with current date number" );


	});
}( jQuery ));

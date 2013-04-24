/*
 * mobile calendar render unit tests
 */
(function($){
	module( "RENDER jquery.mobile.calendar.js" );

	var today = new Date(),
		default_date_format = "yy-m-d",
		today_str;
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	today.setMilliseconds(0);
	today_str = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();

	test( "render inline", function() {
		var c = $( "#calendar" ).calendar({
				inputName: "testname",
				dateFormat: default_date_format
			}),
			body = c.find( ".ui-calendar-body table" );

		equal( c.find("input[type=\"hidden\"]").length, 1, "we have one hidden input for forms");
		equal( c.find("input[type=\"hidden\"]").attr("name"), "testname", "hidden input has name 'testname'");
		equal( c.find("input[type=\"hidden\"]").val(), today_str, "hidden input has current date as value - " + today_str);
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
		equal( body.find("thead tr.ui-calendar-controls td.ui-calendar-controls-selects select").length, 2,
			"must be 2 selects for months and years" );
	});

	test( "render with text input -- popup", function() {
		var c = $( "#inline_calendar" ).calendar({
				popupType: "popup",
				dateFormat: default_date_format
			}),
			body = $(".ui-page .ui-calendar-embedded-box");

		equal( c.val(), today_str, "hidden input has current date as value - " + today_str);
		ok( body.find("table").attr("cols"), "table predefine count of columns" );
		equal( body.find("table").attr("cols"), 7, "table predefine 7 columns" );
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
		equal( body.find("thead tr.ui-calendar-controls td.ui-calendar-controls-selects select").length, 2,
			"must be 2 selects for months and years" );
	});

	test( "render with text input -- panel", function() {
		var c = $( "#inline_calendar" ).calendar({
				popupType: "panel",
				dateFormat: default_date_format
			}),
			body = $(".ui-page .ui-calendar-embedded-box");
		equal( c.val(), today_str, "hidden input has current date as value - " + today_str);
		ok( body.find("table").attr("cols"), "table predefine count of columns" );
		equal( body.find("table").attr("cols"), 7, "table predefine 7 columns" );
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
		equal( body.find("thead tr.ui-calendar-controls td.ui-calendar-controls-selects select").length, 2,
			"must be 2 selects for months and years" );
		c.calendar( "destroy" );
	});

	test( "different themes", function() {
		var c = $( "#calendar" ).calendar({
				theme: "a",
				buttonsTheme: "b",
				monthsTheme: "c",
				yearsTheme: "d"
			}), body = null;
		expect( 3 );
		body = c.find( ".ui-calendar-body table" );

		equal( body.find("thead td.ui-calendar-control a:first").attr("data-theme"), "b", "Buttons must have theme b" );
		equal( body.find("thead td.ui-calendar-controls-selects select:first").attr("data-theme"), "c", "Month select must have theme c" );
		equal( body.find("thead td.ui-calendar-controls-selects select:eq(1)").attr("data-theme"), "d", "Year select must have theme c" );
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
		equal( el.text(), "1", "has text with showOtherMonths == TRUE" );
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
		equal( el.data("time"), today.getTime(), "has timestamp in tag data" );

		el = el.find("a");
		ok( el.length, "has a tag as body");
		ok( el.hasClass("ui-calendar-state-default"), "has a tag with class ui-calendar-state-default" );
		ok( el.hasClass("ui-calendar-state-highlight"), "has a tag with class ui-calendar-state-highlight" );
		ok( el.hasClass("ui-calendar-state-active"), "has a tag with class ui-calendar-state-active" );

		ok( el.hasClass("ui-link"), "has a tag with class ui-link" );
		equal( el.text(), today.getDate(), "has a tag with current date number" );
	});
}( jQuery ));

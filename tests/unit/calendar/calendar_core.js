/*
 * mobile calendar unit tests
 */
(function($){
	module( "jquery.mobile.calendar.js" );

	test( "set date", function(){
		var c = $("#calendar").calendar({
			startDate: "today"
		});

		equal( c.calendar("getCurrentDate"), new Date(), "date equal" );

	});
}( jQuery ));

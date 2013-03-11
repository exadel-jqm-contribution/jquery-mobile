//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Creates carousel from list of images or html-blocks.
//>>label: Carousel
//>>group: Widgets
//>>css.structure: ../css/structure/jquery.mobile.carousel.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

define( ["jquery", "../jquery.mobile.widget" ], function ( jQuery ) {
//>>excludeEnd( "jqmBuildExclude" );

(function( $, undefined ){

$.widget( "mobile.carousel", $.mobile.widget, {
	options:{
		startDate: "today",
		minDate: false,
		maxDate: false,
		activeMonth: false,
		activeDays: false,
		changeMonth: true,
		changeDay: true,
		changeYear: true,
		regional: "_",
		theme: "c",
		mini_controls: true
	},
	current_date: null,
	texts: null,
	regional: [],

	default_regional: { // Default regional settings
		closeText: "Done", // Display text for close link
		prevText: "Prev", // Display text for previous month link
		nextText: "Next", // Display text for next month link
		currentText: "Today", // Display text for current month link
		monthNames: ["January","February","March","April","May","June",
			"July","August","September","October","November","December"], // Names of months for drop-down and formatting
		monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], // For formatting
		dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], // For formatting
		dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // For formatting
		dayNamesMin: ["Su","Mo","Tu","We","Th","Fr","Sa"], // Column headings for days starting at Sunday
		weekHeader: "Wk", // Column header for week of the year
		dateFormat: "mm/dd/yy", // See format options on parseDate
		firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
		isRTL: false, // True if right-to-left language, false if left-to-right
		showMonthAfterYear: false, // True if the year select precedes month, false for month then year
		yearSuffix: "" // Additional text to append to the year in the month headers
	},

	setRegional: function(region) {
		if ( this.regional[region] != undefined ) {
			this.texts = this.regional[region];
			this.options.regional = region;
		}
		return this;
	},

	_create: function() {
		this.element.addClass( "ui-calendar" );
		this.options = $.extend( this.options, this.element.data("options") );
		this.options = $.extend( this.options, this.element.data() );

		this.regional["_"] = this.default_regional;

		this.setRegional( this.options.regional );

		this.current_date = this._createDate( this.options.startDate );

		this.refresh();
	},

	getCurrentDate: function(){
		return this.current_date;
	},

	_createDate: function( d ) {
		var result = null;
		var today = new Date();
		if ( typeof d == "string" ) {
			switch ( d ) {
				case "today":
					result = new Date();
					break;
				case "tomorrow":
					result = new Date( today.getFullYear(), today.getUTCMonth(), today.getDate() + 1 );
					break;
				case "next month":
					result = new Date( today.getFullYear(), today.getUTCMonth() + 1, 1);
					break;
				case "next year":
					result = new Date( today.getFullYear() + 1, today.getUTCMonth(), today.getDate() );
					break;
				case "after six months":
					result = new Date( today.getFullYear(), today.getUTCMonth() + 6, today.getDate() );
					break;
				default:
					try {
						result = new Date( d );
					}
					catch (e) {
						result = new Date();
					}
			}
		} else if ( typeof d == "object" ) {
			result = d;
		}
		return result;
	},

	_createContorols: function() {

		this.controls = $("<fieldset></fieldset>").addClass("ui-calendar-controls");
		this.controls.data({
			role: "controlgroup",
			type: "horizontal",
			mini: this.options.mini_controls
		});
		if ( this.options.changeDay ) {
			this.prev_btn = $("<a></a>").data({
				role: "button",
				icon: "arrow-l",
				iconpos: "notext",
				theme: this.options.theme,
				inline: true
			}).attr("href", "#").text(this.texts.prevText);

			this.next_btn = $("<a></a>").data({
				role: "button",
				icon: "arrow-r",
				iconpos: "notext",
				theme: this.options.theme,
				inline: true
			}).attr("href", "#").text(this.texts.nextText);
		}

		if ( this.options.changeMonth ) {
			var months = $.map(this.texts.monthNames, function(m, i) {
					return '<option value="' + i + '">' + m + '</option>';
				}).join("\n");
			this.month_select = $( "<select></select>" ).append( $(months) );
		}

		if ( this.options.changeYear ) {
			var years = (function(from, to){
				var i = from, res = [];
				for (i = from ; i <= to; i++) {
					res.push(i);
				}
				return res;
			}(1950, 2100));
			this.year_select = $("<select></select>").append(
				$($.map( years, function(m, i) {
					return '<option value="' + i + '">' + m + '</option>';
				}).join( "\n" ))
			);
		}
	},

	_createTable: function( date ) {
		var _table = $( "<table><thead></thead><tbody></tbody></table>" ),
			head = _table.find( "thead" ),
			body = _table.find( "tbody" );
		_table.addClass( "ui-calendar" );
		head.addClass( "ui-calendar-header" );
		body.addClass( "ui-calendar-body" );

	},

	refresh: function() {

	}
});
    $( document ).bind( "pageshow", function( e ) {
		$( document ).trigger( "ui-carouselbeforecreate" );
		return $( ":jqmData(role='carousel')", e.target ).carousel();
	});
}(jQuery));

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd( "jqmBuildExclude" );

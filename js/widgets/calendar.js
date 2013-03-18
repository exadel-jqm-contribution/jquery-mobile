//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Creates calendar from list of images or html-blocks.
//>>label: calendar
//>>group: Widgets
//>>css.structure: ../css/structure/jquery.mobile.calendar.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

define( ["jquery", "../jquery.mobile.widget" ], function ( jQuery ) {
//>>excludeEnd( "jqmBuildExclude" );

(function( $, undefined ){

$.widget( "mobile.calendar", $.mobile.widget, {
	options:{
		dateFormat: null,
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
		if ( this.regional[region] !== undefined ) {
			this.texts = this.regional[region];
			this.options.regional = region;
			if ( this.options.dateFormat !== null ) {
				this.texts.dateFormat = this.options.dateFormat;
			} else {
				this.options.dateFormat = this.texts.dateFormat;
			}
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

	_setOption: function(key, value) {
		switch( key ) {
			case "dateFormat":
				this.texts.dateFormat = this.options.dateFormat = value;
				break;
			case "startDate":
				this.current_date = this._createDate(value);
			default:
				if ( this.options.hasOwnProperty(key) ) {
					this.options[key] = value;
				}
		}
	},

	getCurrentDate: function(){
		return this.current_date;
	},

	getWeekDayName: function(){
		return this.texts.dayNames[this.current_date.getDay()];
	},

	getMonthName: function(){
		return this.texts.monthNames[this.current_date.getMonth()];
	},

	setCurrentDate: function( date ){
		this.current_date = this._createDate( date );
		return this;
	},

	_createDate: function( d, format ) {
		var result = null,
			today = new Date();
		format = format || this.options.dateFormat;
		if ( typeof d === "string" ) {
			switch ( d ) {
				case "today":
					result = new Date();
					break;
				case "tomorrow":
					result = new Date( today.getFullYear(), today.getMonth(), today.getDate() + 1 );
					break;
				case "next month":
					result = new Date( today.getFullYear(), today.getMonth() + 1, 1);
					break;
				case "next year":
					result = new Date( today.getFullYear() + 1, today.getMonth(), today.getDate() );
					break;
				case "after six months":
					result = new Date( today.getFullYear(), today.getMonth() + 6, today.getDate() );
					break;
				default:
					result = this.parseDate( format, d );
			}
		} else if ( typeof d === "object" ) {
			result = d;
		}
		return result;
	},

	/* Handle switch to/from daylight saving.
	 * Hours may be non-zero on daylight saving cut-over:
	 * > 12 when midnight changeover, but then cannot generate
	 * midnight datetime, so jump to 1AM, otherwise reset.
	 * @param  date  (Date) the date to check
	 * @return  (Date) the corrected date
	 */
	_daylightSavingAdjust: function(date) {
		if (!date) {
			return null;
		}
		date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
		return date;
	},
	/* Find the number of days in a given month. */
	_getDaysInMonth: function(year, month) {
		return 32 - this._daylightSavingAdjust(new Date(year, month, 32)).getDate();
	},
	/* inspired by jQueryUI.datepicker
	 * Parse a string value into a date object.
	 * See formatDate below for the possible formats.
	 *
	 * @param  format string - the expected format of the date
	 * @param  value string - the date in the above format
	 * @param  settings Object - attributes include:
	 *					shortYearCutoff  number - the cutoff year for determining the century (optional)
	 *					dayNamesShort	string[7] - abbreviated names of the days from Sunday (optional)
	 *					dayNames		string[7] - names of the days from Sunday (optional)
	 *					monthNamesShort string[12] - abbreviated names of the months (optional)
	 *					monthNames		string[12] - names of the months (optional)
	 * @return  Date - the extracted date value or null if value is blank
	 */
	parseDate: function (format, value, settings) {
		if (format == null || value == null) {
			throw "Invalid arguments";
		}

		value = (typeof value === "object" ? value.toString() : value + "");
		if (value === "") {
			return null;
		}

		var iFormat, dim, extra,
			iValue = 0,
			shortYearCutoffTemp = (settings ? settings.shortYearCutoff : null) || this.texts.shortYearCutoff,
			shortYearCutoff = (typeof shortYearCutoffTemp !== "string" ? shortYearCutoffTemp :
				new Date().getFullYear() % 100 + parseInt(shortYearCutoffTemp, 10)),
			dayNamesShort = (settings ? settings.dayNamesShort : null) || this.texts.dayNamesShort,
			dayNames = (settings ? settings.dayNames : null) || this.texts.dayNames,
			monthNamesShort = (settings ? settings.monthNamesShort : null) || this.texts.monthNamesShort,
			monthNames = (settings ? settings.monthNames : null) || this.texts.monthNames,
			year = -1,
			month = -1,
			day = -1,
			doy = -1,
			literal = false,
			date,
			// Check whether a format character is doubled
			lookAhead = function(match) {
				var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
				if (matches) {
					iFormat++;
				}
				return matches;
			},
			// Extract a number from the string value
			getNumber = function(match) {
				var isDoubled = lookAhead(match),
					size = (match === "@" ? 14 : (match === "!" ? 20 :
					(match === "y" && isDoubled ? 4 : (match === "o" ? 3 : 2)))),
					digits = new RegExp("^\\d{1," + size + "}"),
					num = value.substring(iValue).match(digits);
				if (!num) {
					throw "Missing number at position " + iValue;
				}
				iValue += num[0].length;
				return parseInt(num[0], 10);
			},
			// Extract a name from the string value and convert to an index
			getName = function(match, shortNames, longNames) {
				var index = -1,
					names = $.map(lookAhead(match) ? longNames : shortNames, function (v, k) {
						return [ [k, v] ];
					}).sort(function (a, b) {
						return -(a[1].length - b[1].length);
					});

				$.each(names, function (i, pair) {
					var name = pair[1];
					if (value.substr(iValue, name.length).toLowerCase() === name.toLowerCase()) {
						index = pair[0];
						iValue += name.length;
						return false;
					}
				});
				if (index !== -1) {
					return index + 1;
				} else {
					throw "Unknown name at position " + iValue;
				}
			},
			// Confirm that a literal character matches the string value
			checkLiteral = function() {
				if (value.charAt(iValue) !== format.charAt(iFormat)) {
					throw "Unexpected literal at position " + iValue;
				}
				iValue++;
			};

		for (iFormat = 0; iFormat < format.length; iFormat++) {
			if (literal) {
				if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
					literal = false;
				} else {
					checkLiteral();
				}
			} else {
				switch (format.charAt(iFormat)) {
					case "d":
						day = getNumber("d");
						break;
					case "D":
						getName("D", dayNamesShort, dayNames);
						break;
					case "o":
						doy = getNumber("o");
						break;
					case "m":
						month = getNumber("m");
						break;
					case "M":
						month = getName("M", monthNamesShort, monthNames);
						break;
					case "y":
						year = getNumber("y");
						break;
					case "@":
						date = new Date(getNumber("@"));
						year = date.getFullYear();
						month = date.getMonth() + 1;
						day = date.getDate();
						break;
					case "!":
						date = new Date((getNumber("!") - this._ticksTo1970) / 10000);
						year = date.getFullYear();
						month = date.getMonth() + 1;
						day = date.getDate();
						break;
					case "'":
						if (lookAhead("'")){
							checkLiteral();
						} else {
							literal = true;
						}
						break;
					default:
						checkLiteral();
				}
			}
		}

		if (iValue < value.length){
			extra = value.substr(iValue);
			if (!/^\s+/.test(extra)) {
				throw "Extra/unparsed characters found in date: " + extra;
			}
		}

		if (year === -1) {
			year = new Date().getFullYear();
		} else if (year < 100) {
			year += new Date().getFullYear() - new Date().getFullYear() % 100 +
				(year <= shortYearCutoff ? 0 : -100);
		}

		if (doy > -1) {
			month = 1;
			day = doy;
			do {
				dim = this._getDaysInMonth(year, month - 1);
				if (day <= dim) {
					break;
				}
				month++;
				day -= dim;
			} while (true);
		}

		date = this._daylightSavingAdjust(new Date(year, month - 1, day));
		if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
			throw "Invalid date"; // E.g. 31/02/00
		}
		return date;
	},

	/* Standard date formats. */
	ATOM: "yy-mm-dd", // RFC 3339 (ISO 8601)
	COOKIE: "D, dd M yy",
	ISO_8601: "yy-mm-dd",
	RFC_822: "D, d M y",
	RFC_850: "DD, dd-M-y",
	RFC_1036: "D, d M y",
	RFC_1123: "D, d M yy",
	RFC_2822: "D, d M yy",
	RSS: "D, d M y", // RFC 822
	TICKS: "!",
	TIMESTAMP: "@",
	W3C: "yy-mm-dd", // ISO 8601

	_ticksTo1970: (((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) +
		Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000),

	/* Format a date object into a string value.
	 * The format can be combinations of the following:
	 * d  - day of month (no leading zero)
	 * dd - day of month (two digit)
	 * o  - day of year (no leading zeros)
	 * oo - day of year (three digit)
	 * D  - day name short
	 * DD - day name long
	 * m  - month of year (no leading zero)
	 * mm - month of year (two digit)
	 * M  - month name short
	 * MM - month name long
	 * y  - year (two digit)
	 * yy - year (four digit)
	 * @ - Unix timestamp (ms since 01/01/1970)
	 * ! - Windows ticks (100ns since 01/01/0001)
	 * "..." - literal text
	 * '' - single quote
	 *
	 * @param  format string - the desired format of the date
	 * @param  date Date - the date value to format
	 * @param  settings Object - attributes include:
	 *					dayNamesShort	string[7] - abbreviated names of the days from Sunday (optional)
	 *					dayNames		string[7] - names of the days from Sunday (optional)
	 *					monthNamesShort string[12] - abbreviated names of the months (optional)
	 *					monthNames		string[12] - names of the months (optional)
	 * @return  string - the date in the above format
	 */
	formatDate: function (format, date, settings) {
		if (!date) {
			return "";
		}

		var iFormat,
			dayNamesShort = (settings ? settings.dayNamesShort : null) || this.texts.dayNamesShort,
			dayNames = (settings ? settings.dayNames : null) || this.texts.dayNames,
			monthNamesShort = (settings ? settings.monthNamesShort : null) || this.texts.monthNamesShort,
			monthNames = (settings ? settings.monthNames : null) || this.texts.monthNames,
			// Check whether a format character is doubled
			lookAhead = function(match) {
				var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
				if (matches) {
					iFormat++;
				}
				return matches;
			},
			// Format a number, with leading zero if necessary
			formatNumber = function(match, value, len) {
				var num = "" + value;
				if (lookAhead(match)) {
					while (num.length < len) {
						num = "0" + num;
					}
				}
				return num;
			},
			// Format a name, short or long as requested
			formatName = function(match, value, shortNames, longNames) {
				return (lookAhead(match) ? longNames[value] : shortNames[value]);
			},
			output = "",
			literal = false;

		if (date) {
			for (iFormat = 0; iFormat < format.length; iFormat++) {
				if (literal) {
					if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
						literal = false;
					} else {
						output += format.charAt(iFormat);
					}
				} else {
					switch (format.charAt(iFormat)) {
						case "d":
							output += formatNumber("d", date.getDate(), 2);
							break;
						case "D":
							output += formatName("D", date.getDay(), dayNamesShort, dayNames);
							break;
						case "o":
							output += formatNumber("o",
								Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000), 3);
							break;
						case "m":
							output += formatNumber("m", date.getMonth() + 1, 2);
							break;
						case "M":
							output += formatName("M", date.getMonth(), monthNamesShort, monthNames);
							break;
						case "y":
							output += (lookAhead("y") ? date.getFullYear() :
								(date.getYear() % 100 < 10 ? "0" : "") + date.getYear() % 100);
							break;
						case "@":
							output += date.getTime();
							break;
						case "!":
							output += date.getTime() * 10000 + this._ticksTo1970;
							break;
						case "'":
							if (lookAhead("'")) {
								output += "'";
							} else {
								literal = true;
							}
							break;
						default:
							output += format.charAt(iFormat);
					}
				}
			}
		}
		return output;
	},

	getDateString: function(format) {
		format = format || this.options.dateFormat;

		return this.formatDate( format, this.getCurrentDate() );
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
		$( document ).trigger( "ui-calendarbeforecreate" );
		return $( ":jqmData(role='calendar')", e.target ).calendar();
	});
}(jQuery));

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd( "jqmBuildExclude" );

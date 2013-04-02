//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Creates calendar from list of images or html-blocks.
//>>label: calendar
//>>group: Widgets
//>>css.structure: ../css/structure/jquery.mobile.calendar.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

define( ["jquery", "../jquery.mobile.widget" ], function ( jQuery ) {
//>>excludeEnd( "jqmBuildExclude" );

(function( $, undefined ){

(function( $, undefined ){

$.widget( "mobile.calendar", $.mobile.widget, {
	options:{
		dateFormat: "mm/dd/yy",
		startDate: null,
		minDate: null,
		maxDate: null,
		activeMonth: false,
		activeDays: false,
		changeMonth: true,
		changeYear: true,
		regional: "_",
		theme: "c",
		numberOfMonths: 1,
		popupType: "popup", // "popup" || "panel"
		popupAttr: {},
		closeBtn: true,
		beforeShowDay: null,		// Function that takes a date and returns an array with
			// [0] = true if selectable, false if not, [1] = custom CSS class name(s) or "",
			// [2] = cell title (optional), e.g. $.datepicker.noWeekends
		selectOtherMonths: false, 	// True to allow selection of dates in other months, false for unselectable
		showOtherMonths: false, 	// True to show dates in other months, false to leave blank
		shortYearCutoff: "+10", 	// Short year values < this are in the current century,
			// > this are in the previous century,
			// string value starting with "+" for current year + value
	},
	cuid: 0,
	current_date: null,
	texts: null,
	regional: [],
	inline_mode: false,
	drawFromMonth: 0,
	drawFromYear: 2012,
	input: null,
	container: null,
	calendar_container: null,

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
		var node_type = this.element.get(0).nodeName.toLowerCase();

		this.options = $.extend( this.options, this.element.data("options") );
		this.options = $.extend( this.options, this.element.data() );

		this.regional["_"] = this.default_regional;

		this.setRegional( this.options.regional );

		this.inline_mode = (node_type == "div" || node_type == "span");

		this.refresh = this.inline_mode ? this._refresh_inline : this._refresh_embedded;
		if ( !this.inline_mode ) {
			this._create_embedded();
		} else {
			// this.input = $( "<input type=\"text\" />" );
			// this.container = this.element;
			this.element.on( "click change", this._change.bind(this) );
		}


		var today = new Date();

		this.options.minDate = this._determineDate( this.options.minDate, new Date(today.getFullYear() - 10, 1, 1) );
		this.options.maxDate = this._determineDate( this.options.maxDate, new Date(today.getFullYear() + 10, 1, 1) );

		this.current_date  = this._determineDate( this.options.startDate, new Date());
		this.drawFromYear  = this.current_date.getFullYear();
		this.drawFromMonth = this.current_date.getMonth();
		this._updateInput();
		this.refresh();
	},
	_UID: function() {
		return this.uuid;// + "-" + ( ++this.cuid );
	},
	_change: function( event ) {
		var target = null,
			current = this.getCurrentDate(),
			year = current.getFullYear(),
			month = current.getMonth(),
			tmp;

		target = $( event.target ).data( "calendarHandler" ) ? $( event.target ) :
			$( event.target ).parents("[data-calendar-handler]:first");

		console.log( target.data("calendarHandler") );

		switch ( target.data("calendarHandler") ) {
			case "selectDay":
				this.setCurrentDate( new Date(target.data("year"), target.data("month"), target.data("date")) );
				if ( !this.inline_mode ) {
					this.popup_for_embedded.call(this.calendar_container, "close" );
				} else {
					this.refresh();
				}
				break;
			case "prev":
				tmp = ((this.drawFromMonth - 1) % 12);
				this.drawFromMonth = tmp < 0 ? 11 : tmp;
				if ( tmp < 0 ) {
					this.drawFromYear--;
				}
				this.refresh();
				break;
			case "next":
				tmp = (this.drawFromMonth + 1);
				this.drawFromMonth = tmp % 12;
				if ( tmp > 11 ) {
					this.drawFromYear++;
				}
				this.refresh();
				break;
			case "selectMonth":
				if ( event.type == "change" ) {
					this.drawFromMonth = target.val();
					this.refresh();
				}
				break;
			case "selectYear":
				if ( event.type == "change" ) {
					this.drawFromMonth = 1;
					this.drawFromYear = target.val();
					this.refresh();
				}
				break;
			case "popup":
				break;
			case "closepopup":
				this.popup_for_embedded.call(this.calendar_container, "close" );
				break;
		}
	},

	_create_embedded: function() {
		var id = "ui-calendar-obj-" + this._UID();
		this.element.unwrap();

		this.input = this.element;
		this.input.removeAttr( "class" );
		this.input.addClass( "ui-calendar" );
		this.container = $("<div />").addClass( "ui-calendar ui-calendar-embedded" );
		//debugger;
		this.container.attr("data-role", "fieldcontain");
		this.input.wrap(this.container);
		this.container = this.input.parent();
		this.c_button = $("<a href=\"#\">Calendar</a>");
		this.c_button.attr({
			"data-role": "button",
			"data-icon": "grid",
			"data-iconpos": "notext",
			"data-theme": this.options.theme,
			"data-inline": true,
			"data-rel": this.options.popupType,
			"data-position-to": "window",
			// "data-transition": "fade",
			"data-calendar-handler": "popup",
			"href": "#" + id
		});
		// debugger;
		this.c_button.appendTo( this.container );

		this.calendar_container = $( "<div />" ).addClass( "ui-calendar-embedded-box" );
		this.calendar_container.attr({
			"data-role": this.options.popupType,
			"data-theme": this.options.theme,
			"id": id
		});

		if ( this.options.popupAttr != {} ) {
			this.calendar_container.attr( this.options.popupAttr );
		}

		this.popup_for_embedded = this.calendar_container[this.options.popupType];

		this.calendar_container.on( (this.options.popupType == "popup" ? "popupbeforeposition" : "panelbeforeopen"), {
			self: this
		}, function(event, ui){
			event.data.self.refresh();
		});

		this.calendar_container.appendTo( this.container );

		this.container.on( "click change", this._change.bind(this) );
		this.calendar_container.on( "click change", this._change.bind(this) );
	},

	_createTable: function( currentDate ) {
		var result = $( "<div />" ).addClass( "ui-calendar-body" ),
			table, controls, controls_center, week_row, tbody, btn_prev, btn_next, month_select, year_select,
			i, isCurrent, citem, dRow, dow, daySettings, otherMonth, unselectable, drawYear, drawMonth,
			leadDays, curRows, printDate,
			html_body = "",	tdtr = "",
			btn_prev_exists = false,
			showWeek = this.options.showWeek,
			table_columns = showWeek ? 8 : 7,
			beforeShowDay = this.options.beforeShowDay,
			selectOtherMonths = this.options.selectOtherMonths,
			showOtherMonths = this.options.showOtherMonths,
			temp = new Date(),
			today = this._daylightSavingAdjust( new Date(temp.getFullYear(), temp.getMonth(), temp.getDate()) ),
			minDate = this.options.minDate,
			maxDate = this.options.maxDate,
			days = this.texts.dayNamesMin,
			fromMonth = this.drawFromMonth;

		// we need only one previous button
		btn_prev = $( "<a></a>" ).attr({
			"data-role": "button",
			"data-calendar-handler": "prev",
			"data-icon": "arrow-l",
			"data-iconpos": "notext",
			"data-theme": this.options.theme,
			"data-inline": true
		}).addClass( "ui-calendar-prev" ).attr( "href", "#" ).text( this.texts.prevText );

		if ( this.options.changeMonth && this.options.numberOfMonths == 1 ) {
			var current_month = fromMonth,
			months = $.map( this.texts.monthNames, function(m, i) {
				return '<option value="' + i + '"' + (i == current_month ? " selected" : "") + '>' + m + '</option>';
			}).join("\n");
			month_select = $( "<select name=\"month\"> </select>" );
			month_select.attr({"data-calendar-handler": "selectMonth", "data-inline": true, "data-mini": true}).addClass( "ui-calendar-months" );
			month_select.append( months );
		} else {
			month_select = []
			for ( i = 0; i < this.options.numberOfMonths; i++ ) {
				month_select.push( "<a href=\"#\" data-role=\"button\" class=\"ui-calendar-month\" data-mini=\"true\"> " + this.texts.monthNames[(fromMonth + i) % 12] + " </a>" )
			}
		}

		if ( this.options.changeYear && this.options.numberOfMonths == 1 ) {
			var years = (function(from, to){
				var i = from, res = [];
				for (i = from ; i <= to; i++) {
					res.push(i);
				}
				return res;
			}(Math.min(this.options.minDate.getFullYear(), this.drawFromYear) , Math.max(this.options.maxDate.getFullYear(), this.drawFromYear) ));
			var current_year = this.drawFromYear;
			year_select = $("<select name=\"year\"> </select>")
			year_select.attr({
				"data-calendar-handler": "selectYear",
				"data-inline": true,
				"data-mini": true
			}).addClass( "ui-calendar-years" );
			year_select.append(
				$.map( years, function(m, i) {
					return '<option value="' + m + '"' + (m == current_year ? " selected" : "") + '>' + m + '</option>';
				}).join( "\n" )
			);
		} else {
			year_select = [];
			var _y = this.drawFromYear,
				_m = this.drawFromMonth;

			for ( i = 0; i < this.options.numberOfMonths; i++ ) {
				year_select.push( "<a href=\"#\" data-role=\"button\" class=\"ui-calendar-year\" data-mini=\"true\">" + (new Date( _y, _m + i, 1)).getFullYear() + "</a>" );
			}
		}

		// main loop for list of calendars
		for ( citem = 0; citem < this.options.numberOfMonths; citem++ ) {
			table = $( "<div class=\"ui-calendar-table " + (this.options.numberOfMonths == 1 ? "ui-calendar-one" : "") + (citem < this.options.numberOfMonths-1 ? " hasnext" : "") +"\"><table cols=\"" + table_columns + "\">" +
				"<thead>\n" +
					"<tr class=\"ui-calendar-controls\"></tr>\n" +
					"<tr class=\"ui-calendar-head\"></tr>\n" +
				"</thead>\n" +
				"<tbody> </tbody></table></div>" );
			week_row = $( ".ui-calendar-head", table );
			tbody = $( "tbody", table );
			controls = $( ".ui-calendar-controls", table );

			drawMonth = ( fromMonth + citem ) % 12;
			drawYear = this.drawFromYear;

			if ( fromMonth + citem > 12 ) {
				drawYear++;
			}

			//debugger;
			leadDays = ( this._getFirstDayOfMonth(drawYear, drawMonth) - this.texts.firstDay + 7 ) % 7;
			curRows = Math.ceil( (leadDays + this._getDaysInMonth(drawYear, drawMonth)) / 7 );
			printDate = this._daylightSavingAdjust( new Date(drawYear, drawMonth, 1 - leadDays) );

			if ( showWeek ) {
				week_row.append( "<td class=\"ui-calendar-day-name calendar-week-number-name\">" + this.options.weekHeader + "</td>" );
			}

			week_row.append(function(d, firstDay){
				var i, day, result = "";
				for (i = 0; i < 7; i++) {
					day = (i + firstDay) % 7;
					result += "<td class=\"ui-calendar-day-name\">" + d[day] + "</td>";
				}
				return result;
			}(days, this.texts.firstDay));

			btn_next = $( "<a></a>" ).attr({
				"data-role": "button",
				"data-icon": "arrow-r",
				"data-calendar-handler": "next",
				"data-iconpos": "notext",
				"data-theme": this.options.theme,
				"data-inline": true
			}).addClass( "ui-calendar-next ui-calendar-next-" + citem ).attr("href", "#").text(this.texts.nextText);

			if ( !btn_prev_exists ) {
				controls.append( $("<td class=\"ui-calendar-controls ui-calendar-controls-prev\"></td>").append( btn_prev ) );
				btn_prev_exists = true;
			}

			controls_center = $("<td class=\"ui-calendar-controls ui-calendar-controls-selects\"></td>").attr({
				colspan: citem == 0 ? table_columns - 2: table_columns - 1
			});
			controls_center.append( ($.isArray(month_select) ?  month_select[citem] : month_select) );
			controls_center.append( ($.isArray(year_select) ? year_select[citem] : year_select) );

			controls.append( controls_center );
			controls.append( $("<td class=\"ui-calendar-controls ui-calendar-controls-next\"></td>").append( btn_next ) );

			html_body = "";
			for ( dRow = 0; dRow < curRows; dRow++ ) { // rows
				html_body += "<tr>";

				tdtr = ( !showWeek ? "" : "<td class=\"calendar-week-number\">" + this.iso8601Week(printDate) + "</td>" );
				for ( dow = 0; dow < 7; dow++ ) { // days
					isCurrent = printDate.getFullYear() == this.current_date.getFullYear() && printDate.getMonth() == this.current_date.getMonth() && printDate.getDate() == this.current_date.getDate();
					daySettings = (beforeShowDay ?
						beforeShowDay.apply((this.input ? this.input[0] : null), [printDate]) : [true, ""]);
					otherMonth = (printDate.getMonth() !== drawMonth);
					unselectable = (otherMonth && !selectOtherMonths) || !daySettings[0] ||
						(minDate && printDate < minDate) || (maxDate && printDate > maxDate);
					tdtr += "<td class='" +
						((dow + this.texts.firstDay + 6) % 7 >= 5 ? " ui-calendar-week-end" : "") + // highlight weekends
						(otherMonth ? " ui-calendar-other-month ui-ui-calendar-day-off" : " ui-calendar-day") + // highlight days from other months

						// ((printDate.getTime() === selectedDate.getTime() && drawMonth === this.selectedMonth && this._keyEvent) || // user pressed key
						// (defaultDate.getTime() === printDate.getTime() && defaultDate.getTime() === selectedDate.getTime()) ?
						// // or defaultDate is current printedDate and defaultDate is selectedDate
						// " " + this._dayOverClass : "") + // highlight selected day
						(unselectable ? " ui-calendar-state-disabled": "") +  // highlight unselectable days

						(otherMonth && !showOtherMonths ? "" : " " + daySettings[1] + // highlight custom dates

						(printDate.getTime() === currentDate.getTime() && isCurrent ? " ui-calendar-active" : "") + // highlight selected day

						(printDate.getTime() === today.getTime() ? " ui-calendar-today" : "")) + "'" + // highlight today (if different)

						((!otherMonth || showOtherMonths) && daySettings[2] ? " title='" + daySettings[2].replace(/'/g, "&#39;") + "'" : "") + // cell title
						(!unselectable ? " data-calendar-handler='selectDay' "+
								"data-event='click' "+
								"data-month='" + printDate.getMonth() + "' "+
								"data-year='" + printDate.getFullYear() + "' "+
								"data-date='" + printDate.getDate() + "'" : ""
						) + "> " +
						(otherMonth && !showOtherMonths ? "&#xa0;" : // display for other months
							(unselectable ? "<span class='calendar-state-default'>" + printDate.getDate() + "</span>" : "<a "+
								"class='ui-calendar-state-default" +
							(printDate.getTime() === today.getTime() ? " ui-calendar-state-highlight" : "") +
							(printDate.getTime() === currentDate.getTime() && isCurrent  ? " ui-calendar-state-active" : "") + // highlight selected day
							(otherMonth ? " ui-calendar-priority-secondary" : "") + // distinguish dates from other months
							"' href='#'>" + printDate.getDate() + "</a>")
						) + "</td>"; // display selectable date
					printDate.setDate(printDate.getDate() + 1);
					printDate = this._daylightSavingAdjust(printDate);
				}
				html_body += tdtr + "</tr>";
			}
			tbody.append( html_body );

			table.appendTo(result);
		}

		return result;
	},

	_refresh_inline: function() {
		this.element.html( "" );

		var cdate = this.getCurrentDate();

		$("<div />")
			.addClass( "ui-calendar-body" )
			.append( this._createTable( cdate ) )
			.appendTo( this.element );

		this.element.trigger( "create" );
	},

	_refresh_embedded: function() {
		var cdate = this.getCurrentDate();

		this.calendar_container.html( "" );
		this._createTable( cdate ).appendTo( this.calendar_container );

		if ( this.options.closeBtn ){
			var closeBtn = $("<a href=\"#\">" + this.texts.closeText + "</a>");
			closeBtn.attr({
				"data-rel": "close",
				"data-role": "button",
				"data-theme": this.options.theme,
				"data-icon": "delete",
				"data-inline": true,
				"data-calendar-handler": "closepopup"
			});

			this.calendar_container.append( closeBtn );
		}

		this.calendar_container.trigger( "create" );
		this.container.trigger( "create" );
	},

	_setOption: function(key, value) {
		switch( key ) {
			case "dateFormat":
				this.texts.dateFormat = this.options.dateFormat = value;
				break;
			case "startDate":
				this.current_date = this._determineDate(value, new Date());
			default:
				if ( this.options.hasOwnProperty(key) ) {
					this.options[key] = value;
				}
		}
	},

	getCurrentDate: function(){
		return this._daylightSavingAdjust(this.current_date);
	},

	getWeekDayName: function(){
		return this.texts.dayNames[this.current_date.getDay()];
	},

	getMonthName: function(){
		return this.texts.monthNames[this.current_date.getMonth()];
	},

	setCurrentDate: function( date, format ){
		this.current_date = this._determineDate( date, new Date(), format );
		this._updateInput();
		return this;
	},

	_updateInput: function(){
		this.input.val( this.formatDate( this.options.dateFormat, this.getCurrentDate() ) );
	},

	/* Find the day of the week of the first of a month. */
	_getFirstDayOfMonth: function(year, month) {
		return new Date(year, month, 1).getDay();
	},

	/* A date may be specified as an exact value or a relative one. */
	_determineDate: function(date, defaultDate, format) {
		var offsetNumeric = function(offset) {
				var date = new Date();
				date.setDate(date.getDate() + offset);
				return date;
			},
			that = this,
			offsetString = function(offset) {
				try {
					return that.parseDate(format || that.options.dateFormat, offset);
				}
				catch (e) {
					// Ignore
				}

				var date = (offset.toLowerCase().match(/^c/) ?
					that.getCurrentDate() : null) || new Date(),
					year = date.getFullYear(),
					month = date.getMonth(),
					day = date.getDate(),
					pattern = /([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,
					matches = pattern.exec(offset);

				while (matches) {
					switch (matches[2] || "d") {
						case "d" : case "D" :
							day += parseInt(matches[1],10); break;
						case "w" : case "W" :
							day += parseInt(matches[1],10) * 7; break;
						case "m" : case "M" :
							month += parseInt(matches[1],10);
							day = Math.min(day, that._getDaysInMonth(year, month));
							break;
						case "y": case "Y" :
							year += parseInt(matches[1],10);
							day = Math.min(day, that._getDaysInMonth(year, month));
							break;
					}
					matches = pattern.exec(offset);
				}
				return new Date(year, month, day);
			},
			newDate = (date == null || date === "" ? defaultDate :
				(typeof date === "string" ? offsetString(date) :
					(typeof date === "number" ? (isNaN(date) ? defaultDate : offsetNumeric(date)) :
						new Date(date.getTime())
					)
				)
			);

		newDate = (newDate && newDate.toString() === "Invalid Date" ? defaultDate : newDate);
		if (newDate) {
			newDate.setHours(0);
			newDate.setMinutes(0);
			newDate.setSeconds(0);
			newDate.setMilliseconds(0);
		}
		return this._daylightSavingAdjust(newDate);
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
			shortYearCutoffTemp = (settings ? settings.shortYearCutoff : null) || this.options.shortYearCutoff,
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

	/* Set as beforeShowDay function to prevent selection of weekends.
	 * @param  date  Date - the date to customise
	 * @return [boolean, string] - is this date selectable?, what is its CSS class?
	 */
	noWeekends: function(date) {
		var day = date.getDay();
		return [(day > 0 && day < 6), ""];
	},

	/* Set as calculateWeek to determine the week of the year based on the ISO 8601 definition.
	 * @param  date  Date - the date to get the week for
	 * @return  number - the number of the week within the year that contains this date
	 */
	iso8601Week: function(date) {
		var time,
			checkDate = new Date(date.getTime());

		// Find Thursday of this week starting on Monday
		checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));

		time = checkDate.getTime();
		checkDate.setMonth(0); // Compare with Jan 1
		checkDate.setDate(1);
		return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
	},

	getDateString: function(format) {
		format = format || this.options.dateFormat;

		return this.formatDate( format, this.getCurrentDate() );
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

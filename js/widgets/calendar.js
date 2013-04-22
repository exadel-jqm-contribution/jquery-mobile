//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Creates calendar from list of images or html-blocks.
//>>label: calendar
//>>group: Widgets
//>>css.structure: ../css/structure/jquery.mobile.calendar.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

define( ["jquery", "../jquery.mobile.widget", "widgets/forms/textinput" ], function ( jQuery ) {
//>>excludeEnd( "jqmBuildExclude" );

(function( $, undefined ){

$.widget( "mobile.calendar", $.mobile.textinput, {
	options:{
		dateFormat: "mm/dd/yy",
		startDate: null,
		minDate: null,
		maxDate: null,
		changeMonth: true,
		changeYear: true,
		inputName: "mobilecalendar",
		regional: "_",
		theme: "c",
		monthsTheme: false,
		yearsTheme: false,
		buttonsTheme: false,
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
		if ( this.inline_mode ) {
			this.input = $( "<input type=\"hidden\" name=\"" + this.options.inputName + "\"/>" );
			this.input.appendTo( this.element );
			this.container = this.element;
			this.element.on( "click tap change", this._change.bind(this) );
		} else {
			if ( !this.element.data().hasOwnProperty( "mobileTextinput" ) ) {
				this._super();
			}
			this._create_embedded();
		}
		this.element.on( "orientationchange", this._refresh_table.bind(this) );
		$(window).resize( this._refresh_table.bind(this) );

		var today = new Date();

		this.options.minDate = this._determineDate( this.options.minDate, new Date(today.getFullYear() - 10, 12, 31) );
		this.options.maxDate = this._determineDate( this.options.maxDate, new Date(today.getFullYear() + 10, 12, 31) );

		this.current_date  = this._determineDate( this.options.startDate, new Date());

		this.options.minDate.setTime( Math.min(this.options.minDate.getTime(), this.current_date.getTime()) );
		this.options.maxDate.setTime( Math.max(this.options.maxDate.getTime(), this.current_date.getTime()) );

		this.drawFromYear  = this.current_date.getFullYear();
		this.drawFromMonth = this.current_date.getMonth();
		this._updateInput();
		this.refresh();
		return this;
	},

	_destroy: function() {
		if ( this.inline_mode ) {
			// we must replace block by input with current date
			var input = $("<input />");
			input.attr({
				type: "text",
				name: this.options.inputName,
				value: this.formatDate( this.options.dateFormat, this.getCurrentDate() )
			});
			if ( this.element.attr("id") ){
				input.attr("id", this.element.attr("id") );
			}
			this.element.after(input.wrap("<div />"));
			input.parent().trigger( "create" );
		} else {
			this.c_button.data("calendarHandler", null);
			this.c_button.remove();
			this.input.data("calendarHandler", null);
		}
	},

	getUUID: function() {
		return this.uuid;
	},

	_change: function( event ) {
		if ( event.type != "click" && event.type != "change" && event.type != "tap" ) {
			return;
		}

		var target = null,
			current = this.getCurrentDate(),
			year = current.getFullYear(),
			month = current.getMonth(),
			cevent,
			event_data = {},
			tmp;

		target = $( event.target ).data( "calendarHandler" ) ? $( event.target ) :
					$( event.target ).parents("[data-calendar-handler]:first");
		switch ( target.data("calendarHandler") ) {
			case "selectDay":
				event_data = {
					selectedDate: new Date(target.data("year"), target.data("month"), target.data("date"))
				};
				this.setCurrentDate( event_data.selectedDate );
				if ( !this.inline_mode ) {
					this.popup_for_embedded.call(this.calendar_container, "close" );
				}
				this.refresh(true);
				break;
			case "prev":
				tmp = (this.drawFromMonth - 1);

				if ( tmp < 0 ) {
					this.drawFromYear--;
					this.drawFromMonth = 11;
				} else {
					this.drawFromMonth = tmp % 12;
				}
				event_data = {
					year: this.drawFromYear,
					month: this.drawFromMonth
				};
				this.refresh(false);
				break;
			case "next":
				tmp = (this.drawFromMonth + 1);
				if ( tmp >= 12 ) {
					this.drawFromYear++;
					this.drawFromMonth = 0;
				} else {
					this.drawFromMonth = tmp % 12;
				}
				event_data = {
					year: this.drawFromYear,
					month: this.drawFromMonth
				};
				this.refresh(false);
				break;
			case "selectMonth":
				if ( event.type == "change" ) {
					this.drawFromMonth = parseInt(target.val(), 10);
					event_data = {
						year: this.drawFromYear,
						month: this.drawFromMonth
					};
					this.refresh(false);
				}
				break;
			case "selectYear":
				if ( event.type == "change" ) {
					this.drawFromMonth = 0;
					this.drawFromYear = parseInt(target.val(), 10);
					event_data = {
						year: this.drawFromYear,
						month: this.drawFromMonth
					};
					this.refresh(false);
				}
				break;
			case "popup":
				this.popup_for_embedded.call(this.calendar_container, "open" );
				break;
			case "closepopup":
				this.popup_for_embedded.call(this.calendar_container, "close" );
				break;
		}

		if ( target.data("calendarHandler") ){
			event_data = $.extend( {}, event_data, {
				baseType: event.type
			} );
			cevent = $.Event(
				"calendar" + target.data("calendarHandler").toLowerCase()
			);

			this.element.trigger( cevent, event_data );
		}
		event.preventDefault();
	},

	_create_embedded: function() {
		var id = "ui-calendar-obj-" + this.uuid;
		this.input = this.element;

		this.container = this.input.parent();

		this.c_button = $( "<a href=\"#\">Calendar</a>" );
		this.c_button.addClass( "ui-calendar-popup-btn" ).attr({
			"data-role": "button",
			"data-icon": "grid",
			"data-iconpos": "notext",
			"data-theme": this.options.buttonsTheme || this.options.theme,
			"data-inline": true,
			"data-rel": this.options.popupType,
			"data-position-to": "window",
			"data-calendar-handler": "popup",
			"href": "#" + id
		});

		this.input.data( "calendarHandler", "popup" );

		var t = this.c_button.wrap("<span />");
		t.parent().appendTo( this.container );
		t.parent().trigger( "create" );

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

		if ( this.options.popupType == "popup" ) {
			this.calendar_container.on( "popupbeforeposition", {
				self: this
			}, function(event){
				event.data.self._refresh_table();
			});
		}

		if ( this.options.popupType == "popup" ) {
			t = this.calendar_container.wrap( $("<div />") );
			t.parent().insertAfter( this.container );
		} else {
			t = this.element.parents(".ui-page");
			this.calendar_container.wrap( $("<div />") ).parent().prependTo( t );
		}

		this.container.on( "click tap change", this._change.bind(this) );
		this.calendar_container.on( "click tap change", this._change.bind(this) );
	},

	_createTable: function( currentDate ) {
		var table, controls, controls_center, week_row, btn_prev, btn_next, month_select, year_select,
			i, isCurrent, citem, dRow, dow, daySettings, otherMonth, unselectable, drawYear, drawMonth,
			leadDays, curRows, printDate,
			html_body = "",	tdtr = "", result = "",
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
			fromMonth = this.drawFromMonth,
			monthUseSelect = this.options.changeMonth && this.options.numberOfMonths == 1,
			yearUseSelect = this.options.changeYear && this.options.numberOfMonths == 1;

		// we need only one previous button
		btn_prev = ["<a",
			"data-role=\"button\"",
			"data-calendar-handler=\"prev\"",
			"data-icon=\"arrow-l\"",
			"data-iconpos=\"notext\"",
			"data-theme=\"" + (this.options.buttonsTheme || this.options.theme) + "\"",
			"data-inline=\"true\"",
			"class=\"ui-calendar-prev\" href=\"#\">" + this.texts.prevText + "</a>",
		].join(" ");

		if ( monthUseSelect ) {
			var current_month = fromMonth,
			months = $.map( this.texts.monthNames, function(m, i) {
				return '<option value="' + i + '"' + (i == current_month ? " selected" : "") + '>' + m + '</option>';
			});

			month_select = [
			"<select name=\"month\" class=\"ui-calendar-months\"",
				"data-calendar-handler=\"selectMonth\"",
				"data-inline=\"true\"",
				"data-mini=\"true\"",
				"data-theme=\"" + (this.options.monthsTheme || this.options.theme) + "\">"
			];
			month_select = month_select.concat( months, ["</select>"] );

		} else {
			month_select = []
			for ( i = 0; i < this.options.numberOfMonths; i++ ) {
				month_select.push( "<a href=\"#\" data-role=\"button\"" +
					"data-theme=\"" + (this.options.monthsTheme || this.options.theme)+"\" " +
					"class=\"ui-calendar-month\" data-mini=\"true\"> " + this.texts.monthNames[(fromMonth + i) % 12] + " </a>" )
			}
		}

		if ( yearUseSelect ) {
			var current_year = this.drawFromYear,
				years = (function(from, to){
					var res = [];
					for (; from <= to; from++) {
						res.push( '<option value="' + from + '"' + (from == current_year ? " selected" : "") + '>' + from + '</option>' );
					}
					return res;
				}( Math.min(this.options.minDate.getFullYear(), this.drawFromYear) , Math.max(this.options.maxDate.getFullYear(), this.drawFromYear) ));

			year_select = [
			"<select name=\"year\" class=\"ui-calendar-years\"",
				"data-calendar-handler=\"selectYear\"",
				"data-inline=\"true\"",
				"data-mini=\"true\"",
				"data-theme=\"" + (this.options.yearsTheme || this.options.theme) + "\""
			];

			year_select = year_select.concat( years, ["</select>"] );
		} else {
			year_select = [];
			var _y = this.drawFromYear,
				_m = this.drawFromMonth;

			for ( i = 0; i < this.options.numberOfMonths; i++ ) {
				year_select.push( "<a href=\"#\" data-role=\"button\" " +
					"data-theme=\"" + (this.options.yearsTheme || this.options.theme)+"\" " +
					"class=\"ui-calendar-year\" data-mini=\"true\">" + (new Date( _y, _m + i, 1)).getFullYear() + "</a>" );
			}
		}

		// main loop for list of calendars
		for ( citem = 0; citem < this.options.numberOfMonths; citem++ ) {
			table = ["<div class=\"ui-calendar-table " + (this.options.numberOfMonths == 1 ? "ui-calendar-one" : "") + "\">",
				"<table cols=\"" + table_columns + "\">",
				"<thead>",
					"<tr class=\"ui-calendar-controls\">{{controls}}</tr>",
					"<tr class=\"ui-calendar-head\">{{head}}</tr>",
				"</thead>",
				"<tbody>{{tbody}}</tbody></table></div>"].join( "" );
			week_row = [];
			controls = [];
			controls_center = [];

			drawMonth = ( fromMonth + citem ) % 12;
			drawYear = this.drawFromYear;

			if ( fromMonth + citem > 12 ) {
				drawYear++;
			}

			leadDays = ( this._getFirstDayOfMonth(drawYear, drawMonth) - this.texts.firstDay + 7 ) % 7;
			curRows = Math.ceil( (leadDays + this._getDaysInMonth(drawYear, drawMonth)) / 7 );
			printDate = this._daylightSavingAdjust( new Date(drawYear, drawMonth, 1 - leadDays) );

			if ( showWeek ) {
				week_row.push("<td class=\"ui-calendar-day-name calendar-week-number-name\">" + this.options.weekHeader);
			}

			week_row.push(function(d, firstDay){
				var i, day, result = "";
				for (i = 0; i < 7; i++) {
					day = (i + firstDay) % 7;
					result += "<td class=\"ui-calendar-day-name\">" + d[day] + "</td>";
				}
				return result;
			}(days, this.texts.firstDay));

			btn_next = ["<a href='#' class='ui-calendar-next'",
				"data-role=\"button\"",
				"data-icon=\"arrow-r\"",
				"data-calendar-handler=\"next\"",
				"data-iconpos=\"notext\"",
				"data-theme=\"" + (this.options.buttonsTheme || this.options.theme) + "\"",
				"data-inline=\"true\"",
				">" + this.texts.nextText + "</a>"].join( " " );

			if ( !btn_prev_exists ) {
				controls.push( "<td class=\"ui-calendar-control ui-calendar-controls-prev\">" + btn_prev + "</td>" );
				btn_prev_exists = true;
			}

			controls_center = [
				"<td class=\"ui-calendar-control ui-calendar-controls-selects\" ",
					"colspan='" + (citem == 0 ? table_columns - 2: table_columns - 1) + "'>",
					"<div data-role=\"controlgroup\" data-type=\"horizontal\" data-mini=\"true\">"
			];
			if ( monthUseSelect ) {
				controls_center.push( month_select.join(" ") );
			} else {
				controls_center.push( month_select[citem] );
			}

			if ( yearUseSelect ) {
				controls_center.push( year_select.join(" ") );
			} else {
				controls_center.push( year_select[citem] );
			}

			controls = controls.concat( controls_center, ["<td class=\"ui-calendar-control ui-calendar-controls-next\">", btn_next, "</td>"] );
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
					tdtr += "<td class='ui-calendar-time-" + printDate.getTime() +
						((dow + this.texts.firstDay + 6) % 7 >= 5 ? " ui-calendar-week-end" : "") + // highlight weekends
						(otherMonth ? " ui-calendar-other-month ui-ui-calendar-day-off" : " ui-calendar-day") + // highlight days from other months

						(unselectable ? " ui-calendar-state-disabled": "") +  // highlight unselectable days

						(otherMonth && !showOtherMonths ? "" : " " + daySettings[1] + // highlight custom dates

						(printDate.getTime() === currentDate.getTime() && isCurrent ? " ui-calendar-active" : "") + // highlight selected day

						(printDate.getTime() === today.getTime() ? " ui-calendar-today" : "")) + "'" + // highlight today (if different)

						((!otherMonth || showOtherMonths) && daySettings[2] ? " title='" + daySettings[2].replace(/'/g, "&#39;") + "'" : "") + // cell title
						(!unselectable ? " data-calendar-handler='selectDay' "+
								"data-month='" + printDate.getMonth() + "' "+
								"data-year='" + printDate.getFullYear() + "' "+
								"data-date='" + printDate.getDate() + "'" : ""
						) + ">" +
						(otherMonth && !showOtherMonths ? "&nbsp;" : // display for other months
							(unselectable ? "<span class='calendar-state-default'>" + printDate.getDate() + "</span>" : "<a "+
								"class='ui-calendar-state-default ui-link" +
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

			table = table.replace( "{{controls}}", controls.join("") );
			table = table.replace( "{{head}}", week_row.join("") );
			table = table.replace( "{{tbody}}", html_body );
			result += table;
		}
		return $("<div class=\"ui-calendar-body\">" + result + "</div>");
	},

	_updateTable: function( currentDate ) {
		var body = this.$tables;
		currentDate.setHours(0);
		currentDate.setMinutes(0);
		currentDate.setSeconds(0);
		currentDate.setMilliseconds(0);
		body.find( ".ui-calendar-day.ui-calendar-active" ).removeClass( "ui-calendar-active" );

		body.find( ".ui-calendar-day.ui-calendar-time-" + currentDate.getTime() ).addClass( "ui-calendar-active" );
	},

	_refresh_inline: function(update_only) {
		var cdate = this.getCurrentDate();
		if ( update_only ) {
			this._updateTable( cdate );
		} else {
			this.element.find( ".ui-calendar-body" ).remove();
			this.$tables = this._createTable( cdate );
			this.$tables.appendTo( this.element );

			this.element.trigger( "create" );
			this._refresh_table_size();
			this._refresh_table();
		}
	},

	_refresh_table_size: function() {
		var maxHeight = -1,
			maxWidth = -1,
			list = this.$tables.find(".ui-calendar-table");

		list.each(function(index, el){
			$(el).width( "auto" );
			maxHeight = Math.max($(el).height(), maxHeight);
			maxWidth = Math.max($(el).width(), maxWidth);
		});
		list.height(maxHeight + "px");
		list.width(maxWidth + "px");
	},

	_refresh_table: function() {
		if ( !this.$tables ) return;
		var	first_y_offset = -1,
			prev = null,
			list = this.$tables.find(".ui-calendar-table");

		prev = $( list.get(0) );
		first_y_offset = prev.position().top;

		list.find(".ui-calendar-controls-next a").hide();
		list.each(function(index, el){
			if ( $(el).position().top != first_y_offset  ) {
				return false;
			} else {
				prev = $(el);
				prev.find(".ui-calendar-controls-next a").hide();
			}
		});
		var btn = prev.find(".ui-calendar-controls-next a");
		if ( btn.css("display") != "inline-block" ) {
			btn.css({
				display: "inline-block"
			});
		}
	},

	_refresh_embedded: function(update_only) {
		var cdate = this.getCurrentDate();
		if ( update_only ) {
			this._updateTable( cdate );
		} else {
			this.calendar_container.html( "" );
			this.$tables = this._createTable( cdate );
			this.$tables.appendTo( this.calendar_container );

			if ( this.options.closeBtn ){
				var closeBtn = $("<a href=\"#\">" + this.texts.closeText + "</a>");
				closeBtn.attr({
					"data-rel": "close",
					"data-role": "button",
					"data-theme": this.options.buttonsTheme || this.options.theme,
					"data-icon": "delete",
					"data-inline": true,
					"data-calendar-handler": "closepopup"
				});

				this.calendar_container.append( closeBtn );
			}

			this.calendar_container.parent().trigger( "create" );
			this.$tables.trigger( "create" );
			this._refresh_table_size();
			this._refresh_table();
		}
	},

	_setOption: function(key, value) {
		var temp;
		switch( key ) {
			case "dateFormat":
				this.texts.dateFormat = this.options.dateFormat = this.getStandartFormat( value );
				break;
			case "startDate":
				temp = this._determineDate( value, new Date() );
				temp.setTime( Math.max( temp.getTime(), this.options.minDate.getTime()) );
				temp.setTime( Math.min( temp.getTime(), this.options.maxDate.getTime()) );
				this.current_date = temp;
			case "regional":
				this.setRegional( value );
				break;
			default:
				if ( this.options.hasOwnProperty(key) ) {
					this.options[key] = value;
				}
		}
		this._updateInput();
		this.refresh();
	},

	getCurrentDate: function(){
		return this._daylightSavingAdjust( this.current_date );
	},

	getWeekDayName: function(){
		return this.texts.dayNames[this.current_date.getDay()];
	},

	getMonthName: function(){
		return this.texts.monthNames[this.current_date.getMonth()];
	},

	setCurrentDate: function( date, format ){
		this.options.startDate = this.current_date = this._determineDate( date, new Date(), format || this.options.dateFormat);
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
		format = this.getStandartFormat( format );
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
	standart_formats: {
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
		W3C: "yy-mm-dd" // ISO 8601
	},

	getStandartFormat: function(name) {
		return this.standart_formats[name] || name;
	},

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
		format = this.getStandartFormat( format );
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

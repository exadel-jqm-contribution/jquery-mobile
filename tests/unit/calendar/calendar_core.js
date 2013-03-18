/*
 * mobile calendar unit tests
 */
(function($){
	module( "jquery.mobile.calendar.js" );

	Date.prototype.toStr = function() { // don't overload toString
		return this.getFullYear() + "-" + (this.getMonth() + 1) + "-" + this.getDate();
	};

	var equalsDate = function( d1, d2, message) {
			equal( d1.toStr(), d2.toStr(), message );
		},
		today = new Date(),
		localization = {
			closeText: 'Закрыть',
			prevText: '&#x3C;Пред',
			nextText: 'След&#x3E;',
			currentText: 'Сегодня',
			monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь',
			'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
			monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн',
			'Июл','Авг','Сен','Окт','Ноя','Дек'],
			dayNames: ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],
			dayNamesShort: ['вск','пнд','втр','срд','чтв','птн','сбт'],
			dayNamesMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
			weekHeader: 'Нед',
			dateFormat: 'dd.mm.yy',
			firstDay: 1,
			isRTL: false,
			showMonthAfterYear: false,
			yearSuffix: ''
		};


	test( "add localization and set with initialization", function() {
		$.mobile.calendar.prototype.regional["ru"] = localization;

		var c = $("#calendar").calendar({
			regional: "ru"
		});

		equal( c.calendar("getWeekDayName"), localization.dayNames[today.getDay()], "current day of week: " + localization.dayNames[today.getDay()] );
		equal( c.calendar("getMonthName"), localization.monthNames[today.getMonth()], "current month: " + localization.monthNames[today.getMonth()] );
	});

	test( "add localization and set after initialization", function() {
		$.mobile.calendar.prototype.regional["ru"] = localization;
		var c = $("#calendar").calendar();
		notEqual( c.calendar("getWeekDayName"), localization.dayNames[today.getDay()],
			"current day of week must use default localization" );
		c.calendar( "setRegional", "ru" );
		equal( c.calendar("getWeekDayName"), localization.dayNames[today.getDay()],
			"current day of week with new localization: " + localization.dayNames[today.getDay()] );
		equal( c.calendar("getMonthName"), localization.monthNames[today.getMonth()],
			"current month with new localization: " + localization.monthNames[today.getMonth()] );
	});

	test( "set date", function(){
		var c = $("#calendar").calendar({
			startDate: "today"
		}), d1;

		equal( c.calendar("getCurrentDate").toStr(), today.toStr(), "check: 'today'" );

		d1 = new Date( today.getFullYear(), today.getMonth(), today.getDate() + 1 );
		c.calendar( "setCurrentDate", "tomorrow" );
		equal( c.calendar("getCurrentDate").toStr(), d1.toStr(), "check: 'tommorow' " + d1.toStr());

		d1 = new Date( today.getFullYear(), today.getMonth() + 1, 1 );
		c.calendar( "setCurrentDate", "next month" );
		equal( c.calendar("getCurrentDate").toStr(), d1.toStr(), "check: 'next month' " + d1.toStr());

		d1 = new Date( today.getFullYear() + 1, today.getMonth(), today.getDate() );
		c.calendar( "setCurrentDate", "next year" );
		equal( c.calendar("getCurrentDate").toStr(), d1.toStr(), "check: 'next year' " + d1.toStr());

		d1 = new Date( today.getFullYear(), today.getMonth() + 6, today.getDate() );
		c.calendar( "setCurrentDate", "after six months" );
		equal( c.calendar("getCurrentDate").toStr(), d1.toStr(), "check: 'after six months' " + d1.toStr());
	});

	test( "formats support date -- parse Date", function() {
		var c = $("#calendar").calendar(),
			d = c.calendar( "option", "startDate", "today" )
				 .calendar( "option", "dateFormat", "d/m/y" )
				 .calendar( "getDateString" ),
			current_local = $.mobile.calendar.prototype.default_regional;

		equal( d, today.getDate() + "/" + (today.getMonth() + 1) + "/" + (today.getYear() - 100), "check d/m/y -- " + d );

		d = c.calendar( "setCurrentDate", "next month" ).calendar( "getDateString" );
		equal( d, "1/" + (today.getMonth() + 2) + "/" + (today.getYear() - 100), "check d/m/y with next month -- " + d );

		d = c.calendar( "setCurrentDate", "today" ).calendar( "option", "dateFormat", "yy-m-d" ).calendar( "getDateString" );
		equal( d, today.toStr(), "check yy-m-d with next month -- " + d );

		d = c.calendar( "setCurrentDate", "2013-12-01", "yy-mm-dd" ).calendar( "option", "dateFormat", "y-m-d" ).calendar( "getDateString" );
		equal( d, "13-12-1", "check parse date \"2013-12-01\" and return y-m-d -- " + d );

		d = c.calendar( "setCurrentDate", "2013-2-01", "yy-m-dd" ).calendar( "option", "dateFormat", "y-mm-d" ).calendar( "getDateString" );
 		equal ( d, "13-02-1", "convert date" );


 		equalsDate(c.calendar( "parseDate", "d m y", "3 2 01" ),
			new Date(2001, 2 - 1, 3), "Parse date d m y" );
		equalsDate(c.calendar( "parseDate", "dd mm yy", "03 02 2001" ),
			new Date(2001, 2 - 1, 3), "Parse date dd mm yy" );
		equalsDate(c.calendar( "parseDate", "d m y", "13 12 01" ),
			new Date(2001, 12 - 1, 13), "Parse date d m y" );
		equalsDate(c.calendar( "parseDate", "dd mm yy", "13 12 2001" ),
			new Date(2001, 12 - 1, 13), "Parse date dd mm yy" );
		equalsDate(c.calendar( "parseDate", "y-o", "01-34" ),
			new Date(2001, 2 - 1, 3), "Parse date y-o" );
		equalsDate(c.calendar( "parseDate", "yy-oo", "2001-347" ),
			new Date(2001, 12 - 1, 13), "Parse date yy-oo" );
		equalsDate(c.calendar( "parseDate", "oo yy", "348 2004" ),
			new Date(2004, 12 - 1, 13), "Parse date oo yy" );
		equalsDate(c.calendar( "parseDate", "D d M y", "Sat 3 Feb 01" ),
			new Date(2001, 2 - 1, 3), "Parse date D d M y" );
		equalsDate(c.calendar( "parseDate", "d MM DD yy", "3 February Saturday 2001" ),
			new Date(2001, 2 - 1, 3), "Parse date dd MM DD yy" );
		equalsDate(c.calendar( "parseDate", "DD, MM d, yy", "Saturday, February 3, 2001" ),
			new Date(2001, 2 - 1, 3), "Parse date DD, MM d, yy" );

		equalsDate(c.calendar( "parseDate", "'day' d 'of' MM (''DD''), yy",
			"day 3 of February ('Saturday'), 2001"), new Date(2001, 2 - 1, 3),
			"Parse date 'day' d 'of' MM (''DD''), yy" );

		currentYear = new Date().getFullYear();

		equalsDate(c.calendar( "parseDate", "y-m-d", (currentYear - 2000) + "-02-03" ),
				new Date(currentYear, 2 - 1, 3), "Parse date y-m-d - default cutuff" );
		equalsDate(c.calendar( "parseDate", "y-m-d", (currentYear - 2000 + 10) + "-02-03" ),
				new Date(currentYear+10, 2 - 1, 3), "Parse date y-m-d - default cutuff" );
		equalsDate(c.calendar( "parseDate", "y-m-d", (currentYear - 2000 + 11) + "-02-03" ),
				new Date(currentYear-89, 2 - 1, 3), "Parse date y-m-d - default cutuff" );
		equalsDate(c.calendar( "parseDate", "y-m-d", "80-02-03", {shortYearCutoff: 80}),
			new Date(2080, 2 - 1, 3), "Parse date y-m-d - cutoff 80" );
		equalsDate(c.calendar( "parseDate", "y-m-d", "81-02-03", {shortYearCutoff: 80}),
			new Date(1981, 2 - 1, 3), "Parse date y-m-d - cutoff 80" );
		equalsDate(c.calendar( "parseDate", "y-m-d", (currentYear - 2000 + 60) + "-02-03", {shortYearCutoff: "+60"}),
				new Date(currentYear + 60, 2 - 1, 3), "Parse date y-m-d - cutoff +60" );
		equalsDate(c.calendar( "parseDate", "y-m-d", (currentYear - 2000 + 61) + "-02-03", {shortYearCutoff: "+60"}),
				new Date(currentYear - 39, 2 - 1, 3), "Parse date y-m-d - cutoff +60" );
		gmtDate = new Date(2001, 2 - 1, 3);
		gmtDate.setMinutes(gmtDate.getMinutes() - gmtDate.getTimezoneOffset());
		equalsDate(c.calendar( "parseDate", "@", "981158400000" ), gmtDate, "Parse date @" );
		equalsDate(c.calendar( "parseDate", "!", "631167552000000000" ), gmtDate, "Parse date !" );


		var fr = $.mobile.calendar.prototype.regional.fr;
		settings = { dayNamesShort: fr.dayNamesShort, dayNames: fr.dayNames,
			monthNamesShort: fr.monthNamesShort, monthNames: fr.monthNames};
		equalsDate(c.calendar( "parseDate", "D d M y", "Lun. 9 Avril 01", settings),
			new Date(2001, 4 - 1, 9), "Parse date D M y with settings");
		equalsDate(c.calendar( "parseDate", "d MM DD yy", "9 Avril Lundi 2001", settings),
			new Date(2001, 4 - 1, 9), "Parse date d MM DD yy with settings");
		equalsDate(c.calendar( "parseDate", "DD, MM d, yy", "Lundi, Avril 9, 2001", settings),
			new Date(2001, 4 - 1, 9), "Parse date DD, MM d, yy with settings");
		equalsDate(c.calendar( "parseDate", "'jour' d 'de' MM (''DD''), yy", "jour 9 de Avril ('Lundi'), 2001", settings),
			new Date(2001, 4 - 1, 9), "Parse date 'jour' d 'de' MM (''DD''), yy with settings");

		var zh = $.mobile.calendar.prototype.regional["zh-CN"];
		equalsDate(c.calendar( "parseDate", "yy M d", "2011 十一月 22", zh),
			new Date(2011, 11 - 1, 22), "Parse date yy M d with zh-CN");
	});

	test("formatDate", function() {
		expect( 16 );

		var gmtDate, fr, settings,
			c = $("#calendar").calendar();

		equal(c.calendar( "formatDate", "d m y", new Date(2001, 2 - 1, 3)),
			"3 2 01", "Format date d m y");
		equal(c.calendar( "formatDate", "dd mm yy", new Date(2001, 2 - 1, 3)),
			"03 02 2001", "Format date dd mm yy");
		equal(c.calendar( "formatDate", "d m y", new Date(2001, 12 - 1, 13)),
			"13 12 01", "Format date d m y");
		equal(c.calendar( "formatDate", "dd mm yy", new Date(2001, 12 - 1, 13)),
			"13 12 2001", "Format date dd mm yy");
		equal(c.calendar( "formatDate", "yy-o", new Date(2001, 2 - 1, 3)),
			"2001-34", "Format date yy-o");
		equal(c.calendar( "formatDate", "yy-oo", new Date(2001, 2 - 1, 3)),
			"2001-034", "Format date yy-oo");
		equal(c.calendar( "formatDate", "D M y", new Date(2001, 2 - 1, 3)),
			"Sat Feb 01", "Format date D M y");
		equal(c.calendar( "formatDate", "DD MM yy", new Date(2001, 2 - 1, 3)),
			"Saturday February 2001", "Format date DD MM yy");
		equal(c.calendar( "formatDate", "DD, MM d, yy", new Date(2001, 2 - 1, 3)),
			"Saturday, February 3, 2001", "Format date DD, MM d, yy");
		equal(c.calendar( "formatDate", "'day' d 'of' MM (''DD''), yy",
			new Date(2001, 2 - 1, 3)), "day 3 of February ('Saturday'), 2001",
			"Format date 'day' d 'of' MM ('DD'), yy");

		gmtDate = new Date(2001, 2 - 1, 3);
		gmtDate.setMinutes(gmtDate.getMinutes() - gmtDate.getTimezoneOffset());

		equal(c.calendar( "formatDate", "@", gmtDate), "981158400000", "Format date @");
		equal(c.calendar( "formatDate", "!", gmtDate), "631167552000000000", "Format date !");

		fr = $.mobile.calendar.prototype.regional.fr;
		settings = {dayNamesShort: fr.dayNamesShort, dayNames: fr.dayNames,
			monthNamesShort: fr.monthNamesShort, monthNames: fr.monthNames};
		equal(c.calendar( "formatDate", "D M y", new Date(2001, 4 - 1, 9), settings),
			"Lun. Avril 01", "Format date D M y with settings");
		equal(c.calendar( "formatDate", "DD MM yy", new Date(2001, 4 - 1, 9), settings),
			"Lundi Avril 2001", "Format date DD MM yy with settings");
		equal(c.calendar( "formatDate", "DD, MM d, yy", new Date(2001, 4 - 1, 9), settings),
			"Lundi, Avril 9, 2001", "Format date DD, MM d, yy with settings");
		equal(c.calendar( "formatDate", "'jour' d 'de' MM (''DD''), yy",
			new Date(2001, 4 - 1, 9), settings), "jour 9 de Avril ('Lundi'), 2001",
			"Format date 'jour' d 'de' MM (''DD''), yy with settings");
	});

	test("parseDateErrors", function() {
		expect( 17 );
		var c = $("#calendar").calendar(),
			fr, settings;
		function expectError(expr, value, error) {
			try {
				expr();
				ok(false, "Parsed error " + value);
			}
			catch (e) {
				equal(e, error, "Parsed error " + value);
			}
		}
		expectError(function() { c.calendar( "parseDate", null, "Sat 2 01"); },
			"Sat 2 01", "Invalid arguments");
		expectError(function() { c.calendar( "parseDate", "d m y", null); },
			"null", "Invalid arguments");
		expectError(function() { c.calendar( "parseDate", "d m y", "Sat 2 01"); },
			"Sat 2 01 - d m y", "Missing number at position 0");
		expectError(function() { c.calendar( "parseDate", "dd mm yy", "Sat 2 01"); },
			"Sat 2 01 - dd mm yy", "Missing number at position 0");
		expectError(function() { c.calendar( "parseDate", "d m y", "3 Feb 01"); },
			"3 Feb 01 - d m y", "Missing number at position 2");
		expectError(function() { c.calendar( "parseDate", "dd mm yy", "3 Feb 01"); },
			"3 Feb 01 - dd mm yy", "Missing number at position 2");
		expectError(function() { c.calendar( "parseDate", "d m y", "3 2 AD01"); },
			"3 2 AD01 - d m y", "Missing number at position 4");
		expectError(function() { c.calendar( "parseDate", "d m yy", "3 2 AD01"); },
			"3 2 AD01 - dd mm yy", "Missing number at position 4");
		expectError(function() { c.calendar( "parseDate", "y-o", "01-D01"); },
			"2001-D01 - y-o", "Missing number at position 3");
		expectError(function() { c.calendar( "parseDate", "yy-oo", "2001-D01"); },
			"2001-D01 - yy-oo", "Missing number at position 5");
		expectError(function() { c.calendar( "parseDate", "D d M y", "D7 3 Feb 01"); },
			"D7 3 Feb 01 - D d M y", "Unknown name at position 0");
		expectError(function() { c.calendar( "parseDate", "D d M y", "Sat 3 M2 01"); },
			"Sat 3 M2 01 - D d M y", "Unknown name at position 6");
		expectError(function() { c.calendar( "parseDate", "DD, MM d, yy", "Saturday- Feb 3, 2001"); },
			"Saturday- Feb 3, 2001 - DD, MM d, yy", "Unexpected literal at position 8");
		expectError(function() { c.calendar( "parseDate", "'day' d 'of' MM (''DD''), yy",
			"day 3 of February (\"Saturday\"), 2001"); },
			"day 3 of Mon2 ('Day7'), 2001", "Unexpected literal at position 19");
		expectError(function() { c.calendar( "parseDate", "d m y", "29 2 01"); },
			"29 2 01 - d m y", "Invalid date");

		fr = $.mobile.calendar.prototype.regional.fr;
		settings = {dayNamesShort: fr.dayNamesShort, dayNames: fr.dayNames,
			monthNamesShort: fr.monthNamesShort, monthNames: fr.monthNames};
		expectError(function() { c.calendar( "parseDate", "D d M y", "Mon 9 Avr 01", settings); },
			"Mon 9 Avr 01 - D d M y", "Unknown name at position 0");
		expectError(function() { c.calendar( "parseDate", "D d M y", "Lun. 9 Apr 01", settings); },
			"Lun. 9 Apr 01 - D d M y", "Unknown name at position 7");
	});

}( jQuery ));

/*
 * mobile calendar unit tests
 */
(function($){
	module( "jquery.mobile.calendar.js" );

	Date.prototype.toStr = function() { // don't overload toString
		return this.getFullYear() + "-" + (this.getMonth() + 1) + "-" + this.getDate();
	};

	var today = new Date(),
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
		notEqual( c.calendar("getWeekDayName"), localization.dayNames[today.getDay()], "current day of week must use default localization" );
		c.calendar( "setRegional", "ru" );
		equal( c.calendar("getWeekDayName"), localization.dayNames[today.getDay()], "current day of week with new localization: " + localization.dayNames[today.getDay()] );
		equal( c.calendar("getMonthName"), localization.monthNames[today.getMonth()], "current month with new localization: " + localization.monthNames[today.getMonth()] );
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

}( jQuery ));

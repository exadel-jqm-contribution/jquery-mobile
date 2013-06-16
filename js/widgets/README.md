# Datepicker or Calendar implementation for jQuery Mobile

## Preface

This component aims to replace jQueryDatepicker for mobile devices. Part of the code and tests taken from the original component. Component heavily simplified.

## HTML structure

### Base structure

Base structure can have two different version.

#### For inline calendar

	<div data-role="calendar" />

or

	<span data-role="calendar" />


##### Using in forms

Inline calendar (during initialization) is obtains the hidden input with name defined by `inputName` option.

#### For embedded calendar into text input

	<input type="text" data-role="calendar" name="calendar_name" />


### Other structures

Main html-code for panels, popups and calendar table, is generated automatically based on initialization options.

## Options

We have three different way setting options.

* JavaScript code and initializing options.
* With HTML code in `options` data attribute.
* With HTML code in data attributes named as widget parameters.

### Examples

#### JavaScript code and initializing options

```html
    <body>
    	<div id="place" />
    </body>
```
```javascript
    /**
     * can start with page first init
     * $( document ).one( "pagebeforeshow", function(ev){
     **/

        $( "#place" ).calendar( {
        	"popupType":"panel",
        	"closeBtn": "true",
        	"theme": "c",
        	"startDate": "2013-05-06",
        	"dateFormat": "yy-mm-dd",
        	"changeYear": "true",
        	"inputName": "calendar"
        } );
    /**
     * });
     **/
```

#### With HTML code in `options` data attribute

```html
	<input type="text" name="test" data-role="calendar" data-options='{ "popupType":"panel", "closeBtn": "true", "theme": "c", "startDate": "2013-05-06", "dateFormat": "yy-mm-dd", "changeYear": "true" }' />
```
```html
	<div data-role="calendar" data-options='{ "popupType":"panel", "closeBtn": "true", "theme": "c", "startDate": "2013-05-06", "dateFormat": "yy-mm-dd", "changeYear": "true", "inputName": "calendar" }' />
```

#### With HTML code in data attributes named as widget parameters

```html
	<input type="text" name="test" data-role="calendar" data-popup-type="panel" data-close-btn="true" data-theme="c" data-start-date="2013-05-06" data-date-format="yy-mm-dd" data-change-year="true" />
```
```html
	<div data-role="calendar" data-popup-type="panel" data-close-btn="true" data-theme="c" data-start-date="2013-05-06" data-date-format="yy-mm-dd" data-change-year="true" data-input-name="calendar" />
```

### Available parameters

* `dateFormat: "mm/dd/yy"` -- main format for parsing and formatting output date;
* `startDate: null` -- date selected as default date (). Default value is current date;
* `minDate: null` -- date as first date in the past that user can select. Default value is 31 Dec and "-10 years from current date";
* `maxDate: null` -- date as last date in the future that user can select. Default value is 31 Dec and "+10 years from current date";
* `changeMonth: true` -- is user can chose month by the select box;
* `changeYear: true` -- is user can chose year by the select box;
* `inputName: "mobilecalendar"` -- for inline mode, this option using as name for hidden field with date (for forms);
* `regional: "_"` -- regional abbreviation. Available list of abbreviations is the same as list for jQueryUI.datepicker plugin.
* `theme: "c"` -- main or default theme for controls;
* `monthsTheme: false` -- overwrite theme setting for Months select only;
* `yearsTheme: false` -- overwrite theme setting for Years select only;
* `buttonsTheme: false` -- overwrite theme setting for all buttons;
* `numberOfMonths: 1` -- number of showing month;
* `popupType: "popup"` -- popup type. Available types is `popup` and `panel`;
* `popupAttr: null` -- additional attributes for popup dialog ([ditails|http://view.jquerymobile.com/1.3.0/docs/widgets/panels/])
* `closeBtn: true` --whether to show Close button in popup dialog;
* `beforeShowDay: null` -- Function that takes a date and returns an array with:
    * [0] = true if selectable, false if not,
    * [1] = custom CSS class name(s) or "",
    * [2] = cell title (optional)
* `selectOtherMonths: false` -- True to allow selection of dates in other months, false for unselectabl
* `showOtherMonths: false` -- True to show dates in other months, false to leave blank

## Public methods

* `setRegional( region_name )` -- set and update language;
    * `region_name: String` -- region name.
* `getCurrentDate()` -- return current selected date as JavaScript Date-object;
* `getWeekDayName` -- return full weekday name for current selected date;
* `getMonthName` -- return full month name for current selected date;
* `setCurrentDate( date_string_or_object \[, format\] )` -- set current date from string or Date-object.
    * `date_string_or_object: String|Date` -- value;
    * `format: String` -- trying use `format` for parse value, otherwise use `dateFormat` from component options;
* `parseDate( format, value\[, settings\] )` -- Parse a string value into a date object. See formatDate below for the possible formats.
    * `format: String` -- the expected format of the date
    * `value: String` -- the date in the above format
    * `settings: PlainObject` -- attributes include:
        * shortYearCutoff  number - the cutoff year for determining the century (optional)
        * dayNamesShort	string[7] - abbreviated names of the days from Sunday (optional)
        * dayNames		string[7] - names of the days from Sunday (optional)
        * monthNamesShort string[12] - abbreviated names of the months (optional)
        * monthNames		string[12] - names of the months (optional)
* `getStandartFormat( name )` -- return String with format for specified name;
    * `name: String` -- name of format `("ATOM", "COOKIE", "ISO_8601", "RFC_822", "RFC_850", "RFC_1036", "RFC_1123", "RFC_2822", "RSS", "TICKS", "TIMESTAMP", "W3C")`
* `formatDate( format, date\[, settings\] )` -- Format a date object into a string value.
    * `format: String` -- the desired format of the date. The format can be combinations of the following:
        * `d` - day of month (no leading zero)
        * `dd` - day of month (two digit)
        * `o` - day of year (no leading zeros)
        * `oo` - day of year (three digit)
        * `D` - day name short
        * `DD` - day name long
        * `m` - month of year (no leading zero)
        * `mm` - month of year (two digit)
        * `M` - month name short
        * `MM` - month name long
        * `y` - year (two digit)
        * `yy` - year (four digit)
        * `@` - Unix timestamp (ms since 01/01/1970)
        * `!` - Windows ticks (100ns since 01/01/0001)
        * `"..."` - literal text
        * `''` - single quote
    * `date: Date` -- the date value to format
    * `settings: Object` - attributes include:
        * dayNamesShort	: string[7] - abbreviated names of the days from Sunday (optional)
        * dayNames		: string[7] - names of the days from Sunday (optional)
        * monthNamesShort : string[12] - abbreviated names of the months (optional)
        * monthNames		: string[12] - names of the months (optional)
* `getDateString( \[format\] )` -- get current date as formated string.
    * `format: String` -- string format for current date. If not set, using `dateFormat` option.
* `iso8601Week( \[date\] )` -- return the number of the week within the year that contains this date (or current date if `date` not set);
    * `date: Date`

## Available language abbreviations

af, ar, ar-DZ, az, be, bg, bs, ca, cs, cy-GB, da, de, el, en-AU, en-GB, en-NZ, eo, es, et, eu, fa, fi, fo, fr, fr-CA, fr-CH, gl, he, hi, hr, hu, hy, id, is, it, ja, ka, kk, km, ko, ky, lb, lt, lv, mk, ml, ms, nb, nl, nl-BE, nn, no, pl, pt, pt-BR, rm, ro, ru, sk, sl, sq, sr, sr-SR, sv, ta, th, tj, tr, uk, vi, zh-CN, zh-HK, zh-TW.

## Events

Widget generate few events:

* `selectday` -- fire with selecting day. Callbacks for this event will receive a data object as their 2nd arg. This data object has the following properties on it:
    * `selectedDate: Date` -- Selected Date;
* `prev` -- fire after calendar moves to previous month;
    * `year: Number` -- new Year number (which drawing first);
    * `month: Number` -- new Month number \[0..11\] (which drawing first);
* `next` -- fire after calendar moves to next month;
    * `year: Number` -- new Year number (which drawing first);
    * `month: Number` -- new Month number \[0..11\] (which drawing first);
* `selectmonth` -- fire when user selects month in dropdown;
    * `year: Number` -- new Year number (which drawing first);
    * `month: Number` -- new Month number \[0..11\] (which drawing first and current selected);
* `selectyear` -- user selects year in dropdown;
    * `year: Number` -- new Year number (which drawing first and current selected);
    * `month: Number` -- new Month number usually 0 (Jan) (which drawing first);
* `popup` -- fire when popup is open; no additional data;
* `closepopup` -- fire when user clicks on Close button. Warning! Event not fire when popup is closed by another actions.

### Additional data for all events

All callbacks for component events receive one additional parameter:
* `baseType` as String describe type of parent event, for example, `click, change` or `tap` for touch event.

## Base generated structure

Widget generate base box for calendar:

```html
    <div class="ui-calendar-body">
        <div class="ui-calendar-table">
            <table cols="7">
                <thead>
                    <tr class="ui-calendar-controls">...</tr>
                    <tr class="ui-calendar-head">...</tr>
                </thead>
              	<tbody>
              		<tr>
              		....
```

* `ui-calendar-controls` -- contains control buttons, such as Previous Month, Next Month and dropdown select boxes for choose Month and Year.
* `ui-calendar-head` -- contains weekday names.

Styles for days:
* `ui-calendar-day` -- td-cell of day that can be selected;
* `ui-calendar-day-off` -- td-cell of day by any reason disabled for selection day;
* `ui-calendar-active` -- td-cell of current selected day;
* `ui-calendar-today` -- td-cell of current day (today)

Examples:

http://jsbin.com/evubof/22

# Carousel Widget for jQueryMobile

## HTML structure

### Base structure

	<div data-role="carousel">
	    <div class="ui-carousel-items">
	        {{PLACE FOR ITEMS}}
	    </div>
	</div>


### Scroll buttons


	<div class="ui-left-arrow"></div>
	<div class="ui-right-arrow"></div>


This code can be added to any part of main element.

Default structure:

	<div data-role="carousel">
	    <div class="ui-carousel-items">
	    	<div class="ui-left-arrow"></div>
			<div class="ui-right-arrow"></div>
	        {{PLACE FOR ITEMS}}
	    </div>
	</div>


### Items

We support two versions of items: Image and HTML-code.

Type of item describe `type` data-attribute.

Example of Image-type item:

	<div data-type="image" data-title="01234" data-image-url="../../../css/themes/default/images/ajax-loader.gif"></div>

Example for HTML-type item:

	<div data-type="html" data-title="Heavy metal rulez!!!">
		<div style="width:400px; height: 100%; background-color: red; margin: 0 auto; text-align: left;">
			<h1>Lorem</h1>
			<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
			tempor incididunt ut labore et dolore magna aliqua.</p>
		</div>
	</div>


As you can see in examples both types can have title-option. And only `image` type can have `imageUrl` option witch define URL for image.

Image item can't have additional HTML mark-up inside element. It display only image with or without title.

HTML-type of item use HTML code inside element as main item content and wraps to additional block with class `ui-carousel-box`.

## Options

We have three different way setting options.

* JavaScript code and initializing options.
* With HTML code in `options` data attribute.
* With HTML code in data attributes named as widget parameters.

JavaScript way we describe later.

Example for `options`:

	<div data-role="carousel" data-options='{"showIndicator": true, "dependent": true}'>
	    <div class="ui-carousel-items">
	        {{PLACE FOR ITEMS}}
	    </div>
	</div>

Example for data attributes:

	<div data-role="carousel" data-show-indicator="true" data-dependent="true" data-show-title="true">
	    <div class="ui-carousel-items">
	        {{PLACE FOR ITEMS}}
	    </div>
	</div>


### Available parameters

* `indicators: null` -- container for indicators. Can by `string` as jQuery selector or jQuery object as DOM element.
* `indicatorsListClass: "ui-carousel-indicators"` -- class for indicators container.
* `animationDuration: 250` -- speed of sliding animation in milliseconds.
* `useLegasyAnimation: false` -- If false widget try init browser build in support for css3 animation;
* `showIndicator: true` -- show or hide indicators. If false, they will not render.
* `showTitle: true` -- same for title.
* `createIndicator: null` -- function for render indicator. Will be describe later.
* `titleBuildIn: false` -- title can by render with two ways. Will be describe later.
* `titleIsText: true` -- if TRUE then widget use jQuery.text() for add title, else jQuery.html();
* `createTitle: null` -- function for render title. Will be describe later.
* `enabled: true` -- this option for switch off sliding. After launch widget show first frame.
* `dependent: false` -- this option for switching off reaction on mouse or touch, but API continues to work.

#### Indicators

Indicators can by placed anywhere on the page. Defaults put HTML-code of indicators to the end of main element.
User can overwrite this.

##### Custom indicators.

By setting `indicators` parameter user can specify his container.
And with setting `createIndicator` user can control rendering.

Current implementation `createIndicator` in widget:

	function createIndicator( list, title ) {
		var indicator = $( "<div></div>" );
		indicator.addClass( "ui-carousel-indicator" );
		indicator.attr( "title", title );
		indicator.appendTo( list );
		return indicator;
	}

Widget will use this function for render each item of indicator.

* `list` -- container of indicators, can be set by `indicators` option.
* `title` -- text of title from item data attributes.

Function must always return jQuery-object of indicator for additional tuning in widget (events).

Indicators can by disabled with initialization by setting option `showIndicator: false`

#### Titles

Defaults put HTML-code of title to the end of item element.
User *can't* overwrite this.

##### Custom title.

For now we have 2 build in ways for display title.

* `titleBuildIn: false` -- wrap title text in one div with class `ui-carousel-title`
* `titleBuildIn: true` -- wrap title text in two divs with class `ui-carousel-title`
	and inside div with class `ui-carousel-title-inside`

As Indicators, this behaviour can be change by overwrite option
`createTitle: null` with owned function.
For this mode flag `titleBuildIn` will be ignore.


	function create_title ( title_str, target ) {
		...
		return title;
	},

Widget will use this function for render each title.

* `title_str` -- title string
* `target` -- target to put title, function must put created title to this jQuery-object.

Function can return title-object, but currently it doesn't matter.

Titles can by disabled with initialization by setting option `showTitle: false`

#### Animation of sliding

For animation widget use jQuery implementation of sliding by changing css-value `left`.
For showing item `left == 0`, otherwise `left` can by `100%` or `-100%`

#### Dependent widget

The `dependent` option provide ability for create widget that ignore touch and clicks,
but can by controlled by using widget API.

## API

### Data role

As other jQuery.Mobile widgets Carousel widget can be launch with `data-role` attribute `carousel`.
Widget starts with `pageshow` event and trigger `i-carouselbeforecreate` event in the beginning.

Example:

	<div data-role="carousel">
	    <div class="ui-carousel-items">
	        {{PLACE FOR ITEMS}}
	    </div>
	</div>


### JS

Example. Create Carousel instance for specific element with special options:

	function drawSpecialIndicator( list, title ) {
		// ...
	}

	function drawSpecialTitle( title_str, target ) {
		// ...
	}

	$({TARGET_SELECTOR}).carousel({
		indicators: $("#special_place_for_indicators"),
		indicatorsListClass: "owned-class-indicators",
		animationDuration: 50, // we want quick animation
		createIndicator: drawSpecialIndicator,
		// titleBuildIn: false, // we want draw owned title, so ...
		createTitle: drawSpecialTitle,
		enabled: true,
		dependent: true // we will use another script for controlling widget.
	});


### Build in public methods

* `next` -- move to next frame;
* `previous` -- move to previous frame;
* `slide` -- accept two parameters:
	* `type` -- `"next"` or `"prev"` for navigation. Else, `slide` method determine relative position for `next` object and current active frame;
	* `next` -- jQuery object of next frame for showing.
* `to` -- can by using for jump to frame with specific `index` (as parameter);
* `getFrame` -- return jQuery-object of frame with specific `index` (as parameter);
* `add` -- create new frame. Return jQuery-object of created element or
	Carousel object in case Array of items in the first argument. Accepted parameters:
	* `type` -- define type of frame (`"index"` or `"html"`). Can by array of [PlainObjects](http://api.jquery.com/Types#PlainObject)	for adding many frames, in this case other parameters will by ignore;
	* `title` -- title of frame;
	* `content` -- define content for frame. If `type == "image"` then this parameter use as `imageUrl`, otherwise as HTML-code.;
	* `onReady` -- can be `undefined`. Provide ability to set callback for frame event `ready`;
	* `onShow` -- can be `undefined`. Provide ability to set callback for frame event `show`.
* `length` -- return frames count;
* `eachItem` -- as jQuery.each for every frame;
* `remove` -- remove one frame (and indicator) by `index` in first parameter or frame defined in second parameter;
* `clear` -- remove all items from carousel;
* `refresh` -- method can by used for forced update from DOM or from first parameter, which must be array of objects. If array of objects sets, then carousel run `clear`-method and build new carousel;
* `unBindEvents` -- unbind touch events and cursors. Widget controllable only by API and Indicators;
* `bindEvents` -- rebind touch events and cursors.

### Events

#### Target: Frame

* `ready` -- Loaded Frame. For frame with type `"image"`, this event fire when image is loaded;
* `beforeshow` -- Before show (before animation begin);
* `show` -- Frame showing;
* `hide` -- Frame. Frame hidden;
* `itemremove` -- Before removing DOM element of *Frame*. Indicator still exists.

#### Target: Indicator

* `itemremove` -- Before removing DOM element of *Indicator*. Frame already removed;
* `show` -- Frame showing. Trigger after `show` for frame;
* `hide` -- Frame hidden. Trigger after `hide` for frame.

#### Target: Main Carousel DOM element
* `clear_all` --  Before removing all Frames;
* `beforenext` -- Before slide to next frame;
* `beforeprev` -- Before slide to previous frame;
* `slidingstart` -- Before any sliding starts, but after `beforeshow`-event for frame;
* `slidingdone` -- After sliding to next frame (animation completed). As first additional parameter will be set type of sliding (`"next"` or `"prev"`);
* `goto` -- Before run `to` method. As first additional parameter: `index`;

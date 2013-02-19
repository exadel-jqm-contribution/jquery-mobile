h2. HTML structure

h3. Base structure
	{code}
	<div data-role="carousel">
	    <div class="ui-carousel-items">
	        {{PLACE FOR ITEMS}}
	    </div>
	</div>
	{code}

h3. Scroll buttons

	{code}
	<div class="ui-left-arrow"></div>
	<div class="ui-right-arrow"></div>
	{code}

	This code can be added to any part of main element.

	Default structure:
	{code}
	<div data-role="carousel">
	    <div class="ui-carousel-items">
	    	<div class="ui-left-arrow"></div>
			<div class="ui-right-arrow"></div>
	        {{PLACE FOR ITEMS}}
	    </div>
	</div>
	{code}

h3. Items

	We support two versions of items: Image and HTML-code.

	Type of item describe {{type}} data-attribute.

	Example of Image-type item:
	{code}
	<div data-type="image" data-title="01234" data-image-url="../../../css/themes/default/images/ajax-loader.gif"></div>
	{code}

	Example for HTML-type item:
	{code}
	<div data-type="html" data-title="Heavy metal rulez!!!">
		<div style="width:400px; height: 100%; background-color: red; margin: 0 auto; text-align: left;">
			<h1>Lorem</h1>
			<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
			tempor incididunt ut labore et dolore magna aliqua.</p>
		</div>
	</div>
	{code}

	As you can see in examples both types can have title-option. And only {{image}} type can have {{imageUrl}} option witch describe URL for image.

	Image item can't have additional HTML mark-up inside element. It display only image with or without title.

	HTML-type of item use HTML code inside element as main item content and wraps to additional block with class {{ui-carousel-box}}.

h2. Options

	We have three different way setting options.

	# JavaScript code and initializing options.
	# With HTML code in {{options}} data attribute.
	# With HTML code in data attributes named as widget parameters.

	h3. Available parameters

	* {{indicators: null}} -- container for indicators. Can by {{string}} as jQuery selector or jQuery object as DOM element.
	* {{indicatorsListClass: "ui-carousel-indicators"}} -- class for indicators container.
	* {{animationDuration: 250}} -- speed of sliding animation in milliseconds.
	* {{showIndicator: true}} -- show or hide indicators. If false, they will not render.
	* {{showTitle: true}} -- same for title.
	* {{createIndicator: null}} -- function for render indicator. Will be describe later.
	* {{titleBuildIn: false}} -- title can by render with two ways. Will be describe later.
	* {{createTitle: null}} -- function for render title. Will be describe later.
	* {{enabled: true}} -- this option for switch off sliding. After launch widget show first frame.
	* {{depended: false}} -- this option for switching off reaction on mouse or touch, but API continues to work.

	h4. Indicators

		Indicators can by placed anywhere on the page. Defaults put HTML-code of indicators to the end of main element.
		User can overwrite this.

		h5. Custom indicators.

		By setting {{indicators}} parameter user can specify his container.
		And with setting {{createIndicator}} user can control rendering.

		Current implementation {{createIndicator}} in widget:
		{code}
		function createIndicator( list, title ) {
			var indicator = $( "<div></div>" );
			indicator.addClass( "ui-carousel-indicator" );
			indicator.attr( "title", title );
			indicator.appendTo( list );
			return indicator;
		}
		{code}
		Widget will use this function for render each item of indicator.
		* {{list}} -- container of indicators, can be set by {{indicators}} option.
		* {{title}} -- text of title from item data attributes.

		Function must always return jQuery-object of indicator for additional tuning in widget (events).

		Indicators can by disabled with initialization by setting option {{showIndicator: false}}

	h4. Titles

		Defaults put HTML-code of title to the end of item element.
		User *can't* overwrite this.

		h5. Custom title.

		For now we have 2 build in ways for display title.
		* {{titleBuildIn: false}} -- wrap title text in one div with class {{ui-carousel-title}}
		* {{titleBuildIn: true}} -- wrap title text in two divs with class {{ui-carousel-title}}
			and inside div with class {{ui-carousel-title-inside}}

		As Indicators, this behaviour can be change by overwrite option
		{{createTitle: null}} with owned function.
		For this mode flag {{titleBuildIn}} will be ignore.

		{code}
		function create_title ( title_str, target ) {
			...
			return title;
		},
		{code}
		Widget will use this function for render each title.
		* {{title_str}} -- title string
		* {{target}} -- target to put title, function must put created title to this jQuery-object.

		Function can return title-object, but currently it doesn't matter.

		Titles can by disabled with initialization by setting option {{showTitle: false}}

	h4. Animation of sliding

	For animation widget use jQuery implementation of sliding by changing css-value {{left}}.
	For showing item {{left}} == 0, otherwise {{left}} can by {{100%}} or {{-100%}}



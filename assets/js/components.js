// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < children.length; i++) {
    if (Util.hasClass(children[i], className)) childrenByClass.push(children[i]);
  }
  return childrenByClass;
};

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};


// File#: _1_tabs
// Usage: codyhouse.co/license
(function() {
	var Tab = function(element) {
		this.element = element;
		this.tabList = this.element.getElementsByClassName('js-tabs__controls')[0];
		this.listItems = this.tabList.getElementsByTagName('li');
		this.triggers = this.tabList.getElementsByTagName('a');
		this.panelsList = this.element.getElementsByClassName('js-tabs__panels')[0];
		this.panels = Util.getChildrenByClassName(this.panelsList, 'js-tabs__panel');
		this.hideClass = this.element.getAttribute('data-hide-panel-class') ? this.element.getAttribute('data-hide-panel-class') : 'th8-hide';
		this.customShowClass = this.element.getAttribute('data-show-panel-class') ? this.element.getAttribute('data-show-panel-class') : false;
		this.layout = this.element.getAttribute('data-tabs-layout') ? this.element.getAttribute('data-tabs-layout') : 'horizontal';
		// deep linking options
		this.deepLinkOn = this.element.getAttribute('data-deep-link') == 'on';
		// init tabs
		this.initTab();
	};

	Tab.prototype.initTab = function() {
		//set initial aria attributes
		this.tabList.setAttribute('role', 'tablist');
		Util.addClass(this.element, 'tabs--no-interaction');

		for( var i = 0; i < this.triggers.length; i++) {
			var bool = (i == 0),
				panelId = this.panels[i].getAttribute('id');
			this.listItems[i].setAttribute('role', 'presentation');
			Util.setAttributes(this.triggers[i], {'role': 'tab', 'aria-selected': bool, 'aria-controls': panelId, 'id': 'tab-'+panelId});
			Util.addClass(this.triggers[i], 'js-tabs__trigger'); 
			Util.setAttributes(this.panels[i], {'role': 'tabpanel', 'aria-labelledby': 'tab-'+panelId});
			Util.toggleClass(this.panels[i], this.hideClass, !bool);
			if(bool && this.customShowClass) Util.addClass(this.panels[i], this.customShowClass);

			if(!bool) this.triggers[i].setAttribute('tabindex', '-1'); 
		}

		//listen for Tab events
		this.initTabEvents();

		// check deep linking option
		this.initDeepLink();
	};

	Tab.prototype.initTabEvents = function() {
		var self = this;
		//click on a new tab -> select content
		this.tabList.addEventListener('click', function(event) {
			if( event.target.closest('.js-tabs__trigger') ) self.triggerTab(event.target.closest('.js-tabs__trigger'), event);
		});
		//arrow keys to navigate through tabs 
		this.tabList.addEventListener('keydown', function(event) {
			;
			if( !event.target.closest('.js-tabs__trigger') ) return;
			if( tabNavigateNext(event, self.layout) ) {
				event.preventDefault();
				self.selectNewTab('next');
			} else if( tabNavigatePrev(event, self.layout) ) {
				event.preventDefault();
				self.selectNewTab('prev');
			}
		});
	};

	Tab.prototype.selectNewTab = function(direction) {
		var selectedTab = this.tabList.querySelector('[aria-selected="true"]'),
			index = Util.getIndexInArray(this.triggers, selectedTab);
		index = (direction == 'next') ? index + 1 : index - 1;
		//make sure index is in the correct interval 
		//-> from last element go to first using the right arrow, from first element go to last using the left arrow
		if(index < 0) index = this.listItems.length - 1;
		if(index >= this.listItems.length) index = 0;	
		this.triggerTab(this.triggers[index]);
		this.triggers[index].focus();
	};

	Tab.prototype.triggerTab = function(tabTrigger, event) {
		var self = this;
		event && event.preventDefault();	
		var index = Util.getIndexInArray(this.triggers, tabTrigger);
		//no need to do anything if tab was already selected
		if(this.triggers[index].getAttribute('aria-selected') == 'true') return;

		Util.removeClass(this.element, 'tabs--no-interaction');
		
		for( var i = 0; i < this.triggers.length; i++) {
			var bool = (i == index);
			Util.toggleClass(this.panels[i], this.hideClass, !bool);
			if(this.customShowClass) Util.toggleClass(this.panels[i], this.customShowClass, bool);
			this.triggers[i].setAttribute('aria-selected', bool);
			bool ? this.triggers[i].setAttribute('tabindex', '0') : this.triggers[i].setAttribute('tabindex', '-1');
		}

		// update url if deepLink is on
		if(this.deepLinkOn) {
			history.replaceState(null, '', '#'+tabTrigger.getAttribute('aria-controls'));
		}
	};

	Tab.prototype.initDeepLink = function() {
		if(!this.deepLinkOn) return;
		var hash = window.location.hash.substr(1);
		var self = this;
		if(!hash || hash == '') return;
		for(var i = 0; i < this.panels.length; i++) {
			if(this.panels[i].getAttribute('id') == hash) {
				this.triggerTab(this.triggers[i], false);
				setTimeout(function(){self.panels[i].scrollIntoView(true);});
				break;
			}
		};
	};

	function tabNavigateNext(event, layout) {
		if(layout == 'horizontal' && (event.keyCode && event.keyCode == 39 || event.key && event.key == 'ArrowRight')) {return true;}
		else if(layout == 'vertical' && (event.keyCode && event.keyCode == 40 || event.key && event.key == 'ArrowDown')) {return true;}
		else {return false;}
	};

	function tabNavigatePrev(event, layout) {
		if(layout == 'horizontal' && (event.keyCode && event.keyCode == 37 || event.key && event.key == 'ArrowLeft')) {return true;}
		else if(layout == 'vertical' && (event.keyCode && event.keyCode == 38 || event.key && event.key == 'ArrowUp')) {return true;}
		else {return false;}
	};

	window.Tab = Tab;
	
	//initialize the Tab objects
	var tabs = document.getElementsByClassName('js-tabs');
	if( tabs.length > 0 ) {
		for( var i = 0; i < tabs.length; i++) {
			(function(i){new Tab(tabs[i]);})(i);
		}
	}
}());
// File#: _1_sticky-feature
// Usage: codyhouse.co/license
(function() {
  var StickyFeature = function(element) {
    this.element = element;
    this.contentList = this.element.getElementsByClassName('js-sticky-feature__content-list');
    this.assetsList = this.element.getElementsByClassName('js-sticky-feature__media-list');
    
    if(this.contentList.length < 1 || this.assetsList.length < 1) return;

    this.contentItems = this.contentList[0].getElementsByClassName('js-sticky-feature__content-item');
    this.assetItems = this.assetsList[0].getElementsByClassName('js-sticky-feature__media-item');

    this.titleItems = this.contentList[0].getElementsByClassName('js-sticky-feature__title');
    this.activeSectionClass = 'sticky-feature-current-item';
    this.bindScroll = false;
    this.scrolling = false;
    initStickyFeature(this);
  };

  function initStickyFeature(el) {
    // init observer - detect when feature list enters the viewport and change section
    var observer = new IntersectionObserver(stickyFeatureObserve.bind(el));
    observer.observe(el.contentList[0]);

    // init click on title
    for(var i = 0; i < el.titleItems.length; i++) {
      (function(i){
        el.titleItems[i].addEventListener('click', function(event){
          scrollToSection(el, i);
        });
      })(i);
    }
  };

  function stickyFeatureObserve(entries) {
    if(entries[0].isIntersecting) {
      if(!this.bindScroll) {
        getSelectSection(this); // update selected section
        bindScroll(this); // bind window scroll
      }
    } else if(this.bindScroll) {
      unbindScroll(this); // unbind window scroll
      resetSectionVisibility(this); // reset selected section
    }
  };

  function updateVisibleSection(el) {
    // on scroll, detect which section should be selected
    var self = this;
    if(this.scrolling) return;
    this.scrolling = true;
    window.requestAnimationFrame(function(){
      getSelectSection(self);
      self.scrolling = false;
    });
  };

  function getSelectSection(el) {
    resetSectionVisibility(el); // remove selected class from all sections
    // get the section to select
    var index = [];
    for(var i = 0; i < el.contentItems.length; i++) {
      if(el.contentItems[i].getBoundingClientRect().top <= window.innerHeight/2) index.push(i);
    }
    var itemIndex = (index.length > 0) ? index[index.length - 1] : 0; // select either the first section or the one in the center of the viewport
    selectSection(el, itemIndex);
  };

  function resetSectionVisibility(el) {
    // no section is selected -> remove selected class
    var selectedItems = el.element.getElementsByClassName(el.activeSectionClass);
    while (selectedItems[0]) {
      selectedItems[0].classList.remove(el.activeSectionClass);
    }
  };

  function selectSection(el, index) {
    el.contentItems[index].classList.add(el.activeSectionClass);
    el.assetItems[index].classList.add(el.activeSectionClass);
  };

  function scrollToSection(el, index) {
    // on click - scroll to the selected section
    if(el.assetsList[0].offsetWidth < 1) return;
    window.scrollBy({
      top: el.titleItems[index].getBoundingClientRect().top - window.innerHeight/2 + 10,
      behavior: 'smooth'
    });
  };

  function bindScroll(el) {
    if(!el.bindScroll) {
      el.bindScroll = updateVisibleSection.bind(el);
      window.addEventListener('scroll', el.bindScroll);
    }
  };

  function unbindScroll(el) {
    if(el.bindScroll) {
      window.removeEventListener('scroll', el.bindScroll);
      el.bindScroll = false;
    }
  };

  window.StickyFeature = StickyFeature;

	//initialize the StickyFeature objects
	var stickyFeatures = document.getElementsByClassName('js-sticky-feature');
	if( stickyFeatures.length > 0 ) {
		for( var i = 0; i < stickyFeatures.length; i++) {
			(function(i){new StickyFeature(stickyFeatures[i]);})(i);
		}
	}
}());
// File#: _1_swipe-content
(function() {
	var SwipeContent = function(element) {
		this.element = element;
		this.delta = [false, false];
		this.dragging = false;
		this.intervalId = false;
		initSwipeContent(this);
	};

	function initSwipeContent(content) {
		content.element.addEventListener('mousedown', handleEvent.bind(content));
		content.element.addEventListener('touchstart', handleEvent.bind(content), {passive: true});
	};

	function initDragging(content) {
		//add event listeners
		content.element.addEventListener('mousemove', handleEvent.bind(content));
		content.element.addEventListener('touchmove', handleEvent.bind(content), {passive: true});
		content.element.addEventListener('mouseup', handleEvent.bind(content));
		content.element.addEventListener('mouseleave', handleEvent.bind(content));
		content.element.addEventListener('touchend', handleEvent.bind(content));
	};

	function cancelDragging(content) {
		//remove event listeners
		if(content.intervalId) {
			(!window.requestAnimationFrame) ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId);
			content.intervalId = false;
		}
		content.element.removeEventListener('mousemove', handleEvent.bind(content));
		content.element.removeEventListener('touchmove', handleEvent.bind(content));
		content.element.removeEventListener('mouseup', handleEvent.bind(content));
		content.element.removeEventListener('mouseleave', handleEvent.bind(content));
		content.element.removeEventListener('touchend', handleEvent.bind(content));
	};

	function handleEvent(event) {
		switch(event.type) {
			case 'mousedown':
			case 'touchstart':
				startDrag(this, event);
				break;
			case 'mousemove':
			case 'touchmove':
				drag(this, event);
				break;
			case 'mouseup':
			case 'mouseleave':
			case 'touchend':
				endDrag(this, event);
				break;
		}
	};

	function startDrag(content, event) {
		content.dragging = true;
		// listen to drag movements
		initDragging(content);
		content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
		// emit drag start event
		emitSwipeEvents(content, 'dragStart', content.delta, event.target);
	};

	function endDrag(content, event) {
		cancelDragging(content);
		// credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
		var dx = parseInt(unify(event).clientX), 
	    dy = parseInt(unify(event).clientY);
	  
	  // check if there was a left/right swipe
		if(content.delta && (content.delta[0] || content.delta[0] === 0)) {
	    var s = getSign(dx - content.delta[0]);
			
			if(Math.abs(dx - content.delta[0]) > 30) {
				(s < 0) ? emitSwipeEvents(content, 'swipeLeft', [dx, dy]) : emitSwipeEvents(content, 'swipeRight', [dx, dy]);	
			}
	    
	    content.delta[0] = false;
	  }
		// check if there was a top/bottom swipe
	  if(content.delta && (content.delta[1] || content.delta[1] === 0)) {
	  	var y = getSign(dy - content.delta[1]);

	  	if(Math.abs(dy - content.delta[1]) > 30) {
	    	(y < 0) ? emitSwipeEvents(content, 'swipeUp', [dx, dy]) : emitSwipeEvents(content, 'swipeDown', [dx, dy]);
	    }

	    content.delta[1] = false;
	  }
		// emit drag end event
	  emitSwipeEvents(content, 'dragEnd', [dx, dy]);
	  content.dragging = false;
	};

	function drag(content, event) {
		if(!content.dragging) return;
		// emit dragging event with coordinates
		(!window.requestAnimationFrame) 
			? content.intervalId = setTimeout(function(){emitDrag.bind(content, event);}, 250) 
			: content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event));
	};

	function emitDrag(event) {
		emitSwipeEvents(this, 'dragging', [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]);
	};

	function unify(event) { 
		// unify mouse and touch events
		return event.changedTouches ? event.changedTouches[0] : event; 
	};

	function emitSwipeEvents(content, eventName, detail, el) {
		var trigger = false;
		if(el) trigger = el;
		// emit event with coordinates
		var event = new CustomEvent(eventName, {detail: {x: detail[0], y: detail[1], origin: trigger}});
		content.element.dispatchEvent(event);
	};

	function getSign(x) {
		if(!Math.sign) {
			return ((x > 0) - (x < 0)) || +x;
		} else {
			return Math.sign(x);
		}
	};

	window.SwipeContent = SwipeContent;
	
	//initialize the SwipeContent objects
	var swipe = document.getElementsByClassName('js-swipe-content');
	if( swipe.length > 0 ) {
		for( var i = 0; i < swipe.length; i++) {
			(function(i){new SwipeContent(swipe[i]);})(i);
		}
	}
}());
// utility functions
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName('body')[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};


// File#: _1_popover
// Usage: codyhouse.co/license
(function() {
  var Popover = function(element) {
    this.element = element;
		this.elementId = this.element.getAttribute('id');
		this.trigger = document.querySelectorAll('[aria-controls="'+this.elementId+'"]');
		this.selectedTrigger = false;
    this.popoverVisibleClass = 'popover--is-visible';
    this.selectedTriggerClass = 'popover-control--active';
    this.popoverIsOpen = false;
    // focusable elements
    this.firstFocusable = false;
		this.lastFocusable = false;
		// position target - position tooltip relative to a specified element
		this.positionTarget = getPositionTarget(this);
		// gap between element and viewport - if there's max-height 
		this.viewportGap = parseInt(getComputedStyle(this.element).getPropertyValue('--popover-viewport-gap')) || 20;
		initPopover(this);
		initPopoverEvents(this);
  };

  // public methods
  Popover.prototype.togglePopover = function(bool, moveFocus) {
    togglePopover(this, bool, moveFocus);
  };

  Popover.prototype.checkPopoverClick = function(target) {
    checkPopoverClick(this, target);
  };

  Popover.prototype.checkPopoverFocus = function() {
    checkPopoverFocus(this);
  };

	// private methods
	function getPositionTarget(popover) {
		// position tooltip relative to a specified element - if provided
		var positionTargetSelector = popover.element.getAttribute('data-position-target');
		if(!positionTargetSelector) return false;
		var positionTarget = document.querySelector(positionTargetSelector);
		return positionTarget;
	};

  function initPopover(popover) {
		// reset popover position
		initPopoverPosition(popover);
		// init aria-labels
		for(var i = 0; i < popover.trigger.length; i++) {
			Util.setAttributes(popover.trigger[i], {'aria-expanded': 'false', 'aria-haspopup': 'true'});
		}
  };
  
  function initPopoverEvents(popover) {
		for(var i = 0; i < popover.trigger.length; i++) {(function(i){
			popover.trigger[i].addEventListener('click', function(event){
				event.preventDefault();
				// if the popover had been previously opened by another trigger element -> close it first and reopen in the right position
				if(Util.hasClass(popover.element, popover.popoverVisibleClass) && popover.selectedTrigger !=  popover.trigger[i]) {
					togglePopover(popover, false, false); // close menu
				}
				// toggle popover
				popover.selectedTrigger = popover.trigger[i];
				togglePopover(popover, !Util.hasClass(popover.element, popover.popoverVisibleClass), true);
			});
    })(i);}
    
    // trap focus
    popover.element.addEventListener('keydown', function(event){
      if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
        //trap focus inside popover
        trapFocus(popover, event);
      }
    });

		// custom events -> open/close popover
		popover.element.addEventListener('openPopover', function(event){
			togglePopover(popover, true);
		});

		popover.element.addEventListener('closePopover', function(event){
			togglePopover(popover, false, event.detail);
		});
  };
  
  function togglePopover(popover, bool, moveFocus) {
		// toggle popover visibility
		Util.toggleClass(popover.element, popover.popoverVisibleClass, bool);
		popover.popoverIsOpen = bool;
		if(bool) {
      popover.selectedTrigger.setAttribute('aria-expanded', 'true');
      getFocusableElements(popover);
      // move focus
      focusPopover(popover);
			popover.element.addEventListener("transitionend", function(event) {focusPopover(popover);}, {once: true});
			// position the popover element
			positionPopover(popover);
			// add class to popover trigger
			Util.addClass(popover.selectedTrigger, popover.selectedTriggerClass);
		} else if(popover.selectedTrigger) {
			popover.selectedTrigger.setAttribute('aria-expanded', 'false');
			if(moveFocus) Util.moveFocus(popover.selectedTrigger);
			// remove class from menu trigger
			Util.removeClass(popover.selectedTrigger, popover.selectedTriggerClass);
			popover.selectedTrigger = false;
		}
	};
	
	function focusPopover(popover) {
		if(popover.firstFocusable) {
			popover.firstFocusable.focus();
		} else {
			Util.moveFocus(popover.element);
		}
	};

  function positionPopover(popover) {
		// reset popover position
		resetPopoverStyle(popover);
		var selectedTriggerPosition = (popover.positionTarget) ? popover.positionTarget.getBoundingClientRect() : popover.selectedTrigger.getBoundingClientRect();
		
		var menuOnTop = (window.innerHeight - selectedTriggerPosition.bottom) < selectedTriggerPosition.top;
			
		var left = selectedTriggerPosition.left,
			right = (window.innerWidth - selectedTriggerPosition.right),
			isRight = (window.innerWidth < selectedTriggerPosition.left + popover.element.offsetWidth);

		var horizontal = isRight ? 'right: '+right+'px;' : 'left: '+left+'px;',
			vertical = menuOnTop
				? 'bottom: '+(window.innerHeight - selectedTriggerPosition.top)+'px;'
				: 'top: '+selectedTriggerPosition.bottom+'px;';
		// check right position is correct -> otherwise set left to 0
		if( isRight && (right + popover.element.offsetWidth) > window.innerWidth) horizontal = 'left: '+ parseInt((window.innerWidth - popover.element.offsetWidth)/2)+'px;';
		// check if popover needs a max-height (user will scroll inside the popover)
		var maxHeight = menuOnTop ? selectedTriggerPosition.top - popover.viewportGap : window.innerHeight - selectedTriggerPosition.bottom - popover.viewportGap;

		var initialStyle = popover.element.getAttribute('style');
		if(!initialStyle) initialStyle = '';
		popover.element.setAttribute('style', initialStyle + horizontal + vertical +'max-height:'+Math.floor(maxHeight)+'px;');
	};
	
	function resetPopoverStyle(popover) {
		// remove popover inline style before appling new style
		popover.element.style.maxHeight = '';
		popover.element.style.top = '';
		popover.element.style.bottom = '';
		popover.element.style.left = '';
		popover.element.style.right = '';
	};

	function initPopoverPosition(popover) {
		// make sure the popover does not create any scrollbar 
		popover.element.style.top = '0px';
		popover.element.style.left = '0px';
	};

  function checkPopoverClick(popover, target) {
    // close popover when clicking outside it
    if(!popover.popoverIsOpen) return;
    if(!popover.element.contains(target) && !target.closest('[aria-controls="'+popover.elementId+'"]')) togglePopover(popover, false);
  };

  function checkPopoverFocus(popover) {
    // on Esc key -> close popover if open and move focus (if focus was inside popover)
    if(!popover.popoverIsOpen) return;
    var popoverParent = document.activeElement.closest('.js-popover');
    togglePopover(popover, false, popoverParent);
  };
  
  function getFocusableElements(popover) {
    //get all focusable elements inside the popover
		var allFocusable = popover.element.querySelectorAll(focusableElString);
		getFirstVisible(popover, allFocusable);
		getLastVisible(popover, allFocusable);
  };

  function getFirstVisible(popover, elements) {
		//get first visible focusable element inside the popover
		for(var i = 0; i < elements.length; i++) {
			if( isVisible(elements[i]) ) {
				popover.firstFocusable = elements[i];
				break;
			}
		}
	};

  function getLastVisible(popover, elements) {
		//get last visible focusable element inside the popover
		for(var i = elements.length - 1; i >= 0; i--) {
			if( isVisible(elements[i]) ) {
				popover.lastFocusable = elements[i];
				break;
			}
		}
  };

  function trapFocus(popover, event) {
    if( popover.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of popover
			event.preventDefault();
			popover.lastFocusable.focus();
		}
		if( popover.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of popover
			event.preventDefault();
			popover.firstFocusable.focus();
		}
  };
  
  function isVisible(element) {
		// check if element is visible
		return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
	};

  window.Popover = Popover;

  //initialize the Popover objects
  var popovers = document.getElementsByClassName('js-popover');
  // generic focusable elements string selector
	var focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
	
	if( popovers.length > 0 ) {
		var popoversArray = [];
		var scrollingContainers = [];
		for( var i = 0; i < popovers.length; i++) {
			(function(i){
				popoversArray.push(new Popover(popovers[i]));
				var scrollableElement = popovers[i].getAttribute('data-scrollable-element');
				if(scrollableElement && !scrollingContainers.includes(scrollableElement)) scrollingContainers.push(scrollableElement);
			})(i);
		}

		// listen for key events
		window.addEventListener('keyup', function(event){
			if( event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' ) {
        // close popover on 'Esc'
				popoversArray.forEach(function(element){
					element.checkPopoverFocus();
				});
			} 
		});
		// close popover when clicking outside it
		window.addEventListener('click', function(event){
			popoversArray.forEach(function(element){
				element.checkPopoverClick(event.target);
			});
		});
		// on resize -> close all popover elements
		window.addEventListener('resize', function(event){
			popoversArray.forEach(function(element){
				element.togglePopover(false, false);
			});
		});
		// on scroll -> close all popover elements
		window.addEventListener('scroll', function(event){
			popoversArray.forEach(function(element){
				if(element.popoverIsOpen) element.togglePopover(false, false);
			});
		});
		// take into account additinal scrollable containers
		for(var j = 0; j < scrollingContainers.length; j++) {
			var scrollingContainer = document.querySelector(scrollingContainers[j]);
			if(scrollingContainer) {
				scrollingContainer.addEventListener('scroll', function(event){
					popoversArray.forEach(function(element){
						if(element.popoverIsOpen) element.togglePopover(false, false);
					});
				});
			}
		}
	}
}());
// File#: _1_floating-action-button
// Usage: codyhouse.co/license
(function() {
  var Fab = function(element) {
		this.element = element;
		this.fabButton = this.element.getElementsByClassName('js-fab__btn');
    this.fabPopover = this.element.getElementsByClassName('js-fab__popover');
    this.fabPopoverInner = this.element.getElementsByClassName('js-fab__popover-inner');
    this.visibleClass = 'fab--active';
    this.animating = false;
    // focusable elements
    this.firstFocusable = false;
		this.lastFocusable = false;
    // offset variables
    this.offsetIn = 0;
    this.offsetOut = 0;
    this.targetIn = this.element.getAttribute('data-target-in') ? document.querySelector(this.element.getAttribute('data-target-in')) : false;
    this.targetOut = this.element.getAttribute('data-target-out') ? document.querySelector(this.element.getAttribute('data-target-out')) : false;
    if(this.fabButton.length < 1 || this.fabPopover.length < 1) return;
		initFab(this);
	};

  // public methods
  Fab.prototype.setVariables = function() {
		setFabVariables(this);
	};

  Fab.prototype.resetVisibility = function() {
		resetFabVisibility(this);
	};

  // private methods
  function initFab(element) {
    resetFabVisibility(element);
    setFabVariables(element);
    initFabEvents(element);
  };

  function setFabVariables(element) {
    // set CSS variables
    element.fabPopoverInner[0].style.height = '';
    var height = (element.fabPopover[0].offsetHeight+1)+'px';

    element.element.style.setProperty('--fab-popover-height', height);
    element.fabPopoverInner[0].style.height = height;
  };

  function initFabEvents(element) {
    if(document.fonts) {
      // wait for fonts to be loaded and set popover height
      document.fonts.ready.then(function() {
        setFabVariables(element);
      });
    }

    // toggle popover when clicking on fab button
    element.fabButton[0].addEventListener('click', function() {
      if(element.animating) return;
      element.animating = true;
      toggleFab(element);
    });

    // close popover when clicking on fab background
    element.element.addEventListener('click', function(event){
      if(!event.target.closest('.js-fab__btn') && !event.target.closest('.js-fab__popover-inner')) toggleFab(element);
    });

    // trap focus
    element.element.addEventListener('keydown', function(event){
      if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
        //trap focus inside popover
        trapFocus(element, event);
      } else if(event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' ) {
        if(element.element.classList.contains(element.visibleClass)) toggleFab(element);
      }
    });
  };

  function toggleFab(element) {
    var isOpen = element.element.classList.contains(element.visibleClass);

    if(isOpen) {
      element.element.classList.remove(element.visibleClass);
      element.fabButton[0].removeAttribute('aria-expanded');
      element.fabButton[0].focus();
    } else {
      element.element.classList.add(element.visibleClass);
      element.fabButton[0].setAttribute('aria-expanded', 'true');
    }

    // wait for the end of the transition
    element.fabPopover[0].addEventListener('transitionend', function cb(){
      element.animating = false;
      element.fabPopover[0].removeEventListener('transitionend', cb);
      if(!isOpen) focusPopover(element);
    });
  };

  function focusPopover(element) {
    getFocusableElements(element);
    if(element.firstFocusable) {
			element.firstFocusable.focus();
		}
  };

  // trapping focus
  function getFocusableElements(element) {
    // get all focusable elements inside the popover
		var allFocusable = element.fabPopover[0].querySelectorAll(focusableElString);
		getFirstVisible(element, allFocusable);
		getLastVisible(element, allFocusable);
  };

  function getFirstVisible(element, focusableElments) {
		// get first visible focusable element inside the popover
		for(var i = 0; i < focusableElments.length; i++) {
			if( isVisible(focusableElments[i]) ) {
				element.firstFocusable = focusableElments[i];
				break;
			}
		}
	};

  function getLastVisible(element, focusableElments) {
		// get last visible focusable element inside the popover
		for(var i = focusableElments.length - 1; i >= 0; i--) {
			if( isVisible(focusableElments[i]) ) {
				element.lastFocusable = focusableElments[i];
				break;
			}
		}
  };

  function trapFocus(element, event) {
    if( element.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of popover
			event.preventDefault();
			element.lastFocusable.focus();
		}
		if( element.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of popover
			event.preventDefault();
			element.firstFocusable.focus();
		}
  };

  function isVisible(element) {
		// check if element is visible
		return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
	};

  // offset functions 
  function resetFabVisibility(element) {
    getFabBtnOffsets(element); // get offset values - show/hide fab button 
    var scrollTop = document.documentElement.scrollTop,
      topTarget = false,
      bottomTarget = false;
    if(element.offsetIn <= scrollTop || element.offsetIn == 0) {
      topTarget = true;
    }
    if(element.offsetOut == 0 || scrollTop < element.offsetOut) {
      bottomTarget = true;
    }
    element.element.classList.toggle('fab--in', bottomTarget && topTarget)

    // if popover is visible -> close it
    if( (!bottomTarget || !topTarget) && element.element.classList.contains(element.visibleClass)) toggleFab(element);
  };

  function getFabBtnOffsets(element) { // get offset in and offset out values
    // update offsetIn
    element.offsetIn = 0;
    if(element.targetIn) {
      var boundingClientRect = element.targetIn.getBoundingClientRect();
      element.offsetIn = boundingClientRect.top + document.documentElement.scrollTop + boundingClientRect.height;
    }
    var dataOffsetIn = element.element.getAttribute('data-offset-in');
    if(dataOffsetIn) {
      element.offsetIn = element.offsetIn + parseInt(dataOffsetIn);
    }
    // update offsetOut
    element.offsetOut = 0;
    if(element.targetOut) {
      var boundingClientRect = element.targetOut.getBoundingClientRect();
      element.offsetOut = boundingClientRect.top + document.documentElement.scrollTop - window.innerHeight;
    }
    var dataOffsetOut = element.element.getAttribute('data-offset-out');
    if(dataOffsetOut) {
      element.offsetOut = element.offsetOut + parseInt(dataOffsetOut);
    }
  };

  //initialize the Fab objects
	var fabs = document.getElementsByClassName('js-fab');
  // generic focusable elements string selector
	var focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
	if( fabs.length > 0 ) {
		var fabsArray = [];
		for( var i = 0; i < fabs.length; i++) {
			(function(i){fabsArray.push(new Fab(fabs[i]));})(i);
		}

    // reset fab height on resize
    var resizingId = false;

    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing);
    });

    window.addEventListener('scroll', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneScrolling);
    });

    function doneResizing() {
      fabsArray.forEach(function(element){
				element.setVariables();
        element.resetVisibility();
			});
    };

    function doneScrolling() {
      fabsArray.forEach(function(element){
				element.resetVisibility();
			});
    };
	}
}());
// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; 
};

// File#: _1_ticker
// Usage: codyhouse.co/license
(function() {
  var Ticker = function(element) {
    this.element = element;
    this.list = this.element.getElementsByTagName('ul')[0];
    this.items = this.list.children;
    this.paused = false;
    // clones info
    this.clones = this.list.innerHTML;
    this.clonesNumber = 1;
    this.itemsLength = this.items.length;
    // animation duration
    this.animationDuration = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ticker-animation-duration'));
    initTicker(this);
  };

  function initTicker(ticker) {
    // clone ticker children
    setTickerWidth(ticker);
    cloneItems(ticker);
    initAnimation(ticker);

    // resize/font loaded event
    ticker.element.addEventListener('update-ticker', function(event){
      setTickerWidth(ticker);
      cloneItems(ticker);
    });

    // click on control button events
    ticker.element.addEventListener('anim-ticker', function(event){
      ticker.paused = false;
      Util.removeClass(ticker.element, 'ticker--paused');
    });

    ticker.element.addEventListener('pause-ticker', function(event){
      ticker.paused = true;
      Util.addClass(ticker.element, 'ticker--paused');
    });

    // all set
    Util.addClass(ticker.element, 'ticker--loaded');
  };

  function setTickerWidth(ticker) {
    var width = 0;
    for(var i = 0; i < ticker.itemsLength; i++) {
      width = width + getItemWidth(ticker.items[i]);
    }
    // check if we need to update the number of clones
    if(width < window.innerWidth) {
      ticker.clonesNumber = Math.ceil(window.innerWidth/width) * 2 - 1;
    } else {
      ticker.clonesNumber = 1;
    }

    // update list width
    ticker.list.style.width = ((ticker.clonesNumber + 1)*width)+'px';
  };

  function getItemWidth(item) {
    var style = window.getComputedStyle(item);
    return parseFloat(style.marginRight) + parseFloat(style.marginLeft) + item.offsetWidth;
  };

  function cloneItems(ticker) {
    ticker.list.innerHTML = ticker.clones;
    for(var i = 0; i < ticker.clonesNumber; i++) {
      ticker.list.insertAdjacentHTML('beforeend', ticker.clones);
    }
    // update animation duration
    ticker.element.style.setProperty('--ticker-animation-duration', ticker.animationDuration*(ticker.clonesNumber+1)+'s');
  };

  function initAnimation(ticker) {
    // init observer - animate ticker only when in viewport
    var observer = new IntersectionObserver(tickerObserve.bind(ticker));
    observer.observe(ticker.element);
    
  };

  function tickerObserve(entries) {
    if(entries[0].isIntersecting) {
      if(!this.paused) Util.addClass(this.element, 'ticker--animate');
    } else {
      Util.removeClass(this.element, 'ticker--animate');
    }
  };

  function initTickerController(controller) {
    // play/pause btn controller
    var tickerContainer = document.getElementById(controller.getAttribute('aria-controls'));
    if(!tickerContainer) return;
    var tickerList = tickerContainer.getElementsByClassName('js-ticker');
    if(tickerList.length < 1) tickerList = [tickerContainer];
    // detect click
    controller.addEventListener('click', function(event){
      var playAnimation = controller.getAttribute('aria-pressed') == 'true';
      var animEvent = playAnimation ? 'anim-ticker' : 'pause-ticker';
      playAnimation ? controller.setAttribute('aria-pressed', 'false') : controller.setAttribute('aria-pressed', 'true');
      for(var i = 0; i < tickerList.length; i++) {
        tickerList[i].dispatchEvent(new CustomEvent(animEvent));
      }
    });
  };

  //initialize the Ticker objects
  var tickers = document.getElementsByClassName('js-ticker'),
    requestAnimationFrameSupported = window.requestAnimationFrame,
    reducedMotion = Util.osHasReducedMotion(),
    intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);

	if( tickers.length > 0 ) {
    var tickersArray = [];
		for( var i = 0; i < tickers.length; i++) {
      if(!requestAnimationFrameSupported || reducedMotion || !intersectionObserverSupported) {
        // animation is off if requestAnimationFrame/IntersectionObserver is not supported or reduced motion is on
        Util.addClass(tickers[i], 'ticker--anim-off');
      } else {(function(i){tickersArray.push(new Ticker(tickers[i]));})(i);}
    }

    if(tickersArray.length > 0) {
      var resizingId = false,
        customEvent = new CustomEvent('update-ticker');
      
      // on resize -> update ticker width 
      window.addEventListener('resize', function() {
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 500);
      });

      // wait for font to be loaded -> update ticker width
      if(document.fonts) {
        document.fonts.onloadingdone = function (fontFaceSetEvent) {
          doneResizing();
        };
      }

      function doneResizing() {
        for( var i = 0; i < tickersArray.length; i++) {
          (function(i){tickersArray[i].element.dispatchEvent(customEvent)})(i);
        };
      };

      // ticker play/pause buttons
      var tickerControl = document.getElementsByClassName('js-ticker-control');
      if(tickerControl.length > 0) {
        for( var i = 0; i < tickerControl.length; i++) {
          if(!requestAnimationFrameSupported || reducedMotion || !intersectionObserverSupported) {
            Util.addClass(tickerControl[i], 'tt9-hide');
          } else {
            (function(i){initTickerController(tickerControl[i]);})(i);
          } 
        }
      }
    };
  }
}());
// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; 
};

// File#: _1_scrolling-animations
// Usage: codyhouse.co/license
(function() {
  var ScrollFx = function(element, scrollableSelector) {
    this.element = element;
    this.options = [];
    this.boundingRect = this.element.getBoundingClientRect();
    this.windowHeight = window.innerHeight;
    this.scrollingFx = [];
    this.animating = [];
    this.deltaScrolling = [];
    this.observer = [];
    this.scrollableSelector = scrollableSelector; // if the scrollable element is not the window 
    this.scrollableElement = false;
    initScrollFx(this);
    // ToDo - option to pass two selectors to target the element start and stop animation scrolling values -> to be used for sticky/fixed elements
  };

  function initScrollFx(element) {
    // do not animate if reduced motion is on
    if(Util.osHasReducedMotion()) return;
    // get scrollable element
    setScrollableElement(element);
    // get animation params
    var animation = element.element.getAttribute('data-scroll-fx');
    if(animation) {
      element.options.push(extractAnimation(animation));
    } else {
      getAnimations(element, 1);
    }
    // set Intersection Observer
    initObserver(element);
    // update params on resize
    initResize(element);
  };

  function setScrollableElement(element) {
    if(element.scrollableSelector) element.scrollableElement = document.querySelector(element.scrollableSelector);
  };

  function initObserver(element) {
    for(var i = 0; i < element.options.length; i++) {
      (function(i){
        element.scrollingFx[i] = false;
        element.deltaScrolling[i] = getDeltaScrolling(element, i);
        element.animating[i] = false;

        element.observer[i] = new IntersectionObserver(
          function(entries, observer) { 
            scrollFxCallback(element, i, entries, observer);
          },
          {
            rootMargin: (element.options[i][5] -100)+"% 0px "+(0 - element.options[i][4])+"% 0px"
          }
        );
    
        element.observer[i].observe(element.element);

        // set initial value
        setTimeout(function(){
          animateScrollFx.bind(element, i)();
        })
      })(i);
    }
  };

  function scrollFxCallback(element, index, entries, observer) {
		if(entries[0].isIntersecting) {
      if(element.scrollingFx[index]) return; // listener for scroll event already added
      // reset delta
      resetDeltaBeforeAnim(element, index);
      triggerAnimateScrollFx(element, index);
    } else {
      if(!element.scrollingFx[index]) return; // listener for scroll event already removed
      window.removeEventListener('scroll', element.scrollingFx[index]);
      element.scrollingFx[index] = false;
    }
  };

  function triggerAnimateScrollFx(element, index) {
    element.scrollingFx[index] = animateScrollFx.bind(element, index);
    (element.scrollableElement)
      ? element.scrollableElement.addEventListener('scroll', element.scrollingFx[index])
      : window.addEventListener('scroll', element.scrollingFx[index]);
  };

  function animateScrollFx(index) {
    // if window scroll is outside the proper range -> return
    if(getScrollY(this) < this.deltaScrolling[index][0]) {
      setCSSProperty(this, index, this.options[index][1]);
      return;
    }
    if(getScrollY(this) > this.deltaScrolling[index][1]) {
      setCSSProperty(this, index, this.options[index][2]);
      return;
    }
    if(this.animating[index]) return;
    this.animating[index] = true;
    window.requestAnimationFrame(updatePropertyScroll.bind(this, index));
  };

  function updatePropertyScroll(index) { // get value
    // check if this is a theme value or a css property
    if(isNaN(this.options[index][1])) {
      // this is a theme value to update
      (getScrollY(this) >= this.deltaScrolling[index][1]) 
        ? setCSSProperty(this, index, this.options[index][2])
        : setCSSProperty(this, index, this.options[index][1]);
    } else {
      // this is a CSS property
      var value = this.options[index][1] + (this.options[index][2] - this.options[index][1])*(getScrollY(this) - this.deltaScrolling[index][0])/(this.deltaScrolling[index][1] - this.deltaScrolling[index][0]);
      // update css property
      setCSSProperty(this, index, value);
    }
    
    this.animating[index] = false;
  };

  function setCSSProperty(element, index, value) {
    if(isNaN(value)) {
      // this is a theme value that needs to be updated
      setThemeValue(element, value);
      return;
    }
    if(element.options[index][0] == '--scroll-fx-skew' || element.options[index][0] == '--scroll-fx-scale') {
      // set 2 different CSS properties for the transformation on both x and y axis
      element.element.style.setProperty(element.options[index][0]+'-x', value+element.options[index][3]);
      element.element.style.setProperty(element.options[index][0]+'-y', value+element.options[index][3]);
    } else {
      // set single CSS property
      element.element.style.setProperty(element.options[index][0], value+element.options[index][3]);
    }
  };

  function setThemeValue(element, value) {
    // if value is different from the theme in use -> update it
    if(element.element.getAttribute('data-theme') != value) {
      Util.addClass(element.element, 'scroll-fx--theme-transition');
      element.element.offsetWidth;
      element.element.setAttribute('data-theme', value);
      element.element.addEventListener('transitionend', function cb(){
        element.element.removeEventListener('transitionend', cb);
        Util.removeClass(element.element, 'scroll-fx--theme-transition');
      });
    }
  };

  function getAnimations(element, index) {
    var option = element.element.getAttribute('data-scroll-fx-'+index);
    if(option) {
      // multiple animations for the same element - iterate through them
      element.options.push(extractAnimation(option));
      getAnimations(element, index+1);
    } 
    return;
  };

  function extractAnimation(option) {
    var array = option.split(',').map(function(item) {
      return item.trim();
    });
    var propertyOptions = getPropertyValues(array[1], array[2]);
    var animation = [getPropertyLabel(array[0]), propertyOptions[0], propertyOptions[1], propertyOptions[2], parseInt(array[3]), parseInt(array[4])];
    return animation;
  };

  function getPropertyLabel(property) {
    var propertyCss = '--scroll-fx-';
    for(var i = 0; i < property.length; i++) {
      propertyCss = (property[i] == property[i].toUpperCase())
        ? propertyCss + '-'+property[i].toLowerCase()
        : propertyCss +property[i];
    }
    if(propertyCss == '--scroll-fx-rotate') {
      propertyCss = '--scroll-fx-rotate-z';
    } else if(propertyCss == '--scroll-fx-translate') {
      propertyCss = '--scroll-fx-translate-x';
    }
    return propertyCss;
  };

  function getPropertyValues(val1, val2) {
    var nbVal1 = parseFloat(val1), 
      nbVal2 = parseFloat(val2),
      unit = val1.replace(nbVal1, '');
    if(isNaN(nbVal1)) {
      // property is a theme value
      nbVal1 = val1;
      nbVal2 = val2;
      unit = '';
    }
    return [nbVal1, nbVal2, unit];
  };

  function getDeltaScrolling(element, index) {
    // this retrieve the max and min scroll value that should trigger the animation
    var topDelta = getScrollY(element) - (element.windowHeight - (element.windowHeight + element.boundingRect.height)*element.options[index][4]/100) + element.boundingRect.top,
      bottomDelta = getScrollY(element) - (element.windowHeight - (element.windowHeight + element.boundingRect.height)*element.options[index][5]/100) + element.boundingRect.top;
    return [topDelta, bottomDelta];
  };

  function initResize(element) {
    var resizingId = false;
    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(resetResize.bind(element), 500);
    });
    // emit custom event -> elements have been initialized
    var event = new CustomEvent('scrollFxReady');
		element.element.dispatchEvent(event);
  };

  function resetResize() {
    // on resize -> make sure to update all scrolling delta values
    this.boundingRect = this.element.getBoundingClientRect();
    this.windowHeight = window.innerHeight;
    for(var i = 0; i < this.deltaScrolling.length; i++) {
      this.deltaScrolling[i] = getDeltaScrolling(this, i);
      animateScrollFx.bind(this, i)();
    }
    // emit custom event -> elements have been resized
    var event = new CustomEvent('scrollFxResized');
		this.element.dispatchEvent(event);
  };

  function resetDeltaBeforeAnim(element, index) {
    element.boundingRect = element.element.getBoundingClientRect();
    element.windowHeight = window.innerHeight;
    element.deltaScrolling[index] = getDeltaScrolling(element, index);
  };

  function getScrollY(element) {
    if(!element.scrollableElement) return window.scrollY;
    return element.scrollableElement.scrollTop;
  }

  window.ScrollFx = ScrollFx;

  var scrollFx = document.getElementsByClassName('js-scroll-fx');
  for(var i = 0; i < scrollFx.length; i++) {
    (function(i){
      var scrollableElement = scrollFx[i].getAttribute('data-scrollable-element');
      new ScrollFx(scrollFx[i], scrollableElement);
    })(i);
  }
}());
// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; 
};

// File#: _1_tilted-img-slideshow
// Usage: codyhouse.co/license
(function() {
  var TiltedSlideshow = function(element) {
    this.element = element;
    this.list = this.element.getElementsByClassName('js-tilted-slideshow__list')[0];
    this.images = this.list.getElementsByClassName('js-tilted-slideshow__item');
    this.selectedIndex = 0;
    this.animating = false;
    // classes
    this.orderClasses = ['tilted-slideshow__item--top', 'tilted-slideshow__item--middle', 'tilted-slideshow__item--bottom'];
    this.moveClasses = ['tilted-slideshow__item--move-out', 'tilted-slideshow__item--move-in'];
    this.interactedClass = 'tilted-slideshow--interacted';
    initTiltedSlideshow(this);
  };

  function initTiltedSlideshow(slideshow) {
    if(!animateImgs) removeTransitions(slideshow);
    
    slideshow.list.addEventListener('click', function(event) {
      Util.addClass(slideshow.element, slideshow.interactedClass);
      animateImgs ? animateImages(slideshow) : switchImages(slideshow);
    });
  };

  function removeTransitions(slideshow) {
    // if reduced motion is on or css variables are not supported -> do not animate images
    for(var i = 0; i < slideshow.images.length; i++) {
      slideshow.images[i].style.transition = 'none';
    }
  };

  function switchImages(slideshow) {
    // if reduced motion is on or css variables are not supported -> switch images without animation
    resetOrderClasses(slideshow);
    resetSelectedIndex(slideshow);
  };

  function resetSelectedIndex(slideshow) {
    // update the index of the top image
    slideshow.selectedIndex = resetIndex(slideshow, slideshow.selectedIndex + 1);
  };

  function resetIndex(slideshow, index) {
    // make sure index is < 3
    if(index >= slideshow.images.length) index = index - slideshow.images.length;
    return index;
  };

  function resetOrderClasses(slideshow) {
    // update the orderClasses for each images
    if(!animateImgs) {
      // top image -> remove top class and add bottom class
      Util.addClass(slideshow.images[slideshow.selectedIndex], slideshow.orderClasses[2]);
      Util.removeClass(slideshow.images[slideshow.selectedIndex], slideshow.orderClasses[0]);
    }

    // middle image -> remove middle class and add top class
    var middleImage = slideshow.images[resetIndex(slideshow, slideshow.selectedIndex + 1)];
    Util.addClass(middleImage, slideshow.orderClasses[0]);
    Util.removeClass(middleImage, slideshow.orderClasses[1]);

    // bottom image -> remove bottom class and add middle class
    var bottomImage = slideshow.images[resetIndex(slideshow, slideshow.selectedIndex + 2)];
    Util.addClass(bottomImage, slideshow.orderClasses[1]);
    Util.removeClass(bottomImage, slideshow.orderClasses[2]);
  };

  function animateImages(slideshow) {
    if(slideshow.animating) return;
    slideshow.animating = true;

    // reset order classes for middle/bottom images
    resetOrderClasses(slideshow);
    
    // animate top image
    var topImage = slideshow.images[slideshow.selectedIndex];
    // remove top class and add move out class
    Util.removeClass(topImage, slideshow.orderClasses[0]);
    Util.addClass(topImage, slideshow.moveClasses[0]);
    
    topImage.addEventListener('transitionend', function cb(event) {
      // remove transition
			topImage.style.transition = 'none';
			topImage.removeEventListener("transitionend", cb);
      
      setTimeout(function(){
        // add bottom + move-in class, remove move-out class
        Util.removeClass(topImage, slideshow.moveClasses[0]);
        Util.addClass(topImage, slideshow.moveClasses[1]+' '+ slideshow.orderClasses[2]);
        setTimeout(function(){
          topImage.style.transition = '';
          // remove move-in class
          Util.removeClass(topImage, slideshow.moveClasses[1]);
          topImage.addEventListener('transitionend', function cbn(event) {
            // reset animating property and selectedIndex index
            resetSelectedIndex(slideshow);
            slideshow.animating = false;
            topImage.removeEventListener("transitionend", cbn);
          });
        }, 10);
      }, 10);
		});
  };

  var tiltedSlideshow = document.getElementsByClassName('js-tilted-slideshow'),
    animateImgs = !Util.osHasReducedMotion() && ('CSS' in window) && CSS.supports('color', 'var(--color-var)');
  if(tiltedSlideshow.length > 0) {
    for(var i = 0; i < tiltedSlideshow.length; i++) {
      new TiltedSlideshow(tiltedSlideshow[i]);
    }
  }
}());
// utility functions
if(!Util) function Util () {};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName('body')[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

Util.extend = function() {
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// File#: _1_page-transition
// Usage: codyhouse.co/license
(function() {
  var PageTransition = function(opts) {
    if(!('CSS' in window) || !CSS.supports('color', 'var(--color)')) return;
    this.element = document.getElementsByClassName('js-page-trans')[0];
    this.options = Util.extend(PageTransition.defaults , opts);
    this.cachedPages = [];
    this.anchors = false;
    this.clickFunctions = [];
    this.animating = false;
    this.newContent = false;
    this.containerClass = 'js-page-trans__content';
    this.containers = [];
    initSrRegion(this);
    pageTrInit(this);
    initBrowserHistory(this);
  };

  function initSrRegion(element) {
    var liveRegion = document.createElement('p');
    Util.setAttributes(liveRegion, {'class': 'pz6-sr-only', 'role': 'alert', 'aria-live': 'polite', 'id': 'page-trans-sr-live'});
    element.element.appendChild(liveRegion);
    element.srLive = document.getElementById('page-trans-sr-live');
  };

  function pageTrInit(element) { // bind click events
    element.anchors = document.getElementsByClassName('js-page-trans-link');
    for(var i = 0; i < element.anchors.length; i++) {
      (function(i){
        element.clickFunctions[i] = function(event) {
          event.preventDefault();
          element.updateBrowserHistory = true;
          bindClick(element, element.anchors[i].getAttribute('href'));
        };

        element.anchors[i].addEventListener('click', element.clickFunctions[i]);
      })(i);
    }
  };

  function bindClick(element, link) {
    if(element.animating) return;
    element.animating = true;
    element.link = link; 
    // most of those links will be removed from the page
    unbindClickEvents(element);
    loadPageContent(element); 
    // code that should run before the leaving animation
    if(element.options.beforeLeave) element.options.beforeLeave(element.link);
    // announce to SR new content is being loaded
    element.srLive.textContent = element.options.srLoadingMessage;
    // leaving animation
    if(!element.options.leaveAnimation) return;
    element.containers.push(element.element.getElementsByClassName(element.containerClass)[0]);
    element.options.leaveAnimation(element.containers[0], element.link, function(){
      leavingAnimationComplete(element, true);
    });
  };

  function unbindClickEvents(element) {
    for(var i = 0; i < element.anchors.length; i++) {
      element.anchors[i].removeEventListener('click', element.clickFunctions[i]);
    }
  };

  function loadPageContent(element) {
    element.newContent = false;
    var pageCache = getCachedPage(element);
    if(pageCache) {
      element.newContent = pageCache;
    } else {
      if(element.options.loadFunction) { // use a custom function to load your data
        element.options.loadFunction(element.link, function(data){
          element.newContent = data;
          element.cachedPages.push({link: element.link, content: element.newContent});
        });
      } else {
        // load page content
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            element.newContent = getContainerHTML(element, xmlHttp.responseText);
            element.cachedPages.push({link: element.link, content: element.newContent});
          }
        };
        xmlHttp.open('GET', element.link);
        xmlHttp.send();
      }
    }
  };

  function leavingAnimationComplete(element, triggerProgress) {
    if(element.newContent) {
      // new content has already been created
      triggerEnteringProcess(element);
    } else {
      // new content is not available yet
      if(triggerProgress && element.options.progressAnimation) element.options.progressAnimation(element.link);
      setTimeout(function(){
        leavingAnimationComplete(element, false);
      }, 200);
    }
  };

  function getCachedPage(element) {
    var cachedContent = false;
    for(var i = 0; i < element.cachedPages.length; i++) {
      if(element.cachedPages[i].link == element.link) {
        cachedContent = element.cachedPages[i].content;
        break;
      }
    }
    return cachedContent;
  };

  function getContainerHTML(element, content) {
    var template = document.createElement('div');
    template.innerHTML = content;
    return template.getElementsByClassName(element.containerClass)[0].outerHTML;
  };

  function triggerEnteringProcess(element) {
    if(element.updateBrowserHistory) updateBrowserHistory(element);
    // inject new content
    element.containers[0].insertAdjacentHTML('afterend', element.newContent);
    element.containers = element.element.getElementsByClassName(element.containerClass);
    if(element.options.beforeEnter) element.options.beforeEnter(element.containers[0], element.containers[1], element.link);
    if(!element.options.enterAnimation) return; // entering animation
    element.options.enterAnimation(element.containers[0], element.containers[1], element.link, function(){
      // move focus to new cntent
      Util.moveFocus(element.containers[1]);
      // new content
      var newContent = element.containers[1];
      // remove old content
      element.containers[0].remove();
      if(element.options.afterEnter) element.options.afterEnter(newContent, element.link);
      pageTrInit(element); // bind click event to new anchor elements
      resetPageTransition(element);
      // announce to SR new content is available
      element.srLive.textContent = element.options.srLoadedMessage;
    });
  };

  function resetPageTransition(element) {
    // remove old content
    element.newContent = false;
    element.animating = false;
    element.containers = [];
    element.link = false;
  };

  function updateBrowserHistory(element) {
    if(window.history.state && window.history.state == element.link) return;
    window.history.pushState({path: element.link},'',element.link);
  };

  function initBrowserHistory(element) {
    setTimeout(function() {
      // on load -> replace window history with page url
      window.history.replaceState({path: document.location.href},'',document.location.href);
      window.addEventListener('popstate', function(event) {
        element.updateBrowserHistory = false;
        if(event.state && event.state.path) {
          bindClick(element, event.state.path);
        }
      });
    }, 10);
  };

  PageTransition.defaults = {
    beforeLeave: false, // run before the leaving animation is triggered
    leaveAnimation: false,
    progressAnimation: false,
    beforeEnter: false, // run before enterAnimation (after new content has been added to the page)
    enterAnimation: false,
    afterEnter: false,
    loadFunction: false,
    srLoadingMessage: 'New content is being loaded',
    srLoadedMessage: 'New content has been loaded' 
  };

  window.PageTransition = PageTransition;
}());
// File#: _1_collapse
// Usage: codyhouse.co/license
(function() {
  var Collapse = function(element) {
    this.element = element;
    this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
    this.animate = this.element.getAttribute('data-collapse-animate') == 'on';
    this.animating = false;
    initCollapse(this);
  };

  function initCollapse(element) {
    if ( element.triggers ) {
      // set initial 'aria-expanded' attribute for trigger elements
      updateTriggers(element, !element.element.classList.contains('cj1-hide'));

      // detect click on trigger elements
			for(var i = 0; i < element.triggers.length; i++) {
				element.triggers[i].addEventListener('click', function(event) {
					event.preventDefault();
					toggleVisibility(element);
				});
			}
    }
    
    // custom event
    element.element.addEventListener('collapseToggle', function(event){
      toggleVisibility(element);
    });
  };

  function toggleVisibility(element) {
    var bool = element.element.classList.contains('cj1-hide');
    if(element.animating) return;
    element.animating = true;
    animateElement(element, bool);
    updateTriggers(element, bool);
  };

  function animateElement(element, bool) {
    // bool === true -> show content
    if(!element.animate || !window.requestAnimationFrame) {
      element.element.classList.toggle('cj1-hide', !bool);
      element.animating = false;
      return;
    }

    // animate content height
    element.element.classList.remove('cj1-hide');
    var initHeight = !bool ? element.element.offsetHeight: 0,
      finalHeight = !bool ? 0 : element.element.offsetHeight;

    element.element.classList.add('cj1-overflow-hidden');
    
    setHeight(initHeight, finalHeight, element.element, 200, function(){
      if(!bool) element.element.classList.add('cj1-hide');
      element.element.removeAttribute("style");
      element.element.classList.remove('cj1-overflow-hidden');
      element.animating = false;
    }, 'easeInOutQuad');
  };

  function updateTriggers(element, bool) {
    for(var i = 0; i < element.triggers.length; i++) {
      bool ? element.triggers[i].setAttribute('aria-expanded', 'true') : element.triggers[i].removeAttribute('aria-expanded');
    };
  };

  function setHeight(start, to, element, duration, cb, timeFunction) {
    var change = to - start,
      currentTime = null;

    var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = parseInt((progress/duration)*change + start);
    if(timeFunction) {
      val = Math[timeFunction](progress, start, to - start, duration);
    }
    element.style.height = val+"px";
    if(progress < duration) {
      window.requestAnimationFrame(animateHeight);
    } else {
      if(cb) cb();
    }
    };

    //set the height of the element before starting animation -> fix bug on Safari
    element.style.height = start+"px";
    window.requestAnimationFrame(animateHeight);
  };

  window.Collapse = Collapse;

  //initialize the Collapse objects
	var collapses = document.getElementsByClassName('js-collapse');
	if( collapses.length > 0 ) {
    for( var i = 0; i < collapses.length; i++) {
      new Collapse(collapses[i]);
    }
  }
}());
// File#: _1_anim-menu-btn
// Usage: codyhouse.co/license
(function() {
	var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
	if( menuBtns.length > 0 ) {
		for(var i = 0; i < menuBtns.length; i++) {(function(i){
			initMenuBtn(menuBtns[i]);
		})(i);}

		function initMenuBtn(btn) {
			btn.addEventListener('click', function(event){	
				event.preventDefault();
				var status = !btn.classList.contains('anim-menu-btn--state-b');
				btn.classList.toggle('anim-menu-btn--state-b', status);
				// emit custom event
				var event = new CustomEvent('anim-menu-btn-clicked', {detail: status});
				btn.dispatchEvent(event);
			});
		};
	}
}());
// utility functions
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName('body')[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

// File#: _1_off-canvas-content
// Usage: codyhouse.co/license
(function() {
	var OffCanvas = function(element) {
		this.element = element;
		this.wrapper = document.getElementsByClassName('js-off-canvas')[0];
		this.main = document.getElementsByClassName('off-canvas__main')[0];
		this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
		this.closeBtn = this.element.getElementsByClassName('js-off-canvas__close-btn');
		this.selectedTrigger = false;
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.animating = false;
		initOffCanvas(this);
	};	

	function initOffCanvas(panel) {
		panel.element.setAttribute('aria-hidden', 'true');
		for(var i = 0 ; i < panel.triggers.length; i++) { // listen to the click on off-canvas content triggers
			panel.triggers[i].addEventListener('click', function(event){
				panel.selectedTrigger = event.currentTarget;
				event.preventDefault();
				togglePanel(panel);
			});
		}

		// listen to the triggerOpenPanel event -> open panel without a trigger button
		panel.element.addEventListener('triggerOpenPanel', function(event){
			if(event.detail) panel.selectedTrigger = event.detail;
			openPanel(panel);
		});
		// listen to the triggerClosePanel event -> open panel without a trigger button
		panel.element.addEventListener('triggerClosePanel', function(event){
			closePanel(panel);
		});
	};

	function togglePanel(panel) {
		var status = (panel.element.getAttribute('aria-hidden') == 'true') ? 'close' : 'open';
		if(status == 'close') openPanel(panel);
		else closePanel(panel);
	};

	function openPanel(panel) {
		if(panel.animating) return; // already animating
		emitPanelEvents(panel, 'openPanel', '');
		panel.animating = true;
		panel.element.setAttribute('aria-hidden', 'false');
		panel.wrapper.classList.add('off-canvas--visible');
		getFocusableElements(panel);
		var transitionEl = panel.element;
		if(panel.closeBtn.length > 0 && !panel.closeBtn[0].classList.contains('js-off-canvas__a11y-close-btn')) transitionEl = 	panel.closeBtn[0];
		transitionEl.addEventListener('transitionend', function cb(){
			// wait for the end of transition to move focus and update the animating property
			panel.animating = false;
			moveFocusFn(panel.element);
			transitionEl.removeEventListener('transitionend', cb);
		});
		initPanelEvents(panel);
	};

	function closePanel(panel, bool) {
		if(panel.animating) return;
		panel.animating = true;
		panel.element.setAttribute('aria-hidden', 'true');
		panel.wrapper.classList.remove('off-canvas--visible');
		panel.main.addEventListener('transitionend', function cb(){
			panel.animating = false;
			if(panel.selectedTrigger) panel.selectedTrigger.focus();
			setTimeout(function(){panel.selectedTrigger = false;}, 10);
			panel.main.removeEventListener('transitionend', cb);
		});
		cancelPanelEvents(panel);
		emitPanelEvents(panel, 'closePanel', bool);
	};

	function initPanelEvents(panel) { //add event listeners
		panel.element.addEventListener('keydown', handleEvent.bind(panel));
		panel.element.addEventListener('click', handleEvent.bind(panel));
	};

	function cancelPanelEvents(panel) { //remove event listeners
		panel.element.removeEventListener('keydown', handleEvent.bind(panel));
		panel.element.removeEventListener('click', handleEvent.bind(panel));
	};

	function handleEvent(event) {
		switch(event.type) {
			case 'keydown':
				initKeyDown(this, event);
				break;
			case 'click':
				initClick(this, event);
				break;
		}
	};

	function initClick(panel, event) { // close panel when clicking on close button
		if( !event.target.closest('.js-off-canvas__close-btn')) return;
		event.preventDefault();
		closePanel(panel, 'close-btn');
	};

	function initKeyDown(panel, event) {
		if( event.keyCode && event.keyCode == 27 || event.key && event.key == 'Escape' ) {
			//close off-canvas panel on esc
			closePanel(panel, 'key');
		} else if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
			//trap focus inside panel
			trapFocus(panel, event);
		}
	};

	function trapFocus(panel, event) {
		if( panel.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of panel
			event.preventDefault();
			panel.lastFocusable.focus();
		}
		if( panel.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of panel
			event.preventDefault();
			panel.firstFocusable.focus();
		}
	};

	function getFocusableElements(panel) { //get all focusable elements inside the off-canvas content
		var allFocusable = panel.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		getFirstVisible(panel, allFocusable);
		getLastVisible(panel, allFocusable);
	};

	function getFirstVisible(panel, elements) { //get first visible focusable element inside the off-canvas content
		for(var i = 0; i < elements.length; i++) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				panel.firstFocusable = elements[i];
				return true;
			}
		}
	};

	function getLastVisible(panel, elements) { //get last visible focusable element inside the off-canvas content
		for(var i = elements.length - 1; i >= 0; i--) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				panel.lastFocusable = elements[i];
				return true;
			}
		}
	};

	function emitPanelEvents(panel, eventName, target) { // emit custom event
		var event = new CustomEvent(eventName, {detail: target});
		panel.element.dispatchEvent(event);
	};

	function moveFocusFn(element) {
    element.focus();
    if (document.activeElement !== element) {
      element.setAttribute('tabindex','-1');
      element.focus();
    }
  };

	//initialize the OffCanvas objects
	var offCanvas = document.getElementsByClassName('js-off-canvas__panel');
	if( offCanvas.length > 0 ) {
		for( var i = 0; i < offCanvas.length; i++) {
			(function(i){new OffCanvas(offCanvas[i]);})(i);
		}
	}
}());
// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

// File#: _1_pre-header
// Usage: codyhouse.co/license
(function() {
	var preHeader = document.getElementsByClassName('js-pre-header');
	if(preHeader.length > 0) {
		for(var i = 0; i < preHeader.length; i++) {
			(function(i){ addPreHeaderEvent(preHeader[i]);})(i);
		}

		function addPreHeaderEvent(element) {
			var close = element.getElementsByClassName('js-pre-header__close-btn')[0];
			if(close) {
				close.addEventListener('click', function(event) {
					event.preventDefault();
					Util.addClass(element, 'pre-header--is-hidden');
				});
			}
		}
	}
}());
// utility functions
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

// File#: _1_main-header
// Usage: codyhouse.co/license
(function() {
	var mainHeader = document.getElementsByClassName('js-header');
	if( mainHeader.length > 0 ) {
		var trigger = mainHeader[0].getElementsByClassName('js-header__trigger')[0],
			nav = mainHeader[0].getElementsByClassName('js-header__nav')[0];

		// we'll use these to store the node that needs to receive focus when the mobile menu is closed 
		var focusMenu = false;

		//detect click on nav trigger
		trigger.addEventListener("click", function(event) {
			event.preventDefault();
			toggleNavigation(!Util.hasClass(nav, 'header__nav--is-visible'));
		});

		// listen for key events
		window.addEventListener('keyup', function(event){
			// listen for esc key
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(trigger.getAttribute('aria-expanded') == 'true' && isVisible(trigger)) {
					focusMenu = trigger; // move focus to menu trigger when menu is close
					trigger.click();
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				// close navigation on mobile if open when nav loses focus
				if(trigger.getAttribute('aria-expanded') == 'true' && isVisible(trigger) && !document.activeElement.closest('.js-header')) trigger.click();
			}
		});

		// listen for resize
		var resizingId = false;
		window.addEventListener('resize', function() {
			clearTimeout(resizingId);
			resizingId = setTimeout(doneResizing, 500);
		});

		function doneResizing() {
			if( !isVisible(trigger) && Util.hasClass(mainHeader[0], 'header--expanded')) toggleNavigation(false); 
		};
	}

	function isVisible(element) {
		return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
	};

	function toggleNavigation(bool) { // toggle navigation visibility on small device
		Util.toggleClass(nav, 'header__nav--is-visible', bool);
		Util.toggleClass(mainHeader[0], 'header--expanded', bool);
		trigger.setAttribute('aria-expanded', bool);
		if(bool) { //opening menu -> move focus to first element inside nav
			nav.querySelectorAll('[href], input:not([disabled]), button:not([disabled])')[0].focus();
		} else if(focusMenu) {
			focusMenu.focus();
			focusMenu = false;
		}
	};
}());
// utility functions
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

// File#: _1_password
// Usage: codyhouse.co/license
(function() {
	var Password = function(element) {
		this.element = element;
		this.password = this.element.getElementsByClassName('js-password__input')[0];
		this.visibilityBtn = this.element.getElementsByClassName('js-password__btn')[0];
		this.visibilityClass = 'password--text-is-visible';
		this.initPassword();
	};

	Password.prototype.initPassword = function() {
		var self = this;
		//listen to the click on the password btn
		this.visibilityBtn.addEventListener('click', function(event) {
			//if password is in focus -> do nothing if user presses Enter
			if(document.activeElement === self.password) return;
			event.preventDefault();
			self.togglePasswordVisibility();
		});
	};

	Password.prototype.togglePasswordVisibility = function() {
		var makeVisible = !Util.hasClass(this.element, this.visibilityClass);
		//change element class
		Util.toggleClass(this.element, this.visibilityClass, makeVisible);
		//change input type
		(makeVisible) ? this.password.setAttribute('type', 'text') : this.password.setAttribute('type', 'password');
	};
	
	//initialize the Password objects
	var passwords = document.getElementsByClassName('js-password');
	if( passwords.length > 0 ) {
		for( var i = 0; i < passwords.length; i++) {
			(function(i){new Password(passwords[i]);})(i);
		}
	};
}());
// File#: _1_file-upload
// Usage: codyhouse.co/license
(function() {
	var InputFile = function(element) {
		this.element = element;
		this.input = this.element.getElementsByClassName('file-upload__input')[0];
		this.label = this.element.getElementsByClassName('file-upload__label')[0];
		this.multipleUpload = this.input.hasAttribute('multiple'); // allow for multiple files selection
		
		// this is the label text element -> when user selects a file, it will be changed from the default value to the name of the file 
		this.labelText = this.element.getElementsByClassName('file-upload__text')[0];
		this.initialLabel = this.labelText.textContent;

		initInputFileEvents(this);
	}; 

	function initInputFileEvents(inputFile) {
		// make label focusable
		inputFile.label.setAttribute('tabindex', '0');
		inputFile.input.setAttribute('tabindex', '-1');

		// move focus from input to label -> this is triggered when a file is selected or the file picker modal is closed
		inputFile.input.addEventListener('focusin', function(event){ 
			inputFile.label.focus();
		});

		// press 'Enter' key on label element -> trigger file selection
		inputFile.label.addEventListener('keydown', function(event) {
			if( event.keyCode && event.keyCode == 13 || event.key && event.key.toLowerCase() == 'enter') {inputFile.input.click();}
		});

		// file has been selected -> update label text
		inputFile.input.addEventListener('change', function(event){ 
			updateInputLabelText(inputFile);
		});
	};

	function updateInputLabelText(inputFile) {
		var label = '';
		if(inputFile.input.files && inputFile.input.files.length < 1) { 
			label = inputFile.initialLabel; // no selection -> revert to initial label
		} else if(inputFile.multipleUpload && inputFile.input.files && inputFile.input.files.length > 1) {
			label = inputFile.input.files.length+ ' files'; // multiple selection -> show number of files
		} else {
			label = inputFile.input.value.split('\\').pop(); // single file selection -> show name of the file
		}
		inputFile.labelText.textContent = label;
	};

  //initialize the InputFile objects
	var inputFiles = document.getElementsByClassName('file-upload');
	if( inputFiles.length > 0 ) {
		for( var i = 0; i < inputFiles.length; i++) {
			(function(i){new InputFile(inputFiles[i]);})(i);
		}
	}
}());
// File#: _1_choice-images
// Usage: codyhouse.co/license
(function() {
  var ChoiceImgs = function(element) {
    this.element = element;
    this.imgs = this.element.getElementsByClassName('js-choice-img');
    this.isRadio = this.imgs[0].getAttribute('role') == 'radio';
    resetChoiceImgs(this); // set initial aria values
    initChoiceImgsEvent(this);
  };

  function initChoiceImgsEvent(choiceImgs) {
    // on click -> select new item
    choiceImgs.element.addEventListener('click', function(event){
      var selectedImg = event.target.closest('.js-choice-img');
      if(!selectedImg) return;
      var index = Array.prototype.indexOf.call(choiceImgs.imgs, selectedImg);
      if(choiceImgs.isRadio) {
        setRadio(choiceImgs, selectedImg, index);
      } else {
        setCheckbox(choiceImgs, selectedImg, index);
      }
    });

    // keyboard events
    choiceImgs.element.addEventListener('keydown', function(event){
      var selectedImg = event.target.closest('.js-choice-img');
      if(!selectedImg) return;
      
      if( (event.keyCode && event.keyCode == 32) || (event.key && event.key.toLowerCase() == ' ') ) {
        // spacebar ->if this is a checkbox choice, toggle the state
        if(choiceImgs.isRadio) return;
        event.preventDefault();
        var index = Array.prototype.indexOf.call(choiceImgs.imgs, selectedImg);
        setCheckbox(choiceImgs, selectedImg, index);
      } else if((event.keyCode && (event.keyCode == 40 || event.keyCode == 39) ) || (event.key && (event.key.toLowerCase() == 'arrowdown' || event.key.toLowerCase() == 'arrowright'))) {
        // arrow right/arrow down
        if(!choiceImgs.isRadio) return;
        event.preventDefault();
        navigateRadioImgs(choiceImgs, 1);
      } else if((event.keyCode && (event.keyCode == 38 || event.keyCode == 37) ) || (event.key && (event.key.toLowerCase() == 'arrowup' || event.key.toLowerCase() == 'arrowleft'))) {
        // arrow left/up down
        if(!choiceImgs.isRadio) return;
        event.preventDefault();
        navigateRadioImgs(choiceImgs, -1);
      }
    });
  };

  function setCheckbox(choiceImgs, selectedImg, index) {
    var check = selectedImg.getAttribute('aria-checked') == 'false' ? 'true' : 'false';
    selectedImg.setAttribute('aria-checked', check);
    selectedImg.focus(); // move focus to input element
  };

  function setRadio(choiceImgs, selectedImg, index) {
    var check = selectedImg.getAttribute('aria-checked') == 'false' ? 'true' : 'false';
    if(check == 'true') {
      selectedImg.setAttribute('aria-checked', check);
      selectedImg.setAttribute('tabindex', '0');
      for(var i = 0; i < choiceImgs.imgs.length; i++) {
        if(i != index) {
          choiceImgs.imgs[i].setAttribute('aria-checked', 'false');
          choiceImgs.imgs[i].removeAttribute('tabindex');
        }
      }
    }
    selectedImg.focus(); // move focus to input element
  };

  function navigateRadioImgs(choiceImgs, increment) {
    // navigate radio items with keyboard
    var selectedImg = choiceImgs.element.querySelector('[aria-checked="true"]');
    if(!selectedImg) return;
    var index = Array.prototype.indexOf.call(choiceImgs.imgs, selectedImg);
    index = index + increment;
    if(index < 0) index =  choiceImgs.imgs.length - 1;
    if(index >= choiceImgs.imgs.length) index = 0;
    setRadio(choiceImgs, choiceImgs.imgs[index], index);
  };

  function resetChoiceImgs(choiceImgs) {
    for(var i = 0; i < choiceImgs.imgs.length; i++) {
      var check = choiceImgs.imgs[i].getAttribute('aria-checked');
      if(check == 'true') {
        choiceImgs.imgs[i].setAttribute('tabindex', '0'); // make it focusable
      } else {
        // if radio -> element not focusable
        // if checkbox -> element still focusable
        choiceImgs.isRadio ? choiceImgs.imgs[i].removeAttribute('tabindex') : choiceImgs.imgs[i].setAttribute('tabindex', '0');
      }
    }
  };

  //initialize the ChoiceImgs objects
	var choiceImg = document.getElementsByClassName('js-choice-imgs');
	if( choiceImg.length > 0 ) {
		for( var i = 0; i < choiceImg.length; i++) {
			(function(i){new ChoiceImgs(choiceImg[i]);})(i);
		}
	};
}());
// File#: _1_choice-buttons
// Usage: codyhouse.co/license
(function() {
  var ChoiceButton = function(element) {
    this.element = element;
    this.btns = this.element.getElementsByClassName('js-choice-btn');
    this.inputs = getChoiceInput(this);
    this.isRadio = this.inputs[0].type.toString() == 'radio';
    resetCheckedStatus(this); // set initial classes
    initChoiceButtonEvent(this); // add listeners
  };

  function getChoiceInput(element) { // store input elements in an object property
    var inputs = [];
    for(var i = 0; i < element.btns.length; i++) {
      inputs.push(element.btns[i].getElementsByTagName('input')[0]);
    }
    return inputs;
  };

  function initChoiceButtonEvent(choiceBtn) {
    choiceBtn.element.addEventListener('click', function(event){ // update status on click
      if(Array.prototype.indexOf.call(choiceBtn.inputs, event.target) > -1) return; // triggered by change in input element -> will be detected by the 'change' event
      
      var selectedBtn = event.target.closest('.js-choice-btn');
      if(!selectedBtn) return;
      var index = Array.prototype.indexOf.call(choiceBtn.btns, selectedBtn);
      var isInput = inputsList.indexOf(event.target.tagName.toLowerCase()) > -1;
      if(choiceBtn.isRadio && choiceBtn.inputs[index].checked) { // radio input already checked
        if(!isInput) choiceBtn.inputs[index].focus(); // move focus to input element
        return; 
      }

      choiceBtn.inputs[index].checked = !choiceBtn.inputs[index].checked;
      choiceBtn.inputs[index].dispatchEvent(new CustomEvent('change')); // trigger change event
      if(!isInput) choiceBtn.inputs[index].focus(); // move focus to input element
    });

    for(var i = 0; i < choiceBtn.btns.length; i++) {(function(i){ // change + focus events
      choiceBtn.inputs[i].addEventListener('change', function(event){
        choiceBtn.isRadio ? resetCheckedStatus(choiceBtn) : resetSingleStatus(choiceBtn, i);
      });

      choiceBtn.inputs[i].addEventListener('focus', function(event){
        resetFocusStatus(choiceBtn, i, true);
      });

      choiceBtn.inputs[i].addEventListener('blur', function(event){
        resetFocusStatus(choiceBtn, i, false);
      });
    })(i);}
  };

  function resetCheckedStatus(choiceBtn) {
    for(var i = 0; i < choiceBtn.btns.length; i++) {
      resetSingleStatus(choiceBtn, i);
    }
  };

  function resetSingleStatus(choiceBtn, index) { // toggle .choice-btn--checked class
    choiceBtn.btns[index].classList.toggle('choice-btn--checked', choiceBtn.inputs[index].checked);
  };

  function resetFocusStatus(choiceBtn, index, bool) { // toggle .choice-btn--focus class
    choiceBtn.btns[index].classList.toggle('choice-btn--focus', bool);
  };

  var inputsList = ["input", "select", "textarea"];

  //initialize the ChoiceButtons objects
	var choiceButton = document.getElementsByClassName('js-choice-btns');
	if( choiceButton.length > 0 ) {
		for( var i = 0; i < choiceButton.length; i++) {
			(function(i){new ChoiceButton(choiceButton[i]);})(i);
		}
	};
}());
// File#: _1_form-validator
// Usage: codyhouse.co/license
(function() {
  var FormValidator = function(opts) {
    this.options = extendProps(FormValidator.defaults , opts);
		this.element = this.options.element;
    this.input = [];
    this.textarea = [];
    this.select = [];
    this.errorFields = [];
    this.errorFieldListeners = [];
		initFormValidator(this);
	};

  //public functions
  FormValidator.prototype.validate = function(cb) {
    validateForm(this);
    if(cb) cb(this.errorFields);
  };

  // private methods
  function initFormValidator(formValidator) {
    formValidator.input = formValidator.element.querySelectorAll('input');
    formValidator.textarea = formValidator.element.querySelectorAll('textarea');
    formValidator.select = formValidator.element.querySelectorAll('select');
  };

  function validateForm(formValidator) {
    // reset input with errors
    formValidator.errorFields = []; 
    // remove change/input events from fields with error
    resetEventListeners(formValidator);
    
    // loop through fields and push to errorFields if there are errors
    for(var i = 0; i < formValidator.input.length; i++) {
      validateField(formValidator, formValidator.input[i]);
    }

    for(var i = 0; i < formValidator.textarea.length; i++) {
      validateField(formValidator, formValidator.textarea[i]);
    }

    for(var i = 0; i < formValidator.select.length; i++) {
      validateField(formValidator, formValidator.select[i]);
    }

    // show errors if any was found
    for(var i = 0; i < formValidator.errorFields.length; i++) {
      showError(formValidator, formValidator.errorFields[i]);
    }

    // move focus to first field with error
    if(formValidator.errorFields.length > 0) formValidator.errorFields[0].focus();
  };

  function validateField(formValidator, field) {
    if(!field.checkValidity()) {
      formValidator.errorFields.push(field);
      return;
    }
    // check for custom functions
    var customValidate = field.getAttribute('data-validate');
    if(customValidate && formValidator.options.customValidate[customValidate]) {
      formValidator.options.customValidate[customValidate](field, function(result) {
        if(!result) formValidator.errorFields.push(field);
      });
    }
  };

  function showError(formValidator, field) {
    // add error classes
    toggleErrorClasses(formValidator, field, true);

    // add event listener
    var index = formValidator.errorFieldListeners.length;
    formValidator.errorFieldListeners[index] = function() {
      toggleErrorClasses(formValidator, field, false);
      field.removeEventListener('change', formValidator.errorFieldListeners[index]);
      field.removeEventListener('input', formValidator.errorFieldListeners[index]);
    };
    field.addEventListener('change', formValidator.errorFieldListeners[index]);
    field.addEventListener('input', formValidator.errorFieldListeners[index]);
  };

  function toggleErrorClasses(formValidator, field, bool) {
    bool ? field.classList.add(formValidator.options.inputErrorClass) : field.classList.remove(formValidator.options.inputErrorClass);
    if(formValidator.options.inputWrapperErrorClass) {
      var wrapper = field.closest('.js-form-validate__input-wrapper');
      if(wrapper) {
        bool ? wrapper.classList.add(formValidator.options.inputWrapperErrorClass) : wrapper.classList.remove(formValidator.options.inputWrapperErrorClass);
      }
    }
  };

  function resetEventListeners(formValidator) {
    for(var i = 0; i < formValidator.errorFields.length; i++) {
      toggleErrorClasses(formValidator, formValidator.errorFields[i], false);
      formValidator.errorFields[i].removeEventListener('change', formValidator.errorFieldListeners[i]);
      formValidator.errorFields[i].removeEventListener('input', formValidator.errorFieldListeners[i]);
    }

    formValidator.errorFields = [];
    formValidator.errorFieldListeners = [];
  };

  var extendProps = function () {
    // Variables
    var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;
    // Check if a deep merge
    if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
      deep = arguments[0];
      i++;
    }
    // Merge the object into the extended object
    var merge = function (obj) {
      for ( var prop in obj ) {
        if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
          if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
            extended[prop] = extend( true, extended[prop], obj[prop] );
          } else {
            extended[prop] = obj[prop];
          }
        }
      }
    };
    // Loop through each object and conduct a merge
    for ( ; i < length; i++ ) {
      var obj = arguments[i];
      merge(obj);
    }
    return extended;
  };
  
  FormValidator.defaults = {
    element : '',
    inputErrorClass : 'fd3-form-control--error',
    inputWrapperErrorClass: 'form-validate__input-wrapper--error',
    customValidate: {}
  };
  window.FormValidator = FormValidator;
}());
  // File#: _1_animated-headline
// Usage: codyhouse.co/license
(function() {
  var TextAnim = function(element) {
    this.element = element;
    this.wordsWrapper = this.element.getElementsByClassName(' js-text-anim__wrapper');
    this.words = this.element.getElementsByClassName('js-text-anim__word');
    this.selectedWord = 0;
    // interval between two animations
    this.loopInterval = parseFloat(getComputedStyle(this.element).getPropertyValue('--text-anim-pause'))*1000 || 1000;
    // duration of single animation (e.g., time for a single word to rotate)
    this.transitionDuration = parseFloat(getComputedStyle(this.element).getPropertyValue('--text-anim-duration'))*1000 || 1000;
    // keep animating after first loop was completed
    this.loop = (this.element.getAttribute('data-loop') && this.element.getAttribute('data-loop') == 'off') ? false : true;
    this.wordInClass = 'text-anim__word--in';
    this.wordOutClass = 'text-anim__word--out';
    // check for specific animations
    this.isClipAnim = this.element.classList.contains('text-anim--clip');
    if(this.isClipAnim) {
      this.animBorderWidth = parseInt(getComputedStyle(this.element).getPropertyValue('--text-anim-border-width')) || 2;
      this.animPulseClass = 'text-anim__wrapper--pulse';
    }
    initTextAnim(this);
  };

  function initTextAnim(element) {
    // make sure there's a word with the wordInClass
    setSelectedWord(element);
    // if clip animation -> add pulse class
    if(element.isClipAnim) {
      element.wordsWrapper[0].classList.add(element.animPulseClass);
    }
    // init loop
    loopWords(element);
  };

  function setSelectedWord(element) {
    var selectedWord = element.element.getElementsByClassName(element.wordInClass);
    if(selectedWord.length == 0) {
      element.words[0].classList.add(element.wordInClass);
    } else {
      element.selectedWord = Array.prototype.indexOf.call(element.words, selectedWord[0]);
    }
  };

  function loopWords(element) {
    // stop animation after first loop was completed
    if(!element.loop && element.selectedWord == element.words.length - 1) {
      return;
    }
    var newWordIndex = getNewWordIndex(element);
    setTimeout(function() {
      if(element.isClipAnim) { // clip animation only
        switchClipWords(element, newWordIndex);
      } else {
        switchWords(element, newWordIndex);
      }
    }, element.loopInterval);
  };

  function switchWords(element, newWordIndex) {
    // switch words
    element.words[element.selectedWord].classList.remove(element.wordInClass);
    element.words[element.selectedWord].classList.add(element.wordOutClass);
    element.words[newWordIndex].classList.add(element.wordInClass);
    // reset loop
    resetLoop(element, newWordIndex);
  };

  function resetLoop(element, newIndex) {
    setTimeout(function() { 
      // set new selected word
      element.words[element.selectedWord].classList.remove(element.wordOutClass);
      element.selectedWord = newIndex;
      loopWords(element); // restart loop
    }, element.transitionDuration);
  };

  function switchClipWords(element, newWordIndex) {
    // clip animation only
    var startWidth =  element.words[element.selectedWord].offsetWidth,
      endWidth = element.words[newWordIndex].offsetWidth;
    
    // remove pulsing animation
    element.wordsWrapper[0].classList.remove(element.animPulseClass);
    // close word
    animateWidth(startWidth, element.animBorderWidth, element.wordsWrapper[0], element.transitionDuration, function() {
      // switch words
      element.words[element.selectedWord].classList.remove(element.wordInClass);
      element.words[newWordIndex].classList.add(element.wordInClass);
      element.selectedWord = newWordIndex;

      // open word
      animateWidth(element.animBorderWidth, endWidth, element.wordsWrapper[0], element.transitionDuration, function() {
        // add pulsing class
        element.wordsWrapper[0].classList.add(element.animPulseClass);
        loopWords(element);
      });
    });
  };

  function getNewWordIndex(element) {
    // get index of new word to be shown
    var index = element.selectedWord + 1;
    if(index >= element.words.length) index = 0;
    return index;
  };

  function animateWidth(start, to, element, duration, cb) {
    // animate width of a word for the clip animation
    var currentTime = null;

    var animateProperty = function(timestamp){  
      if (!currentTime) currentTime = timestamp;         
      var progress = timestamp - currentTime;
      
      var val = Math.easeInOutQuart(progress, start, to - start, duration);
      element.style.width = val+"px";
      if(progress < duration) {
          window.requestAnimationFrame(animateProperty);
      } else {
        cb();
      }
    };
  
    //set the width of the element before starting animation -> fix bug on Safari
    element.style.width = start+"px";
    window.requestAnimationFrame(animateProperty);
  };

  window.TextAnim = TextAnim;

  // init TextAnim objects
  var textAnim = document.getElementsByClassName('js-text-anim'),
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if( textAnim ) {
    if(reducedMotion) return;
    for( var i = 0; i < textAnim.length; i++) {
      (function(i){ new TextAnim(textAnim[i]);})(i);
    }
  }

  // Animation curve
  Math.easeInOutQuart = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t*t*t + b;
    t -= 2;
    return -c/2 * (t*t*t*t - 2) + b;
  };
}());
// File#: _1_diagonal-movement
// Usage: codyhouse.co/license
/*
  Modified version of the jQuery-menu-aim plugin
  https://github.com/kamens/jQuery-menu-aim
  - Replaced jQuery with Vanilla JS
  - Minor changes
*/
(function() {
  var menuAim = function(opts) {
    init(opts);
  };

  window.menuAim = menuAim;

  function init(opts) {
    var activeRow = null,
      mouseLocs = [],
      lastDelayLoc = null,
      timeoutId = null,
      options = extendProps({
        menu: '',
        rows: false, //if false, get direct children - otherwise pass nodes list 
        submenuSelector: "*",
        submenuDirection: "right",
        tolerance: 75,  // bigger = more forgivey when entering submenu
        enter: function(){},
        exit: function(){},
        activate: function(){},
        deactivate: function(){},
        exitMenu: function(){}
      }, opts),
      menu = options.menu;

    var MOUSE_LOCS_TRACKED = 3,  // number of past mouse locations to track
      DELAY = 300;  // ms delay when user appears to be entering submenu

    /**
     * Keep track of the last few locations of the mouse.
     */
    var mouseMoveFallback = function(event) {
      (!window.requestAnimationFrame) ? mousemoveDocument(event) : window.requestAnimationFrame(function(){mousemoveDocument(event);});
    };

    var mousemoveDocument = function(e) {
      mouseLocs.push({x: e.pageX, y: e.pageY});

      if (mouseLocs.length > MOUSE_LOCS_TRACKED) {
        mouseLocs.shift();
      }
    };

    /**
     * Cancel possible row activations when leaving the menu entirely
     */
    var mouseleaveMenu = function() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // If exitMenu is supplied and returns true, deactivate the
      // currently active row on menu exit.
      if (options.exitMenu(this)) {
        if (activeRow) {
          options.deactivate(activeRow);
        }

        activeRow = null;
      }
    };

    /**
     * Trigger a possible row activation whenever entering a new row.
     */
    var mouseenterRow = function() {
      if (timeoutId) {
        // Cancel any previous activation delays
        clearTimeout(timeoutId);
      }

      options.enter(this);
      possiblyActivate(this);
    },
    mouseleaveRow = function() {
      options.exit(this);
    };

    /*
     * Immediately activate a row if the user clicks on it.
     */
    var clickRow = function() {
      activate(this);
    };  

    /**
     * Activate a menu row.
     */
    var activate = function(row) {
      if (row == activeRow) {
        return;
      }

      if (activeRow) {
        options.deactivate(activeRow);
      }

      options.activate(row);
      activeRow = row;
    };

    /**
     * Possibly activate a menu row. If mouse movement indicates that we
     * shouldn't activate yet because user may be trying to enter
     * a submenu's content, then delay and check again later.
     */
    var possiblyActivate = function(row) {
      var delay = activationDelay();

      if (delay) {
        timeoutId = setTimeout(function() {
          possiblyActivate(row);
        }, delay);
      } else {
        activate(row);
      }
    };

    /**
     * Return the amount of time that should be used as a delay before the
     * currently hovered row is activated.
     *
     * Returns 0 if the activation should happen immediately. Otherwise,
     * returns the number of milliseconds that should be delayed before
     * checking again to see if the row should be activated.
     */
    var activationDelay = function() {
      if (!activeRow || !elementIs(activeRow, options.submenuSelector)) {
        // If there is no other submenu row already active, then
        // go ahead and activate immediately.
        return 0;
      }

      function getOffset(element) {
        var rect = element.getBoundingClientRect();
        return { top: rect.top + window.pageYOffset, left: rect.left + window.pageXOffset };
      };

      var offset = getOffset(menu),
          upperLeft = {
              x: offset.left,
              y: offset.top - options.tolerance
          },
          upperRight = {
              x: offset.left + menu.offsetWidth,
              y: upperLeft.y
          },
          lowerLeft = {
              x: offset.left,
              y: offset.top + menu.offsetHeight + options.tolerance
          },
          lowerRight = {
              x: offset.left + menu.offsetWidth,
              y: lowerLeft.y
          },
          loc = mouseLocs[mouseLocs.length - 1],
          prevLoc = mouseLocs[0];

      if (!loc) {
        return 0;
      }

      if (!prevLoc) {
        prevLoc = loc;
      }

      if (prevLoc.x < offset.left || prevLoc.x > lowerRight.x || prevLoc.y < offset.top || prevLoc.y > lowerRight.y) {
        // If the previous mouse location was outside of the entire
        // menu's bounds, immediately activate.
        return 0;
      }

      if (lastDelayLoc && loc.x == lastDelayLoc.x && loc.y == lastDelayLoc.y) {
        // If the mouse hasn't moved since the last time we checked
        // for activation status, immediately activate.
        return 0;
      }

      // Detect if the user is moving towards the currently activated
      // submenu.
      //
      // If the mouse is heading relatively clearly towards
      // the submenu's content, we should wait and give the user more
      // time before activating a new row. If the mouse is heading
      // elsewhere, we can immediately activate a new row.
      //
      // We detect this by calculating the slope formed between the
      // current mouse location and the upper/lower right points of
      // the menu. We do the same for the previous mouse location.
      // If the current mouse location's slopes are
      // increasing/decreasing appropriately compared to the
      // previous's, we know the user is moving toward the submenu.
      //
      // Note that since the y-axis increases as the cursor moves
      // down the screen, we are looking for the slope between the
      // cursor and the upper right corner to decrease over time, not
      // increase (somewhat counterintuitively).
      function slope(a, b) {
        return (b.y - a.y) / (b.x - a.x);
      };

      var decreasingCorner = upperRight,
        increasingCorner = lowerRight;

      // Our expectations for decreasing or increasing slope values
      // depends on which direction the submenu opens relative to the
      // main menu. By default, if the menu opens on the right, we
      // expect the slope between the cursor and the upper right
      // corner to decrease over time, as explained above. If the
      // submenu opens in a different direction, we change our slope
      // expectations.
      if (options.submenuDirection == "left") {
        decreasingCorner = lowerLeft;
        increasingCorner = upperLeft;
      } else if (options.submenuDirection == "below") {
        decreasingCorner = lowerRight;
        increasingCorner = lowerLeft;
      } else if (options.submenuDirection == "above") {
        decreasingCorner = upperLeft;
        increasingCorner = upperRight;
      }

      var decreasingSlope = slope(loc, decreasingCorner),
        increasingSlope = slope(loc, increasingCorner),
        prevDecreasingSlope = slope(prevLoc, decreasingCorner),
        prevIncreasingSlope = slope(prevLoc, increasingCorner);

      if (decreasingSlope < prevDecreasingSlope && increasingSlope > prevIncreasingSlope) {
        // Mouse is moving from previous location towards the
        // currently activated submenu. Delay before activating a
        // new menu row, because user may be moving into submenu.
        lastDelayLoc = loc;
        return DELAY;
      }

      lastDelayLoc = null;
      return 0;
    };

    var reset = function(triggerDeactivate) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (activeRow && triggerDeactivate) {
        options.deactivate(activeRow);
      }

      activeRow = null;
    };

    var destroyInstance = function() {
      menu.removeEventListener('mouseleave', mouseleaveMenu);  
      document.removeEventListener('mousemove', mouseMoveFallback);
      if(rows.length > 0) {
        for(var i = 0; i < rows.length; i++) {
          rows[i].removeEventListener('mouseenter', mouseenterRow);  
          rows[i].removeEventListener('mouseleave', mouseleaveRow);
          rows[i].removeEventListener('click', clickRow);  
        }
      }
      
    };

    /**
     * Hook up initial menu events
     */
    menu.addEventListener('mouseleave', mouseleaveMenu);  
    var rows = (options.rows) ? options.rows : menu.children;
    if(rows.length > 0) {
      for(var i = 0; i < rows.length; i++) {(function(i){
        rows[i].addEventListener('mouseenter', mouseenterRow);  
        rows[i].addEventListener('mouseleave', mouseleaveRow);
        rows[i].addEventListener('click', clickRow);  
      })(i);}
    }

    document.addEventListener('mousemove', mouseMoveFallback);

    /* Reset/destroy menu */
    menu.addEventListener('reset', function(event){
      reset(event.detail);
    });
    menu.addEventListener('destroy', destroyInstance);
  };

  var extendProps = function () {
    // Variables
    var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;
    // Check if a deep merge
    if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
      deep = arguments[0];
      i++;
    }
    // Merge the object into the extended object
    var merge = function (obj) {
      for ( var prop in obj ) {
        if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
          if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
            extended[prop] = extend( true, extended[prop], obj[prop] );
          } else {
            extended[prop] = obj[prop];
          }
        }
      }
    };
    // Loop through each object and conduct a merge
    for ( ; i < length; i++ ) {
      var obj = arguments[i];
      merge(obj);
    }
    return extended;
  };

  function elementIs(elem, selector) {
    if(selector.nodeType){
      return elem === selector;
    }
  
    var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
      length = qa.length;
  
    while(length--){
      if(qa[length] === elem){
        return true;
      }
    }
  
    return false;
  };
}());


// utility functions
if(!Util) function Util () {};

Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

// File#: _1_revealing-section
// Usage: codyhouse.co/license
(function() {
  var RevealingSection = function(element) {
    this.element = element;
    this.scrollingFn = false;
    this.scrolling = false;
    this.resetOpacity = false;
    initRevealingSection(this);
  };

  function initRevealingSection(element) {
    // set position of sticky element
    setBottom(element);
    // create a new node - to be inserted before the sticky element
    createPrevElement(element);
    // on resize -> reset element bottom position
    element.element.addEventListener('update-reveal-section', function(){
      setBottom(element);
      setPrevElementTop(element);
    });
    animateRevealingSection.bind(element)(); // set initial status
    // change opacity of layer
    var observer = new IntersectionObserver(revealingSectionCallback.bind(element));
		observer.observe(element.prevElement);
  };

  function createPrevElement(element) {
    var newElement = document.createElement("div"); 
    newElement.setAttribute('aria-hidden', 'true');
    element.element.parentElement.insertBefore(newElement, element.element);
    element.prevElement =  element.element.previousElementSibling;
    element.prevElement.style.opacity = '0';
    element.prevElement.style.height = '1px';
    setPrevElementTop(element);
  };

  function setPrevElementTop(element) {
    element.prevElementTop = element.prevElement.getBoundingClientRect().top + window.scrollY;
  };

  function revealingSectionCallback(entries, observer) {
		if(entries[0].isIntersecting) {
      if(this.scrollingFn) return; // listener for scroll event already added
      revealingSectionInitEvent(this);
    } else {
      if(!this.scrollingFn) return; // listener for scroll event already removed
      window.removeEventListener('scroll', this.scrollingFn);
      updateOpacityValue(this, 0);
      this.scrollingFn = false;
    }
  };
  
  function revealingSectionInitEvent(element) {
    element.scrollingFn = revealingSectionScrolling.bind(element);
    window.addEventListener('scroll', element.scrollingFn);
  };

  function revealingSectionScrolling() {
    if(this.scrolling) return;
    this.scrolling = true;
    window.requestAnimationFrame(animateRevealingSection.bind(this));
  };

  function animateRevealingSection() {
    if(this.prevElementTop - window.scrollY < window.innerHeight) {
      var opacity = (1 - (window.innerHeight + window.scrollY - this.prevElementTop)/window.innerHeight).toFixed(2);
      if(opacity > 0 ) {
        this.resetOpacity = false;
        updateOpacityValue(this, opacity);
      } else if(!this.resetOpacity) {
        this.resetOpacity = true;
        updateOpacityValue(this, 0);
      } 
    }
    this.scrolling = false;
  };

  function updateOpacityValue(element, value) {
    element.element.style.setProperty('--reavealing-section-overlay-opacity', value);
  };

  function setBottom(element) {
    var translateValue = window.innerHeight - element.element.offsetHeight;
    if(translateValue > 0) translateValue = 0;
    element.element.style.bottom = ''+translateValue+'px';
  };

  //initialize the Revealing Section objects
  var revealingSection = document.getElementsByClassName('js-revealing-section');
  var stickySupported = Util.cssSupports('position', 'sticky') || Util.cssSupports('position', '-webkit-sticky');
	if( revealingSection.length > 0 && stickySupported) {
    var revealingSectionArray = [];
		for( var i = 0; i < revealingSection.length; i++) {
      (function(i){revealingSectionArray.push(new RevealingSection(revealingSection[i]));})(i);
    }
    
    var resizingId = false,
      customEvent = new CustomEvent('update-reveal-section');

    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 100);
    });

    // wait for font to be loaded
    if(document.fonts) {
      document.fonts.onloadingdone = function (fontFaceSetEvent) {
        doneResizing();
      };
    }

    function doneResizing() {
      for( var i = 0; i < revealingSectionArray.length; i++) {
        (function(i){revealingSectionArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
	}
}());
// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; 
};

Math.easeOutQuart = function (t, b, c, d) {
  t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};


// File#: _1_overscroll-section
// Usage: codyhouse.co/license
(function() {
  var OverscrollSection = function(element) {
    this.element = element;
    this.stickyContent = this.element.getElementsByClassName('js-overscroll-section__sticky-content');
    this.scrollContent = this.element.getElementsByClassName('js-overscroll-section__scroll-content');
    this.scrollingFn = false;
    this.scrolling = false;
    this.resetOpacity = false;
    this.disabledClass = 'overscroll-section--disabled';
    initOverscrollSection(this);
  };

  function initOverscrollSection(element) {
    // set position of sticky element
    setTop(element);
    // create a new node - to be inserted before the scroll element
    createPrevElement(element);
    // on resize -> reset element top position
    element.element.addEventListener('update-overscroll-section', function(){
      setTop(element);
      setPrevElementTop(element);
    });
    // set initial opacity value
    animateOverscrollSection.bind(element)(); 
    // change opacity of layer
    var observer = new IntersectionObserver(overscrollSectionCallback.bind(element));
    observer.observe(element.prevElement);
  };

  function createPrevElement(element) {
    if(element.scrollContent.length == 0) return;
    var newElement = document.createElement("div"); 
    newElement.setAttribute('aria-hidden', 'true');
    element.element.insertBefore(newElement, element.scrollContent[0]);
    element.prevElement =  element.scrollContent[0].previousElementSibling;
    element.prevElement.style.opacity = '0';
    setPrevElementTop(element);
  };

  function setPrevElementTop(element) {
    element.prevElementTop = element.prevElement.getBoundingClientRect().top + window.scrollY;
  };

  function overscrollSectionCallback(entries) {
    if(entries[0].isIntersecting) {
      if(this.scrollingFn) return; // listener for scroll event already added
      overscrollSectionInitEvent(this);
    } else {
      if(!this.scrollingFn) return; // listener for scroll event already removed
      window.removeEventListener('scroll', this.scrollingFn);
      updateOpacityValue(this, 0);
      this.scrollingFn = false;
    }
  };

  function overscrollSectionInitEvent(element) {
    element.scrollingFn = overscrollSectionScrolling.bind(element);
    window.addEventListener('scroll', element.scrollingFn);
  };

  function overscrollSectionScrolling() {
    if(this.scrolling) return;
    this.scrolling = true;
    window.requestAnimationFrame(animateOverscrollSection.bind(this));
  };

  function animateOverscrollSection() {
    if(this.stickyContent.length == 0) return;
    setPrevElementTop(this);
    if( parseInt(this.stickyContent[0].style.top) != window.innerHeight - this.stickyContent[0].offsetHeight) {
      setTop(this);
    }
    if(this.prevElementTop - window.scrollY < window.innerHeight*2/3) {
      var opacity = Math.easeOutQuart(window.innerHeight*2/3 + window.scrollY - this.prevElementTop, 0, 1, window.innerHeight*2/3);
      if(opacity > 0 ) {
        this.resetOpacity = false;
        updateOpacityValue(this, opacity);
      } else if(!this.resetOpacity) {
        this.resetOpacity = true;
        updateOpacityValue(this, 0);
      } 
    } else {
      updateOpacityValue(this, 0);
    }
    this.scrolling = false;
  };

  function updateOpacityValue(element, value) {
    element.element.style.setProperty('--overscroll-section-opacity', value);
  };

  function setTop(element) {
    if(element.stickyContent.length == 0) return;
    var translateValue = window.innerHeight - element.stickyContent[0].offsetHeight;
    element.stickyContent[0].style.top = translateValue+'px';
    // check if effect should be disabled
    Util.toggleClass(element.element, element.disabledClass, translateValue > 2);
  };

  //initialize the OverscrollSection objects
  var overscrollSections = document.getElementsByClassName('js-overscroll-section');
  var stickySupported = Util.cssSupports('position', 'sticky') || Util.cssSupports('position', '-webkit-sticky'),
    intObservSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
    reducedMotion = Util.osHasReducedMotion();
	if( overscrollSections.length > 0 && stickySupported && !reducedMotion && intObservSupported) {
    var overscrollSectionsArray = [];
		for( var i = 0; i < overscrollSections.length; i++) {
      (function(i){overscrollSectionsArray.push(new OverscrollSection(overscrollSections[i]));})(i);
    }
    
    var resizingId = false,
      customEvent = new CustomEvent('update-overscroll-section');

    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 100);
    });

    // wait for font to be loaded
    document.fonts.onloadingdone = function (fontFaceSetEvent) {
      doneResizing();
    };

    function doneResizing() {
      for( var i = 0; i < overscrollSectionsArray.length; i++) {
        (function(i){overscrollSectionsArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
	}
}());
// File#: _1_cursor-movement-effects
// Usage: codyhouse.co/license
(function() {
  var CursorFx = function(opts) {
    this.target = opts.target;
    this.objects = opts.objects;
    this.animating = false;
    this.animatingId = false;
    this.rotateValue = [];
    initCursorFx(this);
  };

  function initCursorFx(element) {
    // detect mouse move on card element
    element.target.addEventListener('mousemove', function(event){
      if(element.animating) return;
      element.animating = true;
      element.animatingId = window.requestAnimationFrame(moveObjs.bind(element, event));
    });

    element.target.addEventListener('mouseleave', function(event){
      // reset style
      if(element.animatingId) {
        window.cancelAnimationFrame(element.animatingId);
        element.animatingId = false;
        element.animating = false;
      }
      resetObjs(element);
    });
  };

  function moveObjs(event) {
    // update target size info
    this.targetInfo = this.target.getBoundingClientRect();
    for(var i = 0; i < this.objects.length; i++) {
      if(!this.rotateValue[i]) this.rotateValue[i] = false;
      moveSingleObj(this, this.objects[i], event, i);
    }
    this.animating = false;
  };

  function moveSingleObj(element, objDetails, event, index) {
    var effect = 'parallax'; 
    if(objDetails['effect']) effect = objDetails['effect'];
    
    if( effect == 'parallax') {
      moveObjParallax(element, objDetails, event);
    } else if( effect == 'follow') {
      moveObjFollow(element, objDetails, event);
    } else if( effect == 'rotate') {
      moveObjRotate(element, objDetails, event, index);
    }
  };

  function moveObjParallax(element, objDetails, event) {
    // get translateX and translateY values
    var deltaTranslate = parseInt(objDetails['delta']);
    var translateX = (2*deltaTranslate/element.targetInfo.width)*(element.targetInfo.left + element.targetInfo.width/2 - event.clientX);
    var translateY = (2*deltaTranslate/element.targetInfo.height)*(element.targetInfo.top + element.targetInfo.height/2 - event.clientY);
    // check if we need to change direction
    if(objDetails['direction'] && objDetails['direction'] == 'follow') {
      translateX = -1 * translateX;
      translateY = -1 * translateY;
    }

    objDetails.element.style.transform = 'translateX('+translateX+'px) translateY('+translateY+'px)';
  };

  function moveObjFollow(element, objDetails, event) {
    var objInfo = objDetails.element.getBoundingClientRect();
    objDetails.element.style.transform = 'translateX('+parseInt(event.clientX - objInfo.width/2)+'px) translateY('+parseInt(event.clientY - objInfo.height/2)+'px)';
  };

  function moveObjRotate(element, objDetails, event, index) {
    var boxBoundingRect = objDetails.element.getBoundingClientRect();
    var boxCenter = {
        x: boxBoundingRect.left + boxBoundingRect.width/2, 
        y: boxBoundingRect.top + boxBoundingRect.height/2
    };

    var angle = Math.atan2(event.pageX - boxCenter.x, - (event.pageY - boxCenter.y) )*(180 / Math.PI);      

    // if this is the first time the mouse enters the onject - this angle will be the delta rotation
    if(element.rotateValue[index] === false) {
      element.rotateValue[index] = angle;
    };

    angle = angle - element.rotateValue[index];
    objDetails.element.style.transform = 'rotate('+angle+'deg)';
  };

  function resetObjs(element) {
    for(var i = 0; i < element.objects.length; i++) {
      resetSingleObj(element, element.objects[i]);
      element.rotateValue[i] = false;
    }
  };

  function resetSingleObj(element, objDetails) {
    var effect = 'parallax'; 
    if(objDetails['effect']) effect = objDetails['effect'];

    if( effect == 'parallax' || effect == 'rotate') {
      objDetails.element.style.transform = '';
    }

  };

  window.CursorFx = CursorFx;
}());

(function() {
  // demo code - initialize the CursorFx element
  var cursorFx = document.getElementsByClassName('js-cursor-fx-target');
  if(cursorFx.length > 0) {
    var obj1 = document.getElementsByClassName('js-cursor-fx-object--1');
    var obj2 = document.getElementsByClassName('js-cursor-fx-object--2');
    var objects = [];
    if(obj1.length > 0) {
      objects.push({element: obj1[0], effect: 'parallax', delta: '20'});
    }
    if(obj2.length > 0) {
      objects.push({element: obj2[0], effect: 'parallax', delta: '10', direction: 'follow'});
    }

    new CursorFx({
      target: cursorFx[0],
      objects: objects
    });
  }
}());
// File#: _1_modal-window
// Usage: codyhouse.co/license
(function() {
	var Modal = function(element) {
		this.element = element;
		this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.moveFocusEl = null; // focus will be moved to this element when modal is open
		this.modalFocus = this.element.getAttribute('data-modal-first-focus') ? this.element.querySelector(this.element.getAttribute('data-modal-first-focus')) : null;
		this.selectedTrigger = null;
		this.preventScrollEl = this.getPreventScrollEl();
		this.showClass = "modal--is-visible";
		this.initModal();
	};

	Modal.prototype.getPreventScrollEl = function() {
		var scrollEl = false;
		var querySelector = this.element.getAttribute('data-modal-prevent-scroll');
		if(querySelector) scrollEl = document.querySelector(querySelector);
		return scrollEl;
	};

	Modal.prototype.initModal = function() {
		var self = this;
		//open modal when clicking on trigger buttons
		if ( this.triggers ) {
			for(var i = 0; i < this.triggers.length; i++) {
				this.triggers[i].addEventListener('click', function(event) {
					event.preventDefault();
					if(self.element.classList.contains(self.showClass)) {
						self.closeModal();
						return;
					}
					self.selectedTrigger = event.currentTarget;
					self.showModal();
					self.initModalEvents();
				});
			}
		}

		// listen to the openModal event -> open modal without a trigger button
		this.element.addEventListener('openModal', function(event){
			if(event.detail) self.selectedTrigger = event.detail;
			self.showModal();
			self.initModalEvents();
		});

		// listen to the closeModal event -> close modal without a trigger button
		this.element.addEventListener('closeModal', function(event){
			if(event.detail) self.selectedTrigger = event.detail;
			self.closeModal();
		});

		// if modal is open by default -> initialise modal events
		if(this.element.classList.contains(this.showClass)) this.initModalEvents();
	};

	Modal.prototype.showModal = function() {
		var self = this;
		this.element.classList.add(this.showClass);;
		this.getFocusableElements();
		if(this.moveFocusEl) {
			this.moveFocusEl.focus();
			// wait for the end of transitions before moving focus
			this.element.addEventListener("transitionend", function cb(event) {
				self.moveFocusEl.focus();
				self.element.removeEventListener("transitionend", cb);
			});
		}
		this.emitModalEvents('modalIsOpen');
		// change the overflow of the preventScrollEl
		if(this.preventScrollEl) this.preventScrollEl.style.overflow = 'hidden';
	};

	Modal.prototype.closeModal = function() {
		if(!this.element.classList.contains(this.showClass)) return;
		this.element.classList.remove(this.showClass);
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.moveFocusEl = null;
		if(this.selectedTrigger) this.selectedTrigger.focus();
		//remove listeners
		this.cancelModalEvents();
		this.emitModalEvents('modalIsClose');
		// change the overflow of the preventScrollEl
		if(this.preventScrollEl) this.preventScrollEl.style.overflow = '';
	};

	Modal.prototype.initModalEvents = function() {
		//add event listeners
		this.element.addEventListener('keydown', this);
		this.element.addEventListener('click', this);
	};

	Modal.prototype.cancelModalEvents = function() {
		//remove event listeners
		this.element.removeEventListener('keydown', this);
		this.element.removeEventListener('click', this);
	};

	Modal.prototype.handleEvent = function (event) {
		switch(event.type) {
			case 'click': {
				this.initClick(event);
			}
			case 'keydown': {
				this.initKeyDown(event);
			}
		}
	};

	Modal.prototype.initKeyDown = function(event) {
		if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
			//trap focus inside modal
			this.trapFocus(event);
		} else if( (event.keyCode && event.keyCode == 13 || event.key && event.key == 'Enter') && event.target.closest('.js-modal__close')) {
			event.preventDefault();
			this.closeModal(); // close modal when pressing Enter on close button
		}	
	};

	Modal.prototype.initClick = function(event) {
		//close modal when clicking on close button or modal bg layer 
		if( !event.target.closest('.js-modal__close') && !event.target.classList.contains('js-modal') ) return;
		event.preventDefault();
		this.closeModal();
	};

	Modal.prototype.trapFocus = function(event) {
		if( this.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of modal
			event.preventDefault();
			this.lastFocusable.focus();
		}
		if( this.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of modal
			event.preventDefault();
			this.firstFocusable.focus();
		}
	}

	Modal.prototype.getFocusableElements = function() {
		//get all focusable elements inside the modal
		var allFocusable = this.element.querySelectorAll(focusableElString);
		this.getFirstVisible(allFocusable);
		this.getLastVisible(allFocusable);
		this.getFirstFocusable();
	};

	Modal.prototype.getFirstVisible = function(elements) {
		//get first visible focusable element inside the modal
		for(var i = 0; i < elements.length; i++) {
			if( isVisible(elements[i]) ) {
				this.firstFocusable = elements[i];
				break;
			}
		}
	};

	Modal.prototype.getLastVisible = function(elements) {
		//get last visible focusable element inside the modal
		for(var i = elements.length - 1; i >= 0; i--) {
			if( isVisible(elements[i]) ) {
				this.lastFocusable = elements[i];
				break;
			}
		}
	};

	Modal.prototype.getFirstFocusable = function() {
		if(!this.modalFocus || !Element.prototype.matches) {
			this.moveFocusEl = this.firstFocusable;
			return;
		}
		var containerIsFocusable = this.modalFocus.matches(focusableElString);
		if(containerIsFocusable) {
			this.moveFocusEl = this.modalFocus;
		} else {
			this.moveFocusEl = false;
			var elements = this.modalFocus.querySelectorAll(focusableElString);
			for(var i = 0; i < elements.length; i++) {
				if( isVisible(elements[i]) ) {
					this.moveFocusEl = elements[i];
					break;
				}
			}
			if(!this.moveFocusEl) this.moveFocusEl = this.firstFocusable;
		}
	};

	Modal.prototype.emitModalEvents = function(eventName) {
		var event = new CustomEvent(eventName, {detail: this.selectedTrigger});
		this.element.dispatchEvent(event);
	};

	function isVisible(element) {
		return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
	};

	window.Modal = Modal;

	//initialize the Modal objects
	var modals = document.getElementsByClassName('js-modal');
	// generic focusable elements string selector
	var focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
	if( modals.length > 0 ) {
		var modalArrays = [];
		for( var i = 0; i < modals.length; i++) {
			(function(i){modalArrays.push(new Modal(modals[i]));})(i);
		}

		window.addEventListener('keydown', function(event){ //close modal window on esc
			if(event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape') {
				for( var i = 0; i < modalArrays.length; i++) {
					(function(i){modalArrays[i].closeModal();})(i);
				};
			}
		});
	}
}());
// utility functions
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

// File#: _1_sticky-hero
// Usage: codyhouse.co/license
(function() {
	var StickyBackground = function(element) {
		this.element = element;
		this.scrollingElement = this.element.getElementsByClassName('sticky-hero__content')[0];
		this.nextElement = this.element.nextElementSibling;
		this.scrollingTreshold = 0;
		this.nextTreshold = 0;
		initStickyEffect(this);
	};

	function initStickyEffect(element) {
		var observer = new IntersectionObserver(stickyCallback.bind(element), { threshold: [0, 0.1, 1] });
		observer.observe(element.scrollingElement);
		if(element.nextElement) observer.observe(element.nextElement);
	};

	function stickyCallback(entries, observer) {
		var threshold = entries[0].intersectionRatio.toFixed(1);
		(entries[0].target ==  this.scrollingElement)
			? this.scrollingTreshold = threshold
			: this.nextTreshold = threshold;

		Util.toggleClass(this.element, 'sticky-hero--media-is-fixed', (this.nextTreshold > 0 || this.scrollingTreshold > 0));
	};


	var stickyBackground = document.getElementsByClassName('js-sticky-hero'),
		intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
	if(stickyBackground.length > 0 && intersectionObserverSupported) { // if IntersectionObserver is not supported, animations won't be triggeres
		for(var i = 0; i < stickyBackground.length; i++) {
			(function(i){ // if animations are enabled -> init the StickyBackground object
        if( Util.hasClass(stickyBackground[i], 'sticky-hero--overlay-layer') || Util.hasClass(stickyBackground[i], 'sticky-hero--scale')) new StickyBackground(stickyBackground[i]);
      })(i);
		}
	}
}());
// utility functions
if(!Util) function Util () {};

Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;

  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;
        var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
      window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName('body')[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};


Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

// File#: _1_smooth-scrolling
// Usage: codyhouse.co/license
(function() {
	var SmoothScroll = function(element) {
		if(!('CSS' in window) || !CSS.supports('color', 'var(--color-var)')) return;
		this.element = element;
		this.scrollDuration = parseInt(this.element.getAttribute('data-duration')) || 300;
		this.dataElementY = this.element.getAttribute('data-scrollable-element-y') || this.element.getAttribute('data-scrollable-element') || this.element.getAttribute('data-element');
		this.scrollElementY = this.dataElementY ? document.querySelector(this.dataElementY) : window;
		this.dataElementX = this.element.getAttribute('data-scrollable-element-x');
		this.scrollElementX = this.dataElementY ? document.querySelector(this.dataElementX) : window;
		this.initScroll();
	};

	SmoothScroll.prototype.initScroll = function() {
		var self = this;

		//detect click on link
		this.element.addEventListener('click', function(event){
			event.preventDefault();
			var targetId = event.target.closest('.js-smooth-scroll').getAttribute('href').replace('#', ''),
				target = document.getElementById(targetId),
				targetTabIndex = target.getAttribute('tabindex'),
				windowScrollTop = self.scrollElementY.scrollTop || document.documentElement.scrollTop;

			// scroll vertically
			if(!self.dataElementY) windowScrollTop = window.scrollY || document.documentElement.scrollTop;

			var scrollElementY = self.dataElementY ? self.scrollElementY : false;

			var fixedHeight = self.getFixedElementHeight(); // check if there's a fixed element on the page
			Util.scrollTo(target.getBoundingClientRect().top + windowScrollTop - fixedHeight, self.scrollDuration, function() {
				// scroll horizontally
				self.scrollHorizontally(target, fixedHeight);
				//move the focus to the target element - don't break keyboard navigation
				Util.moveFocus(target);
				history.pushState(false, false, '#'+targetId);
				self.resetTarget(target, targetTabIndex);
			}, scrollElementY);
		});
	};

	SmoothScroll.prototype.scrollHorizontally = function(target, delta) {
    var scrollEl = this.dataElementX ? this.scrollElementX : false;
    var windowScrollLeft = this.scrollElementX ? this.scrollElementX.scrollLeft : document.documentElement.scrollLeft;
    var final = target.getBoundingClientRect().left + windowScrollLeft - delta,
      duration = this.scrollDuration;

    var element = scrollEl || window;
    var start = element.scrollLeft || document.documentElement.scrollLeft,
      currentTime = null;

    if(!scrollEl) start = window.scrollX || document.documentElement.scrollLeft;
		// return if there's no need to scroll
    if(Math.abs(start - final) < 5) return;
        
    var animateScroll = function(timestamp){
      if (!currentTime) currentTime = timestamp;        
      var progress = timestamp - currentTime;
      if(progress > duration) progress = duration;
      var val = Math.easeInOutQuad(progress, start, final-start, duration);
      element.scrollTo({
				left: val,
			});
      if(progress < duration) {
        window.requestAnimationFrame(animateScroll);
      }
    };

    window.requestAnimationFrame(animateScroll);
  };

	SmoothScroll.prototype.resetTarget = function(target, tabindex) {
		if( parseInt(target.getAttribute('tabindex')) < 0) {
			target.style.outline = 'none';
			!tabindex && target.removeAttribute('tabindex');
		}	
	};

	SmoothScroll.prototype.getFixedElementHeight = function() {
		var scrollElementY = this.dataElementY ? this.scrollElementY : document.documentElement;
    var fixedElementDelta = parseInt(getComputedStyle(scrollElementY).getPropertyValue('scroll-padding'));
		if(isNaN(fixedElementDelta) ) { // scroll-padding not supported
			fixedElementDelta = 0;
			var fixedElement = document.querySelector(this.element.getAttribute('data-fixed-element'));
			if(fixedElement) fixedElementDelta = parseInt(fixedElement.getBoundingClientRect().height);
		}
		return fixedElementDelta;
	};
	
	//initialize the Smooth Scroll objects
	var smoothScrollLinks = document.getElementsByClassName('js-smooth-scroll');
	if( smoothScrollLinks.length > 0 && !Util.cssSupports('scroll-behavior', 'smooth') && window.requestAnimationFrame) {
		// you need javascript only if css scroll-behavior is not supported
		for( var i = 0; i < smoothScrollLinks.length; i++) {
			(function(i){new SmoothScroll(smoothScrollLinks[i]);})(i);
		}
	}
}());
// File#: _1_accordion
// Usage: codyhouse.co/license
(function() {
	var Accordion = function(element) {
		this.element = element;
		this.items = getChildrenByClassName(this.element, 'js-accordion__item');
		this.version = this.element.getAttribute('data-version') ? '-'+this.element.getAttribute('data-version') : '';
		this.showClass = 'accordion'+this.version+'__item--is-open';
		this.animateHeight = (this.element.getAttribute('data-animation') == 'on');
		this.multiItems = !(this.element.getAttribute('data-multi-items') == 'off'); 
		// deep linking options
		this.deepLinkOn = this.element.getAttribute('data-deep-link') == 'on';
		// init accordion
		this.initAccordion();
	};

	Accordion.prototype.initAccordion = function() {
		//set initial aria attributes
		for( var i = 0; i < this.items.length; i++) {
			var button = this.items[i].getElementsByTagName('button')[0],
				content = this.items[i].getElementsByClassName('js-accordion__panel')[0],
				isOpen = this.items[i].classList.contains(this.showClass) ? 'true' : 'false';
			button.setAttribute('aria-expanded', isOpen);
			button.setAttribute('aria-controls', 'accordion-content-'+i);
			button.setAttribute('id', 'accordion-header-'+i);
			button.classList.add('js-accordion__trigger');
			content.setAttribute('aria-labelledby', 'accordion-header-'+i);
			content.setAttribute('id', 'accordion-content-'+i);
		}

		//listen for Accordion events
		this.initAccordionEvents();

		// check deep linking option
		this.initDeepLink();
	};

	Accordion.prototype.initAccordionEvents = function() {
		var self = this;

		this.element.addEventListener('click', function(event) {
			var trigger = event.target.closest('.js-accordion__trigger');
			//check index to make sure the click didn't happen inside a children accordion
			if( trigger && Array.prototype.indexOf.call(self.items, trigger.parentElement) >= 0) self.triggerAccordion(trigger);
		});
	};

	Accordion.prototype.triggerAccordion = function(trigger) {
		var bool = (trigger.getAttribute('aria-expanded') === 'true');

		this.animateAccordion(trigger, bool, false);

		if(!bool && this.deepLinkOn) {
			history.replaceState(null, '', '#'+trigger.getAttribute('aria-controls'));
		}
	};

	Accordion.prototype.animateAccordion = function(trigger, bool, deepLink) {
		var self = this;
		var item = trigger.closest('.js-accordion__item'),
			content = item.getElementsByClassName('js-accordion__panel')[0],
			ariaValue = bool ? 'false' : 'true';

		if(!bool) item.classList.add(this.showClass);
		trigger.setAttribute('aria-expanded', ariaValue);
		self.resetContentVisibility(item, content, bool);

		if( !this.multiItems && !bool || deepLink) this.closeSiblings(item);
	};

	Accordion.prototype.resetContentVisibility = function(item, content, bool) {
		item.classList.toggle(this.showClass, !bool);
		content.removeAttribute("style");
		if(bool && !this.multiItems) { // accordion item has been closed -> check if there's one open to move inside viewport 
			this.moveContent();
		}
	};

	Accordion.prototype.closeSiblings = function(item) {
		//if only one accordion can be open -> search if there's another one open
		var index = Array.prototype.indexOf.call(this.items, item);
		for( var i = 0; i < this.items.length; i++) {
			if(this.items[i].classList.contains(this.showClass) && i != index) {
				this.animateAccordion(this.items[i].getElementsByClassName('js-accordion__trigger')[0], true, false);
				return false;
			}
		}
	};

	Accordion.prototype.moveContent = function() { // make sure title of the accordion just opened is inside the viewport
		var openAccordion = this.element.getElementsByClassName(this.showClass);
		if(openAccordion.length == 0) return;
		var boundingRect = openAccordion[0].getBoundingClientRect();
		if(boundingRect.top < 0 || boundingRect.top > window.innerHeight) {
			var windowScrollTop = window.scrollY || document.documentElement.scrollTop;
			window.scrollTo(0, boundingRect.top + windowScrollTop);
		}
	};

	Accordion.prototype.initDeepLink = function() {
		if(!this.deepLinkOn) return;
		var hash = window.location.hash.substr(1);
		if(!hash || hash == '') return;
		var trigger = this.element.querySelector('.js-accordion__trigger[aria-controls="'+hash+'"]');
		if(trigger && trigger.getAttribute('aria-expanded') !== 'true') {
			this.animateAccordion(trigger, false, true);
			setTimeout(function(){trigger.scrollIntoView(true);});
		}
	};

	function getChildrenByClassName(el, className) {
		var children = el.children,
    childrenByClass = [];
		for (var i = 0; i < children.length; i++) {
			if (children[i].classList.contains(className)) childrenByClass.push(children[i]);
		}
		return childrenByClass;
	};

	window.Accordion = Accordion;
	
	//initialize the Accordion objects
	var accordions = document.getElementsByClassName('js-accordion');
	if( accordions.length > 0 ) {
		for( var i = 0; i < accordions.length; i++) {
			(function(i){new Accordion(accordions[i]);})(i);
		}
	}
}());
// File#: _1_google-maps
// Usage: codyhouse.co/license
function initGoogleMap() {
	var contactMap = document.getElementsByClassName('js-google-maps');
	if(contactMap.length > 0) {
		for(var i = 0; i < contactMap.length; i++) {
			initContactMap(contactMap[i]);
		}
	}
};

function initContactMap(wrapper) {
	var coordinate = wrapper.getAttribute('data-coordinates').split(',');
	var map = new google.maps.Map(wrapper, {zoom: 10, center: {lat: Number(coordinate[0]), lng:  Number(coordinate[1])}});
	var marker = new google.maps.Marker({position: {lat: Number(coordinate[0]), lng:  Number(coordinate[1])}, map: map});
};
// utility functions
if(!Util) function Util () {};

Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; 
};

// File#: _1_stacking-cards
// Usage: codyhouse.co/license
(function() {
  var StackCards = function(element) {
    this.element = element;
    this.items = this.element.getElementsByClassName('js-stack-cards__item');
    this.scrollingFn = false;
    this.scrolling = false;
    initStackCardsEffect(this); 
    initStackCardsResize(this); 
  };

  function initStackCardsEffect(element) { // use Intersection Observer to trigger animation
    setStackCards(element); // store cards CSS properties
		var observer = new IntersectionObserver(stackCardsCallback.bind(element), { threshold: [0, 1] });
		observer.observe(element.element);
  };

  function initStackCardsResize(element) { // detect resize to reset gallery
    element.element.addEventListener('resize-stack-cards', function(){
      setStackCards(element);
      animateStackCards.bind(element);
    });
  };
  
  function stackCardsCallback(entries) { // Intersection Observer callback
    if(entries[0].isIntersecting) {
      if(this.scrollingFn) return; // listener for scroll event already added
      stackCardsInitEvent(this);
    } else {
      if(!this.scrollingFn) return; // listener for scroll event already removed
      window.removeEventListener('scroll', this.scrollingFn);
      this.scrollingFn = false;
    }
  };
  
  function stackCardsInitEvent(element) {
    element.scrollingFn = stackCardsScrolling.bind(element);
    window.addEventListener('scroll', element.scrollingFn);
  };

  function stackCardsScrolling() {
    if(this.scrolling) return;
    this.scrolling = true;
    window.requestAnimationFrame(animateStackCards.bind(this));
  };

  function setStackCards(element) {
    // store wrapper properties
    element.marginY = getComputedStyle(element.element).getPropertyValue('--stack-cards-gap');
    getIntegerFromProperty(element); // convert element.marginY to integer (px value)
    element.elementHeight = element.element.offsetHeight;

    // store card properties
    var cardStyle = getComputedStyle(element.items[0]);
    element.cardTop = Math.floor(parseFloat(cardStyle.getPropertyValue('top')));
    element.cardHeight = Math.floor(parseFloat(cardStyle.getPropertyValue('height')));

    // store window property
    element.windowHeight = window.innerHeight;

    // reset margin + translate values
    if(isNaN(element.marginY)) {
      element.element.style.paddingBottom = '0px';
    } else {
      element.element.style.paddingBottom = (element.marginY*(element.items.length - 1))+'px';
    }

    for(var i = 0; i < element.items.length; i++) {
      if(isNaN(element.marginY)) {
        element.items[i].style.transform = 'none;';
      } else {
        element.items[i].style.transform = 'translateY('+element.marginY*i+'px)';
      }
    }
  };

  function getIntegerFromProperty(element) {
    var node = document.createElement('div');
    node.setAttribute('style', 'opacity:0; visbility: hidden;position: absolute; height:'+element.marginY);
    element.element.appendChild(node);
    element.marginY = parseInt(getComputedStyle(node).getPropertyValue('height'));
    element.element.removeChild(node);
  };

  function animateStackCards() {
    if(isNaN(this.marginY)) { // --stack-cards-gap not defined - do not trigger the effect
      this.scrolling = false;
      return; 
    }

    var top = this.element.getBoundingClientRect().top;

    if( this.cardTop - top + this.element.windowHeight - this.elementHeight - this.cardHeight + this.marginY + this.marginY*this.items.length > 0) { 
      this.scrolling = false;
      return;
    }

    for(var i = 0; i < this.items.length; i++) { // use only scale
      var scrolling = this.cardTop - top - i*(this.cardHeight+this.marginY);
      if(scrolling > 0) {  
        var scaling = i == this.items.length - 1 ? 1 : (this.cardHeight - scrolling*0.05)/this.cardHeight;
        this.items[i].style.transform = 'translateY('+this.marginY*i+'px) scale('+scaling+')';
      } else {
        this.items[i].style.transform = 'translateY('+this.marginY*i+'px)';
      }
    }

    this.scrolling = false;
  };

  // initialize StackCards object
  var stackCards = document.getElementsByClassName('js-stack-cards'),
    intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
    reducedMotion = Util.osHasReducedMotion();
    
	if(stackCards.length > 0 && intersectionObserverSupported && !reducedMotion) { 
    var stackCardsArray = [];
		for(var i = 0; i < stackCards.length; i++) {
			(function(i){
        stackCardsArray.push(new StackCards(stackCards[i]));
      })(i);
    }
    
    var resizingId = false,
      customEvent = new CustomEvent('resize-stack-cards');
    
    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 500);
    });

    function doneResizing() {
      for( var i = 0; i < stackCardsArray.length; i++) {
        (function(i){stackCardsArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
	}
}());
// utility functions
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < children.length; i++) {
    if (Util.hasClass(children[i], className)) childrenByClass.push(children[i]);
  }
  return childrenByClass;
};

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};


Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

Util.extend = function() {
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; 
};

// File#: _1_looping_tabs
// Usage: codyhouse.co/license
(function() { 
  var LoopTab = function(opts) {
    this.options = Util.extend(LoopTab.defaults , opts);
		this.element = this.options.element;
		this.tabList = this.element.getElementsByClassName('js-loop-tabs__controls')[0];
		this.listItems = this.tabList.getElementsByTagName('li');
		this.triggers = this.tabList.getElementsByTagName('a');
		this.panelsList = this.element.getElementsByClassName('js-loop-tabs__panels')[0];
    this.panels = Util.getChildrenByClassName(this.panelsList, 'js-loop-tabs__panel');
    this.assetsList = this.element.getElementsByClassName('js-loop-tabs__assets')[0];
		this.assets = this.assetsList.getElementsByTagName('li');
		this.videos = getVideoElements(this);
    this.panelShowClass = 'loop-tabs__panel--selected';
		this.assetShowClass = 'loop-tabs__asset--selected';
		this.assetExitClass = 'loop-tabs__asset--exit';
    this.controlActiveClass = 'loop-tabs__control--selected';
    // autoplay
    this.autoplayPaused = false;
		this.loopTabAutoId = false;
		this.loopFillAutoId = false;
		this.loopFill = 0;
		initLoopTab(this);
	};
	
	function getVideoElements(tab) {
		var videos = [];
		for(var i = 0; i < tab.assets.length; i++) {
			var video = tab.assets[i].getElementsByTagName('video');
			videos[i] = video.length > 0 ? video[0] : false;
		}
		return videos;
	};
  
  function initLoopTab(tab) {
    //set initial aria attributes
		tab.tabList.setAttribute('role', 'tablist');
		for( var i = 0; i < tab.triggers.length; i++) {
			var bool = Util.hasClass(tab.triggers[i], tab.controlActiveClass),
        panelId = tab.panels[i].getAttribute('id');
			tab.listItems[i].setAttribute('role', 'presentation');
			Util.setAttributes(tab.triggers[i], {'role': 'tab', 'aria-selected': bool, 'aria-controls': panelId, 'id': 'tab-'+panelId});
			Util.addClass(tab.triggers[i], 'js-loop-tabs__trigger'); 
      Util.setAttributes(tab.panels[i], {'role': 'tabpanel', 'aria-labelledby': 'tab-'+panelId});
      Util.toggleClass(tab.panels[i], tab.panelShowClass, bool);
			Util.toggleClass(tab.assets[i], tab.assetShowClass, bool);
			
			resetVideo(tab, i, bool); // play/pause video if available

			if(!bool) tab.triggers[i].setAttribute('tabindex', '-1'); 
		}
		// add autoplay-off class if needed
		!tab.options.autoplay && Util.addClass(tab.element, 'loop-tabs--autoplay-off');
		//listen for Tab events
		initLoopTabEvents(tab);
  };

  function initLoopTabEvents(tab) {
		if(tab.options.autoplay) { 
			initLoopTabAutoplay(tab); // init autoplay
			// pause autoplay if user is interacting with the tabs
			tab.element.addEventListener('focusin', function(event){
				pauseLoopTabAutoplay(tab);
				tab.autoplayPaused = true;
			});
			tab.element.addEventListener('focusout', function(event){
				tab.autoplayPaused = false;
				initLoopTabAutoplay(tab);
			});
		}

    //click on a new tab -> select content
		tab.tabList.addEventListener('click', function(event) {
			if( event.target.closest('.js-loop-tabs__trigger') ) triggerLoopTab(tab, event.target.closest('.js-loop-tabs__trigger'), event);
		});
		
    //arrow keys to navigate through tabs 
		tab.tabList.addEventListener('keydown', function(event) {
			if( !event.target.closest('.js-loop-tabs__trigger') ) return;
			if( event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright' ) {
				pauseLoopTabAutoplay(tab);
				selectNewLoopTab(tab, 'next', true);
			} else if( event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft' ) {
				pauseLoopTabAutoplay(tab);
				selectNewLoopTab(tab, 'prev', true);
			}
		});
  };

  function initLoopTabAutoplay(tab) {
		if(!tab.options.autoplay || tab.autoplayPaused) return;
		tab.loopFill = 0;
		var selectedTab = tab.tabList.getElementsByClassName(tab.controlActiveClass)[0];
		// reset css variables
		for(var i = 0; i < tab.triggers.length; i++) {
			if(cssVariableSupport) tab.triggers[i].style.setProperty('--loop-tabs-filling', 0);
		}
		
		tab.loopTabAutoId = setTimeout(function(){
      selectNewLoopTab(tab, 'next', false);
		}, tab.options.autoplayInterval);
		
		if(cssVariableSupport) { // tab fill effect
			tab.loopFillAutoId = setInterval(function(){
				tab.loopFill = tab.loopFill + 0.005;
				selectedTab.style.setProperty('--loop-tabs-filling', tab.loopFill);
			}, tab.options.autoplayInterval/200);
		}
  };

  function pauseLoopTabAutoplay(tab) { // pause autoplay
    if(tab.loopTabAutoId) {
			clearTimeout(tab.loopTabAutoId);
			tab.loopTabAutoId = false;
			clearInterval(tab.loopFillAutoId);
			tab.loopFillAutoId = false;
			// make sure the filling line is scaled up
			var selectedTab = tab.tabList.getElementsByClassName(tab.controlActiveClass);
			if(selectedTab.length > 0) selectedTab[0].style.setProperty('--loop-tabs-filling', 1);
		}
  };

  function selectNewLoopTab(tab, direction, bool) {
    var selectedTab = tab.tabList.getElementsByClassName(tab.controlActiveClass)[0],
			index = Util.getIndexInArray(tab.triggers, selectedTab);
		index = (direction == 'next') ? index + 1 : index - 1;
		//make sure index is in the correct interval 
		//-> from last element go to first using the right arrow, from first element go to last using the left arrow
		if(index < 0) index = tab.listItems.length - 1;
		if(index >= tab.listItems.length) index = 0;	
		triggerLoopTab(tab, tab.triggers[index]);
		bool && tab.triggers[index].focus();
  };

  function triggerLoopTab(tab, tabTrigger, event) {
		pauseLoopTabAutoplay(tab);
		event && event.preventDefault();	
		var index = Util.getIndexInArray(tab.triggers, tabTrigger);
		//no need to do anything if tab was already selected
		if(Util.hasClass(tab.triggers[index], tab.controlActiveClass)) return;
		
		for( var i = 0; i < tab.triggers.length; i++) {
			var bool = (i == index),
				exit = Util.hasClass(tab.triggers[i], tab.controlActiveClass);
			Util.toggleClass(tab.triggers[i], tab.controlActiveClass, bool);
      Util.toggleClass(tab.panels[i], tab.panelShowClass, bool);
			Util.toggleClass(tab.assets[i], tab.assetShowClass, bool);
			Util.toggleClass(tab.assets[i], tab.assetExitClass, exit);
			tab.triggers[i].setAttribute('aria-selected', bool);
			bool ? tab.triggers[i].setAttribute('tabindex', '0') : tab.triggers[i].setAttribute('tabindex', '-1');

			resetVideo(tab, i, bool); // play/pause video if available

			// listen for the end of animation on asset element and remove exit class
			if(exit) {(function(i){
				tab.assets[i].addEventListener('transitionend', function cb(event){
					tab.assets[i].removeEventListener('transitionend', cb);
					Util.removeClass(tab.assets[i], tab.assetExitClass);
				});
			})(i);}
		}
    
    // restart tab autoplay
    initLoopTabAutoplay(tab);
	};

	function resetVideo(tab, i, bool) {
		if(tab.videos[i]) {
			if(bool) {
				tab.videos[i].play();
			} else {
				tab.videos[i].pause();
				tab.videos[i].currentTime = 0;
			} 
		}
	};

  LoopTab.defaults = {
    element : '',
    autoplay : true,
    autoplayInterval: 5000
  };

  //initialize the Tab objects
	var loopTabs = document.getElementsByClassName('js-loop-tabs');
	if( loopTabs.length > 0 ) {
		var reducedMotion = Util.osHasReducedMotion(),
			cssVariableSupport = ('CSS' in window) && Util.cssSupports('color', 'var(--var)');
		for( var i = 0; i < loopTabs.length; i++) {
			(function(i){
        var autoplay = (loopTabs[i].getAttribute('data-autoplay') && loopTabs[i].getAttribute('data-autoplay') == 'off' || reducedMotion) ? false : true,
        autoplayInterval = (loopTabs[i].getAttribute('data-autoplay-interval')) ? loopTabs[i].getAttribute('data-autoplay-interval') : 5000;
        new LoopTab({element: loopTabs[i], autoplay : autoplay, autoplayInterval : autoplayInterval});
      })(i);
		}
	}
}());
// utility functions
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

// File#: _1_sub-navigation
// Usage: codyhouse.co/license
(function() {
  var SideNav = function(element) {
    this.element = element;
    this.control = this.element.getElementsByClassName('js-subnav__control');
    this.navList = this.element.getElementsByClassName('js-subnav__wrapper');
    this.closeBtn = this.element.getElementsByClassName('js-subnav__close-btn');
    this.firstFocusable = getFirstFocusable(this);
    this.showClass = 'subnav__wrapper--is-visible';
    this.collapsedLayoutClass = 'subnav--collapsed';
    initSideNav(this);
  };

  function getFirstFocusable(sidenav) { // get first focusable element inside the subnav
    if(sidenav.navList.length == 0) return;
    var focusableEle = sidenav.navList[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
				firstFocusable = false;
    for(var i = 0; i < focusableEle.length; i++) {
      if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
        firstFocusable = focusableEle[i];
        break;
      }
    }

    return firstFocusable;
  };

  function initSideNav(sidenav) {
    checkSideNavLayout(sidenav); // switch from --compressed to --expanded layout
    initSideNavToggle(sidenav); // mobile behavior + layout update on resize
  };

  function initSideNavToggle(sidenav) { 
    // custom event emitted when window is resized
    sidenav.element.addEventListener('update-sidenav', function(event){
      checkSideNavLayout(sidenav);
    });

    // mobile only
    if(sidenav.control.length == 0 || sidenav.navList.length == 0) return;
    sidenav.control[0].addEventListener('click', function(event){ // open sidenav
      openSideNav(sidenav, event);
    });
    sidenav.element.addEventListener('click', function(event) { // close sidenav when clicking on close button/bg layer
      if(event.target.closest('.js-subnav__close-btn') || Util.hasClass(event.target, 'js-subnav__wrapper')) {
        closeSideNav(sidenav, event);
      }
    });
  };

  function openSideNav(sidenav, event) { // open side nav - mobile only
    event.preventDefault();
    sidenav.selectedTrigger = event.target;
    event.target.setAttribute('aria-expanded', 'true');
    Util.addClass(sidenav.navList[0], sidenav.showClass);
    sidenav.navList[0].addEventListener('transitionend', function cb(event){
      sidenav.navList[0].removeEventListener('transitionend', cb);
      sidenav.firstFocusable.focus();
    });
  };

  function closeSideNav(sidenav, event, bool) { // close side sidenav - mobile only
    if( !Util.hasClass(sidenav.navList[0], sidenav.showClass) ) return;
    if(event) event.preventDefault();
    Util.removeClass(sidenav.navList[0], sidenav.showClass);
    if(!sidenav.selectedTrigger) return;
    sidenav.selectedTrigger.setAttribute('aria-expanded', 'false');
    if(!bool) sidenav.selectedTrigger.focus();
    sidenav.selectedTrigger = false; 
  };

  function checkSideNavLayout(sidenav) { // switch from --compressed to --expanded layout
    var layout = getComputedStyle(sidenav.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
    if(layout != 'expanded' && layout != 'collapsed') return;
    Util.toggleClass(sidenav.element, sidenav.collapsedLayoutClass, layout != 'expanded');
  };
  
  var sideNav = document.getElementsByClassName('js-subnav'),
    SideNavArray = [],
    j = 0;
  if( sideNav.length > 0) {
    for(var i = 0; i < sideNav.length; i++) {
      var beforeContent = getComputedStyle(sideNav[i], ':before').getPropertyValue('content');
      if(beforeContent && beforeContent !='' && beforeContent !='none') {
        j = j + 1;
      }
      (function(i){SideNavArray.push(new SideNav(sideNav[i]));})(i);
    }

    if(j > 0) { // on resize - update sidenav layout
      var resizingId = false,
        customEvent = new CustomEvent('update-sidenav');
      window.addEventListener('resize', function(event){
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 300);
      });

      function doneResizing() {
        for( var i = 0; i < SideNavArray.length; i++) {
          (function(i){SideNavArray[i].element.dispatchEvent(customEvent)})(i);
        };
      };

      (window.requestAnimationFrame) // init table layout
        ? window.requestAnimationFrame(doneResizing)
        : doneResizing();
    }

    // listen for key events
		window.addEventListener('keyup', function(event){
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {// listen for esc key - close navigation on mobile if open
				for(var i = 0; i < SideNavArray.length; i++) {
          (function(i){closeSideNav(SideNavArray[i], event);})(i);
        };
			}
      if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) { // listen for tab key - close navigation on mobile if open when nav loses focus
        if( document.activeElement.closest('.js-subnav__wrapper')) return;
        for(var i = 0; i < SideNavArray.length; i++) {
          (function(i){closeSideNav(SideNavArray[i], event, true);})(i);
        };
			}
		});
  }
}());
// File#: _1_custom-select
// Usage: codyhouse.co/license
(function() {
  // NOTE: you need the js code when using the --custom-dropdown/--minimal variation of the Custom Select component. Default version does nor require JS.
  
  var CustomSelect = function(element) {
    this.element = element;
    this.select = this.element.getElementsByTagName('select')[0];
    this.optGroups = this.select.getElementsByTagName('optgroup');
    this.options = this.select.getElementsByTagName('option');
    this.selectedOption = getSelectedOptionText(this);
    this.selectId = this.select.getAttribute('id');
    this.trigger = false;
    this.dropdown = false;
    this.customOptions = false;
    this.arrowIcon = this.element.getElementsByTagName('svg');
    this.label = document.querySelector('[for="'+this.selectId+'"]');
    this.labelContent = '';
    if(this.label) this.labelContent = ', '+this.label.textContent;

    this.optionIndex = 0; // used while building the custom dropdown

    initCustomSelect(this); // init markup
    initCustomSelectEvents(this); // init event listeners
  };
  
  function initCustomSelect(select) {
    // create the HTML for the custom dropdown element
    select.element.insertAdjacentHTML('beforeend', initButtonSelect(select) + initListSelect(select));
    
    // save custom elements
    select.dropdown = select.element.getElementsByClassName('js-select__dropdown')[0];
    select.trigger = select.element.getElementsByClassName('js-select__button')[0];
    select.customOptions = select.dropdown.getElementsByClassName('js-select__item');
    
    // hide default select
    select.select.classList.add('ca8-hide');
    if(select.arrowIcon.length > 0 ) select.arrowIcon[0].style.display = 'none';

    // store drowdown min width
    select.minWidth = parseInt(getComputedStyle(select.dropdown).getPropertyValue('min-width'));

    // place dropdown
    placeDropdown(select);
  };

  function initCustomSelectEvents(select) {
    // option selection in dropdown
    initSelection(select);

    // click events
    select.trigger.addEventListener('click', function(){
      toggleCustomSelect(select, false);
    });
    if(select.label) {
      // move focus to custom trigger when clicking on <select> label
      select.label.addEventListener('click', function(){
        moveFocus(select.trigger);
      });
    }
    // keyboard navigation
    select.dropdown.addEventListener('keydown', function(event){
      if(event.keyCode && event.keyCode == 38 || event.key && event.key.toLowerCase() == 'arrowup') {
        keyboardCustomSelect(select, 'prev', event);
      } else if(event.keyCode && event.keyCode == 40 || event.key && event.key.toLowerCase() == 'arrowdown') {
        keyboardCustomSelect(select, 'next', event);
      }
    });
    // native <select> element has been updated -> update custom select as well
    select.element.addEventListener('select-updated', function(event){
      resetCustomSelect(select);
    });
  };

  function toggleCustomSelect(select, bool) {
    var ariaExpanded;
    if(bool) {
      ariaExpanded = bool;
    } else {
      ariaExpanded = select.trigger.getAttribute('aria-expanded') == 'true' ? 'false' : 'true';
    }
    select.trigger.setAttribute('aria-expanded', ariaExpanded);
    if(ariaExpanded == 'true') {
      var selectedOption = getSelectedOption(select);
      moveFocus(selectedOption); // fallback if transition is not supported
      select.dropdown.addEventListener('transitionend', function cb(){
        moveFocus(selectedOption);
        select.dropdown.removeEventListener('transitionend', cb);
      });
      placeDropdown(select); // place dropdown based on available space
    }
  };

  function placeDropdown(select) {
    // remove placement classes to reset position
    select.dropdown.classList.remove('select__dropdown--right', 'select__dropdown--up');
    var triggerBoundingRect = select.trigger.getBoundingClientRect();
    select.dropdown.classList.toggle('select__dropdown--right', (document.documentElement.clientWidth - 5 < triggerBoundingRect.left + select.dropdown.offsetWidth));
    // check if there's enough space up or down
    var moveUp = (window.innerHeight - triggerBoundingRect.bottom - 5) < triggerBoundingRect.top;
    select.dropdown.classList.toggle('select__dropdown--up', moveUp);
    // set max-height based on available space
    var maxHeight = moveUp ? triggerBoundingRect.top - 20 : window.innerHeight - triggerBoundingRect.bottom - 20;
    if(select.minWidth < triggerBoundingRect.width) { // check if we need to set a min-width
      select.dropdown.setAttribute('style', 'max-height: '+maxHeight+'px; min-width: '+triggerBoundingRect.width+'px;');
    } else {
      select.dropdown.setAttribute('style', 'max-height: '+maxHeight+'px;');
    }
  };

  function keyboardCustomSelect(select, direction, event) { // navigate custom dropdown with keyboard
    event.preventDefault();
    var index = Array.prototype.indexOf.call(select.customOptions, document.activeElement);
    index = (direction == 'next') ? index + 1 : index - 1;
    if(index < 0) index = select.customOptions.length - 1;
    if(index >= select.customOptions.length) index = 0;
    moveFocus(select.customOptions[index]);
  };

  function initSelection(select) { // option selection
    select.dropdown.addEventListener('click', function(event){
      var option = event.target.closest('.js-select__item');
      if(!option) return;
      selectOption(select, option);
    });
  };
  
  function selectOption(select, option) {
    if(option.hasAttribute('aria-selected') && option.getAttribute('aria-selected') == 'true') {
      // selecting the same option
      select.trigger.setAttribute('aria-expanded', 'false'); // hide dropdown
    } else { 
      var selectedOption = select.dropdown.querySelector('[aria-selected="true"]');
      if(selectedOption) selectedOption.setAttribute('aria-selected', 'false');
      option.setAttribute('aria-selected', 'true');
      select.trigger.getElementsByClassName('js-select__label')[0].textContent = option.textContent;
      select.trigger.setAttribute('aria-expanded', 'false');
      // new option has been selected -> update native <select> element _ arai-label of trigger <button>
      updateNativeSelect(select, option.getAttribute('data-index'));
      updateTriggerAria(select); 
    }
    // move focus back to trigger
    select.trigger.focus();
  };

  function updateNativeSelect(select, index) {
    select.select.selectedIndex = index;
    select.select.dispatchEvent(new CustomEvent('change', {bubbles: true})); // trigger change event
    select.select.dispatchEvent(new CustomEvent('input', {bubbles: true})); // trigger input event
  };

  function updateTriggerAria(select) {
    select.trigger.setAttribute('aria-label', select.options[select.select.selectedIndex].innerHTML+select.labelContent);
  };

  function getSelectedOptionText(select) {// used to initialize the label of the custom select button
    var label = '';
    if('selectedIndex' in select.select) {
      label = select.options[select.select.selectedIndex].text;
    } else {
      label = select.select.querySelector('option[selected]').text;
    }
    return label;

  };
  
  function initButtonSelect(select) { // create the button element -> custom select trigger
    // check if we need to add custom classes to the button trigger
    var customClasses = select.element.getAttribute('data-trigger-class') ? ' '+select.element.getAttribute('data-trigger-class') : '';

    var label = select.options[select.select.selectedIndex].innerHTML+select.labelContent;
  
    var button = '<button type="button" class="js-select__button select__button'+customClasses+'" aria-label="'+label+'" aria-expanded="false" aria-controls="'+select.selectId+'-dropdown"><span aria-hidden="true" class="js-select__label select__label">'+select.selectedOption+'</span>';
    if(select.arrowIcon.length > 0 && select.arrowIcon[0].outerHTML) {
      var clone = select.arrowIcon[0].cloneNode(true);
      clone.classList.remove('select__icon');
      button = button +clone.outerHTML;
    }
    
    return button+'</button>';

  };

  function initListSelect(select) { // create custom select dropdown
    var list = '<div class="js-select__dropdown select__dropdown" aria-describedby="'+select.selectId+'-description" id="'+select.selectId+'-dropdown">';
    list = list + getSelectLabelSR(select);
    if(select.optGroups.length > 0) {
      for(var i = 0; i < select.optGroups.length; i++) {
        var optGroupList = select.optGroups[i].getElementsByTagName('option'),
          optGroupLabel = '<li><span class="select__item select__item--optgroup">'+select.optGroups[i].getAttribute('label')+'</span></li>';
        list = list + '<ul class="select__list" role="listbox">'+optGroupLabel+getOptionsList(select, optGroupList) + '</ul>';
      }
    } else {
      list = list + '<ul class="select__list" role="listbox">'+getOptionsList(select, select.options) + '</ul>';
    }
    return list;
  };

  function getSelectLabelSR(select) {
    if(select.label) {
      return '<p class="ca8-sr-only" id="'+select.selectId+'-description">'+select.label.textContent+'</p>'
    } else {
      return '';
    }
  };
  
  function resetCustomSelect(select) {
    // <select> element has been updated (using an external control) - update custom select
    var selectedOption = select.dropdown.querySelector('[aria-selected="true"]');
    if(selectedOption) selectedOption.setAttribute('aria-selected', 'false');
    var option = select.dropdown.querySelector('.js-select__item[data-index="'+select.select.selectedIndex+'"]');
    option.setAttribute('aria-selected', 'true');
    select.trigger.getElementsByClassName('js-select__label')[0].textContent = option.textContent;
    select.trigger.setAttribute('aria-expanded', 'false');
    updateTriggerAria(select); 
  };

  function getOptionsList(select, options) {
    var list = '';
    for(var i = 0; i < options.length; i++) {
      var selected = options[i].hasAttribute('selected') ? ' aria-selected="true"' : ' aria-selected="false"',
        disabled = options[i].hasAttribute('disabled') ? ' disabled' : '';
      list = list + '<li><button type="button" class="js-select__item select__item select__item--option" role="option" data-value="'+options[i].value+'" '+selected+disabled+' data-index="'+select.optionIndex+'">'+options[i].text+'</button></li>';
      select.optionIndex = select.optionIndex + 1;
    };
    return list;
  };

  function getSelectedOption(select) {
    var option = select.dropdown.querySelector('[aria-selected="true"]');
    if(option) return option;
    else return select.dropdown.getElementsByClassName('js-select__item')[0];
  };

  function moveFocusToSelectTrigger(select) {
    if(!document.activeElement.closest('.js-select')) return
    select.trigger.focus();
  };
  
  function checkCustomSelectClick(select, target) { // close select when clicking outside it
    if( !select.element.contains(target) ) toggleCustomSelect(select, 'false');
  };

  function moveFocus(element) {
    element.focus();
    if (document.activeElement !== element) {
      element.setAttribute('tabindex','-1');
      element.focus();
    }
  };
  
  //initialize the CustomSelect objects
  var customSelect = document.getElementsByClassName('js-select');
  if( customSelect.length > 0 ) {
    var selectArray = [];
    for( var i = 0; i < customSelect.length; i++) {
      (function(i){selectArray.push(new CustomSelect(customSelect[i]));})(i);
    }

    // listen for key events
    window.addEventListener('keyup', function(event){
      if( event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' ) {
        // close custom select on 'Esc'
        selectArray.forEach(function(element){
          moveFocusToSelectTrigger(element); // if focus is within dropdown, move it to dropdown trigger
          toggleCustomSelect(element, 'false'); // close dropdown
        });
      } 
    });
    // close custom select when clicking outside it
    window.addEventListener('click', function(event){
      selectArray.forEach(function(element){
        checkCustomSelectClick(element, event.target);
      });
    });
  }
}());
// File#: _1_cross-table
// Usage: codyhouse.co/license
(function() {
  var CrossTables = function(element) {
    this.element = element;
    this.header = this.element.getElementsByClassName('js-cross-table__header')[0];
    this.body = this.element.getElementsByClassName('js-cross-table__body')[0];
    this.headerItems = this.header.getElementsByClassName('cross-table__cell');
    this.rows = this.body.getElementsByClassName('cross-table__row');
    this.rowSections = this.element.getElementsByClassName('js-cross-table__row--w-full');
    this.singleLayoutClass = 'cross-table--cards';
    // resize 
    this.resizingId = false;
    initCrossTable(this);
  };

  function initCrossTable(table) {
    setTableRoles(table); // set proper roles
    addTableContent(table); // create additional table content
    setTableLayout(table); // optimize layout for mobile
    resizeTable(table); // reset table layout on resize
  };

  function setTableRoles(table) {
    // table
    table.element.setAttribute('role', 'table');
    // body and header
    table.header.setAttribute('role', 'rowgroup');
    table.body.setAttribute('role', 'rowgroup');
    // tr, th, td
    var trElements = table.element.getElementsByTagName('tr');
    for(var i=0; i < trElements.length; i++) {
      trElements[i].setAttribute('role', 'row');
    }
    var thElements = table.element.getElementsByTagName('th');
    for(var i=0; i < thElements.length; i++) {
      thElements[i].setAttribute('role', 'rowheader');
    }
    var tdElements = table.element.getElementsByTagName('td');
    for(var i=0; i < tdElements.length; i++) {
      tdElements[i].setAttribute('role', 'cell');
    }
  };

  function addTableContent(table) {
    // store header labels
    var headerLables = [];
    for(var i = 0; i < table.headerItems.length; i++) {
      var headerLabelEl = table.headerItems[i].getElementsByClassName('js-cross-table__label'),
        headerLabel = (headerLabelEl.length > 0 ) ? headerLabelEl[0].innerHTML : table.headerItems[i].innerHTML;
      headerLables.push(headerLabel);
    }
    // insert label inside each cell - visible in cards layout only
    for(var i = 0; i < table.rows.length; i++) {
      if( !table.rows[i].classList.contains('js-cross-table__row--w-full') ) {
        var cells = table.rows[i].children;
        for(var j = 1; j < headerLables.length; j++) {
          if(cells[j]) {
            cells[j].innerHTML = '<span aria-hidden="true" class="cross-table__label">'+headerLables[j]+':</span> <span>'+cells[j].innerHTML+'</span>';
          }
        }
      }
    }
  };

  function setTableLayout(table) {
    // reset style for mobile layout
    for(var i = 0; i < table.rowSections.length; i++) {
      table.rowSections[i].setAttribute('style', 'left:'+table.rowSections[i].nextElementSibling.offsetLeft+'px');
    }
  };

  function resizeTable(table) {
    window.addEventListener('resize', function(event){
      clearTimeout(table.resizingId);
      table.resizingId = setTimeout(function() {
        setTableLayout(table);
      }, 300);
    });
  };

  var crossTables = document.getElementsByClassName('js-cross-table');
  if( crossTables.length > 0 ) {
    for( var i = 0; i < crossTables.length; i++) {
      new CrossTables(crossTables[i]);
    }
  }
}());
// File#: _1_back-to-top
// Usage: codyhouse.co/license
(function() {
  var backTop = document.getElementsByClassName('js-back-to-top')[0];
  if( backTop ) {
    var dataElement = backTop.getAttribute('data-element');
    var scrollElement = dataElement ? document.querySelector(dataElement) : window;
    var scrollOffsetInit = parseInt(backTop.getAttribute('data-offset-in')) || parseInt(backTop.getAttribute('data-offset')) || 0, //show back-to-top if scrolling > scrollOffset
      scrollOffsetOutInit = parseInt(backTop.getAttribute('data-offset-out')) || 0, 
      scrollOffset = 0,
      scrollOffsetOut = 0,
      scrolling = false;

    // check if target-in/target-out have been set
    var targetIn = backTop.getAttribute('data-target-in') ? document.querySelector(backTop.getAttribute('data-target-in')) : false,
      targetOut = backTop.getAttribute('data-target-out') ? document.querySelector(backTop.getAttribute('data-target-out')) : false;

    updateOffsets();
    
    //detect click on back-to-top link
    backTop.addEventListener('click', function(event) {
      event.preventDefault();
      if(!window.requestAnimationFrame) {
        scrollElement.scrollTo(0, 0);
      } else {
        dataElement ? scrollElement.scrollTo({top: 0, behavior: 'smooth'}) : window.scrollTo({top: 0, behavior: 'smooth'});
      } 
      //move the focus to the #top-element - don't break keyboard navigation
      moveFocus(document.getElementById(backTop.getAttribute('href').replace('#', '')));
    });
    
    //listen to the window scroll and update back-to-top visibility
    checkBackToTop();
    if (scrollOffset > 0 || scrollOffsetOut > 0) {
      scrollElement.addEventListener("scroll", function(event) {
        if( !scrolling ) {
          scrolling = true;
          (!window.requestAnimationFrame) ? setTimeout(function(){checkBackToTop();}, 250) : window.requestAnimationFrame(checkBackToTop);
        }
      });
    }

    function checkBackToTop() {
      updateOffsets();
      var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
      if(!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
      var condition =  windowTop >= scrollOffset;
      if(scrollOffsetOut > 0) {
        condition = (windowTop >= scrollOffset) && (window.innerHeight + windowTop < scrollOffsetOut);
      }
      backTop.classList.toggle('back-to-top--is-visible', condition);
      scrolling = false;
    }

    function updateOffsets() {
      scrollOffset = getOffset(targetIn, scrollOffsetInit, true);
      scrollOffsetOut = getOffset(targetOut, scrollOffsetOutInit);
    }

    function getOffset(target, startOffset, bool) {
      var offset = 0;
      if(target) {
        var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
        if(!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
        var boundingClientRect = target.getBoundingClientRect();
        offset = bool ? boundingClientRect.bottom : boundingClientRect.top;
        offset = offset + windowTop;
      }
      if(startOffset && startOffset) {
        offset = offset + parseInt(startOffset);
      }
      return offset;
    }

    function moveFocus(element) {
      if( !element ) element = document.getElementsByTagName("body")[0];
      element.focus();
      if (document.activeElement !== element) {
        element.setAttribute('tabindex','-1');
        element.focus();
      }
    };
  }
}());
// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

// File#: _1_tooltip
// Usage: codyhouse.co/license
(function() {
	var Tooltip = function(element) {
		this.element = element;
		this.tooltip = false;
		this.tooltipIntervalId = false;
		this.tooltipContent = this.element.getAttribute('title');
		this.tooltipPosition = (this.element.getAttribute('data-tooltip-position')) ? this.element.getAttribute('data-tooltip-position') : 'top';
		this.tooltipClasses = (this.element.getAttribute('data-tooltip-class')) ? this.element.getAttribute('data-tooltip-class') : false;
		this.tooltipId = 'js-tooltip-element'; // id of the tooltip element -> trigger will have the same aria-describedby attr
		// there are cases where you only need the aria-label -> SR do not need to read the tooltip content (e.g., footnotes)
		this.tooltipDescription = (this.element.getAttribute('data-tooltip-describedby') && this.element.getAttribute('data-tooltip-describedby') == 'false') ? false : true; 

		this.tooltipDelay = this.element.getAttribute('data-tooltip-delay'); // show tooltip after a delay (in ms)
		if(!this.tooltipDelay) this.tooltipDelay = 300;
		this.tooltipDelta = parseInt(this.element.getAttribute('data-tooltip-gap')); // distance beetwen tooltip and trigger element (in px)
		if(isNaN(this.tooltipDelta)) this.tooltipDelta = 10;
		this.tooltipTriggerHover = false;
		// tooltp sticky option
		this.tooltipSticky = (this.tooltipClasses && this.tooltipClasses.indexOf('tooltip--sticky') > -1);
		this.tooltipHover = false;
		if(this.tooltipSticky) {
			this.tooltipHoverInterval = false;
		}
		// tooltip triangle - css variable to control its position
		this.tooltipTriangleVar = '--tooltip-triangle-translate';
		resetTooltipContent(this);
		initTooltip(this);
	};

	function resetTooltipContent(tooltip) {
		var htmlContent = tooltip.element.getAttribute('data-tooltip-title');
		if(htmlContent) {
			tooltip.tooltipContent = htmlContent;
		}
	};

	function initTooltip(tooltipObj) {
		// reset trigger element
		tooltipObj.element.removeAttribute('title');
		tooltipObj.element.setAttribute('tabindex', '0');
		// add event listeners
		tooltipObj.element.addEventListener('mouseenter', handleEvent.bind(tooltipObj));
		tooltipObj.element.addEventListener('focus', handleEvent.bind(tooltipObj));
	};

	function removeTooltipEvents(tooltipObj) {
		// remove event listeners
		tooltipObj.element.removeEventListener('mouseleave',  handleEvent.bind(tooltipObj));
		tooltipObj.element.removeEventListener('blur',  handleEvent.bind(tooltipObj));
	};

	function handleEvent(event) {
		// handle events
		switch(event.type) {
			case 'mouseenter':
			case 'focus':
				showTooltip(this, event);
				break;
			case 'mouseleave':
			case 'blur':
				checkTooltip(this);
				break;
			case 'newContent':
				changeTooltipContent(this, event);
				break;
		}
	};

	function showTooltip(tooltipObj, event) {
		// tooltip has already been triggered
		if(tooltipObj.tooltipIntervalId) return;
		tooltipObj.tooltipTriggerHover = true;
		// listen to close events
		tooltipObj.element.addEventListener('mouseleave', handleEvent.bind(tooltipObj));
		tooltipObj.element.addEventListener('blur', handleEvent.bind(tooltipObj));
		// custom event to reset tooltip content
		tooltipObj.element.addEventListener('newContent', handleEvent.bind(tooltipObj));

		// show tooltip with a delay
		tooltipObj.tooltipIntervalId = setTimeout(function(){
			createTooltip(tooltipObj);
		}, tooltipObj.tooltipDelay);
	};

	function createTooltip(tooltipObj) {
		tooltipObj.tooltip = document.getElementById(tooltipObj.tooltipId);
		
		if( !tooltipObj.tooltip ) { // tooltip element does not yet exist
			tooltipObj.tooltip = document.createElement('div');
			document.body.appendChild(tooltipObj.tooltip);
		} 

		// remove data-reset attribute that is used when updating tooltip content (newContent custom event)
		tooltipObj.tooltip.removeAttribute('data-reset');
		
		// reset tooltip content/position
		Util.setAttributes(tooltipObj.tooltip, {'id': tooltipObj.tooltipId, 'class': 'tooltip tooltip--is-hidden js-tooltip', 'role': 'tooltip'});
		tooltipObj.tooltip.innerHTML = tooltipObj.tooltipContent;
		if(tooltipObj.tooltipDescription) tooltipObj.element.setAttribute('aria-describedby', tooltipObj.tooltipId);
		if(tooltipObj.tooltipClasses) Util.addClass(tooltipObj.tooltip, tooltipObj.tooltipClasses);
		if(tooltipObj.tooltipSticky) Util.addClass(tooltipObj.tooltip, 'tooltip--sticky');
		placeTooltip(tooltipObj);
		Util.removeClass(tooltipObj.tooltip, 'tooltip--is-hidden');

		// if tooltip is sticky, listen to mouse events
		if(!tooltipObj.tooltipSticky) return;
		tooltipObj.tooltip.addEventListener('mouseenter', function cb(){
			tooltipObj.tooltipHover = true;
			if(tooltipObj.tooltipHoverInterval) {
				clearInterval(tooltipObj.tooltipHoverInterval);
				tooltipObj.tooltipHoverInterval = false;
			}
			tooltipObj.tooltip.removeEventListener('mouseenter', cb);
			tooltipLeaveEvent(tooltipObj);
		});
	};

	function tooltipLeaveEvent(tooltipObj) {
		tooltipObj.tooltip.addEventListener('mouseleave', function cb(){
			tooltipObj.tooltipHover = false;
			tooltipObj.tooltip.removeEventListener('mouseleave', cb);
			hideTooltip(tooltipObj);
		});
	};

	function placeTooltip(tooltipObj) {
		// set top and left position of the tooltip according to the data-tooltip-position attr of the trigger
		var dimention = [tooltipObj.tooltip.offsetHeight, tooltipObj.tooltip.offsetWidth],
			positionTrigger = tooltipObj.element.getBoundingClientRect(),
			position = [],
			scrollY = window.scrollY || window.pageYOffset;
		
		position['top'] = [ (positionTrigger.top - dimention[0] - tooltipObj.tooltipDelta + scrollY), (positionTrigger.right/2 + positionTrigger.left/2 - dimention[1]/2)];
		position['bottom'] = [ (positionTrigger.bottom + tooltipObj.tooltipDelta + scrollY), (positionTrigger.right/2 + positionTrigger.left/2 - dimention[1]/2)];
		position['left'] = [(positionTrigger.top/2 + positionTrigger.bottom/2 - dimention[0]/2 + scrollY), positionTrigger.left - dimention[1] - tooltipObj.tooltipDelta];
		position['right'] = [(positionTrigger.top/2 + positionTrigger.bottom/2 - dimention[0]/2 + scrollY), positionTrigger.right + tooltipObj.tooltipDelta];
		
		var direction = tooltipObj.tooltipPosition;
		if( direction == 'top' && position['top'][0] < scrollY) direction = 'bottom';
		else if( direction == 'bottom' && position['bottom'][0] + tooltipObj.tooltipDelta + dimention[0] > scrollY + window.innerHeight) direction = 'top';
		else if( direction == 'left' && position['left'][1] < 0 )  direction = 'right';
		else if( direction == 'right' && position['right'][1] + dimention[1] > window.innerWidth ) direction = 'left';

		// reset tooltip triangle translate value
		tooltipObj.tooltip.style.setProperty(tooltipObj.tooltipTriangleVar, '0px');
		
		if(direction == 'top' || direction == 'bottom') {
			var deltaMarg = 5;
			if(position[direction][1] < 0 ) {
				position[direction][1] = deltaMarg;
				// make sure triangle is at the center of the tooltip trigger
				tooltipObj.tooltip.style.setProperty(tooltipObj.tooltipTriangleVar, (positionTrigger.left + 0.5*positionTrigger.width - 0.5*dimention[1] - deltaMarg)+'px');
			}
			if(position[direction][1] + dimention[1] > window.innerWidth ) {
				position[direction][1] = window.innerWidth - dimention[1] - deltaMarg;
				// make sure triangle is at the center of the tooltip trigger
				tooltipObj.tooltip.style.setProperty(tooltipObj.tooltipTriangleVar, (0.5*dimention[1] - (window.innerWidth - positionTrigger.right) - 0.5*positionTrigger.width + deltaMarg)+'px');
			}
		}
		tooltipObj.tooltip.style.top = position[direction][0]+'px';
		tooltipObj.tooltip.style.left = position[direction][1]+'px';
		Util.addClass(tooltipObj.tooltip, 'tooltip--'+direction);
	};

	function checkTooltip(tooltipObj) {
		tooltipObj.tooltipTriggerHover = false;
		if(!tooltipObj.tooltipSticky) hideTooltip(tooltipObj);
		else {
			if(tooltipObj.tooltipHover) return;
			if(tooltipObj.tooltipHoverInterval) return;
			tooltipObj.tooltipHoverInterval = setTimeout(function(){
				hideTooltip(tooltipObj); 
				tooltipObj.tooltipHoverInterval = false;
			}, 300);
		}
	};

	function hideTooltip(tooltipObj) {
		if(tooltipObj.tooltipHover || tooltipObj.tooltipTriggerHover) return;
		clearInterval(tooltipObj.tooltipIntervalId);
		if(tooltipObj.tooltipHoverInterval) {
			clearInterval(tooltipObj.tooltipHoverInterval);
			tooltipObj.tooltipHoverInterval = false;
		}
		tooltipObj.tooltipIntervalId = false;
		if(!tooltipObj.tooltip) return;
		// hide tooltip
		removeTooltip(tooltipObj);
		// remove events
		removeTooltipEvents(tooltipObj);
	};

	function removeTooltip(tooltipObj) {
		if(tooltipObj.tooltipContent == tooltipObj.tooltip.innerHTML || tooltipObj.tooltip.getAttribute('data-reset') == 'on') {
			Util.addClass(tooltipObj.tooltip, 'tooltip--is-hidden');
			tooltipObj.tooltip.removeAttribute('data-reset');
		}
		if(tooltipObj.tooltipDescription) tooltipObj.element.removeAttribute('aria-describedby');
	};

	function changeTooltipContent(tooltipObj, event) {
		if(tooltipObj.tooltip && tooltipObj.tooltipTriggerHover && event.detail) {
			tooltipObj.tooltip.innerHTML = event.detail;
			tooltipObj.tooltip.setAttribute('data-reset', 'on');
			placeTooltip(tooltipObj);
		}
	};

	window.Tooltip = Tooltip;

	//initialize the Tooltip objects
	var tooltips = document.getElementsByClassName('js-tooltip-trigger');
	if( tooltips.length > 0 ) {
		for( var i = 0; i < tooltips.length; i++) {
			(function(i){new Tooltip(tooltips[i]);})(i);
		}
	}
}());
// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; 
};

// File#: _1_immersive-section-transition
// Usage: codyhouse.co/license
(function() {
  var ImmerseSectionTr = function(element) {
    this.element = element;
    this.media = this.element.getElementsByClassName('js-immerse-section-tr__media');
    this.scrollContent = this.element.getElementsByClassName('js-immerse-section-tr__content');
    if(this.media.length < 1) return;
    this.figure = this.media[0].getElementsByClassName('js-immerse-section-tr__figure');
    if(this.figure.length < 1) return;
    this.visibleFigure = false;
    this.mediaScale = 1;
    this.mediaInitHeight = 0;
    this.elementPadding = 0;
    this.scrollingFn = false;
    this.scrolling = false;
    this.active = false;
    this.scrollDelta = 0; // amount to scroll for full-screen scaleup
    initImmerseSectionTr(this);
  };

  function initImmerseSectionTr(element) {
    initContainer(element);
    resetSection(element);

    // listen to resize event and reset values
    element.element.addEventListener('update-immerse-section', function(event){
      resetSection(element);
    });

    // detect when the element is sticky - update scale value and opacity layer 
    var observer = new IntersectionObserver(immerseSectionTrCallback.bind(element));
    observer.observe(element.media[0]);
  };

  function resetSection(element) {
    getVisibleFigure(element);
    checkEffectActive(element);
    if(element.active) {
      Util.removeClass(element.element, 'immerse-section-tr--disabled');
      updateMediaHeight(element);
      getMediaScale(element); 
      updateMargin(element);
      setScaleValue.bind(element)();
    } else {
      // reset appearance
      Util.addClass(element.element, 'immerse-section-tr--disabled');
      element.media[0].style = '';
      element.scrollContent[0].style = '';
      updateScale(element, 1);
      updateOpacity(element, 0);
    }
    element.element.dispatchEvent(new CustomEvent('immersive-section-updated', {detail: {active: element.active, asset: element.visibleFigure}}));
  };

  function getVisibleFigure(element) { // get visible figure element
    element.visibleFigure = false;
    for(var i = 0; i < element.figure.length; i++) {
      if(window.getComputedStyle(element.figure[i]).getPropertyValue('display') != 'none') {
        element.visibleFigure = element.figure[i];
        break;
      }
    }
  };

  function updateMediaHeight(element) { // set sticky element padding/margin + height
    element.mediaInitHeight = element.visibleFigure.offsetHeight;
    element.scrollDelta = (window.innerHeight - element.visibleFigure.offsetHeight) > (window.innerWidth - element.visibleFigure.offsetWidth)
      ? (window.innerHeight - element.visibleFigure.offsetHeight)/2
      : (window.innerWidth - element.visibleFigure.offsetWidth)/2;
    if(element.scrollDelta > window.innerHeight) element.scrollDelta = window.innerHeight;
    if(element.scrollDelta < 200) element.scrollDelta = 200;
    element.media[0].style.height = window.innerHeight+'px';
    element.media[0].style.paddingTop = (window.innerHeight - element.visibleFigure.offsetHeight)/2+'px';
    element.media[0].style.marginTop = (element.visibleFigure.offsetHeight - window.innerHeight)/2+'px';
  };

  function getMediaScale(element) { // get media final scale value
    var scaleX = roundValue(window.innerWidth/element.visibleFigure.offsetWidth),
      scaleY = roundValue(window.innerHeight/element.visibleFigure.offsetHeight);

    element.mediaScale = Math.max(scaleX, scaleY);
    element.elementPadding = parseInt(window.getComputedStyle(element.element).getPropertyValue('padding-top'));
  };

  function roundValue(value) {
    return (Math.ceil(value*100)/100).toFixed(2);
  };

  function updateMargin(element) { // update distance between media and content elements
    if(element.scrollContent.length > 0) element.scrollContent[0].style.marginTop = element.scrollDelta+'px';
  };

  function setScaleValue() { // update asset scale value
    if(!this.active) return; // effect is not active
    var offsetTop = (window.innerHeight - this.mediaInitHeight)/2;
    var top = this.element.getBoundingClientRect().top + this.elementPadding;

    if( top < offsetTop && top > offsetTop - this.scrollDelta) {
      var scale = 1 + (top - offsetTop)*(1 - this.mediaScale)/this.scrollDelta;
      updateScale(this, scale);
      updateOpacity(this, 0);
    } else if(top >= offsetTop) {
      updateScale(this, 1);
      updateOpacity(this, 0);
    } else {
      updateScale(this, this.mediaScale);
      updateOpacity(this, 1.8*( offsetTop - this.scrollDelta - top)/ window.innerHeight);
    }

    this.scrolling = false;
  };

  function updateScale(element, value) { // apply new scale value
    element.visibleFigure.style.transform = 'scale('+value+')';
    element.visibleFigure.style.msTransform = 'scale('+value+')';
  };

  function updateOpacity(element, value) { // update layer opacity
    element.element.style.setProperty('--immerse-section-tr-opacity', value);
  };

  function immerseSectionTrCallback(entries) { // intersectionObserver callback
    if(entries[0].isIntersecting) {
      if(this.scrollingFn) return; // listener for scroll event already added
      immerseSectionTrScrollEvent(this);
    } else {
      if(!this.scrollingFn) return; // listener for scroll event already removed
      window.removeEventListener('scroll', this.scrollingFn);
      this.scrollingFn = false;
    }
  };

  function immerseSectionTrScrollEvent(element) { // listen to scroll when asset element is inside the viewport
    element.scrollingFn = immerseSectionTrScrolling.bind(element);
    window.addEventListener('scroll', element.scrollingFn);
  };

  function immerseSectionTrScrolling() { // update asset scale on scroll
    if(this.scrolling) return;
    this.scrolling = true;
    window.requestAnimationFrame(setScaleValue.bind(this));
  };

  function initContainer(element) {
    // add a padding to the container to fix the collapsing-margin issue
    if(parseInt(window.getComputedStyle(element.element).getPropertyValue('padding-top')) == 0) element.element.style.paddingTop = '1px';
  };

  function checkEffectActive(element) { //check if effect needs to be activated
    element.active = true;
    if(element.visibleFigure.offsetHeight >= window.innerHeight) element.active = false;
    if( window.innerHeight - element.visibleFigure.offsetHeight >= 600) element.active = false;
  };

  //initialize the ImmerseSectionTr objects
  var immerseSections = document.getElementsByClassName('js-immerse-section-tr'),
    reducedMotion = Util.osHasReducedMotion(),
    intObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);

  if(immerseSections.length < 1 ) return;
	if( !reducedMotion && intObserverSupported) {
    var immerseSectionsArray = [];
		for( var i = 0; i < immerseSections.length; i++) {
      (function(i){immerseSectionsArray.push(new ImmerseSectionTr(immerseSections[i]));})(i);
    }

    if(immerseSectionsArray.length > 0) {
      var resizingId = false,
        customEvent = new CustomEvent('update-immerse-section');
      
      window.addEventListener('resize', function() {
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 500);
      });

      function doneResizing() {
        for( var i = 0; i < immerseSectionsArray.length; i++) {
          (function(i){immerseSectionsArray[i].element.dispatchEvent(customEvent)})(i);
        };
      };
    };
  } else { // effect deactivated
    for( var i = 0; i < immerseSections.length; i++) Util.addClass(immerseSections[i], 'immerse-section-tr--disabled');
  }
}());
// File#: _1_chameleonic-header
// Usage: codyhouse.co/license
(function() {
  var ChaHeader = function(element) {
    this.element = element;
    this.sections = document.getElementsByClassName('js-cha-section');
    this.header = this.element.getElementsByClassName('js-cha-header')[0];
    // handle mobile behaviour
    this.headerTrigger = this.element.getElementsByClassName('js-cha-header__trigger');
    this.modal = document.getElementsByClassName('js-cha-modal');
    this.focusMenu = false;
    this.firstFocusable = null;
		this.lastFocusable = null;
    this.visibleClass = 'cd-block';
    initChaHeader(this);
  };

  function initChaHeader(element) {
    // set initial status
    for(var j = 0; j < element.sections.length; j++) {
      initSection(element, j);
    }

    // handle mobile behaviour
    if(element.headerTrigger.length > 0) {
      initMobileVersion(element);
    }

    // make sure header element is visible when in focus
    element.header.addEventListener('focusin', function(event){
      checkHeaderVisible(element);
    });
  };

  function initSection(element, index) {
    // clone header element inside each section
    var cloneItem = (index == 0) ? element.element : element.element.cloneNode(true);
    cloneItem.classList.remove('js-cha-header-clip');
    var customClasses = element.sections[index].getAttribute('data-header-class');
    // hide clones to SR
    cloneItem.setAttribute('aria-hidden', 'true');
    if( customClasses ) addHeaderClass(cloneItem.getElementsByClassName('js-cha-header')[0], customClasses);
    // keyborad users - make sure cloned items are not tabbable
    if(index != 0) {
      // reset tab index
      resetTabIndex(cloneItem);
      element.sections[index].insertBefore(cloneItem, element.sections[index].firstChild);
    }
  }

  function addHeaderClass(el, classes) {
    var classList = classes.split(' ');
     el.classList.add(classList[0]);
     if (classList.length > 1) addHeaderClass(el, classList.slice(1).join(' '));
  };

  function resetTabIndex(clone) {
    var focusable = clone.querySelectorAll('[href], button, input');
    for(var i = 0; i < focusable.length; i++) {
      focusable[i].setAttribute('tabindex', '-1');
    }
  };

  function initMobileVersion(element) {
    //detect click on nav trigger
    var triggers = document.getElementsByClassName('js-cha-header__trigger');
    for(var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener("click", function(event) {
        event.preventDefault();
        var ariaExpanded = !element.modal[0].classList.contains(element.visibleClass);
        //show nav and update button aria value
        element.modal[0].classList.toggle(element.visibleClass, ariaExpanded);
        element.headerTrigger[0].setAttribute('aria-expanded', ariaExpanded);
        if(ariaExpanded) { //opening menu -> move focus to first element inside nav
          getFocusableElements(element);
          element.firstFocusable.focus();
        } else if(element.focusMenu) {
          if(window.scrollY < element.focusMenu.offsetTop) element.focusMenu.focus();
          element.focusMenu = false;
        }
      });
    }

    // close modal on click
    element.modal[0].addEventListener("click", function(event) {
      if(!event.target.closest('.js-cha-modal__close')) return;
      closeModal(element);
    });
    
    // listen for key events
		window.addEventListener('keydown', function(event){
			// listen for esc key
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(element.headerTrigger[0].getAttribute('aria-expanded') == 'true' && isVisible(element.headerTrigger[0])) {
          closeModal(element);
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				trapFocus(element, event);
			}
		});
  };

  function closeModal(element) {
    element.focusMenu = element.headerTrigger[0]; // move focus to menu trigger when menu is close
		element.headerTrigger[0].click();
  };

  function trapFocus(element, event) {
    if( element.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of modal
			event.preventDefault();
			element.lastFocusable.focus();
		}
		if( element.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of modal
			event.preventDefault();
			element.firstFocusable.focus();
		}
  };

  function getFocusableElements(element) {
		//get all focusable elements inside the modal
		var allFocusable = element.modal[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		getFirstVisible(element, allFocusable);
		getLastVisible(element, allFocusable);
	};

	function getFirstVisible(element, elements) {
		//get first visible focusable element inside the modal
		for(var i = 0; i < elements.length; i++) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				element.firstFocusable = elements[i];
				return true;
			}
		}
	};

	function getLastVisible(element, elements) {
		//get last visible focusable element inside the modal
		for(var i = elements.length - 1; i >= 0; i--) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				element.lastFocusable = elements[i];
				return true;
			}
		}
  };
  
  function checkHeaderVisible(element) {
    if(window.scrollY > element.sections[0].offsetHeight - element.header.offsetHeight) window.scrollTo(0, 0);
  };

  function isVisible(element) {
		return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
	};

  // init the ChaHeader Object
  var chaHader = document.getElementsByClassName('js-cha-header-clip'),
    clipPathSupported = CSS.supports('clip-path', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)') || CSS.supports('-webkit-clip-path', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)');
  if(chaHader.length > 0 && clipPathSupported) {
    for(var i = 0; i < chaHader.length; i++) {
      new ChaHeader(chaHader[i]);
    }
  }
}());
// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};


Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; 
};

// File#: _1_reveal-effects
// Usage: codyhouse.co/license
(function() {
	var fxElements = document.getElementsByClassName('reveal-fx');
	var intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
	if(fxElements.length > 0) {
		// deactivate effect if Reduced Motion is enabled
		if (Util.osHasReducedMotion() || !intersectionObserverSupported) {
			fxRemoveClasses();
			return;
		}
		//on small devices, do not animate elements -> reveal all
		if( fxDisabled(fxElements[0]) ) {
			fxRevealAll();
			return;
		}

		var fxRevealDelta = 120; // amount (in pixel) the element needs to enter the viewport to be revealed - if not custom value (data-reveal-fx-delta)
		
		var viewportHeight = window.innerHeight,
			fxChecking = false,
			fxRevealedItems = [],
			fxElementDelays = fxGetDelays(), //elements animation delay
			fxElementDeltas = fxGetDeltas(); // amount (in px) the element needs enter the viewport to be revealed (default value is fxRevealDelta) 
		
		
		// add event listeners
		window.addEventListener('load', fxReveal);
		window.addEventListener('resize', fxResize);
		window.addEventListener('restartAll', fxRestart);

		// observe reveal elements
		var observer = [];
		initObserver();

		function initObserver() {
			for(var i = 0; i < fxElements.length; i++) {
				observer[i] = new IntersectionObserver(
					function(entries, observer) { 
						if(entries[0].isIntersecting) {
							fxRevealItemObserver(entries[0].target);
							observer.unobserve(entries[0].target);
						}
					}, 
					{rootMargin: "0px 0px -"+fxElementDeltas[i]+"px 0px"}
				);
	
				observer[i].observe(fxElements[i]);
			}
		};

		function fxRevealAll() { // reveal all elements - small devices
			for(var i = 0; i < fxElements.length; i++) {
				Util.addClass(fxElements[i], 'reveal-fx--is-visible');
			}
		};

		function fxResize() { // on resize - check new window height and reveal visible elements
			if(fxChecking) return;
			fxChecking = true;
			(!window.requestAnimationFrame) ? setTimeout(function(){fxReset();}, 250) : window.requestAnimationFrame(fxReset);
		};

		function fxReset() {
			viewportHeight = window.innerHeight;
			fxReveal();
		};

		function fxReveal() { // reveal visible elements
			for(var i = 0; i < fxElements.length; i++) {(function(i){
				if(fxRevealedItems.indexOf(i) != -1 ) return; //element has already been revelead
				if(fxElementIsVisible(fxElements[i], i)) {
					fxRevealItem(i);
					fxRevealedItems.push(i);
				}})(i); 
			}
			fxResetEvents(); 
			fxChecking = false;
		};

		function fxRevealItem(index) {
			if(fxElementDelays[index] && fxElementDelays[index] != 0) {
				// wait before revealing element if a delay was added
				setTimeout(function(){
					Util.addClass(fxElements[index], 'reveal-fx--is-visible');
				}, fxElementDelays[index]);
			} else {
				Util.addClass(fxElements[index], 'reveal-fx--is-visible');
			}
		};

		function fxRevealItemObserver(item) {
			var index = Util.getIndexInArray(fxElements, item);
			if(fxRevealedItems.indexOf(index) != -1 ) return; //element has already been revelead
			fxRevealItem(index);
			fxRevealedItems.push(index);
			fxResetEvents(); 
			fxChecking = false;
		};

		function fxGetDelays() { // get anmation delays
			var delays = [];
			for(var i = 0; i < fxElements.length; i++) {
				delays.push( fxElements[i].getAttribute('data-reveal-fx-delay') ? parseInt(fxElements[i].getAttribute('data-reveal-fx-delay')) : 0);
			}
			return delays;
		};

		function fxGetDeltas() { // get reveal delta
			var deltas = [];
			for(var i = 0; i < fxElements.length; i++) {
				deltas.push( fxElements[i].getAttribute('data-reveal-fx-delta') ? parseInt(fxElements[i].getAttribute('data-reveal-fx-delta')) : fxRevealDelta);
			}
			return deltas;
		};

		function fxDisabled(element) { // check if elements need to be animated - no animation on small devices
			return !(window.getComputedStyle(element, '::before').getPropertyValue('content').replace(/'|"/g, "") == 'reveal-fx');
		};

		function fxElementIsVisible(element, i) { // element is inside viewport
			return (fxGetElementPosition(element) <= viewportHeight - fxElementDeltas[i]);
		};

		function fxGetElementPosition(element) { // get top position of element
			return element.getBoundingClientRect().top;
		};

		function fxResetEvents() { 
			if(fxElements.length > fxRevealedItems.length) return;
			// remove event listeners if all elements have been revealed
			window.removeEventListener('load', fxReveal);
			window.removeEventListener('resize', fxResize);
		};

		function fxRemoveClasses() {
			// Reduced Motion on or Intersection Observer not supported
			while(fxElements[0]) {
				// remove all classes starting with 'reveal-fx--'
				var classes = fxElements[0].getAttribute('class').split(" ").filter(function(c) {
					return c.lastIndexOf('reveal-fx--', 0) !== 0;
				});
				fxElements[0].setAttribute('class', classes.join(" ").trim());
				Util.removeClass(fxElements[0], 'reveal-fx');
			}
		};

		function fxRestart() {
      // restart the reveal effect -> hide all elements and re-init the observer
      if (Util.osHasReducedMotion() || !intersectionObserverSupported || fxDisabled(fxElements[0])) {
        return;
      }
      // check if we need to add the event listensers back
      if(fxElements.length <= fxRevealedItems.length) {
        window.addEventListener('load', fxReveal);
        window.addEventListener('resize', fxResize);
      }
      // remove observer and reset the observer array
      for(var i = 0; i < observer.length; i++) {
        if(observer[i]) observer[i].disconnect();
      }
      observer = [];
      // remove visible class
      for(var i = 0; i < fxElements.length; i++) {
        Util.removeClass(fxElements[i], 'reveal-fx--is-visible');
      }
      // reset fxRevealedItems array
      fxRevealedItems = [];
      // restart observer
      initObserver();
    };
	}
}());
// utility functions
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

// File#: _1_switch-icon
// Usage: codyhouse.co/license
(function() {
	var switchIcons = document.getElementsByClassName('js-switch-icon');
	if( switchIcons.length > 0 ) {
		for(var i = 0; i < switchIcons.length; i++) {(function(i){
			if( !Util.hasClass(switchIcons[i], 'switch-icon--hover') ) initswitchIcons(switchIcons[i]);
		})(i);}

		function initswitchIcons(btn) {
			btn.addEventListener('click', function(event){	
				event.preventDefault();
				var status = !Util.hasClass(btn, 'switch-icon--state-b');
				Util.toggleClass(btn, 'switch-icon--state-b', status);
				// emit custom event
				var event = new CustomEvent('switch-icon-clicked', {detail: status});
				btn.dispatchEvent(event);
			});
		};
	}
}());
// File#: _1_lazy-load
// Usage: codyhouse.co/license
(function() {
  var LazyLoad = function(elements) {
    this.elements = elements;
    initLazyLoad(this);
  };

  function initLazyLoad(asset) {
    if(lazySupported) setAssetsSrc(asset);
    else if(intersectionObsSupported) observeAssets(asset);
    else scrollAsset(asset);
  };

  function setAssetsSrc(asset) {
    for(var i = 0; i < asset.elements.length; i++) {
      if(asset.elements[i].getAttribute('data-bg') || asset.elements[i].tagName.toLowerCase() == 'picture') { // this could be an element with a bg image or a <source> element inside a <picture>
        observeSingleAsset(asset.elements[i]);
      } else {
        setSingleAssetSrc(asset.elements[i]);
      } 
    }
  };

  function setSingleAssetSrc(img) {
    if(img.tagName.toLowerCase() == 'picture') {
      setPictureSrc(img);
    } else {
      setSrcSrcset(img);
      var bg = img.getAttribute('data-bg');
      if(bg) img.style.backgroundImage = bg;
      if(!lazySupported || bg) img.removeAttribute("loading");
    }
  };

  function setPictureSrc(picture) {
    var pictureChildren = picture.children;
    for(var i = 0; i < pictureChildren.length; i++) setSrcSrcset(pictureChildren[i]);
    picture.removeAttribute("loading");
  };

  function setSrcSrcset(img) {
    var src = img.getAttribute('data-src');
    if(src) img.src = src;
    var srcset = img.getAttribute('data-srcset');
    if(srcset) img.srcset = srcset;
  };

  function observeAssets(asset) {
    for(var i = 0; i < asset.elements.length; i++) {
      observeSingleAsset(asset.elements[i]);
    }
  };

  function observeSingleAsset(img) {
    if( !img.getAttribute('data-src') && !img.getAttribute('data-srcset') && !img.getAttribute('data-bg') && img.tagName.toLowerCase() != 'picture') return; // using the native lazyload with no need js lazy-loading

    var threshold = img.getAttribute('data-threshold') || '200px';
    var config = {rootMargin: threshold};
    var observer = new IntersectionObserver(observerLoadContent.bind(img), config);
    observer.observe(img);
  };

  function observerLoadContent(entries, observer) { 
    if(entries[0].isIntersecting) {
      setSingleAssetSrc(this);
      observer.unobserve(this);
    }
  };

  function scrollAsset(asset) {
    asset.elements = Array.prototype.slice.call(asset.elements);
    asset.listening = false;
    asset.scrollListener = eventLazyLoad.bind(asset);
    document.addEventListener("scroll", asset.scrollListener);
    asset.resizeListener = eventLazyLoad.bind(asset);
    document.addEventListener("resize", asset.resizeListener);
    eventLazyLoad.bind(asset)(); // trigger before starting scrolling/resizing
  };

  function eventLazyLoad() {
    var self = this;
    if(self.listening) return;
    self.listening = true;
    setTimeout(function() {
      for(var i = 0; i < self.elements.length; i++) {
        if ((self.elements[i].getBoundingClientRect().top <= window.innerHeight && self.elements[i].getBoundingClientRect().bottom >= 0) && getComputedStyle(self.elements[i]).display !== "none") {
          setSingleAssetSrc(self.elements[i]);

          self.elements = self.elements.filter(function(image) {
            return image.hasAttribute("loading");
          });

          if (self.elements.length === 0) {
            if(self.scrollListener) document.removeEventListener("scroll", self.scrollListener);
            if(self.resizeListener) window.removeEventListener("resize", self.resizeListener);
          }
        }
      }
      self.listening = false;
    }, 200);
  };

  window.LazyLoad = LazyLoad;

  var lazyLoads = document.querySelectorAll('[loading="lazy"]'),
    lazySupported = 'loading' in HTMLImageElement.prototype,
    intersectionObsSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
  
  if( lazyLoads.length > 0 ) {
    new LazyLoad(lazyLoads);
  };
  
}());
// File#: _1_parallax-image
// Usage: codyhouse.co/license
(function() {
  var ParallaxImg = function(element, rotationLevel) {
    this.element = element;
    this.figure = this.element.getElementsByClassName('js-parallax__wrapper')[0];
    this.imgs = this.element.getElementsByClassName('js-parallax__item');
    this.maxRotation = rotationLevel || 2; // rotate level
    this.scale = 1;
    this.animating = false;
    initParallax(this);
    initParallaxEvents(this);
  };

  function initParallax(element) {
    element.count = 0;
    window.requestAnimationFrame(checkImageLoaded.bind(element));
    // check if this is an image -> otherwise no need to check if loaded
    for(var i = 0; i < element.imgs.length; i++) {(function(i){
      var loaded = false;
      if(element.imgs[i].tagName.toLowerCase() != 'img') {
        element.count = element.count + 1;
        return;
      }
      element.imgs[i].addEventListener('load', function(){
        if(loaded) return;
        element.count = element.count + 1;
      });
      if(element.imgs[i].complete && !loaded) {
        loaded = true;
        element.count = element.count + 1;
      }
    })(i);}

    // set translateZ
    for(var i = 0; i < element.imgs.length; i++) {
      if(element.imgs[i].getAttribute('data-parallax-distance')) {
        element.imgs[i].style.transform = 'translateZ('+parseInt(element.imgs[i].getAttribute('data-parallax-distance')) + 'px'+')';
      }
    }
  };

  function checkImageLoaded() {
    if(this.count >= this.imgs.length) {
      initScale(this);
      if(this.loaded) {
        window.cancelAnimationFrame(this.loaded);
        this.loaded = false;
      }
    } else {
      this.loaded = window.requestAnimationFrame(checkImageLoaded.bind(this));
    }
  };

  function initScale(element) {
    var maxImgResize = getMaxScale(element);
    element.scale = maxImgResize/(Math.sin(Math.PI / 2 - element.maxRotation*Math.PI/180));
    element.figure.style.transform = 'scale('+element.scale+')';  
    element.element.classList.add('parallax--loaded');
  };

  function getMaxScale(element) {
    var minWidth = 0;
    var maxWidth = 0;
    for(var i = 0; i < element.imgs.length; i++) {
      var width = element.imgs[i].getBoundingClientRect().width;
      if(width < minWidth || i == 0 ) minWidth = width;
      if(width > maxWidth || i == 0 ) maxWidth = width;
    }
    var scale = Math.ceil(10*maxWidth/minWidth)/10;
    if(scale < 1.1) scale = 1.1;
    return scale;
  }

  function initParallaxEvents(element) {
    element.element.addEventListener('mousemove', function(event){
      if(element.animating) return;
      element.animating = true;
      window.requestAnimationFrame(moveImage.bind(element, event));
    });
  };

  function moveImage(event, timestamp) {
    var wrapperPosition = this.element.getBoundingClientRect();
    var rotateY = 2*(this.maxRotation/wrapperPosition.width)*(wrapperPosition.left - event.clientX + wrapperPosition.width/2);
    var rotateX = 2*(this.maxRotation/wrapperPosition.height)*(event.clientY - wrapperPosition.top - wrapperPosition.height/2);

    if(rotateY > this.maxRotation) rotateY = this.maxRotation;
		if(rotateY < -1*this.maxRotation) rotateY = -this.maxRotation;
		if(rotateX > this.maxRotation) rotateX = this.maxRotation;
    if(rotateX < -1*this.maxRotation) rotateX = -this.maxRotation;
    this.figure.style.transform = 'scale('+this.scale+') rotateX('+rotateX+'deg) rotateY('+rotateY+'deg)';
    this.animating = false;
  };

  window.ParallaxImg = ParallaxImg;

  //initialize the ParallaxImg objects
	var parallaxImgs = document.getElementsByClassName('js-parallax');
	if( parallaxImgs.length > 0) {
		for( var i = 0; i < parallaxImgs.length; i++) {
			(function(i){
        var rotationLevel = parallaxImgs[i].getAttribute('data-perspective');
        new ParallaxImg(parallaxImgs[i], rotationLevel);
      })(i);
		}
	};
}());
// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

// File#: _1_notice
// Usage: codyhouse.co/license
(function() {
  function initNoticeEvents(notice) {
    notice.addEventListener('click', function(event){
      if(event.target.closest('.js-notice__hide-control')) {
        event.preventDefault();
        Util.addClass(notice, 'notice--hide');
      }
    });
  };
  
  var noticeElements = document.getElementsByClassName('js-notice');
  if(noticeElements.length > 0) {
    for(var i=0; i < noticeElements.length; i++) {(function(i){
      initNoticeEvents(noticeElements[i]);
    })(i);}
  }
}());
// File#: _1_masonry
// Usage: codyhouse.co/license
(function() {
  var Masonry = function(element) {
    this.element = element;
    this.list = this.element.getElementsByClassName('js-masonry__list')[0];
    this.items = this.element.getElementsByClassName('js-masonry__item');
    this.activeColumns = 0;
    this.colStartWidth = 0; // col min-width (defined in CSS using --masonry-col-auto-size variable)
    this.colWidth = 0; // effective column width
    this.colGap = 0;
    // store col heights and items
    this.colHeights = [];
    this.colItems = [];
    // flex full support
    this.flexSupported = checkFlexSupported(this.items[0]);
    getGridLayout(this); // get initial grid params
    setGridLayout(this); // set grid params (width of elements)
    initMasonryLayout(this); // init gallery layout
  };

  function checkFlexSupported(item) {
    var itemStyle = window.getComputedStyle(item);
    return itemStyle.getPropertyValue('flex-basis') != 'auto';
  };

  function getGridLayout(grid) { // this is used to get initial grid details (width/grid gap)
    var itemStyle = window.getComputedStyle(grid.items[0]);
    if( grid.colStartWidth == 0) {
      grid.colStartWidth = parseFloat(itemStyle.getPropertyValue('width'));
    }
    grid.colGap = parseFloat(itemStyle.getPropertyValue('margin-right'));
  };

  function setGridLayout(grid) { // set width of items in the grid
    var containerWidth = parseFloat(window.getComputedStyle(grid.element).getPropertyValue('width'));
    grid.activeColumns = parseInt((containerWidth + grid.colGap)/(grid.colStartWidth+grid.colGap));
    if(grid.activeColumns == 0) grid.activeColumns = 1;
    grid.colWidth = parseFloat((containerWidth - (grid.activeColumns - 1)*grid.colGap)/grid.activeColumns);
    for(var i = 0; i < grid.items.length; i++) {
      grid.items[i].style.width = grid.colWidth+'px'; // reset items width
    }
  };

  function initMasonryLayout(grid) {
    if(grid.flexSupported) {
      checkImgLoaded(grid); // reset layout when images are loaded
    } else {
      grid.element.classList.add('masonry--loaded'); // make sure the gallery is visible
    }

    grid.element.addEventListener('masonry-resize', function(){ // window has been resized -> reset masonry layout
      getGridLayout(grid);
      setGridLayout(grid);
      if(grid.flexSupported) layItems(grid); 
    });

    grid.element.addEventListener('masonry-reset', function(event){ // reset layout (e.g., new items added to the gallery)
      getGridLayout(grid);
      setGridLayout(grid);
      if(grid.flexSupported) checkImgLoaded(grid); 
    });

    // if there are fonts to be loaded -> reset masonry 
    if(document.fonts) {
      document.fonts.onloadingdone = function (fontFaceSetEvent) {
        if(!grid.masonryLaid) return;
        getGridLayout(grid);
        setGridLayout(grid);
        if(grid.flexSupported) layItems(grid); 
      };
    }
  };

  function layItems(grid) {
    grid.element.classList.add('masonry--loaded'); // make sure the gallery is visible
    grid.colHeights = [];
    grid.colItems = [];

    // grid layout has already been set -> update container height and order of items
    for(var j = 0; j < grid.activeColumns; j++) {
      grid.colHeights.push(0); // reset col heights
      grid.colItems[j] = []; // reset items order
    }
    
    for(var i = 0; i < grid.items.length; i++) {
      var minHeight = Math.min.apply( Math, grid.colHeights ),
        index = grid.colHeights.indexOf(minHeight);
      if(grid.colItems[index]) grid.colItems[index].push(i);
      grid.items[i].style.flexBasis = 0; // reset flex basis before getting height
      var itemHeight = grid.items[i].getBoundingClientRect().height || grid.items[i].offsetHeight || 1;
      grid.colHeights[index] = grid.colHeights[index] + grid.colGap + itemHeight;
    }

    // reset height of container
    var masonryHeight = Math.max.apply( Math, grid.colHeights ) + 5;
    grid.list.style.cssText = 'height: '+ masonryHeight + 'px;';

    // go through elements and set flex order
    var order = 0;
    for(var i = 0; i < grid.colItems.length; i++) {
      for(var j = 0; j < grid.colItems[i].length; j++) {
        grid.items[grid.colItems[i][j]].style.order = order;
        order = order + 1;
      }
      // change flex-basis of last element of each column, so that next element shifts to next col
      var lastItemCol = grid.items[grid.colItems[i][grid.colItems[i].length - 1]];
      if(lastItemCol) lastItemCol.style.flexBasis = masonryHeight - grid.colHeights[i] + lastItemCol.getBoundingClientRect().height - 5 + 'px';
    }

    grid.masonryLaid = true;
    // emit custom event when grid has been reset
    grid.element.dispatchEvent(new CustomEvent('masonry-laid'));
  };

  function checkImgLoaded(grid) {
    var imgs = grid.list.getElementsByTagName('img');

    function countLoaded() {
      var setTimeoutOn = false;
      for(var i = 0; i < imgs.length; i++) {
        if(imgs[i].complete && imgs[i].naturalHeight == 0) {
          continue; // broken image -> skip
        }
        
        if(!imgs[i].complete) {
          setTimeoutOn = true;
          break;
        } else if (typeof imgs[i].naturalHeight !== "undefined" && imgs[i].naturalHeight == 0) {
          setTimeoutOn = true;
          break;
        }
      }

      if(!setTimeoutOn) {
        layItems(grid);
      } else {
        setTimeout(function(){
          countLoaded();
        }, 100);
      }
    };

    if(imgs.length == 0) {
      layItems(grid); // no need to wait -> no img available
    } else {
      countLoaded();
    }
  };

  //initialize the Masonry objects
  var masonries = document.getElementsByClassName('js-masonry'), 
    flexSupported = CSS.supports('flex-basis', 'auto'),
    masonriesArray = [];

  if( masonries.length > 0) {
    for( var i = 0; i < masonries.length; i++) {
      if(!flexSupported) {
        masonries[i].classList.add('masonry--loaded'); // reveal gallery
      } else {
        (function(i){masonriesArray.push(new Masonry(masonries[i]));})(i); // init Masonry Layout
      }
    }

    if(!flexSupported) return;

    // listen to window resize -> reorganize items in gallery
    var resizingId = false,
      customEvent = new CustomEvent('masonry-resize');
      
    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 500);
    });

    function doneResizing() {
      for( var i = 0; i < masonriesArray.length; i++) {
        (function(i){masonriesArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
  };
}());
// File#: _1_morphing-background
// Usage: codyhouse.co/license
(function() {
  var MorphBg = function(element) {
    this.element = element;
    this.wrapper = this.element.closest('.js-morph-bg-wrapper');
    this.elementId = this.element.getAttribute('id');
    this.targets = document.querySelectorAll('[data-morph-bg="'+this.elementId+'"]');
    this.bgTargets = [];
    this.action = this.element.getAttribute('data-morph-bg-event');
    this.targetIndex = false;
    this.deafultIndex = false;
    if(!this.action) this.action = 'click';
    initMorphBg(this);
  };

  function initMorphBg(element) {
    // update the element.bgTargets - array of the elements whose size will be used for the morphing transformation
    getBgTargets(element);
    // see if we need to set the element visible
    setInitialState(element);
    // add listeners
    if(element.action == 'click') {
      initClickEvent(element);
    } else {
      initHoverEvent(element);
    }
    // on window resize/fonts loaded - reset background element size
    window.addEventListener('update-morphbg', function(){
      morphBgResize(element);
    });
    window.addEventListener('hide-morphbg', function(){
      morphBgHide(element);
    });
    
  };

  function getBgTargets(element) {
    for(var i = 0; i < element.targets.length; i++) {
      var bgTarget = element.targets[i].querySelector('[data-morph-bg-target]') || element.targets[i];
      element.bgTargets.push(bgTarget);
    }
  };

  function setInitialState(element) {
    for(var i = 0; i < element.targets.length; i++) {
      if(element.targets[i].hasAttribute('data-morph-bg-active')) {
        setPosition(element, i);
        element.deafultIndex = i;
        break;
      }
    }
  };

  function initClickEvent(element) {
    for(var i = 0; i < element.targets.length; i++) {
      (function(i){
        element.targets[i].addEventListener('click', function(event){
          setPosition(element, i);
        })
      })(i);
    }
  };

  function initHoverEvent(element) {
    for(var i = 0; i < element.targets.length; i++) {
      (function(i){
        element.targets[i].addEventListener('mouseenter', function(event){
          setPosition(element, i);
        });
        element.targets[i].addEventListener('mouseleave', function(event){
          resetBgPosition(element, event);
        });
      })(i);
    }

    // if there's [data-morph-bg-preserve] element - detect mouseleave
    var preserveWrapper = element.targets[0].closest('[data-morph-bg-preserve]');
    if(preserveWrapper) {
      preserveWrapper.addEventListener('mouseleave', function(event){
        resetBgPosition(element, event);
      });
    }
  };

  function setPosition(element, index) {
    // get size + position target
    var targetInfo = element.bgTargets[index].getBoundingClientRect(),
      targetRadius = getComputedStyle(element.bgTargets[index]).borderRadius;

    // get the wrapper parent info
    var wrapperInfo = element.wrapper.getBoundingClientRect();

    // modify element position and size
    element.element.style.transform = 'translateX('+(targetInfo.left - wrapperInfo.left)+'px) translateY('+(targetInfo.top - wrapperInfo.top)+'px) translateZ(-0.1px)';
    element.element.style.height = targetInfo.height+'px';
    element.element.style.width = targetInfo.width+'px';

    // modify element radius
    element.element.style.borderRadius = targetRadius;

    // show item
    element.element.classList.add('morph-bg--visible');
    setTimeout(function(){
      if(!element.element.classList.contains('morph-bg--has-transition')) element.element.classList.add('morph-bg--has-transition');
    }, 10);

    // update target index
    element.targetIndex = index;
  };

  function resetBgPosition(element, event) {
    if(event.relatedTarget.closest('[data-morph-bg="'+element.elementId+'"]') || event.relatedTarget.closest('[data-morph-bg-preserve]')) {
      return; // mouse is inside another target
    }
    // check if tehre was a default index
    if(element.deafultIndex !== false) {
      element.targetIndex = element.deafultIndex;
      setPosition(element, element.targetIndex);
      return;
    }
    // if none of the above -> hide bg
    element.element.classList.remove('morph-bg--visible', 'morph-bg--has-transition');
    // reset target index
    element.targetIndex = false;
  };

  function morphBgResize(element) {
    if(element.targetIndex === false) return;
    setPosition(element, element.targetIndex);
    element.element.style.display = '';
  };

  function morphBgHide(element) {
    element.element.style.display = 'none';
  };

  window.MorphBg = MorphBg;

  //initialize the MorphBg objects
	var morphBg = document.getElementsByClassName('js-morph-bg');
  if( morphBg.length > 0 ) {
		for( var i = 0; i < morphBg.length; i++) {
			(function(i){new MorphBg(morphBg[i]);})(i);
		}
  }

  // on window resize - reset morph bg size
  var resizingId = false,
    customEventMorph = new CustomEvent('update-morphbg'),
    customEventHide = new CustomEvent('hide-morphbg');

  window.addEventListener('resize', function() {
    if(!resizingId) doneResizing(customEventHide);
    clearTimeout(resizingId);
    resizingId = setTimeout(function(){
      doneResizing(customEventMorph);
      resizingId = false;
    }, 100);
  });

  // wait for font to be loaded
  if(document.fonts) {
    document.fonts.onloadingdone = function (fontFaceSetEvent) {
      doneResizing(customEventMorph);
    };
    
    document.fonts.ready.then(function() {
      setTimeout(function(){
        doneResizing(customEventMorph);
      }, 300);
    });
  }

  function doneResizing(customEvent) {
    window.dispatchEvent(customEvent);
  };
}());
/// File#: _1_custom-cursor
// Usage: codyhouse.co/license
(function() {
  var CustomCursor = function(element) {
    this.element = element;
    this.targets = document.querySelectorAll('[data-custom-cursor="'+this.element.getAttribute('id')+'"]');
    this.target = false;
    this.moving = false;

    // cursor classes
    this.inClass = 'c-cursor--in';
    this.outClass = 'c-cursor--out';
    this.positionClass = 'c-cursor--';
  
    initCustomCursor(this);
  };

  function initCustomCursor(obj) {
    if(obj.targets.length == 0) return;
    // init events
    for( var i = 0; i < obj.targets.length; i++) {
      (function(i){
        obj.targets[i].addEventListener('mouseenter', handleEvent.bind(obj));
      })(i);
    }
  };

  function handleEvent(event) {
    switch(event.type) {
      case 'mouseenter': {
        initMouseEnter(this, event);
        break;
      }
      case 'mouseleave': {
        initMouseLeave(this, event);
        break;
      }
      case 'mousemove': {
        initMouseMove(this, event);
        break;
      }
    }
  };

  function initMouseEnter(obj, event) {
    removeTargetEvents(obj);
    obj.target = event.currentTarget;
    // listen for move and leave events
    obj.target.addEventListener('mousemove', handleEvent.bind(obj));
    obj.target.addEventListener('mouseleave', handleEvent.bind(obj));
    // show custom cursor
    toggleCursor(obj, true);
    // place custom cursor
    moveCursor(obj, event);
  };

  function initMouseLeave(obj, event) {
    removeTargetEvents(obj);
    toggleCursor(obj, false);
    if(obj.moving) {
      window.cancelAnimationFrame(obj.moving);
      obj.moving = false;
    }
  };

  function removeTargetEvents(obj) {
    if(obj.target) {
      obj.target.removeEventListener('mousemove', handleEvent.bind(obj));
		  obj.target.removeEventListener('mouseleave', handleEvent.bind(obj));
      obj.target = false;
    }
  };

  function initMouseMove(obj, event) {
    if(obj.moving) return;
    obj.moving = window.requestAnimationFrame(function(){
      moveCursor(obj, event);
    });
  };

  function moveCursor(obj, event) {
    obj.element.style.transform = 'translateX('+event.clientX+'px) translateY('+event.clientY+'px)';
    // set position classes
    updatePositionClasses(obj, event.clientX, event.clientY);
    obj.moving = false;
  };

  function updatePositionClasses(obj, xposition, yposition) {
    if(!obj.target) return;
    var targetBoundingRect = obj.target.getBoundingClientRect();
    var isLeft = xposition < (targetBoundingRect.left + targetBoundingRect.width/2),
      isTop = yposition < (targetBoundingRect.top + targetBoundingRect.height/2);

    // reset classes
    obj.element.classList.toggle(obj.positionClass+'left', isLeft);
    obj.element.classList.toggle(obj.positionClass+'right', !isLeft);
    obj.element.classList.toggle(obj.positionClass+'top', isTop);
    obj.element.classList.toggle(obj.positionClass+'bottom', !isTop);
  };

  function toggleCursor(obj, bool) {
    obj.element.classList.toggle(obj.outClass, !bool);
    obj.element.classList.toggle(obj.inClass, bool);
  };

  window.CustomCursor = CustomCursor;

  var cCursor = document.getElementsByClassName('js-c-cursor');
  if( cCursor.length > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for( var i = 0; i < cCursor.length; i++) {
      (function(i){new CustomCursor(cCursor[i]);})(i);
    }
  }
}());
// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

// File#: _1_product-tour
// Usage: codyhouse.co/license
(function() {
  var PTour = function(element, bool) {
    this.element = element;
    this.pin = this.element.getElementsByClassName('js-p-tour__pin');
    this.bg = this.element.getElementsByClassName('js-p-tour__background');
    this.steps = this.element.getElementsByClassName('js-p-tour__step');
    this.targets = [];
    this.targetPositions = [];
    this.showPTour = bool;
    this.visibleStep = 0;
    this.isMobile = false;
    this.resizingId = false;
    this.stepTimeout = false;
    // trigger of the entire tour
    this.tourTriggers = document.getElementsByClassName('js-p-tour-start');
    initPTour(this);
  };

  // public methods
  PTour.prototype.show = function() {
    updateLayout(this);
    resetTour(this);
		showTour(this);
	};

  PTour.prototype.hide = function() {
		closeTour(this);
	};

  // private methods
  function initPTour(element) {
    // define position functions
    setPositionFn(element);

    // collect all targets
    collectTargets(element);

    // set layout type
    updateLayout(element);

    // detect click on tour element
    element.element.addEventListener('click', function(event) {
      // check if we need to close tour
      var closeBtn = event.target.closest('.js-p-tour__close');
      if(closeBtn) closeTour(element);

      // check if this was a next/prev button
      var nextStep = event.target.closest('.js-p-tour__btn-next');
      if(nextStep) updateSteps(element, 'next');
      var prevStep = event.target.closest('.js-p-tour__btn-prev');
      if(prevStep) updateSteps(element, 'prev');
    });

    // toggle tour visibility
    element.showPTour ? showTour(element) : closeTour(element);

    // on resize -> update layout type
    window.addEventListener('resize', function(event){
      clearTimeout(element.resizingId);
      element.resizingId = setTimeout(function(){
        updateLayout(element);
        if(!element.mobile) showSelectedStep(element);
      }, 200);
    });

    // start tour using a trigger button
    if(element.tourTriggers.length > 0) {
      for(var i = 0; i < element.tourTriggers.length; i++) {
        element.tourTriggers[i].addEventListener('click', function(event) {
          updateLayout(element);
          resetTour(element);
		      showTour(element);
        });
      }
    }

    // add loaded class
    Util.addClass(element.element, 'p-tour--loaded');
  };

  function setPositionFn(element) {
    element['tooltipBottom'] = tooltipBottom;
    element['tooltipTop'] = tooltipTop;
    element['tooltipLeft'] = tooltipLeft;
    element['tooltipRight'] = tooltipRight;
    element['tooltipBottomLeft'] = tooltipBottomLeft;
    element['tooltipBottomRight'] = tooltipBottomRight;
    element['tooltipTopLeft'] = tooltipTopLeft;
    element['tooltipTopRight'] = tooltipTopRight;
  };

  function collectTargets(element) {
    for(var i = 0; i < element.steps.length; i++) {
      element.targets.push(document.querySelector('[data-p-tour-target="'+(i + 1)+'"]'));
      element.targetPositions.push(element.targets[i].getAttribute('data-p-tour-position') || 'center');
    };
  };

  function showTour(element) {
    Util.removeClass(element.element, 'p-tour--is-hidden');
    // reveal step
    showSelectedStep(element);
    // show background
    animateBg(element);
  };

  function closeTour(element) {
    Util.addClass(element.element, 'p-tour--is-hidden');
    element.element.addEventListener('transitionend', function cb(){
      element.visibleStep = 0;
      element.element.removeEventListener('transitionend', cb);
      updateLayout(element);
      resetTour(element);
    });
  };

  function updateSteps(element, direction) {
    // clear timeout
    if(element.stepTimeout) {
      clearTimeout(element.stepTimeout);
      element.stepTimeout = false;
    }
    var newIndex = direction == 'next' ? element.visibleStep + 1 : element.visibleStep - 1;
    if(newIndex < 0) newIndex = element.steps.length - 1;
    if(newIndex >= element.steps.length) newIndex = 0;
    // reset bg class
    Util.removeClass(element.bg[0], 'p-tour__background--animate');
    // hide old step
    hideStep(element, direction, function(){
      // update index
      element.visibleStep = newIndex;
      // show new step
      showSelectedStep(element, direction);
      // trigger bg animation
      animateBg(element);
    });
  };

  function hideStep(element, direction, cb) {
    Util.removeClass(element.steps[element.visibleStep], 'p-tour__step--current');
    if(element.isMobile) {
      // small screen animation
      var isNext = (direction == 'next');
      Util.toggleClass(element.steps[element.visibleStep], 'p-tour__step--m-right', !isNext);
      Util.toggleClass(element.steps[element.visibleStep], 'p-tour__step--m-left', isNext);
    } else {
      Util.addClass(element.pin[0], 'p-tour__pin--out');
    }
    if(element.isMobile) cb();
    else {
      element.stepTimeout = setTimeout(cb, 300);
    }
  };

  function showSelectedStep(element, direction) {
    // get pin position
    var position = getPinPosition(element); // position = [top, left]
    // update pin position
    setPosition(element.pin[0], position);
    // show pin
    Util.removeClass(element.pin[0], 'p-tour__pin--out');
    // get class position of new step (e.g., p-tour__step--right)
    var classPosition = setTooltipPosition(element, position); 
    // remove all position classes
    Util.removeClass(element.steps[element.visibleStep], 'p-tour__step--top p-tour__step--bottom p-tour__step--left p-tour__step--right p-tour__step--bottom-right p-tour__step--bottom-left p-tour__step--top-right p-tour__step--top-left');
    if(element.isMobile) {
      Util.addClass(element.steps[element.visibleStep], 'p-tour__step--current');
    } else {
      Util.addClass(element.steps[element.visibleStep], 'p-tour__step--current '+classPosition);
    }
    
    if(direction) {
      // mobile animation
      Util.removeClass(element.steps[element.visibleStep], 'p-tour__step--m-left p-tour__step--m-right');
    }
    // move focus to first action button
    var btnAction = element.steps[element.visibleStep].querySelector('button');
    if(btnAction) btnAction.focus();
  };

  function animateBg(element) {
    Util.addClass(element.bg[0], 'p-tour__background--animate');
  };

  function updateLayout(element) {
    var layout = getComputedStyle(element.element).getPropertyValue('--p-tour-layout').replace(/'/g, '').replace(/"/g, '').trim();
    // on resize -> check tour layout type
    element.isMobile = (layout == 'mobile');
    // init steps
    initStepsPosition(element);
  };

  function initStepsPosition(element) {
    if(!element.isMobile) {
      for(var i = 0; i < element.steps.length; i++) Util.removeClass(element.steps[i], 'p-tour__step--m-left p-tour__step--m-right');
    } else {
      for(var i = 0; i < element.steps.length; i++) {
        element.steps[i].style.top = '';
        element.steps[i].style.left = '';
        if(i < element.visibleStep) {
          Util.addClass(element.steps[i], 'p-tour__step--m-left');
          Util.removeClass(element.steps[i], 'p-tour__step--m-right');
        } else if(i > element.visibleStep) {
          Util.addClass(element.steps[i], 'p-tour__step--m-right');
          Util.removeClass(element.steps[i], 'p-tour__step--m-left');
        } else {
          Util.removeClass(element.steps[i], 'p-tour__step--m-right');
          Util.removeClass(element.steps[i], 'p-tour__step--m-left');
        }
      }
    }
  };

  function resetTour(element) {
    for(var i = 0; i < element.steps.length; i++) {
      Util.removeClass(element.steps[i], 'p-tour__step--current');
    }
    Util.removeClass(element.bg[0], 'p-tour__background--animate');
  };

  function getPinPosition(element) {
    var tourPosition = element.targetPositions[element.visibleStep],
      stepTargetPosition = element.targets[element.visibleStep].getBoundingClientRect();
    var position = [0, 0]; // [top, left]

    switch (tourPosition) {
      case 'bottom':
        position[0] = stepTargetPosition.bottom;
        position[1] = stepTargetPosition.left + stepTargetPosition.width/2;
        break;
      case 'top':
        position[0] = stepTargetPosition.top;
        position[1] = stepTargetPosition.left + stepTargetPosition.width/2;
        break;
      case 'left':
        position[0] = stepTargetPosition.top + stepTargetPosition.height/2;
        position[1] = stepTargetPosition.left;
        break;
      case 'right':
        position[0] = stepTargetPosition.top + stepTargetPosition.height/2;
        position[1] = stepTargetPosition.left + stepTargetPosition.width;
        break;
      case 'center':
        position[0] = stepTargetPosition.top + stepTargetPosition.height/2;
        position[1] = stepTargetPosition.left + stepTargetPosition.width/2;
        break;
      case 'bottom-right':
        position[0] = stepTargetPosition.top + stepTargetPosition.height;
        position[1] = stepTargetPosition.left + stepTargetPosition.width;
        break;
      case 'bottom-left':
        position[0] = stepTargetPosition.top + stepTargetPosition.height;
        position[1] = stepTargetPosition.left;
        break;
      case 'top-right':
        position[0] = stepTargetPosition.top;
        position[1] = stepTargetPosition.left + stepTargetPosition.width;
        break;
      case 'top-left':
        position[0] = stepTargetPosition.top;
        position[1] = stepTargetPosition.left;
        break;
    }
    return position;
  };

  function setPosition(element, position) {
    // position = [top, left]
    if(position[0] !== false) element.style.top = position[0]+'px';
    if(position[1] !== false) element.style.left = position[1]+'px';
  };

  function setTooltipPosition(element, position) {
    if(element.isMobile) return false;
    var layout = element.targetPositions[element.visibleStep];
    if(layout == 'center') layout == 'top';
    var tooltipInfo = getTooltipInfo(element, layout, position);
    setPosition(element.steps[element.visibleStep], tooltipInfo[1]);
    return 'p-tour__step--'+tooltipInfo[0];
  };

  function getTooltipInfo(element, layout, position) {
    switch (layout) {
      case 'bottom':
      case 'center':
        var result = checkPosition(element, 'tooltipBottom', 'tooltipTop', 'tooltipLeft', 'tooltipRight', 'tooltipBottomLeft', 'tooltipBottomRight', 'tooltipTopLeft', 'tooltipTopRight', position);
        break;
      case 'top':
        var result = checkPosition(element, 'tooltipTop', 'tooltipBottom', 'tooltipLeft', 'tooltipRight', 'tooltipBottomLeft', 'tooltipBottomRight', 'tooltipTopLeft', 'tooltipTopRight', position);
        break;
      case 'left':
      case 'bottom-left':
      case 'top-left':
        var result = checkPosition(element, 'tooltipLeft', 'tooltipTop', 'tooltipBottom', 'tooltipRight', 'tooltipBottomLeft', 'tooltipBottomRight', 'tooltipTopLeft', 'tooltipTopRight', position);
        break;
      case 'right':
      case 'bottom-right':
      case 'top-right':
        var result = checkPosition(element, 'tooltipRight', 'tooltipLeft', 'tooltipTop', 'tooltipBottom', 'tooltipBottomLeft', 'tooltipBottomRight', 'tooltipTopLeft', 'tooltipTopRight', position);
        break;
    }
    return [result[1], result[0]];
  };

  function checkPosition(element, pos1, pos2, pos3, pos4, pos5, pos6, pos7, pos8, position) {
    var result = element[pos1](element, position);
    if(result[0]) return [result[1], result[2]];
    result = element[pos2](element, position);
    if(result[0]) return [result[1], result[2]];
    result = element[pos3](element, position);
    if(result[0]) return [result[1], result[2]];
    result = element[pos4](element, position);
    if(result[0]) return [result[1], result[2]];
    result = element[pos5](element, position);
    if(result[0]) return [result[1], result[2]];
    result = element[pos6](element, position);
    if(result[0]) return [result[1], result[2]];
    result = element[pos7](element, position);
    if(result[0]) return [result[1], result[2]];
    result = element[pos8](element, position);
    if(result[0]) return [result[1], result[2]];
    return [[position[0], position[1] - element.steps[element.visibleStep].getBoundingClientRect().width], 'bottom'];
  };

  function tooltipBottom(element, position) {
    // check if tooltip can be placed below the pin
    var tooltipBox = element.steps[element.visibleStep].getBoundingClientRect();
    if(tooltipBox.height + position[0] > window.innerHeight && position[0] > tooltipBox.height) {
      return [false, false, false]; 
    }
    if(position[1] - tooltipBox.width/2 < 0 && position[1] + tooltipBox.width < window.innerWidth) {
      return [false, false, false]; 
    }

    if(position[1] + tooltipBox.width > window.innerWidth && position[1] - tooltipBox.width > 0) {
      return [false, false, false]; 
    }
    return [true, [position[0], position[1] - tooltipBox.width/2], 'bottom'];
  };

  function tooltipTop(element, position) {
    // check if tooltip can be placed on top of the pin
    var tooltipBox = element.steps[element.visibleStep].getBoundingClientRect();
    if( position[0] < tooltipBox.height && position[0] + tooltipBox.height < window.innerHeight) {
      return [false, false, false]; 
    }
    if(position[1] - tooltipBox.width/2 < 0 && position[1] + tooltipBox.width < window.innerWidth) {
      return [false, false, false]; 
    }
    
    if(position[1] + tooltipBox.width/2 > window.innerWidth && position[1] - tooltipBox.width > 0) {
      return [false, false, false]; 
    }
    return [true, [position[0] - tooltipBox.height, position[1] - tooltipBox.width/2], 'top'];
  };

  function tooltipLeft(element, position) {
    // check if tooltip can be placed to the left of the pin
    var tooltipBox = element.steps[element.visibleStep].getBoundingClientRect();
    if(position[1] < tooltipBox.width && position[1] + tooltipBox.width < window.innerWidth) return [false, false, false];
    if(position[0] < tooltipBox.height/2 && position[0] + tooltipBox.height < window.innerHeight) return [false, false, false];
    if(position[0] + tooltipBox.height/2 >  window.innerHeight && position[0] > tooltipBox.height) return [false, false, false];
    return [true, [position[0] - tooltipBox.height/2, position[1] - tooltipBox.width], 'left'];
  };

  function tooltipRight(element, position) {
    // check if tooltip can be placed to the right of the pin
    var tooltipBox = element.steps[element.visibleStep].getBoundingClientRect();
    if(position[1] + tooltipBox.width > window.innerWidth && position[1] > tooltipBox.width) return [false, false, false];
    if(position[0] < tooltipBox.height/2 && position[0] + tooltipBox.height < window.innerHeight) return [false, false, false];
    if(position[0] + tooltipBox.height/2 >  window.innerHeight && position[0] > tooltipBox.height) return [false, false, false];
    return [true, [position[0] - tooltipBox.height/2, position[1]], 'right'];
  };

  function tooltipBottomLeft(element, position) {
    // check if tooltip can be placed to the bottom-left of the pin
    var tooltipBox = element.steps[element.visibleStep].getBoundingClientRect();
    if(position[1] < tooltipBox.width && position[1] + tooltipBox.width < window.innerWidth) return [false, false, false];
    if(position[0] + tooltipBox.height > window.innerHeight && position[0] > tooltipBox.height) return [false, false, false];
    return [true, [position[0], position[1] - tooltipBox.width], 'bottom-left'];
  };

  function tooltipTopLeft(element, position) {
    // check if tooltip can be placed to the top-left of the pin
    var tooltipBox = element.steps[element.visibleStep].getBoundingClientRect();
    if(position[1] < tooltipBox.width && position[1] + tooltipBox.width < window.innerWidth) return [false, false, false];
    if(position[0] < tooltipBox.height && position[0] + tooltipBox.height < window.innerHeight) return [false, false, false];
    return [true, [position[0] - tooltipBox.height, position[1] - tooltipBox.width], 'top-left'];
  };

  function tooltipBottomRight(element, position) {
    // check if tooltip can be placed to the bottom-right of the pin
    var tooltipBox = element.steps[element.visibleStep].getBoundingClientRect();
    if(position[1] + tooltipBox.width > window.innerWidth && position[1] > tooltipBox.width) return [false, false, false];
    if(position[0] + tooltipBox.height > window.innerHeight && position[0] > tooltipBox.height) return [false, false, false];
    return [true, [position[0], position[1]], 'bottom-right'];
  };

  function tooltipTopRight(element, position) {
    // check if tooltip can be placed to the top-right of the pin
    var tooltipBox = element.steps[element.visibleStep].getBoundingClientRect();
    if(position[1] + tooltipBox.width > window.innerWidth && position[1] > tooltipBox.width) return [false, false, false];
    if(position[0] < tooltipBox.height && position[0] + tooltipBox.height < window.innerHeight) return [false, false, false];
    return [true, [position[0] - tooltipBox.height, position[1]], 'top-right'];
  };

  window.PTour = PTour;

  //initialize the PTour objects
	var pTour = document.getElementsByClassName('js-p-tour');
	if( pTour.length > 0 ) {
		for( var i = 0; i < pTour.length; i++) {
			(function(i){new PTour(pTour[i], true);})(i);
		}
	};
}());
// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName('body')[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};


// File#: _1_read-more
// Usage: codyhouse.co/license
(function() {
  var ReadMore = function(element) {
    this.element = element;
    this.moreContent = this.element.getElementsByClassName('js-read-more__content');
    this.count = this.element.getAttribute('data-characters') || 200;
    this.counting = 0;
    this.btnClasses = this.element.getAttribute('data-btn-class');
    this.ellipsis = this.element.getAttribute('data-ellipsis') && this.element.getAttribute('data-ellipsis') == 'off' ? false : true;
    this.btnShowLabel = 'Read more';
    this.btnHideLabel = 'Read less';
    this.toggleOff = this.element.getAttribute('data-toggle') && this.element.getAttribute('data-toggle') == 'off' ? false : true;
    if( this.moreContent.length == 0 ) splitReadMore(this);
    setBtnLabels(this);
    initReadMore(this);
  };

  function splitReadMore(readMore) { 
    splitChildren(readMore.element, readMore); // iterate through children and hide content
  };

  function splitChildren(parent, readMore) {
    if(readMore.counting >= readMore.count) {
      Util.addClass(parent, 'js-read-more__content');
      return parent.outerHTML;
    }
    var children = parent.childNodes;
    var content = '';
    for(var i = 0; i < children.length; i++) {
      if (children[i].nodeType == Node.TEXT_NODE) {
        content = content + wrapText(children[i], readMore);
      } else {
        content = content + splitChildren(children[i], readMore);
      }
    }
    parent.innerHTML = content;
    return parent.outerHTML;
  };

  function wrapText(element, readMore) {
    var content = element.textContent;
    if(content.replace(/\s/g,'').length == 0) return '';// check if content is empty
    if(readMore.counting >= readMore.count) {
      return '<span class="js-read-more__content">' + content + '</span>';
    }
    if(readMore.counting + content.length < readMore.count) {
      readMore.counting = readMore.counting + content.length;
      return content;
    }
    var firstContent = content.substr(0, readMore.count - readMore.counting);
    firstContent = firstContent.substr(0, Math.min(firstContent.length, firstContent.lastIndexOf(" ")));
    var secondContent = content.substr(firstContent.length, content.length);
    readMore.counting = readMore.count;
    return firstContent + '<span class="js-read-more__content">' + secondContent + '</span>';
  };

  function setBtnLabels(readMore) { // set custom labels for read More/Less btns
    var btnLabels = readMore.element.getAttribute('data-btn-labels');
    if(btnLabels) {
      var labelsArray = btnLabels.split(',');
      readMore.btnShowLabel = labelsArray[0].trim();
      readMore.btnHideLabel = labelsArray[1].trim();
    }
  };

  function initReadMore(readMore) { // add read more/read less buttons to the markup
    readMore.moreContent = readMore.element.getElementsByClassName('js-read-more__content');
    if( readMore.moreContent.length == 0 ) {
      Util.addClass(readMore.element, 'read-more--loaded');
      return;
    }
    var btnShow = ' <button class="js-read-more__btn '+readMore.btnClasses+'">'+readMore.btnShowLabel+'</button>';
    var btnHide = ' <button class="js-read-more__btn rh9-hide '+readMore.btnClasses+'">'+readMore.btnHideLabel+'</button>';
    if(readMore.ellipsis) {
      btnShow = '<span class="js-read-more__ellipsis" aria-hidden="true">...</span>'+ btnShow;
    }

    readMore.moreContent[readMore.moreContent.length - 1].insertAdjacentHTML('afterend', btnHide);
    readMore.moreContent[0].insertAdjacentHTML('afterend', btnShow);
    resetAppearance(readMore);
    initEvents(readMore);
  };

  function resetAppearance(readMore) { // hide part of the content
    for(var i = 0; i < readMore.moreContent.length; i++) Util.addClass(readMore.moreContent[i], 'rh9-hide');
    Util.addClass(readMore.element, 'read-more--loaded'); // show entire component
  };

  function initEvents(readMore) { // listen to the click on the read more/less btn
    readMore.btnToggle = readMore.element.getElementsByClassName('js-read-more__btn');
    readMore.ellipsis = readMore.element.getElementsByClassName('js-read-more__ellipsis');

    readMore.btnToggle[0].addEventListener('click', function(event){
      event.preventDefault();
      updateVisibility(readMore, true);
    });
    readMore.btnToggle[1].addEventListener('click', function(event){
      event.preventDefault();
      updateVisibility(readMore, false);
    });
  };

  function updateVisibility(readMore, visibile) {
    for(var i = 0; i < readMore.moreContent.length; i++) Util.toggleClass(readMore.moreContent[i], 'rh9-hide', !visibile);
    // reset btns appearance
    Util.toggleClass(readMore.btnToggle[0], 'rh9-hide', visibile);
    Util.toggleClass(readMore.btnToggle[1], 'rh9-hide', !visibile);
    if(readMore.ellipsis.length > 0 ) Util.toggleClass(readMore.ellipsis[0], 'rh9-hide', visibile);
    if(!readMore.toggleOff) Util.addClass(readMore.btn, 'rh9-hide');
    // move focus
    if(visibile) {
      var targetTabIndex = readMore.moreContent[0].getAttribute('tabindex');
      Util.moveFocus(readMore.moreContent[0]);
      resetFocusTarget(readMore.moreContent[0], targetTabIndex);
    } else {
      Util.moveFocus(readMore.btnToggle[0]);
    }
  };

  function resetFocusTarget(target, tabindex) {
    if( parseInt(target.getAttribute('tabindex')) < 0) {
			target.style.outline = 'none';
			!tabindex && target.removeAttribute('tabindex');
		}
  };

  //initialize the ReadMore objects
	var readMore = document.getElementsByClassName('js-read-more');
	if( readMore.length > 0 ) {
		for( var i = 0; i < readMore.length; i++) {
			(function(i){new ReadMore(readMore[i]);})(i);
		}
	};
}());
// File#: _1_3d-drawer
// Usage: codyhouse.co/license
(function() {
	var TdDrawer = function(element) {
    this.element = element;
    this.mianContent = document.getElementsByClassName('js-td-drawer-main');
		this.content = document.getElementsByClassName('js-td-drawer__body');
		this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.selectedTrigger = null;
    this.showClass = "td-drawer--is-visible";
    this.showMainClass = "td-drawer-main--drawer-is-visible";
		initDrawer(this);
  };
  
  function initDrawer(drawer) {
    // open drawer when clicking on trigger buttons
		for(var i = 0; i < drawer.triggers.length; i++) {
			drawer.triggers[i].addEventListener('click', function(event) {
				event.preventDefault();
				if(drawer.element.classList.contains(drawer.showClass)) {
					closeDrawer(drawer);
					return;
				}
				drawer.selectedTrigger = event.target;
				showDrawer(drawer);
				initDrawerEvents(drawer);
			});
		}
		
		// if drawer is already open -> we should initialize the drawer events
		if(drawer.element.classList.contains(drawer.showClass)) initDrawerEvents(drawer);
  };

  function showDrawer(drawer) {
    if(drawer.content.length  > 0 ) drawer.content[0].scrollTop = 0;
    if(drawer.mianContent.length > 0 ) drawer.mianContent[0].classList.add(drawer.showMainClass);
		drawer.element.classList.add(drawer.showClass);
	  getFocusableElements(drawer);
		focusDrawer(drawer);
		// wait for the end of transitions before moving focus
		drawer.element.addEventListener("transitionend", function cb(event) {
			focusDrawer(drawer);
			drawer.element.removeEventListener("transitionend", cb);
		});
		emitDrawerEvents(drawer, 'drawerIsOpen');
  };

	function focusDrawer(drawer) {
		drawer.element.setAttribute('tabindex','-1'); 
		drawer.element.focus();
	};

  function closeDrawer(drawer) {
    if(drawer.mianContent.length > 0) drawer.mianContent[0].classList.remove(drawer.showMainClass);
		drawer.element.classList.remove(drawer.showClass);
		drawer.firstFocusable = null;
		drawer.lastFocusable = null;
		if(drawer.selectedTrigger) drawer.selectedTrigger.focus();
		//remove listeners
		cancelDrawerEvents(drawer);
		emitDrawerEvents(drawer, 'drawerIsClose');
  };

  function initDrawerEvents(drawer) {
    //add event listeners
    drawer.element.addEventListener('keydown', handleEvent.bind(drawer));
    drawer.element.addEventListener('click', handleEvent.bind(drawer));
  };

  function cancelDrawerEvents(drawer) {
		//remove event listeners
		drawer.element.removeEventListener('keydown', handleEvent.bind(drawer));
		drawer.element.removeEventListener('click', handleEvent.bind(drawer));
  };

  function handleEvent(event) {
    switch(event.type) {
      case 'click': {
        initClick(this, event);
      }
      case 'keydown': {
        initKeyDown(this, event);
      }
    }
  };

  function initKeyDown(drawer, event) {
    if( event.keyCode && event.keyCode == 27 || event.key && event.key == 'Escape' ) {
      //close drawer window on esc
      closeDrawer(drawer);
    } else if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
      //trap focus inside drawer
      trapFocus(drawer, event);
    }
  };

  function initClick(drawer, event) {
    //close drawer when clicking on close button or drawer bg layer 
		if( !event.target.closest('.js-td-drawer__close') && !event.target.classList.contains('js-td-drawer')) return;
		event.preventDefault();
		closeDrawer(drawer);
  };

  function trapFocus(drawer, event) {
    if( drawer.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of drawer
			event.preventDefault();
			drawer.lastFocusable.focus();
		}
		if( drawer.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of drawer
			event.preventDefault();
			drawer.firstFocusable.focus();
		}
  };

  function getFocusableElements(drawer) {
    //get all focusable elements inside the drawer
		var allFocusable = drawer.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		getFirstVisible(drawer, allFocusable);
		getLastVisible(drawer, allFocusable);
  };

  function getFirstVisible(drawer, elements) {
    //get first visible focusable element inside the drawer
		for(var i = 0; i < elements.length; i++) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				drawer.firstFocusable = elements[i];
				return true;
			}
		}
  };

  function getLastVisible(drawer, elements) {
    //get last visible focusable element inside the drawer
		for(var i = elements.length - 1; i >= 0; i--) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				drawer.lastFocusable = elements[i];
				return true;
			}
		}
  };

  function emitDrawerEvents(drawer, eventName) {
    var event = new CustomEvent(eventName, {detail: drawer.selectedTrigger});
		drawer.element.dispatchEvent(event);
  };

	//initialize the Drawer objects
	var drawer = document.getElementsByClassName('js-td-drawer');
	if( drawer.length > 0 ) {
		for( var i = 0; i < drawer.length; i++) {
			(function(i){new TdDrawer(drawer[i]);})(i);
		}
	}
}());
// File#: _1_menu
// Usage: codyhouse.co/license
(function() {
	var Menu = function(element) {
		this.element = element;
		this.elementId = this.element.getAttribute('id');
		this.menuItems = this.element.getElementsByClassName('js-menu__content');
		this.trigger = document.querySelectorAll('[aria-controls="'+this.elementId+'"]');
		this.selectedTrigger = false;
		this.menuIsOpen = false;
		this.initMenu();
		this.initMenuEvents();
	};	

	Menu.prototype.initMenu = function() {
		// init aria-labels
		for(var i = 0; i < this.trigger.length; i++) {
			this.trigger[i].setAttribute('aria-expanded', 'false');
			this.trigger[i].setAttribute('aria-haspopup', 'true');
		}
		// init tabindex
		for(var i = 0; i < this.menuItems.length; i++) {
			this.menuItems[i].setAttribute('tabindex', '0');
		}
	};

	Menu.prototype.initMenuEvents = function() {
		var self = this;
		for(var i = 0; i < this.trigger.length; i++) {(function(i){
			self.trigger[i].addEventListener('click', function(event){
				event.preventDefault();
				// if the menu had been previously opened by another trigger element -> close it first and reopen in the right position
				if(self.element.classList.contains('menu--is-visible') && self.selectedTrigger !=  self.trigger[i]) {
					self.toggleMenu(false, false); // close menu
				}
				// toggle menu
				self.selectedTrigger = self.trigger[i];
				self.toggleMenu(!self.element.classList.contains('menu--is-visible'), true);
			});
		})(i);}
		
		// keyboard events
		this.element.addEventListener('keydown', function(event) {
			// use up/down arrow to navigate list of menu items
			if( !event.target.classList.contains('js-menu__content') ) return;
			if( (event.keyCode && event.keyCode == 40) || (event.key && event.key.toLowerCase() == 'arrowdown') ) {
				self.navigateItems(event, 'next');
			} else if( (event.keyCode && event.keyCode == 38) || (event.key && event.key.toLowerCase() == 'arrowup') ) {
				self.navigateItems(event, 'prev');
			}
		});
	};

	Menu.prototype.toggleMenu = function(bool, moveFocus) {
		var self = this;
		// toggle menu visibility
		this.element.classList.toggle('menu--is-visible', bool);
		this.menuIsOpen = bool;
		if(bool) {
			this.selectedTrigger.setAttribute('aria-expanded', 'true');
			moveFocusFn(this.menuItems[0]);
			this.element.addEventListener("transitionend", function(event) {moveFocusFn(self.menuItems[0]);}, {once: true});
			// position the menu element
			this.positionMenu();
			// add class to menu trigger
			this.selectedTrigger.classList.add('menu-control--active');
		} else if(this.selectedTrigger) {
			this.selectedTrigger.setAttribute('aria-expanded', 'false');
			if(moveFocus) moveFocusFn(this.selectedTrigger);
			// remove class from menu trigger
			this.selectedTrigger.classList.remove('menu-control--active');
			this.selectedTrigger = false;
		}
	};

	Menu.prototype.positionMenu = function(event, direction) {
		var selectedTriggerPosition = this.selectedTrigger.getBoundingClientRect(),
			menuOnTop = (window.innerHeight - selectedTriggerPosition.bottom) < selectedTriggerPosition.top;
			// menuOnTop = window.innerHeight < selectedTriggerPosition.bottom + this.element.offsetHeight;
			
		var left = selectedTriggerPosition.left,
			right = (window.innerWidth - selectedTriggerPosition.right),
			isRight = (window.innerWidth < selectedTriggerPosition.left + this.element.offsetWidth);

		var horizontal = isRight ? 'right: '+right+'px;' : 'left: '+left+'px;',
			vertical = menuOnTop
				? 'bottom: '+(window.innerHeight - selectedTriggerPosition.top)+'px;'
				: 'top: '+selectedTriggerPosition.bottom+'px;';
		// check right position is correct -> otherwise set left to 0
		if( isRight && (right + this.element.offsetWidth) > window.innerWidth) horizontal = 'left: '+ parseInt((window.innerWidth - this.element.offsetWidth)/2)+'px;';
		var maxHeight = menuOnTop ? selectedTriggerPosition.top - 20 : window.innerHeight - selectedTriggerPosition.bottom - 20;
		this.element.setAttribute('style', horizontal + vertical +'max-height:'+Math.floor(maxHeight)+'px;');
	};

	Menu.prototype.navigateItems = function(event, direction) {
		event.preventDefault();
		var index = Array.prototype.indexOf.call(this.menuItems, event.target),
			nextIndex = direction == 'next' ? index + 1 : index - 1;
		if(nextIndex < 0) nextIndex = this.menuItems.length - 1;
		if(nextIndex > this.menuItems.length - 1) nextIndex = 0;
		moveFocusFn(this.menuItems[nextIndex]);
	};

	Menu.prototype.checkMenuFocus = function() {
		var menuParent = document.activeElement.closest('.js-menu');
		if (!menuParent || !this.element.contains(menuParent)) this.toggleMenu(false, false);
	};

	Menu.prototype.checkMenuClick = function(target) {
		if( !this.element.contains(target) && !target.closest('[aria-controls="'+this.elementId+'"]')) this.toggleMenu(false);
	};

	function moveFocusFn(element) {
    element.focus();
    if (document.activeElement !== element) {
      element.setAttribute('tabindex','-1');
      element.focus();
    }
  };

	window.Menu = Menu;

	//initialize the Menu objects
	var menus = document.getElementsByClassName('js-menu');
	if( menus.length > 0 ) {
		var menusArray = [];
		var scrollingContainers = [];
		for( var i = 0; i < menus.length; i++) {
			(function(i){
				menusArray.push(new Menu(menus[i]));
				var scrollableElement = menus[i].getAttribute('data-scrollable-element');
				if(scrollableElement && !scrollingContainers.includes(scrollableElement)) scrollingContainers.push(scrollableElement);
			})(i);
		}

		// listen for key events
		window.addEventListener('keyup', function(event){
			if( event.keyCode && event.keyCode == 9 || event.key && event.key.toLowerCase() == 'tab' ) {
				//close menu if focus is outside menu element
				menusArray.forEach(function(element){
					element.checkMenuFocus();
				});
			} else if( event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' ) {
				// close menu on 'Esc'
				menusArray.forEach(function(element){
					element.toggleMenu(false, false);
				});
			} 
		});
		// close menu when clicking outside it
		window.addEventListener('click', function(event){
			menusArray.forEach(function(element){
				element.checkMenuClick(event.target);
			});
		});
		// on resize -> close all menu elements
		window.addEventListener('resize', function(event){
			menusArray.forEach(function(element){
				element.toggleMenu(false, false);
			});
		});
		// on scroll -> close all menu elements
		window.addEventListener('scroll', function(event){
			menusArray.forEach(function(element){
				if(element.menuIsOpen) element.toggleMenu(false, false);
			});
		});
		// take into account additinal scrollable containers
		for(var j = 0; j < scrollingContainers.length; j++) {
			var scrollingContainer = document.querySelector(scrollingContainers[j]);
			if(scrollingContainer) {
				scrollingContainer.addEventListener('scroll', function(event){
					menusArray.forEach(function(element){
						if(element.menuIsOpen) element.toggleMenu(false, false);
					});
				});
			}
		}
	}
}());
// utility functions
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName('body')[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

Util.extend = function() {
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// File#: _2_slideshow
// Usage: codyhouse.co/license
(function() {
	var Slideshow = function(opts) {
		this.options = Util.extend(Slideshow.defaults , opts);
		this.element = this.options.element;
		this.items = this.element.getElementsByClassName('js-slideshow__item');
		this.controls = this.element.getElementsByClassName('js-slideshow__control'); 
		this.selectedSlide = 0;
		this.autoplayId = false;
		this.autoplayPaused = false;
		this.navigation = false;
		this.navCurrentLabel = false;
		this.ariaLive = false;
		this.moveFocus = false;
		this.animating = false;
		this.supportAnimation = Util.cssSupports('transition');
		this.animationOff = (!Util.hasClass(this.element, 'slideshow--transition-fade') && !Util.hasClass(this.element, 'slideshow--transition-slide') && !Util.hasClass(this.element, 'slideshow--transition-prx'));
		this.animationType = Util.hasClass(this.element, 'slideshow--transition-prx') ? 'prx' : 'slide';
		this.animatingClass = 'slideshow--is-animating';
		initSlideshow(this);
		initSlideshowEvents(this);
		initAnimationEndEvents(this);
	};

	Slideshow.prototype.showNext = function() {
		showNewItem(this, this.selectedSlide + 1, 'next');
	};

	Slideshow.prototype.showPrev = function() {
		showNewItem(this, this.selectedSlide - 1, 'prev');
	};

	Slideshow.prototype.showItem = function(index) {
		showNewItem(this, index, false);
	};

	Slideshow.prototype.startAutoplay = function() {
		var self = this;
		if(this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
			self.autoplayId = setInterval(function(){
				self.showNext();
			}, self.options.autoplayInterval);
		}
	};

	Slideshow.prototype.pauseAutoplay = function() {
		var self = this;
		if(this.options.autoplay) {
			clearInterval(self.autoplayId);
			self.autoplayId = false;
		}
	};

	function initSlideshow(slideshow) { // basic slideshow settings
		// if no slide has been selected -> select the first one
		if(slideshow.element.getElementsByClassName('slideshow__item--selected').length < 1) Util.addClass(slideshow.items[0], 'slideshow__item--selected');
		slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('slideshow__item--selected')[0]);
		// create an element that will be used to announce the new visible slide to SR
		var srLiveArea = document.createElement('div');
		Util.setAttributes(srLiveArea, {'class': 'sq7-sr-only js-slideshow__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
		slideshow.element.appendChild(srLiveArea);
		slideshow.ariaLive = srLiveArea;
	};

	function initSlideshowEvents(slideshow) {
		// if slideshow navigation is on -> create navigation HTML and add event listeners
		if(slideshow.options.navigation) {
			// check if navigation has already been included
			if(slideshow.element.getElementsByClassName('js-slideshow__navigation').length == 0) {
				var navigation = document.createElement('ol'),
					navChildren = '';

				var navClasses = slideshow.options.navigationClass+' js-slideshow__navigation';
				if(slideshow.items.length <= 1) {
					navClasses = navClasses + ' sq7-hide';
				}
				
				navigation.setAttribute('class', navClasses);
				for(var i = 0; i < slideshow.items.length; i++) {
					var className = (i == slideshow.selectedSlide) ? 'class="'+slideshow.options.navigationItemClass+' '+slideshow.options.navigationItemClass+'--selected js-slideshow__nav-item"' :  'class="'+slideshow.options.navigationItemClass+' js-slideshow__nav-item"',
						navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="sq7-sr-only js-slideshow__nav-current-label">Current Item</span>' : '';
					navChildren = navChildren + '<li '+className+'><button><span class="sq7-sr-only">'+ (i+1) + '</span>'+navCurrentLabel+'</button></li>';
				}
				navigation.innerHTML = navChildren;
				slideshow.element.appendChild(navigation);
			}
			
			slideshow.navCurrentLabel = slideshow.element.getElementsByClassName('js-slideshow__nav-current-label')[0]; 
			slideshow.navigation = slideshow.element.getElementsByClassName('js-slideshow__nav-item');

			var dotsNavigation = slideshow.element.getElementsByClassName('js-slideshow__navigation')[0];

			dotsNavigation.addEventListener('click', function(event){
				navigateSlide(slideshow, event, true);
			});
			dotsNavigation.addEventListener('keyup', function(event){
				navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
			});
		}
		// slideshow arrow controls
		if(slideshow.controls.length > 0) {
			// hide controls if one item available
			if(slideshow.items.length <= 1) {
				Util.addClass(slideshow.controls[0], 'sq7-hide');
				Util.addClass(slideshow.controls[1], 'sq7-hide');
			}
			slideshow.controls[0].addEventListener('click', function(event){
				event.preventDefault();
				slideshow.showPrev();
				updateAriaLive(slideshow);
			});
			slideshow.controls[1].addEventListener('click', function(event){
				event.preventDefault();
				slideshow.showNext();
				updateAriaLive(slideshow);
			});
		}
		// swipe events
		if(slideshow.options.swipe) {
			//init swipe
			new SwipeContent(slideshow.element);
			slideshow.element.addEventListener('swipeLeft', function(event){
				slideshow.showNext();
			});
			slideshow.element.addEventListener('swipeRight', function(event){
				slideshow.showPrev();
			});
		}
		// autoplay
		if(slideshow.options.autoplay) {
			slideshow.startAutoplay();
			// pause autoplay if user is interacting with the slideshow
			if(!slideshow.options.autoplayOnHover) {
				slideshow.element.addEventListener('mouseenter', function(event){
					slideshow.pauseAutoplay();
					slideshow.autoplayPaused = true;
				});
				slideshow.element.addEventListener('mouseleave', function(event){
					slideshow.autoplayPaused = false;
					slideshow.startAutoplay();
				});
			}
			if(!slideshow.options.autoplayOnFocus) {
				slideshow.element.addEventListener('focusin', function(event){
					slideshow.pauseAutoplay();
					slideshow.autoplayPaused = true;
				});
				slideshow.element.addEventListener('focusout', function(event){
					slideshow.autoplayPaused = false;
					slideshow.startAutoplay();
				});
			}
		}
		// detect if external buttons control the slideshow
		var slideshowId = slideshow.element.getAttribute('id');
		if(slideshowId) {
			var externalControls = document.querySelectorAll('[data-controls="'+slideshowId+'"]');
			for(var i = 0; i < externalControls.length; i++) {
				(function(i){externalControlSlide(slideshow, externalControls[i]);})(i);
			}
		}
		// custom event to trigger selection of a new slide element
		slideshow.element.addEventListener('selectNewItem', function(event){
			// check if slide is already selected
			if(event.detail) {
				if(event.detail - 1 == slideshow.selectedSlide) return;
				showNewItem(slideshow, event.detail - 1, false);
			}
		});

		// keyboard navigation
		slideshow.element.addEventListener('keydown', function(event){
			if(event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright') {
				slideshow.showNext();
			} else if(event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft') {
				slideshow.showPrev();
			}
		});
	};

	function navigateSlide(slideshow, event, keyNav) { 
		// user has interacted with the slideshow navigation -> update visible slide
		var target = ( Util.hasClass(event.target, 'js-slideshow__nav-item') ) ? event.target : event.target.closest('.js-slideshow__nav-item');
		if(keyNav && target && !Util.hasClass(target, 'slideshow__nav-item--selected')) {
			slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
			slideshow.moveFocus = true;
			updateAriaLive(slideshow);
		}
	};

	function initAnimationEndEvents(slideshow) {
		// remove animation classes at the end of a slide transition
		for( var i = 0; i < slideshow.items.length; i++) {
			(function(i){
				slideshow.items[i].addEventListener('animationend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
				slideshow.items[i].addEventListener('transitionend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
			})(i);
		}
	};

	function resetAnimationEnd(slideshow, item) {
		setTimeout(function(){ // add a delay between the end of animation and slideshow reset - improve animation performance
			if(Util.hasClass(item,'slideshow__item--selected')) {
				if(slideshow.moveFocus) Util.moveFocus(item);
				emitSlideshowEvent(slideshow, 'newItemVisible', slideshow.selectedSlide);
				slideshow.moveFocus = false;
			}
			Util.removeClass(item, 'slideshow__item--'+slideshow.animationType+'-out-left slideshow__item--'+slideshow.animationType+'-out-right slideshow__item--'+slideshow.animationType+'-in-left slideshow__item--'+slideshow.animationType+'-in-right');
			item.removeAttribute('aria-hidden');
			slideshow.animating = false;
			Util.removeClass(slideshow.element, slideshow.animatingClass); 
		}, 100);
	};

	function showNewItem(slideshow, index, bool) {
		if(slideshow.items.length <= 1) return;
		if(slideshow.animating && slideshow.supportAnimation) return;
		slideshow.animating = true;
		Util.addClass(slideshow.element, slideshow.animatingClass); 
		if(index < 0) index = slideshow.items.length - 1;
		else if(index >= slideshow.items.length) index = 0;
		// skip slideshow item if it is hidden
		if(bool && Util.hasClass(slideshow.items[index], 'sq7-hide')) {
			slideshow.animating = false;
			index = bool == 'next' ? index + 1 : index - 1;
			showNewItem(slideshow, index, bool);
			return;
		}
		// index of new slide is equal to index of slide selected item
		if(index == slideshow.selectedSlide) {
			slideshow.animating = false;
			return;
		}
		var exitItemClass = getExitItemClass(slideshow, bool, slideshow.selectedSlide, index);
		var enterItemClass = getEnterItemClass(slideshow, bool, slideshow.selectedSlide, index);
		// transition between slides
		if(!slideshow.animationOff) Util.addClass(slideshow.items[slideshow.selectedSlide], exitItemClass);
		Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow__item--selected');
		slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //hide to sr element that is exiting the viewport
		if(slideshow.animationOff) {
			Util.addClass(slideshow.items[index], 'slideshow__item--selected');
		} else {
			Util.addClass(slideshow.items[index], enterItemClass+' slideshow__item--selected');
		}
		// reset slider navigation appearance
		resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
		slideshow.selectedSlide = index;
		// reset autoplay
		slideshow.pauseAutoplay();
		slideshow.startAutoplay();
		// reset controls/navigation color themes
		resetSlideshowTheme(slideshow, index);
		// emit event
		emitSlideshowEvent(slideshow, 'newItemSelected', slideshow.selectedSlide);
		if(slideshow.animationOff) {
			slideshow.animating = false;
			Util.removeClass(slideshow.element, slideshow.animatingClass);
		}
	};

	function getExitItemClass(slideshow, bool, oldIndex, newIndex) {
		var className = '';
		if(bool) {
			className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-out-right' : 'slideshow__item--'+slideshow.animationType+'-out-left'; 
		} else {
			className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-out-left' : 'slideshow__item--'+slideshow.animationType+'-out-right';
		}
		return className;
	};

	function getEnterItemClass(slideshow, bool, oldIndex, newIndex) {
		var className = '';
		if(bool) {
			className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-in-right' : 'slideshow__item--'+slideshow.animationType+'-in-left'; 
		} else {
			className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-in-left' : 'slideshow__item--'+slideshow.animationType+'-in-right';
		}
		return className;
	};

	function resetSlideshowNav(slideshow, newIndex, oldIndex) {
		if(slideshow.navigation) {
			Util.removeClass(slideshow.navigation[oldIndex], 'slideshow__nav-item--selected');
			Util.addClass(slideshow.navigation[newIndex], 'slideshow__nav-item--selected');
			slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
			slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
		}
	};

	function resetSlideshowTheme(slideshow, newIndex) {
		var dataTheme = slideshow.items[newIndex].getAttribute('data-theme');
		if(dataTheme) {
			if(slideshow.navigation) slideshow.navigation[0].parentElement.setAttribute('data-theme', dataTheme);
			if(slideshow.controls[0]) slideshow.controls[0].parentElement.setAttribute('data-theme', dataTheme);
		} else {
			if(slideshow.navigation) slideshow.navigation[0].parentElement.removeAttribute('data-theme');
			if(slideshow.controls[0]) slideshow.controls[0].parentElement.removeAttribute('data-theme');
		}
	};

	function emitSlideshowEvent(slideshow, eventName, detail) {
		var event = new CustomEvent(eventName, {detail: detail});
		slideshow.element.dispatchEvent(event);
	};

	function updateAriaLive(slideshow) {
		slideshow.ariaLive.innerHTML = 'Item '+(slideshow.selectedSlide + 1)+' of '+slideshow.items.length;
	};

	function externalControlSlide(slideshow, button) { // control slideshow using external element
		button.addEventListener('click', function(event){
			var index = button.getAttribute('data-index');
			if(!index || index == slideshow.selectedSlide + 1) return;
			event.preventDefault();
			showNewItem(slideshow, index - 1, false);
		});
	};

	Slideshow.defaults = {
    element : '',
    navigation : true,
    autoplay : false,
		autoplayOnHover: false,
		autoplayOnFocus: false,
    autoplayInterval: 5000,
		navigationItemClass: 'slideshow__nav-item',
    navigationClass: 'slideshow__navigation',
    swipe: false
  };

	window.Slideshow = Slideshow;
	
	//initialize the Slideshow objects
	var slideshows = document.getElementsByClassName('js-slideshow');
	if( slideshows.length > 0 ) {
		for( var i = 0; i < slideshows.length; i++) {
			(function(i){
				var navigation = (slideshows[i].getAttribute('data-navigation') && slideshows[i].getAttribute('data-navigation') == 'off') ? false : true,
					autoplay = (slideshows[i].getAttribute('data-autoplay') && slideshows[i].getAttribute('data-autoplay') == 'on') ? true : false,
					autoplayOnHover = (slideshows[i].getAttribute('data-autoplay-hover') && slideshows[i].getAttribute('data-autoplay-hover') == 'on') ? true : false,
					autoplayOnFocus = (slideshows[i].getAttribute('data-autoplay-focus') && slideshows[i].getAttribute('data-autoplay-focus') == 'on') ? true : false,
					autoplayInterval = (slideshows[i].getAttribute('data-autoplay-interval')) ? slideshows[i].getAttribute('data-autoplay-interval') : 5000,
					swipe = (slideshows[i].getAttribute('data-swipe') && slideshows[i].getAttribute('data-swipe') == 'on') ? true : false,
					navigationItemClass = slideshows[i].getAttribute('data-navigation-item-class') ? slideshows[i].getAttribute('data-navigation-item-class') : 'slideshow__nav-item',
          navigationClass = slideshows[i].getAttribute('data-navigation-class') ? slideshows[i].getAttribute('data-navigation-class') : 'slideshow__navigation';
				new Slideshow({element: slideshows[i], navigation: navigation, autoplay : autoplay, autoplayOnHover: autoplayOnHover, autoplayOnFocus: autoplayOnFocus, autoplayInterval : autoplayInterval, swipe : swipe, navigationItemClass: navigationItemClass, navigationClass: navigationClass});
			})(i);
		}
	}
}());
// File#: _2_adv-custom-select
// Usage: codyhouse.co/license
(function() {
  var AdvSelect = function(element) {
    this.element = element;
    this.select = this.element.getElementsByTagName('select')[0];
    this.optGroups = this.select.getElementsByTagName('optgroup');
    this.options = this.select.getElementsByTagName('option');
    this.optionData = getOptionsData(this);
    this.selectId = this.select.getAttribute('id');
    this.selectLabel = document.querySelector('[for='+this.selectId+']')
    this.trigger = this.element.getElementsByClassName('js-adv-select__control')[0];
    this.triggerLabel = this.trigger.getElementsByClassName('js-adv-select__value')[0];
    this.dropdown = document.getElementById(this.trigger.getAttribute('aria-controls'));

    initAdvSelect(this); // init markup
    initAdvSelectEvents(this); // init event listeners
  };

  function getOptionsData(select) {
    var obj = [],
      dataset = select.options[0].dataset;

    function camelCaseToDash( myStr ) {
      return myStr.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
    }
    for (var prop in dataset) {
      if (Object.prototype.hasOwnProperty.call(dataset, prop)) {
        // obj[prop] = select.dataset[prop];
        obj.push(camelCaseToDash(prop));
      }
    }
    return obj;
  };

  function initAdvSelect(select) {
    // create custom structure
    createAdvStructure(select);
    // update trigger label
    updateTriggerLabel(select);
    // hide native select and show custom structure
    select.select.classList.add('adv-select-hide');
    select.trigger.classList.remove('adv-select-hide');
    select.dropdown.classList.remove('adv-select-hide');
  };

  function initAdvSelectEvents(select) {
    if(select.selectLabel) {
      // move focus to custom trigger when clicking on <select> label
      select.selectLabel.addEventListener('click', function(){
        select.trigger.focus();
      });
    }

    // option is selected in dropdown
    select.dropdown.addEventListener('click', function(event){
      triggerSelection(select, event.target);
    });

    // keyboard navigation
    select.dropdown.addEventListener('keydown', function(event){
      if(event.keyCode && event.keyCode == 38 || event.key && event.key.toLowerCase() == 'arrowup') {
        keyboardCustomSelect(select, 'prev', event);
      } else if(event.keyCode && event.keyCode == 40 || event.key && event.key.toLowerCase() == 'arrowdown') {
        keyboardCustomSelect(select, 'next', event);
      } else if(event.keyCode && event.keyCode == 13 || event.key && event.key.toLowerCase() == 'enter') {
        triggerSelection(select, document.activeElement);
      }
    });
  };

  function createAdvStructure(select) {
    // store optgroup and option structure
    var optgroup = select.dropdown.querySelector('[role="group"]'),
      option = select.dropdown.querySelector('[role="option"]'),
      optgroupClone = false,
      optgroupLabel = false,
      optionClone = false;
    if(optgroup) {
      optgroupClone = optgroup.cloneNode();
      optgroupLabel = document.getElementById(optgroupClone.getAttribute('describedby'));
    }
    if(option) optionClone = option.cloneNode(true);

    var dropdownCode = '';

    if(select.optGroups.length > 0) {
      for(var i = 0; i < select.optGroups.length; i++) {
        dropdownCode = dropdownCode + getOptGroupCode(select, select.optGroups[i], optgroupClone, optionClone, optgroupLabel, i);
      }
    } else {
      for(var i = 0; i < select.options.length; i++) {
        dropdownCode = dropdownCode + getOptionCode(select, select.options[i], optionClone);
      }
    }

    select.dropdown.innerHTML = dropdownCode;
  };

  function getOptGroupCode(select, optGroup, optGroupClone, optionClone, optgroupLabel, index) {
    if(!optGroupClone || !optionClone) return '';
    var code = '';
    var options = optGroup.getElementsByTagName('option');
    for(var i = 0; i < options.length; i++) {
      code = code + getOptionCode(select, options[i], optionClone);
    }
    if(optgroupLabel) {
      var label = optgroupLabel.cloneNode(true);
      var id = label.getAttribute('id') + '-'+index;
      label.setAttribute('id', id);
      optGroupClone.setAttribute('describedby', id);
      code = label.outerHTML.replace('{optgroup-label}', optGroup.getAttribute('label')) + code;
    } 
    optGroupClone.innerHTML = code;
    return optGroupClone.outerHTML;
  };

  function getOptionCode(select, option, optionClone) {
    optionClone.setAttribute('data-value', option.value);
    if(option.selected) {
      optionClone.setAttribute('aria-selected', 'true');
      optionClone.setAttribute('tabindex', '0');
    } else {
      optionClone.removeAttribute('aria-selected');
      optionClone.removeAttribute('tabindex');
    }
    var optionHtml = optionClone.outerHTML;
    optionHtml = optionHtml.replace('{option-label}', option.text);
    for(var i = 0; i < select.optionData.length; i++) {
      optionHtml = optionHtml.replace('{'+select.optionData[i]+'}', option.getAttribute('data-'+select.optionData[i]));
    }
    return optionHtml;
  };

  function updateTriggerLabel(select) {
    // select.triggerLabel.textContent = select.options[select.select.selectedIndex].text;
    select.triggerLabel.innerHTML = select.dropdown.querySelector('[aria-selected="true"]').innerHTML;
  };

  function triggerSelection(select, target) {
    var option = target.closest('[role="option"]');
    if(!option) return;
    selectOption(select, option);
  };

  function selectOption(select, option) {
    if(option.hasAttribute('aria-selected') && option.getAttribute('aria-selected') == 'true') {
      // selecting the same option
    } else { 
      var selectedOption = select.dropdown.querySelector('[aria-selected="true"]');
      if(selectedOption) {
        selectedOption.removeAttribute('aria-selected');
        selectedOption.removeAttribute('tabindex');
      }
      option.setAttribute('aria-selected', 'true');
      option.setAttribute('tabindex', '0');
      // new option has been selected -> update native <select> element and trigger label
      updateNativeSelect(select, option.getAttribute('data-value'));
      updateTriggerLabel(select);
    }
    // move focus back to trigger
    setTimeout(function(){
      select.trigger.click();
    });
  };

  function updateNativeSelect(select, selectedValue) {
    var selectedOption = select.select.querySelector('[value="'+selectedValue+'"');
    select.select.selectedIndex = Array.prototype.indexOf.call(select.options, selectedOption);
    select.select.dispatchEvent(new CustomEvent('change', {bubbles: true})); // trigger change event
  };

  function keyboardCustomSelect(select, direction) {
    var selectedOption = select.select.querySelector('[value="'+document.activeElement.getAttribute('data-value')+'"]');
    if(!selectedOption) return;
    var index = Array.prototype.indexOf.call(select.options, selectedOption);
    
    index = direction == 'next' ? index + 1 : index - 1;
    if(index < 0) return;
    if(index >= select.options.length) return;
    
    var dropdownOption = select.dropdown.querySelector('[data-value="'+select.options[index].getAttribute('value')+'"]');
    if(dropdownOption) moveFocus(dropdownOption);
  };

  function moveFocus(element) {
    element.focus();
    if (document.activeElement !== element) {
      element.setAttribute('tabindex','-1');
      element.focus();
    }
  };

  //initialize the AdvSelect objects
  var advSelect = document.getElementsByClassName('js-adv-select');
  if( advSelect.length > 0 ) {
    for( var i = 0; i < advSelect.length; i++) {
      (function(i){new AdvSelect(advSelect[i]);})(i);
    }
  }
}());
// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Math.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

// File#: _2_page-transition-v1
// Usage: codyhouse.co/license
(function() {
  var pageTransitionWrapper = document.getElementsByClassName('js-page-trans');
  if(pageTransitionWrapper.length < 1) return;
  
  var transPanel = document.getElementsByClassName('page-trans-v1'),
    loaderScale = '--page-trans-v1-loader-scale',
    timeoutId = false,
    loaderScaleDown = 0.2;

  var timeLeaveAnim = 0;
  
  new PageTransition({
    leaveAnimation: function(initContent, link, cb) {
      timeLeaveAnim = 0;
      Util.addClass(transPanel[0], 'page-trans-v1--is-visible');
      transPanel[0].addEventListener('transitionend', function cbLeave(){
        transPanel[0].removeEventListener('transitionend', cbLeave);
        setTimeout(function(){
          animateLoader(300, 1, loaderScaleDown, function(){
            Util.addClass(initContent, 'px9-hide');
            timeLeaveAnim = new Date().getTime();
            cb();
          });
        }, 100);
      });
    },
    enterAnimation: function(initContent, newContent, link, cb) {
      if(timeoutId) {
        window.cancelAnimationFrame(timeoutId);
        timeoutId = false;
      }

      // set a minimum loader animation duration of 0.75s
      var duration = Math.max((750 - new Date().getTime() + timeLeaveAnim), 300);
  
      // complete page-trans-v1__loader scale animation
      animateLoader(duration, parseFloat(getComputedStyle(transPanel[0]).getPropertyValue(loaderScale)), 1, function() {
        Util.removeClass(transPanel[0], 'page-trans-v1--is-visible');
        transPanel[0].addEventListener('transitionend', function cbEnter(){
          transPanel[0].removeEventListener('transitionend', cbEnter);
          cb();
        });
      });
    },
    progressAnimation: function(link) {
      animateLoader(3000, loaderScaleDown, 0.9);
    }
  });

  function animateLoader(duration, startValue, finalValue, cb) {
    // takes care of animating the loader element
    var currentTime = false;

    var animateScale = function(timestamp) {
      if (!currentTime) currentTime = timestamp;        
      var progress = timestamp - currentTime;
      if(progress > duration) progress = duration;
      var val = Math.easeInOutQuart(progress, startValue, finalValue - startValue, duration);
      transPanel[0].style.setProperty(loaderScale, val);
      if(progress < duration) {
        timeoutId = window.requestAnimationFrame(animateScale);
      } else {
        // reveal page content
        if(cb) cb();
      }
    };
    timeoutId = window.requestAnimationFrame(animateScale);
  };
}());
// File#: _2_autocomplete
// Usage: codyhouse.co/license
(function() {
  var Autocomplete = function(opts) {
    if(!('CSS' in window) || !CSS.supports('color', 'var(--color-var)')) return;
    this.options = extendProps(Autocomplete.defaults, opts);
    this.element = this.options.element;
    this.input = this.element.getElementsByClassName('js-autocomplete__input')[0];
    this.results = this.element.getElementsByClassName('js-autocomplete__results')[0];
    this.resultsList = this.results.getElementsByClassName('js-autocomplete__list')[0];
    this.ariaResult = this.element.getElementsByClassName('js-autocomplete__aria-results');
    this.resultClassName = this.element.getElementsByClassName('js-autocomplete__item').length > 0 ? 'js-autocomplete__item' : 'js-autocomplete__result';
    // store search info
    this.inputVal = '';
    this.typeId = false;
    this.searching = false;
    this.searchingClass = this.element.getAttribute('data-autocomplete-searching-class') || 'autocomplete--searching';
    // dropdown reveal class
    this.dropdownActiveClass =  this.element.getAttribute('data-autocomplete-dropdown-visible-class') || this.element.getAttribute('data-dropdown-active-class');
    // truncate dropdown
    this.truncateDropdown = this.element.getAttribute('data-autocomplete-dropdown-truncate') && this.element.getAttribute('data-autocomplete-dropdown-truncate') == 'on' ? true : false;
    initAutocomplete(this);
    this.autocompleteClosed = false; // fix issue when selecting an option from the list
  };

  function initAutocomplete(element) {
    initAutocompleteAria(element); // set aria attributes for SR and keyboard users
    initAutocompleteTemplates(element);
    initAutocompleteEvents(element);
  };

  function initAutocompleteAria(element) {
    // set aria attributes for input element
    element.input.setAttribute('role', 'combobox');
    element.input.setAttribute('aria-autocomplete', 'list');
    var listId = element.resultsList.getAttribute('id');
    if(listId) element.input.setAttribute('aria-owns', listId);
    // set aria attributes for autocomplete list
    element.resultsList.setAttribute('role', 'list');
  };

  function initAutocompleteTemplates(element) {
    element.templateItems = element.resultsList.querySelectorAll('.'+element.resultClassName+'[data-autocomplete-template]');
    if(element.templateItems.length < 1) element.templateItems = element.resultsList.querySelectorAll('.'+element.resultClassName);
    element.templates = [];
    for(var i = 0; i < element.templateItems.length; i++) {
      element.templates[i] = element.templateItems[i].getAttribute('data-autocomplete-template');
    }
  };

  function initAutocompleteEvents(element) {
    // input - keyboard navigation 
    element.input.addEventListener('keyup', function(event){
      handleInputTyped(element, event);
    });

    // if input type="search" -> detect when clicking on 'x' to clear input
    element.input.addEventListener('search', function(event){
      updateSearch(element);
    });

    // make sure dropdown is open on click
    element.input.addEventListener('click', function(event){
      updateSearch(element, true);
    });

    element.input.addEventListener('focus', function(event){
      if(element.autocompleteClosed) {
        element.autocompleteClosed = false;
        return;
      }
      updateSearch(element, true);
    });

    // input loses focus -> close menu
    element.input.addEventListener('blur', function(event){
      checkFocusLost(element, event);
    });

    // results list - keyboard navigation 
    element.resultsList.addEventListener('keydown', function(event){
      navigateList(element, event);
    });

    // results list loses focus -> close menu
    element.resultsList.addEventListener('focusout', function(event){
      checkFocusLost(element, event);
    });

    // close on esc
    window.addEventListener('keyup', function(event){
      if( event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' ) {
        toggleOptionsList(element, false);
      } else if(event.keyCode && event.keyCode == 13 || event.key && event.key.toLowerCase() == 'enter') { // on Enter - select result if focus is within results list
        selectResult(element, document.activeElement.closest('.'+element.resultClassName), event);
      }
    });

    // select element from list
    element.resultsList.addEventListener('click', function(event){
      selectResult(element, event.target.closest('.'+element.resultClassName), event);
    });
  };

  function checkFocusLost(element, event) {
    if(element.element.contains(event.relatedTarget)) return;
    toggleOptionsList(element, false);
  };

  function handleInputTyped(element, event) {
    if(event.key.toLowerCase() == 'arrowdown' || event.keyCode == '40') {
      moveFocusToList(element);
    } else {
      updateSearch(element);
    }
  };

  function moveFocusToList(element) {
    if(!element.element.classList.contains(element.dropdownActiveClass)) return;
    resetSearch(element); // clearTimeout
    // make sure first element is focusable
    var index = 0;
    if(!elementListIsFocusable(element.resultsItems[index])) {
      index = getElementFocusbleIndex(element, index, true);
    }
    getListFocusableEl(element.resultsItems[index]).focus();
  };

  function updateSearch(element, bool) {
    var inputValue = element.input.value;
    if(inputValue == element.inputVal && !bool) return; // input value did not change
    element.inputVal = inputValue;
    if(element.typeId) clearInterval(element.typeId); // clearTimeout
    if(element.inputVal.length < element.options.characters) { // not enough characters to start searching
      toggleOptionsList(element, false);
      return;
    }
    if(bool) { // on focus -> update result list without waiting for the debounce
      updateResultsList(element, 'focus');
      return;
    }
    element.typeId = setTimeout(function(){
      updateResultsList(element, 'type');
    }, element.options.debounce);
  };

  function toggleOptionsList(element, bool) {
    // toggle visibility of options list
    if(bool) {
      if(element.element.classList.contains(element.dropdownActiveClass)) return;
      element.element.classList.add(element.dropdownActiveClass);
      element.input.setAttribute('aria-expanded', true);
      truncateAutocompleteList(element);
    } else {
      if(!element.element.classList.contains(element.dropdownActiveClass)) return;
      if(element.resultsList.contains(document.activeElement)) {
        element.autocompleteClosed = true;
        element.input.focus();
      }
      element.element.classList.remove(element.dropdownActiveClass);
      element.input.removeAttribute('aria-expanded');
      resetSearch(element); // clearTimeout
    }
  };

  function truncateAutocompleteList(element) {
    if(!element.truncateDropdown) return;
    // reset max height
    element.resultsList.style.maxHeight = '';
    // check available space 
    var spaceBelow = (window.innerHeight - element.input.getBoundingClientRect().bottom - 10),
      maxHeight = parseInt(getComputedStyle(element.resultsList).maxHeight);

    (maxHeight > spaceBelow) 
      ? element.resultsList.style.maxHeight = spaceBelow+'px' 
      : element.resultsList.style.maxHeight = '';
  };

  function updateResultsList(element, eventType) {
    if(element.searching) return;
    element.searching = true;
    element.element.classList.add(element.searchingClass); // show loader
    element.options.searchData(element.inputVal, function(data, cb){
      // data = custom results
      populateResults(element, data, cb);
      element.element.classList.remove(element.searchingClass);
      toggleOptionsList(element, true);
      updateAriaRegion(element);
      element.searching = false;
    }, eventType);
  };

  function updateAriaRegion(element) {
    element.resultsItems = element.resultsList.querySelectorAll('.'+element.resultClassName+'[tabindex="-1"]');
    if(element.ariaResult.length == 0) return;
    element.ariaResult[0].textContent = element.resultsItems.length;
  };

  function resetSearch(element) {
    if(element.typeId) clearInterval(element.typeId);
    element.typeId = false;
  };

  function navigateList(element, event) {
    var downArrow = (event.key.toLowerCase() == 'arrowdown' || event.keyCode == '40'),
      upArrow = (event.key.toLowerCase() == 'arrowup' || event.keyCode == '38');
    if(!downArrow && !upArrow) return;
    event.preventDefault();
    var selectedElement = document.activeElement.closest('.'+element.resultClassName) || document.activeElement;
    var index = Array.prototype.indexOf.call(element.resultsItems, selectedElement);
    var newIndex = getElementFocusbleIndex(element, index, downArrow);
    getListFocusableEl(element.resultsItems[newIndex]).focus();
  };

  function getElementFocusbleIndex(element, index, nextItem) {
    var newIndex = nextItem ? index + 1 : index - 1;
    if(newIndex < 0) newIndex = element.resultsItems.length - 1;
    if(newIndex >= element.resultsItems.length) newIndex = 0;
    // check if element can be focused
    if(!elementListIsFocusable(element.resultsItems[newIndex])) {
      // skip this element
      return getElementFocusbleIndex(element, newIndex, nextItem);
    }
    return newIndex;
  };

  function elementListIsFocusable(item) {
    var role = item.getAttribute('role');
    if(role && role == 'presentation') {
      // skip this element
      return false;
    }
    return true;
  };

  function getListFocusableEl(item) {
    var newFocus = item,
      focusable = newFocus.querySelectorAll('button:not([disabled]), [href]');
    if(focusable.length > 0 ) newFocus = focusable[0];
    return newFocus;
  };

  function selectResult(element, result, event) {
    if(!result) return;
    if(element.options.onClick) {
      element.options.onClick(result, element, event, function(){
        toggleOptionsList(element, false);
      });
    } else {
      element.input.value = getResultContent(result);
      toggleOptionsList(element, false);
    }
    element.inputVal = element.input.value;
  };

  function getResultContent(result) { // get text content of selected item
    var labelElement = result.querySelector('[data-autocomplete-label]');
    return labelElement ? labelElement.textContent : result.textContent;
  };

  function populateResults(element, data, cb) {
    var innerHtml = '';

    for(var i = 0; i < data.length; i++) {
      innerHtml = innerHtml + getItemHtml(element, data[i]);
    }
    if(element.options.populate) element.resultsList.innerHTML = innerHtml;
    else if(cb) cb(innerHtml);
  };

  function getItemHtml(element, data) {
    var clone = getClone(element, data);
    clone.classList.remove('autocomplete__item--is-hidden');
    clone.setAttribute('tabindex', '-1');
    for(var key in data) {
      if (data.hasOwnProperty(key)) {
        if(key == 'label') setLabel(clone, data[key]);
        else if(key == 'class') setClass(clone, data[key]);
        else if(key == 'url') setUrl(clone, data[key]);
        else if(key == 'src') setSrc(clone, data[key]);
        else setKey(clone, key, data[key]);
      }
    }
    return clone.outerHTML;
  };

  function getClone(element, data) {
    var item = false;
    if(element.templateItems.length == 1 || !data['template']) item = element.templateItems[0];
    else {
      for(var i = 0; i < element.templateItems.length; i++) {
        if(data['template'] == element.templates[i]) {
          item = element.templateItems[i];
        }
      }
      if(!item) item = element.templateItems[0];
    }
    return item.cloneNode(true);
  };

  function setLabel(clone, label) {
    var labelElement = clone.querySelector('[data-autocomplete-label]');
    labelElement 
      ? labelElement.textContent = label
      : clone.textContent = label;
  };

  function setClass(clone, classList) {
    var classesArray = classList.split(' ');
    clone.classList.add(classesArray[0]);
 	  if (classesArray.length > 1) setClass(clone, classesArray.slice(1).join(' '));
  };

  function setUrl(clone, url) {
    var linkElement = clone.querySelector('[data-autocomplete-url]');
    if(linkElement) linkElement.setAttribute('href', url);
  };

  function setSrc(clone, src) {
    var imgElement = clone.querySelector('[data-autocomplete-src]');
    if(imgElement) imgElement.setAttribute('src', src);
  };

  function setKey(clone, key, value) {
    var subElement = clone.querySelector('[data-autocomplete-'+key+']');
    if(subElement) {
      if(subElement.hasAttribute('data-autocomplete-html')) subElement.innerHTML = value;
      else subElement.textContent = value;
    }
  };

  var extendProps = function () {
    // Variables
    var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;
  
    // Check if a deep merge
    if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
      deep = arguments[0];
      i++;
    }
  
    // Merge the object into the extended object
    var merge = function (obj) {
      for ( var prop in obj ) {
        if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
          // If deep merge and property is an object, merge properties
          if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
            extended[prop] = extend( true, extended[prop], obj[prop] );
          } else {
            extended[prop] = obj[prop];
          }
        }
      }
    };
  
    // Loop through each object and conduct a merge
    for ( ; i < length; i++ ) {
      var obj = arguments[i];
      merge(obj);
    }
  
    return extended;
  };

  Autocomplete.defaults = {
    element : '',
    debounce: 200,
    characters: 2,
    populate: true,
    searchData: false, // function used to return results
    onClick: false // function executed when selecting an item in the list; arguments (result, obj) -> selected <li> item + Autocompletr obj reference
  };

  window.Autocomplete = Autocomplete;
}());
// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

// File#: _2_off-canvas-navigation
// Usage: codyhouse.co/license
(function() {
  var OffCanvasNav = function(element) {
    this.element = element;
    this.panel = this.element.getElementsByClassName('js-off-canvas__panel')[0];
    this.trigger = document.querySelectorAll('[aria-controls="'+this.panel.getAttribute('id')+'"]')[0];
    this.svgAnim = this.trigger.getElementsByTagName('circle');
    initOffCanvasNav(this);
  };

  function initOffCanvasNav(canvas) {
    if(transitionSupported) {
      // do not allow click on menu icon while the navigation is animating
      canvas.trigger.addEventListener('click', function(event){
        canvas.trigger.style.setProperty('pointer-events', 'none');
      });
      canvas.panel.addEventListener('openPanel', function(event){
        canvas.trigger.style.setProperty('pointer-events', 'none');
      });
      canvas.panel.addEventListener('transitionend', function(event){
        if(event.propertyName == 'visibility') {
          canvas.trigger.style.setProperty('pointer-events', '');
        }
      });
    }

    if(canvas.svgAnim.length > 0) { // create the circle fill-in effect
      var circumference = (2*Math.PI*canvas.svgAnim[0].getAttribute('r')).toFixed(2);
      canvas.svgAnim[0].setAttribute('stroke-dashoffset', circumference);
      canvas.svgAnim[0].setAttribute('stroke-dasharray', circumference);
      Util.addClass(canvas.trigger, 'offnav-control--ready-to-animate');
    }
    
    canvas.panel.addEventListener('closePanel', function(event){
      // if the navigation is closed using keyboard or a11y close btn -> change trigger icon appearance (from arrow to menu icon) 
      if(event.detail == 'key' || event.detail == 'close-btn') {
        canvas.trigger.click();
      }
    });
  };

  // init OffCanvasNav objects
  var offCanvasNav = document.getElementsByClassName('js-off-canvas--nav'),
    transitionSupported = Util.cssSupports('transition');
	if( offCanvasNav.length > 0 ) {
		for( var i = 0; i < offCanvasNav.length; i++) {
			(function(i){new OffCanvasNav(offCanvasNav[i]);})(i);
		}
	}
}());
// utility functions
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

Util.extend = function() {
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// File#: _2_password-strength
// Usage: codyhouse.co/license
(function() {
  var PasswordStrength = function(opts) {
    this.options = Util.extend(PasswordStrength.defaults , opts); // used to store custom filter/sort functions
    this.element = this.options.element;
    this.input = this.element.getElementsByClassName('js-password-strength__input');
    this.reqs = this.element.getElementsByClassName('js-password-strength__req');
    this.strengthSection = this.element.getElementsByClassName('js-password-strength__meter-wrapper');
    this.strengthValue = this.element.getElementsByClassName('js-password-strength__value');
    this.strengthMeter = this.element.getElementsByClassName('js-password-strength__meter');
    this.passwordInteracted = false;
    this.reqMetClass = 'password-strength__req--met';
    this.reqNoMetClass = 'password-strength__req--no-met';
    shouldCheckStrength(this); // check if password strength should be checked
    getStrengthLabels(this); // labels for password strength
    initPasswordStrength(this);
  };

  function shouldCheckStrength(password) {
    password.checkStrength = true;
    var checkStrength = password.element.getAttribute('data-check-strength');
    if(checkStrength && checkStrength == 'off') password.checkStrength = false;
  };

  function getStrengthLabels(password) {
    if(!password.checkStrength) password.strengthLabels = false;
    password.strengthLabels = ['Bad', 'Weak', 'Good', 'Strong'];
    var dataLabel = password.element.getAttribute('data-strength-labels');
    if(dataLabel) {
      var labels = dataLabel.split(',');
      if(labels.length < 4) return;
      password.strengthLabels = labels.map(function(element){return element.trim()});
    }
  };

  function initPasswordStrength(password) {
    if(password.input.length == 0) return;
    toggleCheckStrength(password); // hide/show password strenght section
    checkStrength(password);
    checkConditions(password);
    initInput(password);
  };

  function initInput(password) {
    password.input[0].addEventListener('input', function(event) { // password changed
      toggleCheckStrength(password); // hide/show password strenght section
      checkStrength(password);
      checkConditions(password);
    });

    password.input[0].addEventListener('blur', function cb(event) {
      password.input[0].removeEventListener('blur', cb);
      password.passwordInteracted = true;
      // show error for requirement not met
      for(var i = 0; i < password.reqs.length; i++) {
        if(!Util.hasClass(password.reqs[i], password.reqMetClass)) Util.addClass(password.reqs[i], password.reqNoMetClass);
      }
    });
  };

  function toggleCheckStrength(password) {
    if(password.strengthSection.length == 0) return;
    Util.toggleClass(password.strengthSection[0], 'pn9-hide', (password.input[0].value.length == 0));
  };

  function checkStrength(password) {
    if(!password.checkStrength || !zxcvbn) return;
    var response = zxcvbn(password.input[0].value);
    if(password.strengthValue.length > 0) { // update strength label
      if(response.score >= 1) password.strengthValue[0].textContent = password.strengthLabels[response.score - 1];
      else password.strengthValue[0].textContent = password.strengthLabels[0];
    }

    if(password.strengthMeter.length > 0) { // update strength meter
      var score = response.score;
      if(score == 0 && password.input[0].value.length > 0) score = 1;
      password.strengthMeter[0].firstElementChild.style.width = score/0.04+'%';
      removeStrengthClasses(password);
      if(response.score >= 1) Util.addClass(password.strengthMeter[0], 'password-strength__meter--fill-'+response.score);
      else Util.addClass(password.strengthMeter[0], 'password-strength__meter--fill-1');
    }
  };

  function checkConditions(password) {
    // uppercase, lowercase, special characters, length, number + custom
    for(var i = 0; i < password.reqs.length; i++) {
      var req = password.reqs[i].getAttribute('data-password-req');
      var result = false;
      if(password.options[req]) {
        result = password.options[req](password.input[0].value);
      } else {
        result = checkSingleCondition(password.input[0].value, req);
      }

      Util.toggleClass(password.reqs[i], password.reqMetClass, result);
      if(password.passwordInteracted) Util.toggleClass(password.reqs[i], password.reqNoMetClass, !result);
    }
  };

  function checkSingleCondition(value, req) {
    var result;
    switch (true) {
      case (req.trim() == 'uppercase'):
        result = (value.toLowerCase() != value);
        break;
      case (req.trim() == 'lowercase'):
        result = (value.toUpperCase() != value);
        break;
      case (req.trim() == 'number'):
        result = /\d/.test(value);
        break;
      case (req.indexOf('length:') == 0):
        var reqArray = req.split(':');
        result = (value.length >= parseInt(reqArray[1]));
        if(reqArray.length > 2 && result) result = (value.length <= parseInt(reqArray[2]));
        break;
      case (req.trim() == 'special'):
        result = /[!@#$%^&*=~`'"|/\?\_\-\,\;\.\:\(\)\{\}\[\]\+\>\<\\]/.test(value);
        break;
      case (req.trim() == 'letter'):
        result = /[a-zA-Z]/.test(value);
        break;
      default:
        result = false;
        break;
    }
    return result;
  };

  function removeStrengthClasses(password) {
    var classes = password.strengthMeter[0].className.split(" ").filter(function(c) {
      return c.lastIndexOf('password-strength__meter--fill-', 0) !== 0;
    });
    password.strengthMeter[0].className = classes.join(" ").trim();
  };

  PasswordStrength.defaults = {
    element : false,
  };

  window.PasswordStrength = PasswordStrength;

  //initialize the PasswordStrength objects
	var passwordStrength = document.getElementsByClassName('js-password-strength');
	if( passwordStrength.length > 0 ) {
		for( var i = 0; i < passwordStrength.length; i++) {
			(function(i){new PasswordStrength({element: passwordStrength[i]});})(i);
		}
  };
}());
// File#: _2_flexi-header
// Usage: codyhouse.co/license
(function() {
  var flexHeader = document.getElementsByClassName('js-f-header');
	if(flexHeader.length > 0) {
		var menuTrigger = flexHeader[0].getElementsByClassName('js-anim-menu-btn')[0],
			firstFocusableElement = getMenuFirstFocusable();

		// we'll use these to store the node that needs to receive focus when the mobile menu is closed 
		var focusMenu = false;

		resetFlexHeaderOffset();
		setAriaButtons();

		menuTrigger.addEventListener('anim-menu-btn-clicked', function(event){
			toggleMenuNavigation(event.detail);
		});

		// listen for key events
		window.addEventListener('keyup', function(event){
			// listen for esc key
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
					focusMenu = menuTrigger; // move focus to menu trigger when menu is close
					menuTrigger.click();
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				// close navigation on mobile if open when nav loses focus
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-f-header')) menuTrigger.click();
			}
		});

		// detect click on a dropdown control button - expand-on-mobile only
		flexHeader[0].addEventListener('click', function(event){
			var btnLink = event.target.closest('.js-f-header__dropdown-control');
			if(!btnLink) return;
			!btnLink.getAttribute('aria-expanded') ? btnLink.setAttribute('aria-expanded', 'true') : btnLink.removeAttribute('aria-expanded');
		});

		// detect mouseout from a dropdown control button - expand-on-mobile only
		flexHeader[0].addEventListener('mouseout', function(event){
			var btnLink = event.target.closest('.js-f-header__dropdown-control');
			if(!btnLink) return;
			// check layout type
			if(getLayout() == 'mobile') return;
			btnLink.removeAttribute('aria-expanded');
		});

		// close dropdown on focusout - expand-on-mobile only
		flexHeader[0].addEventListener('focusin', function(event){
			var btnLink = event.target.closest('.js-f-header__dropdown-control'),
				dropdown = event.target.closest('.f-header__dropdown');
			if(dropdown) return;
			if(btnLink && btnLink.hasAttribute('aria-expanded')) return;
			// check layout type
			if(getLayout() == 'mobile') return;
			var openDropdown = flexHeader[0].querySelector('.js-f-header__dropdown-control[aria-expanded="true"]');
			if(openDropdown) openDropdown.removeAttribute('aria-expanded');
		});

		// listen for resize
		var resizingId = false;
		window.addEventListener('resize', function() {
			clearTimeout(resizingId);
			resizingId = setTimeout(doneResizing, 500);
		});

		function getMenuFirstFocusable() {
			var focusableEle = flexHeader[0].getElementsByClassName('f-header__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
				firstFocusable = false;
			for(var i = 0; i < focusableEle.length; i++) {
				if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
					firstFocusable = focusableEle[i];
					break;
				}
			}

			return firstFocusable;
    };
    
    function isVisible(element) {
      return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
		};

		function doneResizing() {
			if( !isVisible(menuTrigger) && flexHeader[0].classList.contains('f-header--expanded')) {
				menuTrigger.click();
			}
			resetFlexHeaderOffset();
		};
		
		function toggleMenuNavigation(bool) { // toggle menu visibility on small devices
			document.getElementsByClassName('f-header__nav')[0].classList.toggle('f-header__nav--is-visible', bool);
			flexHeader[0].classList.toggle('f-header--expanded', bool);
			menuTrigger.setAttribute('aria-expanded', bool);
			if(bool) firstFocusableElement.focus(); // move focus to first focusable element
			else if(focusMenu) {
				focusMenu.focus();
				focusMenu = false;
			}
		};

		function resetFlexHeaderOffset() {
			// on mobile -> update max height of the flexi header based on its offset value (e.g., if there's a fixed pre-header element)
			document.documentElement.style.setProperty('--f-header-offset', flexHeader[0].getBoundingClientRect().top+'px');
		};

		function setAriaButtons() {
			var btnDropdown = flexHeader[0].getElementsByClassName('js-f-header__dropdown-control');
			for(var i = 0; i < btnDropdown.length; i++) {
				var id = 'f-header-dropdown-'+i,
					dropdown = btnDropdown[i].nextElementSibling;
				if(dropdown.hasAttribute('id')) {
					id = dropdown.getAttribute('id');
				} else {
					dropdown.setAttribute('id', id);
				}
				btnDropdown[i].setAttribute('aria-controls', id);	
			}
		};

		function getLayout() {
			return getComputedStyle(flexHeader[0], ':before').getPropertyValue('content').replace(/\'|"/g, '');
		};
	}
}());
// File#: _2_dropdown
// Usage: codyhouse.co/license
(function() {
	var Dropdown = function(element) {
		this.element = element;
		this.trigger = this.element.getElementsByClassName('js-dropdown__trigger')[0];
		this.dropdown = this.element.getElementsByClassName('js-dropdown__menu')[0];
		this.triggerFocus = false;
		this.dropdownFocus = false;
		this.hideInterval = false;
		// sublevels
		this.dropdownSubElements = this.element.getElementsByClassName('js-dropdown__sub-wrapper');
		this.prevFocus = false; // store element that was in focus before focus changed
		this.addDropdownEvents();
	};
	
	Dropdown.prototype.addDropdownEvents = function(){
		//place dropdown
		var self = this;
		this.placeElement();
		this.element.addEventListener('placeDropdown', function(event){
			self.placeElement();
		});
		// init dropdown
		this.initElementEvents(this.trigger, this.triggerFocus); // this is used to trigger the primary dropdown
		this.initElementEvents(this.dropdown, this.dropdownFocus); // this is used to trigger the primary dropdown
		// init sublevels
		this.initSublevels(); // if there are additional sublevels -> bind hover/focus events
	};

	Dropdown.prototype.placeElement = function() {
		// remove inline style first
		this.dropdown.removeAttribute('style');
		// check dropdown position
		var triggerPosition = this.trigger.getBoundingClientRect(),
			isRight = (window.innerWidth < triggerPosition.left + parseInt(getComputedStyle(this.dropdown).getPropertyValue('width')));

		var xPosition = isRight ? 'right: 0px; left: auto;' : 'left: 0px; right: auto;';
		this.dropdown.setAttribute('style', xPosition);
	};

	Dropdown.prototype.initElementEvents = function(element, bool) {
		var self = this;
		element.addEventListener('mouseenter', function(){
			bool = true;
			self.showDropdown();
		});
		element.addEventListener('focus', function(){
			self.showDropdown();
		});
		element.addEventListener('mouseleave', function(){
			bool = false;
			self.hideDropdown();
		});
		element.addEventListener('focusout', function(){
			self.hideDropdown();
		});
	};

	Dropdown.prototype.showDropdown = function(){
		if(this.hideInterval) clearInterval(this.hideInterval);
		// remove style attribute
		this.dropdown.removeAttribute('style');
		this.placeElement();
		this.showLevel(this.dropdown, true);
	};

	Dropdown.prototype.hideDropdown = function(){
		var self = this;
		if(this.hideInterval) clearInterval(this.hideInterval);
		this.hideInterval = setTimeout(function(){
			var dropDownFocus = document.activeElement.closest('.js-dropdown'),
				inFocus = dropDownFocus && (dropDownFocus == self.element);
			// if not in focus and not hover -> hide
			if(!self.triggerFocus && !self.dropdownFocus && !inFocus) {
				self.hideLevel(self.dropdown, true);
				// make sure to hide sub/dropdown
				self.hideSubLevels();
				self.prevFocus = false;
			}
		}, 300);
	};

	Dropdown.prototype.initSublevels = function(){
		var self = this;
		var dropdownMenu = this.element.getElementsByClassName('js-dropdown__menu');
		for(var i = 0; i < dropdownMenu.length; i++) {
			var listItems = dropdownMenu[i].children;
			// bind hover
	    new menuAim({
	      menu: dropdownMenu[i],
	      activate: function(row) {
	      	var subList = row.getElementsByClassName('js-dropdown__menu')[0];
	      	if(!subList) return;
					row.querySelector('a').classList.add('dropdown__item--hover');
	      	self.showLevel(subList);
	      },
	      deactivate: function(row) {
	      	var subList = row.getElementsByClassName('dropdown__menu')[0];
	      	if(!subList) return;
					row.querySelector('a').classList.remove('dropdown__item--hover');
	      	self.hideLevel(subList);
	      },
	      submenuSelector: '.js-dropdown__sub-wrapper',
	    });
		}
		// store focus element before change in focus
		this.element.addEventListener('keydown', function(event) { 
			if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
				self.prevFocus = document.activeElement;
			}
		});
		// make sure that sublevel are visible when their items are in focus
		this.element.addEventListener('keyup', function(event) {
			if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
				// focus has been moved -> make sure the proper classes are added to subnavigation
				var focusElement = document.activeElement,
					focusElementParent = focusElement.closest('.js-dropdown__menu'),
					focusElementSibling = focusElement.nextElementSibling;

				// if item in focus is inside submenu -> make sure it is visible
				if(focusElementParent && !focusElementParent.classList.contains('dropdown__menu--is-visible')) {
					self.showLevel(focusElementParent);
				}
				// if item in focus triggers a submenu -> make sure it is visible
				if(focusElementSibling && !focusElementSibling.classList.contains('dropdown__menu--is-visible')) {
					self.showLevel(focusElementSibling);
				}

				// check previous element in focus -> hide sublevel if required 
				if( !self.prevFocus) return;
				var prevFocusElementParent = self.prevFocus.closest('.js-dropdown__menu'),
					prevFocusElementSibling = self.prevFocus.nextElementSibling;
				
				if( !prevFocusElementParent ) return;
				
				// element in focus and element prev in focus are siblings
				if( focusElementParent && focusElementParent == prevFocusElementParent) {
					if(prevFocusElementSibling) self.hideLevel(prevFocusElementSibling);
					return;
				}

				// element in focus is inside submenu triggered by element prev in focus
				if( prevFocusElementSibling && focusElementParent && focusElementParent == prevFocusElementSibling) return;
				
				// shift tab -> element in focus triggers the submenu of the element prev in focus
				if( focusElementSibling && prevFocusElementParent && focusElementSibling == prevFocusElementParent) return;
				
				var focusElementParentParent = focusElementParent.parentNode.closest('.js-dropdown__menu');
				
				// shift tab -> element in focus is inside the dropdown triggered by a siblings of the element prev in focus
				if(focusElementParentParent && focusElementParentParent == prevFocusElementParent) {
					if(prevFocusElementSibling) self.hideLevel(prevFocusElementSibling);
					return;
				}
				if(prevFocusElementParent && prevFocusElementParent.classList.contains('dropdown__menu--is-visible')) {
					self.hideLevel(prevFocusElementParent);
				}
			}
		});
	};

	Dropdown.prototype.hideSubLevels = function(){
		var visibleSubLevels = this.dropdown.getElementsByClassName('dropdown__menu--is-visible');
		if(visibleSubLevels.length == 0) return;
		while (visibleSubLevels[0]) {
			this.hideLevel(visibleSubLevels[0]);
	 	}
	 	var hoveredItems = this.dropdown.getElementsByClassName('dropdown__item--hover');
	 	while (hoveredItems[0]) {
			hoveredItems[0].classList.remove('dropdown__item--hover');
	 	}
	};

	Dropdown.prototype.showLevel = function(level, bool){
		if(bool == undefined) {
			//check if the sublevel needs to be open to the left
			level.classList.remove('dropdown__menu--left');
			var boundingRect = level.getBoundingClientRect();
			if(window.innerWidth - boundingRect.right < 5 && boundingRect.left + window.scrollX > 2*boundingRect.width) level.classList.add('dropdown__menu--left');
		}
		
		level.classList.add('dropdown__menu--is-visible');
		level.classList.remove('dropdown__menu--hide');
	};

	Dropdown.prototype.hideLevel = function(level, bool){
		if(!level.classList.contains('dropdown__menu--is-visible')) return;
		level.classList.remove('dropdown__menu--is-visible');
		level.classList.add('dropdown__menu--hide');
		
		level.addEventListener('transitionend', function cb(event){
			if(event.propertyName != 'opacity') return;
			level.removeEventListener('transitionend', cb);
			if(level.classList.contains('dropdown__menu--is-hidden')) level.classList.remove('dropdown__menu--is-hidden', 'dropdown__menu--left');
			if(bool && !level.classList.contains('dropdown__menu--is-visible')) level.setAttribute('style', 'width: 0px; overflow: hidden;');
		});
	};

	window.Dropdown = Dropdown;

	var dropdown = document.getElementsByClassName('js-dropdown');
	if( dropdown.length > 0 ) { // init Dropdown objects
		for( var i = 0; i < dropdown.length; i++) {
			(function(i){new Dropdown(dropdown[i]);})(i);
		}
	}
}());
// File#: _2_hero-boxed
// Usage: codyhouse.co/license
(function() {
  var heroBoxedTarget = document.getElementsByClassName('js-boxed-hero__target');

  if(heroBoxedTarget.length > 0) {
    for(var i = 0; i < heroBoxedTarget.length; i++) {
      
      var boxedObject = heroBoxedTarget[i].getElementsByClassName('js-boxed-hero__cursor-follower');
      if(boxedObject.length < 1) return;
      new CursorFx({
        target: heroBoxedTarget[i],
        objects: [
          {element: boxedObject[0], effect: 'follow'}
        ]
      });
    }
  }
}());
// File#: _2_modal-video
// Usage: codyhouse.co/license
(function() {
	var ModalVideo = function(element) {
		this.element = element;
		this.modalContent = this.element.getElementsByClassName('js-modal-video__content')[0];
		this.media = this.element.getElementsByClassName('js-modal-video__media')[0];
		this.contentIsIframe = this.media.tagName.toLowerCase() == 'iframe';
		this.modalIsOpen = false;
		this.initModalVideo();
	};

	ModalVideo.prototype.initModalVideo = function() {
		var self = this;
		// reveal modal content when iframe is ready
		this.addLoadListener();
		// listen for the modal element to be open -> set new iframe src attribute
		this.element.addEventListener('modalIsOpen', function(event){
			self.modalIsOpen = true;
			self.media.setAttribute('src', event.detail.closest('[aria-controls]').getAttribute('data-url'));
		});
		// listen for the modal element to be close -> reset iframe and hide modal content
		this.element.addEventListener('modalIsClose', function(event){
			self.modalIsOpen = false;
			self.element.classList.add('modal--is-loading');
			self.media.setAttribute('src', '');
		});
	};

	ModalVideo.prototype.addLoadListener = function() {
		var self = this;
		if(this.contentIsIframe) {
			this.media.onload = function () {
				self.revealContent();
			};
		} else {
			this.media.addEventListener('loadedmetadata', function(){
				self.revealContent();
			});
		}
		
	};

	ModalVideo.prototype.revealContent = function() {
		if( !this.modalIsOpen ) return;
		this.element.classList.remove('modal--is-loading');
		if(this.element.getAttribute('data-modal-first-focus')) return; // user selected a specific element to focus
		this.contentIsIframe ? this.media.contentWindow.focus() : this.media.focus();
	};

	//initialize the ModalVideo objects
	var modalVideos = document.getElementsByClassName('js-modal-video__media');
	if( modalVideos.length > 0 ) {
		for( var i = 0; i < modalVideos.length; i++) {
			(function(i){new ModalVideo(modalVideos[i].closest('.js-modal'));})(i);
		}
	}
}());
// utility functions
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

// File#: _2_table-of-contents
// Usage: codyhouse.co/license
(function() {
  var Toc = function(element) {
		this.element = element;
    this.list = this.element.getElementsByClassName('js-toc__list')[0];
    this.anchors = this.list.querySelectorAll('a[href^="#"]');
    this.sections = getSections(this);
    this.controller = this.element.getElementsByClassName('js-toc__control');
    this.controllerLabel = this.element.getElementsByClassName('js-toc__control-label');
    this.content = getTocContent(this);
    this.clickScrolling = false;
    this.intervalID = false;
    this.staticLayoutClass = 'toc--static';
    this.contentStaticLayoutClass = 'toc-content--toc-static';
    this.expandedClass = 'toc--expanded';
    this.isStatic = Util.hasClass(this.element, this.staticLayoutClass);
    this.layout = 'static';
    initToc(this);
  };

  function getSections(toc) {
    var sections = [];
    // get all content sections
    for(var i = 0; i < toc.anchors.length; i++) {
      var section = document.getElementById(toc.anchors[i].getAttribute('href').replace('#', ''));
      if(section) sections.push(section);
    }
    return sections;
  };

  function getTocContent(toc) {
    if(toc.sections.length < 1) return false;
    var content = toc.sections[0].closest('.js-toc-content');
    return content;
  };

  function initToc(toc) {
    checkTocLayour(toc); // switch between mobile and desktop layout
    if(toc.sections.length > 0) {
      // listen for click on anchors
      toc.list.addEventListener('click', function(event){
        var anchor = event.target.closest('a[href^="#"]');
        if(!anchor) return;
        // reset link apperance 
        toc.clickScrolling = true;
        resetAnchors(toc, anchor);
        // close toc if expanded on mobile
        toggleToc(toc, true);
      });

      // check when a new section enters the viewport
      var intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
      if(intersectionObserverSupported) {
        var observer = new IntersectionObserver(
          function(entries, observer) { 
            entries.forEach(function(entry){
              if(!toc.clickScrolling) { // do not update classes if user clicked on a link
                getVisibleSection(toc);
              }
            });
          }, 
          {
            threshold: [0, 0.1],
            rootMargin: "0px 0px -70% 0px"
          }
        );

        for(var i = 0; i < toc.sections.length; i++) {
          observer.observe(toc.sections[i]);
        }
      }

      // detect the end of scrolling -> reactivate IntersectionObserver on scroll
      toc.element.addEventListener('toc-scroll', function(event){
        toc.clickScrolling = false;
      });
    }

    // custom event emitted when window is resized
    toc.element.addEventListener('toc-resize', function(event){
      checkTocLayour(toc);
    });

    // collapsed version only (mobile)
    initCollapsedVersion(toc);
  };

  function resetAnchors(toc, anchor) {
    if(!anchor) return;
    for(var i = 0; i < toc.anchors.length; i++) Util.removeClass(toc.anchors[i], 'toc__link--selected');
    Util.addClass(anchor, 'toc__link--selected');
  };

  function getVisibleSection(toc) {
    if(toc.intervalID) {
      clearInterval(toc.intervalID);
    }
    toc.intervalID = setTimeout(function(){
      var halfWindowHeight = window.innerHeight/2,
      index = -1;
      for(var i = 0; i < toc.sections.length; i++) {
        var top = toc.sections[i].getBoundingClientRect().top;
        if(top < halfWindowHeight) index = i;
      }
      if(index > -1) {
        resetAnchors(toc, toc.anchors[index]);
      }
      toc.intervalID = false;
    }, 100);
  };

  function checkTocLayour(toc) {
    if(toc.isStatic) return;
    toc.layout = getComputedStyle(toc.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
    Util.toggleClass(toc.element, toc.staticLayoutClass, toc.layout == 'static');
    if(toc.content) Util.toggleClass(toc.content, toc.contentStaticLayoutClass, toc.layout == 'static');
  };

  function initCollapsedVersion(toc) { // collapsed version only (mobile)
    if(toc.controller.length < 1) return;
    
    // toggle nav visibility
    toc.controller[0].addEventListener('click', function(event){
      var isOpen = Util.hasClass(toc.element, toc.expandedClass);
      toggleToc(toc, isOpen);
    });

    // close expanded version on esc
    toc.element.addEventListener('keydown', function(event){
      if(toc.layout == 'static') return;
      if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape') ) {
        toggleToc(toc, true);
        toc.controller[0].focus();
      }
    });
  };

  function toggleToc(toc, bool) { // collapsed version only (mobile)
    if(toc.controller.length < 1) return;
    // toggle mobile version
    Util.toggleClass(toc.element, toc.expandedClass, !bool);
    bool ? toc.controller[0].removeAttribute('aria-expanded') : toc.controller[0].setAttribute('aria-expanded', 'true');
    if(!bool && toc.anchors.length > 0) {
      toc.anchors[0].focus();
    }
  };
  
  var tocs = document.getElementsByClassName('js-toc');

  var tocsArray = [];
	if( tocs.length > 0) {
		for( var i = 0; i < tocs.length; i++) {
			(function(i){ tocsArray.push(new Toc(tocs[i])); })(i);
    }

    // listen to window scroll -> reset clickScrolling property
    var scrollId = false,
      resizeId = false,
      scrollEvent = new CustomEvent('toc-scroll'),
      resizeEvent = new CustomEvent('toc-resize');
      
    window.addEventListener('scroll', function() {
      clearTimeout(scrollId);
      scrollId = setTimeout(doneScrolling, 100);
    });

    window.addEventListener('resize', function() {
      clearTimeout(resizeId);
      scrollId = setTimeout(doneResizing, 100);
    });

    function doneScrolling() {
      for( var i = 0; i < tocsArray.length; i++) {
        (function(i){tocsArray[i].element.dispatchEvent(scrollEvent)})(i);
      };
    };

    function doneResizing() {
      for( var i = 0; i < tocsArray.length; i++) {
        (function(i){tocsArray[i].element.dispatchEvent(resizeEvent)})(i);
      };
    };
  }
}());
// File#: _2_morphing-navigation
// Usage: codyhouse.co/license
(function() {
  var MorphNav = function(element) {
    this.element = element;
    this.menuToggle = this.element.getElementsByClassName('js-morph-nav__sm-menu-toggle');
    this.nav = this.element.getElementsByClassName('js-morph-nav__sm-dropdown');
    this.morphDropown = this.element.getElementsByClassName('js-morph-nav__lg-subnav');
    this.morphDpWrapper = this.element.getElementsByClassName('js-morph-nav__lg-dropdown-wrapper');
    this.morphBg = this.element.getElementsByClassName('js-morph-nav__lg-dropdown-bg');
    this.navItems = this.element.getElementsByClassName('js-morph-nav__lg-nav-item');
    this.navDropdowns = this.element.getElementsByClassName('js-morph-nav__lg-dropdown-item');
    if(this.nav.length < 1 || this.menuToggle.length < 1 || this.morphBg.length < 1) return false;

    // variables to navigate dropdown with keyboard
    this.navFirstFocusable = navFirstFocusable(this);
    this.indexKeyDropdown = -1;
    this.dropdownFocusableItems = [];
    
    initMorphNav(this);
  };

  function navFirstFocusable(obj) {
    var focusableEle = obj.nav[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
			firstFocusable = false;

    for(var i = 0; i < focusableEle.length; i++) {
      if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
        firstFocusable = focusableEle[i];
        break;
      }
    }

    return firstFocusable;
  };

  function initMorphNav(obj) {
    // get focusable items in dropdown
    initDrobdownFocusable(obj);

    // on small devices - show navigation when clicking on menu toggle button
    obj.menuToggle[0].addEventListener('click', function(event){
      toggleMenuNavigation(obj);
    });

    // init key events
    initKeyEvents(obj);

    // on bigger devices - show morphing dropdown on hover/click
    for( var i = 0; i < obj.navItems.length; i++) {
			(function(i){
        detectHover(obj, i);
        detectClick(obj, i);
      })(i);
		}
  };

  function toggleMenuNavigation(obj) { // toggle menu visibility on small devices
    var expandedStatus = obj.nav[0].classList.toggle('morph-nav__sm-dropdown--is-visible');
    obj.menuToggle[0].setAttribute('aria-expanded', expandedStatus);
    if(expandedStatus && obj.navFirstFocusable) obj.navFirstFocusable.focus(); // move focus to first focusable element
  };

  function detectHover(obj, index) {
    obj.navItems[index].addEventListener('mouseenter', function(event){
      showMorphBg(obj, index);
    });
    
    obj.navItems[index].addEventListener('mouseleave', function(event){
      setTimeout(function(){
        if(isDropdownHovered(obj, index)) return; // the mouse moved to the dropdown
        isDropdownHovered(obj) ? hideDropdown(obj, index) : hideMorphBg(obj, index);
      }, 50);
    });

    obj.navDropdowns[index].addEventListener('mouseleave', function(event){
      setTimeout(function(){
        if(isDropdownHovered(obj, index)) return; // the mouse moved to the dropdown
        isDropdownHovered(obj) ? hideDropdown(obj, index) : hideMorphBg(obj, index);
      }, 50);
    });
  };

  function detectClick(obj, index) {
    obj.navItems[index].addEventListener('click', function(event){
      if(!obj.navDropdowns[index].classList.contains('morph-nav__lg-dropdown-item--is-visible')) {
        showMorphBg(obj, index, function(){
          if(obj.dropdownFocusableItems[index].length > 0) obj.dropdownFocusableItems[index][0].focus();
        });
      } else {
        hideMorphBg(obj, index);
      } 
    });
  };

  function isDropdownHovered(obj, index) {
    var hovered = false;
    if(typeof index !== 'undefined') {
      // check if a specific dropdown is hovered
      if(obj.navItems[index].matches(':hover') || obj.navDropdowns[index].matches(':hover')) return true;
      return false;
    }
    for(var i = 0; i < obj.navItems.length; i++) {
      // check if one of the dropdowns is hovered
      if(obj.navItems[i].matches(':hover') || obj.navDropdowns[i].matches(':hover')) {
        hovered = true;
        break;
      }
    }
    return hovered;
  };

  function showMorphBg(obj, index, cb) {
    var timeout = 0,
      duration = 300;
    if(!obj.morphBg[0].classList.contains('morph-nav__lg-dropdown-bg--is-visible')) {
      timeout = 50;
      duration = 0;
    }
    resetBgStyle(obj, index, duration); // set dropdown position/size

    // add visibility classes
    setTimeout(function(){
      obj.morphDropown[0].classList.add('morph-nav__lg-subnav--is-visible');
      obj.morphBg[0].classList.add('morph-nav__lg-dropdown-bg--is-visible');
      obj.navDropdowns[index].classList.add('morph-nav__lg-dropdown-item--is-visible');
      setAriaAttribute(obj, index, 'true');
      if(cb) cb();
    }, timeout);
  };

  function hideMorphBg(obj, index) {
    obj.morphDropown[0].classList.remove('morph-nav__lg-subnav--is-visible');
    obj.morphBg[0].classList.remove('morph-nav__lg-dropdown-bg--is-visible');
    obj.navDropdowns[index].classList.remove('morph-nav__lg-dropdown-item--is-visible');
    setAriaAttribute(obj, index, 'false');
  };

  function hideDropdown(obj, index) {
    obj.navDropdowns[index].classList.remove('morph-nav__lg-dropdown-item--is-visible');
    setAriaAttribute(obj, index, 'false');
  };

  function resetBgStyle(obj, index, duration) {
    var height = 0, width = 0, left = 0, top = 0;
    if(obj.navItems[index]) {
      var boundingRectItem = obj.navItems[index].getBoundingClientRect(),
        left = boundingRectItem.left,
        itemWidth = boundingRectItem.width;
    }

    if(obj.navDropdowns[index]) {
      var boundingRectDrop = obj.navDropdowns[index].getBoundingClientRect(),
        height = boundingRectDrop.height,
        width = boundingRectDrop.width;
    }

    animateElement(obj, height, width, left - width/2 +itemWidth/2, duration, 'easeOutQuart');
  };

  function setAriaAttribute(obj, index, value) {
    var controller = obj.navItems[index].querySelector('button');
    if(controller) controller.setAttribute('aria-exanded', value);
  };

  function initKeyEvents(obj) {
    // key navigation - small devices
    window.addEventListener('keyup', function(event){
			// listen for esc key - close navigation if open
			if( event.key && event.key.toLowerCase() == 'escape' && !shouldShowMorphBg(obj)) {
				if(obj.menuToggle[0].getAttribute('aria-expanded') == 'true' && document.activeElement.closest('.js-morph-nav')) {
					obj.menuToggle[0].click();
          obj.menuToggle[0].focus();
				}
			}
			// listen for tab key - close navigation when it loses focus 
			if( event.key && event.key.toLowerCase() == 'tab' && !shouldShowMorphBg(obj)) {
				if(obj.menuToggle[0].getAttribute('aria-expanded') == 'true' && !document.activeElement.closest('.js-morph-nav')) obj.menuToggle[0].click();
			}
		});

    // key navigation - bigger devices
    window.addEventListener('keydown', function(event){
      if( event.key && event.key.toLowerCase() == 'tab' && shouldShowMorphBg(obj)) {
        obj.indexKeyDropdown = getFocusedDropdown(obj);
        var direction = event.shiftKey ? 'prev' : 'next';
        if(obj.indexKeyDropdown > -1) navigateDropdown(obj, direction, event);
      }
    });
  };

  function getFocusedDropdown(obj) {
    var index = -1;
    // return the index of the dropdown in focus (if any)
    for(var i = 0; i < obj.navDropdowns.length; i++) {
      if(obj.navItems[i].matches(':focus-within') || obj.navDropdowns[i].matches(':focus-within')) {
        index = i;
        break;
      }
    }
    return index;
  };

  function navigateDropdown(obj, direction, event) {
    if( obj.dropdownFocusableItems[obj.indexKeyDropdown][0] == document.activeElement && direction == 'prev') {
      // first focusable item in dropdown is in focus -> move focus to trigger
      moveFocusToTrigger(obj, event, obj.indexKeyDropdown);
    }
    if( obj.dropdownFocusableItems[obj.indexKeyDropdown][obj.dropdownFocusableItems[obj.indexKeyDropdown].length - 1] == document.activeElement && direction == 'next') {
      // last focusable item in dropdown is in focus -> move focus to trigger
      moveFocusToTrigger(obj, event, obj.indexKeyDropdown);
    }
  };

  function moveFocusToTrigger(obj, event, index) {
    event.preventDefault();
    var focusable = obj.navItems[index].querySelector('button, a');
    if(focusable) focusable.focus();
    hideMorphBg(obj, index);
  };

  function initDrobdownFocusable(obj) {
    for(var i = 0; i < obj.navDropdowns.length; i++) {
      obj.dropdownFocusableItems[i] = obj.navDropdowns[i].querySelectorAll(focusableElString);
    }
  };

  function shouldShowMorphBg(obj) {
    // true on bigger devices
    return !(obj.menuToggle[0].offsetWidth || obj.menuToggle[0].offsetHeight || obj.menuToggle[0].getClientRects().length);
  };

  function animateElement(obj, toH, toW, toT, duration) {
    // loop function to animate height/width/transform
    if(duration == 0) {
      obj.morphDpWrapper[0].style.height = toH+"px";
      obj.morphDpWrapper[0].style.width = toW+"px";
      obj.morphDpWrapper[0].style.transform = 'translateX('+toT+'px)';
      return;
    }
    var startW = obj.morphDpWrapper[0].offsetWidth,
      startH = obj.morphDpWrapper[0].offsetHeight,
      startT = getTranslateX();

    var currentTime = null;

    var animateLoop = function(timestamp){  
      if (!currentTime) currentTime = timestamp;         
      var progress = timestamp - currentTime;
      if(progress > duration) progress = duration;
      // get new style values
      var valH = Math.easeOutQuart(progress, startH, toH - startH, duration);
      var valW = Math.easeOutQuart(progress, startW, toW - startW, duration);
      var valT = Math.easeOutQuart(progress, startT, toT - startT, duration);
      
      obj.morphDpWrapper[0].style.height = valH+"px";
      obj.morphDpWrapper[0].style.width = valW+"px";
      obj.morphDpWrapper[0].style.transform = 'translateX('+valT+'px)';
      if(progress < duration) {
        window.requestAnimationFrame(animateLoop);
      }
    };

    function getTranslateX() {
      var style = window.getComputedStyle(obj.morphDpWrapper[0]);
      var matrix = new WebKitCSSMatrix(style.transform);
      return matrix.m41;
    }
    
    obj.morphDpWrapper[0].style.height = startH+"px";
    obj.morphDpWrapper[0].style.width = startW+"px";
    window.requestAnimationFrame(animateLoop);
  };

  Math.easeOutQuart = function (t, b, c, d) {
    t /= d;
    t--;
    return -c * (t*t*t*t - 1) + b;
  };

  var focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';

  window.MorphNav = MorphNav;

  var morphNav = document.getElementsByClassName('js-morph-nav');
	if(morphNav.length > 0) {
		for( var i = 0; i < morphNav.length; i++) {
			(function(i){new MorphNav(morphNav[i]);})(i);
		}
  }
}());
// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

// File#: _2_pricing-table-v2
// Usage: codyhouse.co/license
(function() {
	var pTable = document.getElementsByClassName('js-p-table-v2');
	if(pTable.length > 0) {
		for(var i = 0; i < pTable.length; i++) {
			(function(i){ addPTableEvent(pTable[i]);})(i);
		}

		function addPTableEvent(element) {
			// switcher monthly/yearly plan
      var pSwitch = element.getElementsByClassName('js-p-table-v2__switch');
			if(pSwitch.length > 0) {
				pSwitch[0].addEventListener('change', function(event) {
          Util.toggleClass(element, 'p-table-v2--monthly-plan', (event.target.value == 'monthly'));
				});
			}

			// volume selector for multiple-users plan
			var pSelect = element.getElementsByClassName('js-p-table-v2__select'),
				pVolumeBtn = element.getElementsByClassName('js-p-table-v2__btn-volume');
			if(pSelect.length > 0 && pVolumeBtn.length > 0) {
				var volumeOptions = pVolumeBtn[0].querySelectorAll('[data-value]');
				updatePTableTeam(volumeOptions, pSelect[0].value); // init multiple-users plan price
				pSelect[0].addEventListener('change', function(event) {
          updatePTableTeam(volumeOptions, pSelect[0].value);
				});
			}
		}

		function updatePTableTeam(volumeOpt, value) {
			for(var i = 0; i < volumeOpt.length; i++) {
				volumeOpt[i].getAttribute('data-value') == value
					? volumeOpt[i].removeAttribute('style')
					: volumeOpt[i].setAttribute('style', 'display: none;');
			}
		};
	}
}());
// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

// File#: _2_pricing-table
// Usage: codyhouse.co/license
(function() {
	// NOTE: you need the js code only when using the --has-switch variation of the pricing table
	// default version does not require js
	var pTable = document.getElementsByClassName('js-p-table--has-switch');
	if(pTable.length > 0) {
		for(var i = 0; i < pTable.length; i++) {
			(function(i){ addPTableEvent(pTable[i]);})(i);
		}

		function addPTableEvent(element) {
			var pSwitch = element.getElementsByClassName('js-p-table__switch')[0];
			if(pSwitch) {
				pSwitch.addEventListener('change', function(event) {
          Util.toggleClass(element, 'p-table--yearly', (event.target.value == 'yearly'));
				});
			}
		}
	}
}());
// File#: _2_floating-side-nav
// Usage: codyhouse.co/license
(function() {
  var FSideNav = function(element) {
		this.element = element;
    this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
    this.list = this.element.getElementsByClassName('js-float-sidenav__list')[0];
    this.anchors = this.list.querySelectorAll('a[href^="#"]');
    this.sections = getSections(this);
    this.sectionsContainer = document.getElementsByClassName('js-float-sidenav-target');
		this.firstFocusable = getFSideNavFirstFocusable(this);
		this.selectedTrigger = null;
    this.showClass = "float-sidenav--is-visible";
    this.clickScrolling = false;
    this.intervalID = false;
		initFSideNav(this);
  };

  function getSections(nav) {
    var sections = [];
    // get all content sections
    for(var i = 0; i < nav.anchors.length; i++) {
      var section = document.getElementById(nav.anchors[i].getAttribute('href').replace('#', ''));
      if(section) sections.push(section);
    }
    return sections;
  };

  function getFSideNavFirstFocusable(nav) {
    var focusableEle = nav.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
				firstFocusable = false;
    for(var i = 0; i < focusableEle.length; i++) {
      if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
        firstFocusable = focusableEle[i];
        break;
      }
    }

    return firstFocusable;
  };
  
  function initFSideNav(nav) {
    initButtonTriggers(nav); // mobile version behaviour

    initAnchorEvents(nav); // select anchor in list

    if(intersectionObserverSupported) {
      initSectionScroll(nav); // update anchor appearance on scroll
    } else {
      nav.element.classList.add('float-sidenav--on-target');
    }
  };

  function initButtonTriggers(nav) { // mobile only
    if ( !nav.triggers ) return;

    for(var i = 0; i < nav.triggers.length; i++) {
      nav.triggers[i].addEventListener('click', function(event) {
        openFSideNav(nav, event);
      });
    }

    // close side nav when clicking on close button/bg layer
    nav.element.addEventListener('click', function(event) {
      if(event.target.closest('.js-float-sidenav__close-btn') || event.target.classList.contains('js-float-sidenav')) {
        closeFSideNav(nav, event);
      }
    });

    // listen for key events
		window.addEventListener('keyup', function(event){
			// listen for esc key
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				closeFSideNav(nav, event);
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) { // close navigation on mobile if open when nav loses focus
        if( !document.activeElement.closest('.js-float-sidenav')) closeFSideNav(nav, event, true);
			}
		});
  };

  function openFSideNav(nav, event) { // open side nav - mobile only
    event.preventDefault();
    nav.selectedTrigger = event.target;
    event.target.setAttribute('aria-expanded', 'true');
    nav.element.classList.add(nav.showClass);
    nav.element.addEventListener('transitionend', function cb(event){
      nav.element.removeEventListener('transitionend', cb);
      nav.firstFocusable.focus();
    });
  };

  function closeFSideNav(nav, event, bool) { // close side nav - mobile only
    if( !nav.element.classList.contains(nav.showClass) ) return;
    if(event) event.preventDefault();
    nav.element.classList.remove(nav.showClass);
    if(!nav.selectedTrigger) return;
    nav.selectedTrigger.setAttribute('aria-expanded', 'false');
    if(!bool) nav.selectedTrigger.focus();
    nav.selectedTrigger = false; 
  };

  function initAnchorEvents(nav) {
    nav.list.addEventListener('click', function(event){
      var anchor = event.target.closest('a[href^="#"]');
      if(!anchor || anchor.classList.contains('float-sidenav__link--selected')) return;
      if(nav.clickScrolling) { // a different link has already been clicked
        event.preventDefault();
        return;
      }
      // reset link apperance 
      nav.clickScrolling = true;
      resetAnchors(nav, anchor);
      closeFSideNav(nav, false, true);
      if(!canScroll()) window.dispatchEvent(new CustomEvent('scroll'));
    });
  };

  function canScroll() {
    var pageHeight = document.documentElement.offsetHeight,
      windowHeight = window.innerHeight,
      scrollPosition = window.scrollY || window.pageYOffset || document.body.scrollTop + (document.documentElement && document.documentElement.scrollTop || 0);
    
    return !(pageHeight - 2 <= windowHeight + scrollPosition);
  };

  function resetAnchors(nav, anchor) {
    if(!intersectionObserverSupported) return;
    for(var i = 0; i < nav.anchors.length; i++) nav.anchors[i].classList.remove('float-sidenav__link--selected');
    if(anchor) anchor.classList.add('float-sidenav__link--selected');
  };

  function initSectionScroll(nav) {
    // check when a new section enters the viewport
    var observer = new IntersectionObserver(
      function(entries, observer) { 
        entries.forEach(function(entry){
          var threshold = entry.intersectionRatio.toFixed(1);
          
          if(!nav.clickScrolling) { // do not update classes if user clicked on a link
            getVisibleSection(nav);
          }

          // if first section is not inside the viewport - reset anchors
          if(nav.sectionsContainer && entry.target == nav.sections[0] && threshold == 0 && nav.sections[0].getBoundingClientRect().top > 0) {
            setSectionsLimit(nav);
          }
        });

        // check if there's a selected dot and toggle the --on-target class from the nav
        nav.element.classList.toggle('float-sidenav--on-target', nav.list.getElementsByClassName('float-sidenav__link--selected').length != 0);
      }, 
      {
        rootMargin: "0px 0px -50% 0px"
      }
    );

    for(var i = 0; i < nav.sections.length; i++) {
      observer.observe(nav.sections[i]);
    }

    // detect when sections container is inside/outside the viewport
    if(nav.sectionsContainer) {
      var containerObserver = new IntersectionObserver(
        function(entries, observer) { 
          entries.forEach(function(entry){
            var threshold = entry.intersectionRatio.toFixed(1);

            if(entry.target.getBoundingClientRect().top < 0) {
              if(threshold == 0) {
                setSectionsLimit(nav);
              } else {
                activateLastSection(nav);
              }
            }
          });
        },
        {threshold: [0, 0.1, 1]}
      );

      containerObserver.observe(nav.sectionsContainer[0]);
    }

    // detect the end of scrolling -> reactivate IntersectionObserver on scroll
    nav.element.addEventListener('float-sidenav-scroll', function(event){
      if(!nav.clickScrolling) getVisibleSection(nav);
      nav.clickScrolling = false;
    });
  };

  function setSectionsLimit(nav) {
    if(!nav.clickScrolling) resetAnchors(nav, false);
    nav.element.classList.remove('float-sidenav--on-target');
  };

  function activateLastSection(nav) {
    nav.element.classList.add('float-sidenav--on-target');
    if(nav.list.getElementsByClassName('float-sidenav__link--selected').length == 0 ) {
      nav.anchors[nav.anchors.length - 1].classList.add('float-sidenav__link--selected');
    }
  };

  function getVisibleSection(nav) {
    if(nav.intervalID) return;
    nav.intervalID = setTimeout(function(){
      var halfWindowHeight = window.innerHeight/2,
      index = -1;
      for(var i = 0; i < nav.sections.length; i++) {
        var top = nav.sections[i].getBoundingClientRect().top;
        if(top < halfWindowHeight) index = i;
      }
      if(index > -1) {
        resetAnchors(nav, nav.anchors[index]);
      }
      nav.intervalID = false;
    }, 100);
  };

  //initialize the Side Nav objects
  var fixedNav = document.getElementsByClassName('js-float-sidenav'),
    intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
  
  var fixedNavArray = [];
	if( fixedNav.length > 0 ) {
		for( var i = 0; i < fixedNav.length; i++) {
			(function(i){ fixedNavArray.push(new FSideNav(fixedNav[i])) ; })(i);
    }
    
    // listen to window scroll -> reset clickScrolling property
    var scrollId = false,
      customEvent = new CustomEvent('float-sidenav-scroll');
      
    window.addEventListener('scroll', function() {
      clearTimeout(scrollId);
      scrollId = setTimeout(doneScrolling, 100);
    });

    function doneScrolling() {
      for( var i = 0; i < fixedNavArray.length; i++) {
        (function(i){fixedNavArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
	}
}());
// File#: _2_main-header-v3
// Usage: codyhouse.co/license
(function() {
	var mainHeader = document.getElementsByClassName('js-header-v3');
	if(mainHeader.length > 0) {
		var menuTrigger = mainHeader[0].getElementsByClassName('js-toggle-menu')[0],
			searchTrigger = mainHeader[0].getElementsByClassName('js-toggle-search'),
			navigation = mainHeader[0].getElementsByClassName('header-v3__nav')[0];

		// we'll use these to store the node that needs to receive focus when the mobile menu/search input are closed 
		var focusSearch = false,
			focusMenu = false;
			
		// set delays for list items inside navigation -> mobile animation
		var navItems = getChildrenByClassName(navigation.getElementsByClassName('header-v3__nav-list')[0], 'header-v3__nav-item');
		for(var i = 0; i < navItems.length; i++) {
			setTransitionDelay(navItems[i], i);
		}
		// toggle navigation on mobile
		menuTrigger.addEventListener('switch-icon-clicked', function(event){ // toggle menu visibility an small devices
			toggleNavigation(event.detail);
		});
		// toggle search on desktop
		if(searchTrigger.length > 0) {
			searchTrigger[0].addEventListener('switch-icon-clicked', function(event){ // toggle menu visibility an small devices
				toggleSearch(event.detail);
			});
		}
		
		window.addEventListener('keyup', function(event){
			// listen for esc key events
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
					focusMenu = menuTrigger; // move focus to menu trigger when menu is close
					menuTrigger.click();
				}
				// close search if open
				if(searchTrigger.length > 0 && searchTrigger[0].getAttribute('aria-expanded') == 'true' && isVisible(searchTrigger[0])) {
					focusSearch = searchTrigger[0]; // move focus to search trigger when search is close
					searchTrigger[0].click();
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				// close navigation on mobile if open when nav loses focus
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-header-v3')) menuTrigger.click();
			}
		});

		// listen for resize
		var resizingId = false;
		window.addEventListener('resize', function() {
			clearTimeout(resizingId);
			resizingId = setTimeout(doneResizing, 300);
		});

		function toggleNavigation(bool) {
			navigation.classList.add('header-v3__nav--is-visible');
			menuTrigger.classList.add('switch-icon--disabled');
			menuTrigger.setAttribute('aria-expanded', bool);
			// animate navigation height
			var finalHeight = bool ? window.innerHeight: 0,
				initHeight = bool ? 0 : window.innerHeight; 
			navigation.style.height = initHeight+'px';

			setTimeout(function(){
				navigation.style.height = finalHeight+'px';
				navigation.classList.toggle('header-v3__nav--animate-children', bool);
			}, 50);

			navigation.addEventListener('transitionend', function cb(event){
				if (event.propertyName !== 'height') return;
				if(finalHeight > 0) {
					var firstFocusableElement = getMenuFirstFocusable();
					firstFocusableElement.focus(); // move focus to first focusable element
				} else {
					navigation.classList.remove('header-v3__nav--is-visible', 'header-v3__nav--animate-children');
					if(focusMenu) { // we may need to move the focus to a new element
						focusMenu.focus();
						focusMenu = false;
					}
				}
				
				navigation.removeEventListener('transitionend', cb);
				navigation.removeAttribute('style');
				menuTrigger.classList.remove('switch-icon--disabled');
			});
			// toggle expanded class to header
			mainHeader[0].classList.toggle('header-v3--expanded', bool);
		};

		function toggleSearch(bool){
			searchTrigger[0].classList.add('switch-icon--disabled');
			mainHeader[0].classList.toggle('header-v3--show-search', bool);
			searchTrigger[0].setAttribute('aria-expanded', bool);
			mainHeader[0].addEventListener('transitionend', function cb(){
				mainHeader[0].removeEventListener('transitionend', cb);
				searchTrigger[0].classList.remove('switch-icon--disabled');
				if(bool) mainHeader[0].getElementsByClassName('header-v3__nav-item--search-form')[0].getElementsByTagName('input')[0].focus();
				else if(focusSearch) {// move focus to a new element when closing the search
					focusSearch.focus();
					focusSearch = false;
				}
			});

			// toggle expanded class to header
			mainHeader[0].classList.toggle('header-v3--expanded', bool);
		};

		function doneResizing() {
			// check if main nav is visible (small devices only)
			if( !isVisible(menuTrigger) && menuTrigger.getAttribute('aria-expanded') == 'true') menuTrigger.click();
			// check if search input is visible
			if( searchTrigger.length > 0 && !isVisible(searchTrigger[0]) && searchTrigger[0].getAttribute('aria-expanded') == 'true') searchTrigger[0].click();
		};

		function getMenuFirstFocusable() {
			var focusableEle = mainHeader[0].getElementsByClassName('header-v3__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
				firstFocusable = false;
			for(var i = 0; i < focusableEle.length; i++) {
				if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
					firstFocusable = focusableEle[i];
					break;
				}
			}

			return firstFocusable;
		};

		function setTransitionDelay(element, index) {
			element.style.transitionDelay = parseFloat((index/20) + 0.1).toFixed(2)+'s';
		};

		function isVisible(element) {
			return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
		};

		function getChildrenByClassName(el, className) {
			var children = el.children,
				childrenByClass = [];
			for (var i = 0; i < children.length; i++) {
				if (children[i].classList.contains(className)) childrenByClass.push(children[i]);
			}
			return childrenByClass;
		};
	}
}());
// utility functions
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName('body')[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

Util.extend = function() {
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// File#: _2_slideshow-preview-mode
// Usage: codyhouse.co/license
(function() {
	var SlideshowPrew = function(opts) {
		this.options = Util.extend(SlideshowPrew.defaults , opts);
		this.element = this.options.element;
		this.list = this.element.getElementsByClassName('js-slideshow-pm__list')[0];
		this.items = this.list.getElementsByClassName('js-slideshow-pm__item');
		this.controls = this.element.getElementsByClassName('js-slideshow-pm__control-wrapper'); 
		this.selectedSlide = 0;
		this.autoplayId = false;
		this.autoplayPaused = false;
		this.navigation = false;
		this.navCurrentLabel = false;
		this.ariaLive = false;
		this.moveFocus = false;
		this.animating = false;
		this.supportAnimation = Util.cssSupports('transition');
		this.itemWidth = false;
		this.itemMargin = false;
		this.containerWidth = false;
		this.resizeId = false;
		// we will need this to implement keyboard nav
		this.firstFocusable = false;
		this.lastFocusable = false;
		// fallback for browsers not supporting flexbox
		initSlideshow(this);
		initSlideshowEvents(this);
		initAnimationEndEvents(this);
		Util.addClass(this.element, 'slideshow-pm--js-loaded');
	};

	SlideshowPrew.prototype.showNext = function(autoplay) {
		showNewItem(this, this.selectedSlide + 1, 'next', autoplay);
	};

	SlideshowPrew.prototype.showPrev = function() {
		showNewItem(this, this.selectedSlide - 1, 'prev');
	};

	SlideshowPrew.prototype.showItem = function(index) {
		showNewItem(this, index, false);
	};

	SlideshowPrew.prototype.startAutoplay = function() {
		var self = this;
		if(this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
			self.autoplayId = setInterval(function(){
				self.showNext(true);
			}, self.options.autoplayInterval);
		}
	};

	SlideshowPrew.prototype.pauseAutoplay = function() {
		var self = this;
		if(this.options.autoplay) {
			clearInterval(self.autoplayId);
			self.autoplayId = false;
		}
	};

	function initSlideshow(slideshow) { // basic slideshow settings
		// if no slide has been selected -> select the first one
		if(slideshow.element.getElementsByClassName('slideshow-pm__item--selected').length < 1) Util.addClass(slideshow.items[0], 'slideshow-pm__item--selected');
		slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('slideshow-pm__item--selected')[0]);
		// now set translate value to the container element
		setTranslateValue(slideshow);
		setTranslate(slideshow);
		resetSlideshowNav(slideshow, 0, slideshow.selectedSlide);
		setFocusableElements(slideshow);
		// if flexbox is not supported, set a width for the list element
		if(!flexSupported) resetSlideshowFlexFallback(slideshow);
		// now add class to animate while translating
		setTimeout(function(){Util.addClass(slideshow.list, 'slideshow-pm__list--has-transition');}, 50);
		// add arai-hidden to not selected slides
		for(var i = 0; i < slideshow.items.length; i++) {
			(i == slideshow.selectedSlide) ? slideshow.items[i].removeAttribute('aria-hidden') : slideshow.items[i].setAttribute('aria-hidden', 'true');
		}
		// create an element that will be used to announce the new visible slide to SR
		var srLiveArea = document.createElement('div');
		Util.setAttributes(srLiveArea, {'class': 'se4-sr-only js-slideshow-pm__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
		slideshow.element.appendChild(srLiveArea);
		slideshow.ariaLive = srLiveArea;
	};

	function initSlideshowEvents(slideshow) {
		// if slideshow navigation is on -> create navigation HTML and add event listeners
		if(slideshow.options.navigation) {
			var navigation = document.createElement('ol'),
				navChildren = '';
			
			navigation.setAttribute('class', slideshow.options.navClass);
			for(var i = 0; i < slideshow.items.length; i++) {
				var className = (i == slideshow.selectedSlide) ? 'class="'+slideshow.options.navItemClass+' '+slideshow.options.navItemClass+'--selected js-slideshow-pm__nav-item"' :  'class="'+slideshow.options.navItemClass+' js-slideshow-pm__nav-item"',
					navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="se4-sr-only js-slideshow-pm__nav-current-label">Current Item</span>' : '';
				navChildren = navChildren + '<li '+className+'><button class="se4-reset '+slideshow.options.navBtnClass+'"><span class="se4-sr-only">'+ (i+1) + '</span>'+navCurrentLabel+'</button></li>';
			}

			navigation.innerHTML = navChildren;
			slideshow.navCurrentLabel = navigation.getElementsByClassName('js-slideshow-pm__nav-current-label')[0]; 
			slideshow.element.appendChild(navigation);
			slideshow.navigation = slideshow.element.getElementsByClassName('js-slideshow-pm__nav-item');

			navigation.addEventListener('click', function(event){
				navigateSlide(slideshow, event, true);
			});
			navigation.addEventListener('keyup', function(event){
				navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
			});
		}
		// slideshow arrow controls
		if(slideshow.controls.length > 0) {
			slideshow.controls[0].addEventListener('click', function(event){
				event.preventDefault();
				slideshow.showPrev();
				updateAriaLive(slideshow);
			});
			slideshow.controls[1].addEventListener('click', function(event){
				event.preventDefault();
				slideshow.showNext(false);
				updateAriaLive(slideshow);
			});
		}
		// navigate slideshow when clicking on preview
		if(slideshow.options.prewNav) {
			slideshow.element.addEventListener('click', function(event){
				var item = event.target.closest('.js-slideshow-pm__item');
				if(item && !Util.hasClass(item, 'slideshow-pm__item--selected')) {
					slideshow.showItem(Util.getIndexInArray(slideshow.items, item));
				}
			});
		}
		// swipe events
		if(slideshow.options.swipe) {
			//init swipe
			new SwipeContent(slideshow.element);
			slideshow.element.addEventListener('swipeLeft', function(event){
				slideshow.showNext(false);
			});
			slideshow.element.addEventListener('swipeRight', function(event){
				slideshow.showPrev();
			});
		}
		// autoplay
		if(slideshow.options.autoplay) {
			slideshow.startAutoplay();
			// pause autoplay if user is interacting with the slideshow
			slideshow.element.addEventListener('mouseenter', function(event){
				slideshow.pauseAutoplay();
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('focusin', function(event){
				slideshow.pauseAutoplay();
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('mouseleave', function(event){
				slideshow.autoplayPaused = false;
				slideshow.startAutoplay();
			});
			slideshow.element.addEventListener('focusout', function(event){
				slideshow.autoplayPaused = false;
				slideshow.startAutoplay();
			});
		}
		// keyboard navigation
		initKeyboardEvents(slideshow);
		// reset on resize
    window.addEventListener('resize', function(event){
    	slideshow.pauseAutoplay();
      clearTimeout(slideshow.resizeId);
      slideshow.resizeId = setTimeout(function(){
        resetSlideshowResize(slideshow);
        setTimeout(function(){slideshow.startAutoplay();}, 60);
      }, 250)
    });
	};

	function initKeyboardEvents(slideshow) {
		// tab on selected slide -> if last focusable -> move to prev or next arrow
		// tab + shift selected slide -> if first focusable -> move to container
		if(slideshow.controls.length > 0) {
			// tab+shift on prev arrow -> move focus to last focusable element inside the selected slide (or to the slider container)
			slideshow.controls[0].addEventListener('keydown', function(event){
				if( (event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab') && event.shiftKey ) moveFocusToLast(slideshow);
			});
			// tab+shift on next arrow -> if first slide selectes -> move focus to last focusable element inside the selected slide (or to the slider container)
			slideshow.controls[1].addEventListener('keydown', function(event){
				if( (event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab') && event.shiftKey && (slideshow.selectedSlide == 0)) moveFocusToLast(slideshow);
			});
		}
		// check tab is pressed when focus is inside selected slide
		slideshow.element.addEventListener('keydown', function(event){
			if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
				var target = event.target.closest('.js-slideshow-pm__item');
				if(target && Util.hasClass(target, 'slideshow-pm__item--selected')) moveFocusOutsideSlide(slideshow, event);
				else if(target || Util.hasClass(event.target, 'js-slideshow-pm') && !event.shiftKey) moveFocusToSelectedSlide(slideshow);
			} 
		});

		// detect tab moves to slideshow 
		window.addEventListener('keyup', function(event){
			if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab') {
				var target = event.target.closest('.js-slideshow-prew__item');
				if(target || Util.hasClass(event.target, 'js-slideshow-prew') && !event.shiftKey) moveFocusToSelectedSlide(slideshow);
			}
		});
	};

	function moveFocusToLast(slideshow) {
		event.preventDefault();
		if(slideshow.lastFocusable)	{
			slideshow.lastFocusable.focus();
		} else {
			Util.moveFocus(slideshow.element);
		}
	};

	function moveFocusToSelectedSlide(slideshow) { // focus is inside a slide that is not selected
		event.preventDefault();
		if(slideshow.firstFocusable)	{
			slideshow.firstFocusable.focus();
		} else if(slideshow.controls.length > 0) {
			(slideshow.selectedSlide == 0) ? slideshow.controls[1].getElementsByTagName('button')[0].focus() : slideshow.controls[0].getElementsByTagName('button')[0].focus();
		} else if(slideshow.options.navigation) {
			slideshow.navigation.getElementsByClassName('js-slideshow-pm__nav-item')[0].getElementsByTagName('button')[0].focus();
		}
	};

	function moveFocusOutsideSlide(slideshow, event) {
		if(event.shiftKey && slideshow.firstFocusable && event.target == slideshow.firstFocusable) {
			// shift+tab -> focus was on first foucusable element inside selected slide -> move to container
			event.preventDefault();
			Util.moveFocus(slideshow.element);
		} else if( !event.shiftKey && slideshow.lastFocusable && event.target == slideshow.lastFocusable) {
			event.preventDefault();
			
			if(slideshow.selectedSlide != 0) slideshow.controls[0].getElementsByTagName('button')[0].focus();
			else slideshow.controls[1].getElementsByTagName('button')[0].focus();
		}
	};

	function initAnimationEndEvents(slideshow) {
		slideshow.list.addEventListener('transitionend', function(){
			setTimeout(function(){ // add a delay between the end of animation and slideshow reset - improve animation performance
				resetAnimationEnd(slideshow);
			}, 100);
		});
	};

	function resetAnimationEnd(slideshow) {
		if(slideshow.moveFocus) Util.moveFocus(slideshow.items[slideshow.selectedSlide]);
		slideshow.items[slideshow.selectedSlide].removeAttribute('aria-hidden');
		slideshow.animating = false;
		slideshow.moveFocus = false;
		slideshow.startAutoplay();
	};

	function navigateSlide(slideshow, event, keyNav) { 
		// user has interacted with the slideshow navigation -> update visible slide
		var target = event.target.closest('.js-slideshow-pm__nav-item');
		if(keyNav && target && !Util.hasClass(target, slideshow.options.navItemClass+'--selected')) {
			slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
			slideshow.moveFocus = true;
			updateAriaLive(slideshow);
		}
	};

	function showNewItem(slideshow, index, bool, autoplay) {
		if(slideshow.animating && slideshow.supportAnimation) return;
		if(autoplay) {
			if(index < 0) index = slideshow.items.length - 1;
			else if(index >= slideshow.items.length) index = 0;
		}
		if(index < 0 || index >= slideshow.items.length) return;
		slideshow.animating = true;
		Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow-pm__item--selected');
		slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //hide to sr element that is exiting the viewport
		Util.addClass(slideshow.items[index], 'slideshow-pm__item--selected');
		resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
		slideshow.selectedSlide = index;
		setTranslate(slideshow);
		slideshow.pauseAutoplay();
		setFocusableElements(slideshow);
		if(!transitionSupported) resetAnimationEnd(slideshow);
		emitSlideshowEvent(slideshow, 'newSlide');
	};

	function updateAriaLive(slideshow) {
		slideshow.ariaLive.innerHTML = 'Item '+(slideshow.selectedSlide + 1)+' of '+slideshow.items.length;
	};

	function resetSlideshowResize(slideshow) {
		Util.removeClass(slideshow.list, 'slideshow-pm__list--has-transition');
		setTimeout(function(){
			setTranslateValue(slideshow);
			setTranslate(slideshow);
			Util.addClass(slideshow.list, 'slideshow-pm__list--has-transition');
		}, 30)
	};

	function setTranslateValue(slideshow) {
		var itemStyle = window.getComputedStyle(slideshow.items[slideshow.selectedSlide]);

		slideshow.itemWidth = parseFloat(itemStyle.getPropertyValue('width'));
		slideshow.itemMargin = parseFloat(itemStyle.getPropertyValue('margin-right'));
		slideshow.containerWidth = parseFloat(window.getComputedStyle(slideshow.element).getPropertyValue('width'));
	};

	function setTranslate(slideshow) {
		var translate = parseInt(((slideshow.itemWidth + slideshow.itemMargin) * slideshow.selectedSlide * (-1)) + ((slideshow.containerWidth - slideshow.itemWidth)*0.5));
    slideshow.list.style.transform = 'translateX('+translate+'px)';
    slideshow.list.style.msTransform = 'translateX('+translate+'px)';
  };

  function resetSlideshowNav(slideshow, newIndex, oldIndex) {
  	if(slideshow.navigation) {
			Util.removeClass(slideshow.navigation[oldIndex], slideshow.options.navItemClass+'--selected');
			Util.addClass(slideshow.navigation[newIndex], slideshow.options.navItemClass+'--selected');
			slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
			slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
		}
		if(slideshow.controls.length > 0) {
			Util.toggleClass(slideshow.controls[0], 'slideshow-pm__control-wrapper--active', newIndex != 0);
			Util.toggleClass(slideshow.controls[1], 'slideshow-pm__control-wrapper--active', newIndex != (slideshow.items.length - 1));
  	}
  };

  function setFocusableElements(slideshow) {
  	//get all focusable elements inside the selected slide
		var allFocusable = slideshow.items[slideshow.selectedSlide].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		getFirstVisible(slideshow, allFocusable);
		getLastVisible(slideshow, allFocusable);
  };

  function getFirstVisible(slideshow, elements) {
  	slideshow.firstFocusable = false;
		//get first visible focusable element inside the selected slide
		for(var i = 0; i < elements.length; i++) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				slideshow.firstFocusable = elements[i];
				return true;
			}
		}
  };

  function getLastVisible(slideshow, elements) {
  	//get last visible focusable element inside the selected slide
  	slideshow.lastFocusable = false;
		for(var i = elements.length - 1; i >= 0; i--) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				slideshow.lastFocusable = elements[i];
				return true;
			}
		}
  };

  function resetSlideshowFlexFallback(slideshow) {
		slideshow.list.style.width = ((slideshow.items.length+1)*(slideshow.itemMargin+slideshow.itemWidth))+'px';
		for(var i = 0; i < slideshow.items.length; i++) {slideshow.items[i].style.width = slideshow.itemWidth+'px';}
  };

	function emitSlideshowEvent(slideshow, eventType) {
    if(eventType == 'newSlide') {
      var detail = slideshow.selectedSlide;
    }
    slideshow.element.dispatchEvent(new CustomEvent(eventType, {detail: detail}));
  };

	SlideshowPrew.defaults = {
    element : '',
    navigation : true,
    autoplay : false,
    autoplayInterval: 5000,
    prewNav: false,
    swipe: false,
		navClass: 'slideshow-pm__navigation',
		navItemClass: 'slideshow-pm__nav-item',
		navBtnClass: 'slideshow-pm__nav-btn'
  };

  window.SlideshowPrew = SlideshowPrew;
	
	// initialize the slideshowsPrew objects
	var slideshowsPrew = document.getElementsByClassName('js-slideshow-pm'),
		flexSupported = Util.cssSupports('align-items', 'stretch'),
		transitionSupported = Util.cssSupports('transition');
	if( slideshowsPrew.length > 0 ) {
		for( var i = 0; i < slideshowsPrew.length; i++) {
			(function(i){
				var navigation = (slideshowsPrew[i].getAttribute('data-navigation') && slideshowsPrew[i].getAttribute('data-navigation') == 'off') ? false : true,
					autoplay = (slideshowsPrew[i].getAttribute('data-autoplay') && slideshowsPrew[i].getAttribute('data-autoplay') == 'on') ? true : false,
					autoplayInterval = (slideshowsPrew[i].getAttribute('data-autoplay-interval')) ? slideshowsPrew[i].getAttribute('data-autoplay-interval') : 5000,
					prewNav = (slideshowsPrew[i].getAttribute('data-pm-nav') && slideshowsPrew[i].getAttribute('data-pm-nav') == 'on' ) ? true : false, 
					swipe = (slideshowsPrew[i].getAttribute('data-swipe') && slideshowsPrew[i].getAttribute('data-swipe') == 'on') ? true : false,
					navClass = slideshowsPrew[i].getAttribute('data-pm-nav-class') ? slideshowsPrew[i].getAttribute('data-pm-nav-class') : 'slideshow-pm__navigation',
					navItemClass = slideshowsPrew[i].getAttribute('data-pm-nav-item-class') ? slideshowsPrew[i].getAttribute('data-pm-nav-item-class') : 'slideshow-pm__nav-item',
					navBtnClass = slideshowsPrew[i].getAttribute('data-pm-nav-btn-class') ? slideshowsPrew[i].getAttribute('data-pm-nav-btn-class') : 'slideshow-pm__nav-btn';
				new SlideshowPrew({element: slideshowsPrew[i], navigation: navigation, autoplay : autoplay, autoplayInterval : autoplayInterval, swipe : swipe, prewNav: prewNav, navClass: navClass, navItemClass: navItemClass, navBtnClass: navBtnClass});
			})(i);
		}
	}

}());
// File#: _2_grid-switch
// Usage: codyhouse.co/license
(function() {
  var GridSwitch = function(element) {
    this.element = element;
    this.controller = this.element.getElementsByClassName('js-grid-switch__controller')[0];
    this.items = this.element.getElementsByClassName('js-grid-switch__item');
    this.contentElements = this.element.getElementsByClassName('js-grid-switch__content');
    // store custom classes
    this.classList = [[this.element.getAttribute('data-gs-item-class-1'), this.element.getAttribute('data-gs-content-class-1')], [this.element.getAttribute('data-gs-item-class-2'), this.element.getAttribute('data-gs-content-class-2')]];
    initGridSwitch(this);
  };

  function initGridSwitch(element) {
    // get selected state and apply style
    var selectedInput = element.controller.querySelector('input:checked');
    if(selectedInput) {
      setGridAppearance(element, selectedInput.value);
    }
    // reveal grid
    addClasses(element.element, 'grid-switch--is-visible');
    // a new layout has been selected 
    element.controller.addEventListener('change', function(event) {
      setGridAppearance(element, event.target.value);
    });
  };

  function setGridAppearance(element, value) {
    var newStatus = parseInt(value) - 1,
      oldStatus = newStatus == 1 ? 0 : 1;
      
    for(var i = 0; i < element.items.length; i++) {
      removeClasses(element.items[i], element.classList[oldStatus][0]);
      removeClasses(element.contentElements[i], element.classList[oldStatus][1]);
      addClasses(element.items[i], element.classList[newStatus][0]);
      addClasses(element.contentElements[i], element.classList[newStatus][1]);
    }
  };

  function addClasses(el, className) {
    var classList = className.split(' ');
    el.classList.add(classList[0]);
    if (classList.length > 1) addClasses(el, classList.slice(1).join(' '));
  };

  function removeClasses(el, className) {
    var classList = className.split(' ');
    el.classList.remove(classList[0]);
    if (classList.length > 1) removeClasses(el, classList.slice(1).join(' '));
  };

  //initialize the GridSwitch objects
	var gridSwitch = document.getElementsByClassName('js-grid-switch');
	if( gridSwitch.length > 0 ) {
		for( var i = 0; i < gridSwitch.length; i++) {
			(function(i){new GridSwitch(gridSwitch[i]);})(i);
    }
  }
}());
// File#: _2_image-comparison-slider
// Usage: codyhouse.co/license
(function() {
  var ComparisonSlider = function(element) {
    this.element = element;
    this.modifiedImg = this.element.getElementsByClassName('js-compare-slider__img--modified')[0];
    this.handle = this.element.getElementsByClassName('js-compare-slider__handle')[0];
    this.keyboardHandle = this.element.getElementsByClassName('js-compare-slider__input-handle')[0];
    this.captions = this.element.getElementsByClassName('js-compare-slider__caption');
    // drag
    this.dragStart = false;
    this.animating = false;
    this.leftPosition = 50;
    // store container width
    this.sliderWidth = getSliderWidth(this);
    initComparisonSlider(this);
  };

  function getSliderWidth(slider) {
    return slider.element.offsetWidth;
  };

  function initComparisonSlider(slider) {
    // initial animation
    if(reducedMotion) { // do not animate slider elements
      slider.element.classList.add('compare-slider--reduced-motion', 'compare-slider--in-viewport');
    } else if(intersectionObserverSupported) { // reveal slider elements when it enters the viewport
      var observer = new IntersectionObserver(sliderObserve.bind(slider), { threshold: [0, 0.3] });
      observer.observe(slider.element);
      modifiedImgAnimation(slider);
    } else { // reveal slider elements right away
      slider.element.classList.add('compare-slider--in-viewport');
      modifiedImgAnimation(slider);
    }
    // init drag functionality
    new SwipeContent(slider.element);
    slider.element.addEventListener('dragStart', function(event){
      if(!event.detail.origin.closest('.js-compare-slider__handle')) return;
      slider.element.classList.add('compare-slider--is-dragging');
      if(!slider.dragStart) {
        slider.dragStart = event.detail.x;
        detectDragEnd(slider);
      }
    });
    // slider.element.addEventListener('dragging', function(event){
    slider.element.addEventListener('mousemove', function(event){
      sliderDragging(slider, event)
    });
    slider.element.addEventListener('touchmove', function(event){
      sliderDragging(slider, event)
    });

    // detect mouse leave
    slider.element.addEventListener('mouseleave', function(event){
      sliderResetDragging(slider, event);
    });
    slider.element.addEventListener('touchend', function(event){
      sliderResetDragging(slider, event);
    });

    // on resize -> update slider width
    window.addEventListener('resize', function(){
      slider.sliderWidth = getSliderWidth(slider);
    });

    // detect change in keyboardHandle input -> allow keyboard navigation
    slider.keyboardHandle.addEventListener('change', function(event){
      slider.leftPosition = Number(slider.keyboardHandle.value);
      updateCompareSlider(slider, 0);
    });
  };

  function modifiedImgAnimation(slider) {
    // make sure modified img animation runs only one time
    slider.modifiedImg.addEventListener('animationend', function cb() {
      slider.modifiedImg.removeEventListener('animationend', cb);
      slider.modifiedImg.style.animation = 'none';
    });
  };

  function sliderDragging(slider, event) {
    if(!slider.dragStart) return;
    var pageX = event.pageX || event.touches[0].pageX;
    if(slider.animating || Math.abs(pageX - slider.dragStart) < 5) return;
    slider.animating = true;
    updateCompareSlider(slider, pageX - slider.dragStart);
    slider.dragStart = pageX;
  };

  function sliderResetDragging(slider, event) {
    if(!slider.dragStart) return;
    if(event.pageX < slider.element.offsetLeft) {
      slider.leftPosition = 0;
      updateCompareSlider(slider, 0);
    }
    if(event.pageX > slider.element.offsetLeft + slider.element.offsetWidth) {
      slider.leftPosition = 100;
      updateCompareSlider(slider, 0);
    }
  };

  function sliderObserve(entries, observer) {
    if(entries[0].intersectionRatio.toFixed(1) > 0) { // reveal slider elements when in viewport
      this.element.classList.add('compare-slider--in-viewport');
      observer.unobserve(this.element);
    }
  };

  function detectDragEnd(slider) {
    document.addEventListener('click', function cb(event){
      document.removeEventListener('click', cb);
      slider.element.classList.remove('compare-slider--is-dragging');
      updateCompareSlider(slider, event.detail.x - slider.dragStart);
      slider.dragStart = false;
    });
  };

  function updateCompareSlider(slider, delta) {
    var percentage = (delta*100/slider.sliderWidth);
    if(isNaN(percentage)) return;
    slider.leftPosition = Number((slider.leftPosition + percentage).toFixed(2));
    if(slider.leftPosition < 0) slider.leftPosition = 0;
    if(slider.leftPosition > 100) slider.leftPosition = 100; 
    // update slider elements -> modified img width + handle position + input element (keyboard accessibility)
    slider.keyboardHandle.value = slider.leftPosition;
    slider.handle.style.left = slider.leftPosition + '%';
    slider.modifiedImg.style.width = slider.leftPosition + '%'; 
    updateCompareLabels(slider);
    slider.animating = false;
  };

  function updateCompareLabels(slider) { // update captions visibility
    for(var i = 0; i < slider.captions.length; i++) {
      var delta = ( i == 0 ) 
        ? slider.captions[i].offsetLeft - slider.modifiedImg.offsetLeft - slider.modifiedImg.offsetWidth
        : slider.modifiedImg.offsetLeft + slider.modifiedImg.offsetWidth - slider.captions[i].offsetLeft - slider.captions[i].offsetWidth;
      slider.captions[i].classList.toggle('compare-slider__caption--hide', delta < 10);
    }
  };

  window.ComparisonSlider = ComparisonSlider;
  
  //initialize the ComparisonSlider objects
  var comparisonSliders = document.getElementsByClassName('js-compare-slider'),
    intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if( comparisonSliders.length > 0 ) {
		for( var i = 0; i < comparisonSliders.length; i++) {
			(function(i){
        new ComparisonSlider(comparisonSliders[i]);
      })(i);
    }
	}
}());
// File#: _2_points-of-interest
// Usage: codyhouse.co/license
(function() {
  function initPoi(element) {
    element.addEventListener('click', function(event){
      var poiItem = event.target.closest('.js-poi__item');
      if(poiItem) poiItem.classList.add('poi__item--visited');
    });
  };

  var poi = document.getElementsByClassName('js-poi');
  for(var i = 0; i < poi.length; i++) {
    (function(i){initPoi(poi[i]);})(i);
  }
}());
// File#: _2_morphing-image-modal
// Usage: codyhouse.co/license
(function() {
  var MorphImgModal = function(opts) {
    this.options = extendProps(MorphImgModal.defaults, opts);
    this.element = this.options.element;
    this.modalId = this.element.getAttribute('id');
    this.triggers = document.querySelectorAll('[aria-controls="'+this.modalId+'"]');
    this.selectedImg = false;
    // store morph elements
    this.morphBg = document.getElementsByClassName('js-morph-img-bg');
    this.morphImg = document.getElementsByClassName('js-morph-img-clone');
    // store modal content
    this.modalContent = this.element.getElementsByClassName('js-morph-img-modal__content');
    this.modalImg = this.element.getElementsByClassName('js-morph-img-modal__img');
    this.modalInfo = this.element.getElementsByClassName('js-morph-img-modal__info');
    // store close btn element
    this.modalCloseBtn = document.getElementsByClassName('js-morph-img-close-btn');
    // animation duration
    this.animationDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--morph-img-modal-transition-duration'))*1000 || 300;
    // morphing animation should run
    this.animating = false;
    this.reset = false;
    initMorphModal(this);
  };

  function initMorphModal(element) {
    if(element.morphImg.length < 1) return;
    element.morphEl = element.morphImg[0].getElementsByTagName('image');
    element.morphRect  = element.morphImg[0].getElementsByTagName('rect');
    initMorphModalMarkup(element);
    initMorphModalEvents(element);
  };

  function initMorphModalMarkup(element) {
    // append the clip path + <image> elements to use to morph the image
    element.morphImg[0].innerHTML = '<svg><defs><clipPath id="'+element.modalId+'-clip"><rect/></clipPath></defs><image height="100%" width="100%" clip-path="url(#'+element.modalId+'-clip)"></image></svg>';
  };

  function initMorphModalEvents(element) {
    // morph modal was open
    element.element.addEventListener('modalIsOpen', function(event){
      var target = event.detail.closest('[aria-controls="'+element.modalId+'"]');
      setModalImg(element, target);
      setModalContent(element, target);
      toggleModalCloseBtn(element, true);
    });

    // morph modal was closed
    element.element.addEventListener('modalIsClose', function(event){
      element.reset = false;
      element.animating = true;
      element.modalContent[0].classList.add('mn4-opacity-0');
      animateImg(element, false, function() {
        if(element.reset) return; // user opened a new modal before the animation was complete - no need to reset the modal
        element.selectedImg = false;
        resetMorphModal(element, false);
        element.animating = false;
      });
      toggleModalCloseBtn(element, false);
    });

    // close modal clicking on close btn
    if(element.modalCloseBtn.length > 0) {
      element.modalCloseBtn[0].addEventListener('click', function(event) {
        element.element.click();
      });
    }
  };

  function setModalImg(element, target) {
    if(!target) return;
    element.selectedImg = (target.tagName.toLowerCase() == 'img') ? target : target.querySelector('img');
    var src = element.selectedImg.getAttribute('data-modal-src') || element.selectedImg.getAttribute('src');
    // update url modal image + morph
    if(element.modalImg.length > 0) element.modalImg[0].setAttribute('src', src);
    element.morphEl[0].setAttribute('xlink:href', src);
    element.morphEl[0].setAttribute('href', src);
    element.reset = false;
    element.animating = true;  
    // wait for image to be loaded, then animate
    loadImage(element, src, function() {
      animateImg(element, true, function() {
        if(element.reset) return; // user closed the modal before the animation was complete - no need to reset the modal
        resetMorphModal(element, true);
        element.animating = false;
      });
    });
  };

  function loadImage(element, src, cb) {
    var image = new Image();
    var loaded = false;
    image.onload = function () {
      if(loaded) return;
      cb();
    }
    image.src = src;
    if(image.complete) {
      loaded = true;
      cb();
    }
  };

  function setModalContent(element, target) {
    // load the modal info details - using the searchData custom function the user defines
    if(element.modalInfo.length < 1) return;
    element.options.searchData(target, function(data){
      element.modalInfo[0].innerHTML = data;
      if(element.options.afterEnter) element.options.afterEnter(target, element.modalInfo[0]);
    });
  };

  function toggleModalCloseBtn(element, bool) {
    if(element.modalCloseBtn.length > 0) {
      element.modalCloseBtn[0].classList.toggle('morph-img-close-btn--is-visible', bool);
    }
  };

  function animateImg(element, isOpening, cb) {
    element.morphImg[0].classList.remove('mn4-hide');

    var galleryImgRect = element.selectedImg.getBoundingClientRect(),
      modalImgRect = element.modalImg[0].getBoundingClientRect();

    runClipAnimation(element, galleryImgRect, modalImgRect, isOpening, cb);
  };

  function runClipAnimation(element, startRect, endRect, isOpening, cb) {
    // retrieve all animation params
    // main element animation (<div>)
    var elInitHeight = startRect.height,
      elIntWidth = startRect.width,
      elInitTop = startRect.top,
      elInitLeft = startRect.left;
    
    var elScale = Math.max(endRect.height/startRect.height, endRect.width/startRect.width);

    var elTranslateX = endRect.left - startRect.left + (endRect.width - startRect.width*elScale)*0.5,
      elTranslateY = endRect.top - startRect.top + (endRect.height - startRect.height*elScale)*0.5;

    // clip <rect> animation
    var rectScaleX = endRect.width/(startRect.width*elScale),
      rectScaleY = endRect.height/(startRect.height*elScale);

    element.morphImg[0].style = 'height:'+elInitHeight+'px; width:'+elIntWidth+'px; top:'+elInitTop+'px; left:'+elInitLeft+'px;';

    element.morphRect[0].setAttribute('transform', 'scale('+1+','+1+')');

    // init morph bg
    element.morphBg[0].style.height = startRect.height + 'px';
    element.morphBg[0].style.width = startRect.width + 'px';
    element.morphBg[0].style.top = startRect.top + 'px';
    element.morphBg[0].style.left = startRect.left + 'px';

    element.morphBg[0].classList.remove('mn4-hide');
    
    animateRectScale(element, elInitHeight, elIntWidth, elScale, elTranslateX, elTranslateY, rectScaleX, rectScaleY, isOpening, cb);
  };

  function animateRectScale(element, height, width, elScale, elTranslateX, elTranslateY, rectScaleX, rectScaleY, isOpening, cb) {
    var isMobile = getComputedStyle(element.element, ':before').getPropertyValue('content').replace(/\'|"/g, '') == 'mobile';

    var currentTime = null,
      duration =  element.animationDuration;

    var startRect = element.selectedImg.getBoundingClientRect(),
      endRect = element.modalContent[0].getBoundingClientRect();
    
    var scaleX = endRect.width/startRect.width,
      scaleY = endRect.height/startRect.height;
  
    var translateX = endRect.left - startRect.left,
      translateY = endRect.top - startRect.top;

    var animateScale = function(timestamp){  
      if (!currentTime) currentTime = timestamp;         
      var progress = timestamp - currentTime;
      if(progress > duration) progress = duration;
      
      // main element values
      if(isOpening) {
        var elScalePr = Math.easeOutQuart(progress, 1, elScale - 1, duration),
        elTransXPr = Math.easeOutQuart(progress, 0, elTranslateX, duration),
        elTransYPr = Math.easeOutQuart(progress, 0, elTranslateY, duration);
      } else {
        var elScalePr = Math.easeOutQuart(progress, elScale, 1 - elScale, duration),
        elTransXPr = Math.easeOutQuart(progress, elTranslateX, - elTranslateX, duration),
        elTransYPr = Math.easeOutQuart(progress, elTranslateY, - elTranslateY, duration);
      }
      
      // rect values
      if(isOpening) {
        var rectScaleXPr = Math.easeOutQuart(progress, 1, rectScaleX - 1, duration),
          rectScaleYPr = Math.easeOutQuart(progress, 1, rectScaleY - 1, duration);
      } else {
        var rectScaleXPr = Math.easeOutQuart(progress, rectScaleX,  1 - rectScaleX, duration),
          rectScaleYPr = Math.easeOutQuart(progress, rectScaleY, 1 - rectScaleY, duration);
      }

      element.morphImg[0].style.transform = 'translateX('+elTransXPr+'px) translateY('+elTransYPr+'px) scale('+elScalePr+')';

      element.morphRect[0].setAttribute('transform', 'translate('+(width/2)*(1 - rectScaleXPr)+' '+(height/2)*(1 - rectScaleYPr)+') scale('+rectScaleXPr+','+rectScaleYPr+')');

      if(isOpening) {
        var valScaleX = Math.easeOutQuart(progress, 1, (scaleX - 1), duration),
          valScaleY = isMobile ? Math.easeOutQuart(progress, 1, (scaleY - 1), duration): rectScaleYPr*elScalePr,
          valTransX = Math.easeOutQuart(progress, 0, translateX, duration),
          valTransY = isMobile ? Math.easeOutQuart(progress, 0, translateY, duration) : elTransYPr + (elScalePr*height - rectScaleYPr*elScalePr*height)/2;
      } else {
        var valScaleX = Math.easeOutQuart(progress, scaleX, 1 - scaleX, duration),
          valScaleY = isMobile ? Math.easeOutQuart(progress, scaleY, 1 - scaleY, duration) : rectScaleYPr*elScalePr,
          valTransX = Math.easeOutQuart(progress, translateX, - translateX, duration),
          valTransY = isMobile ? Math.easeOutQuart(progress, translateY, - translateY, duration) : elTransYPr + (elScalePr*height - rectScaleYPr*elScalePr*height)/2;
      }

      // morph bg
      element.morphBg[0].style.transform = 'translateX('+valTransX+'px) translateY('+valTransY+'px) scale('+valScaleX+','+valScaleY+')';

      if(progress < duration) {
        window.requestAnimationFrame(animateScale);
      } else if(cb) {
        cb();
      }
    };
    
    window.requestAnimationFrame(animateScale);
  };
  
  function resetMorphModal(element, isOpening) {
    // reset modal at the end of an opening/closing animation
    element.modalContent[0].classList.toggle('mn4-opacity-0', !isOpening);
    element.modalInfo[0].classList.toggle('mn4-opacity-0', !isOpening);
    element.morphBg[0].classList.add('mn4-hide');
    element.morphImg[0].classList.add('mn4-hide');
    if(!isOpening) {
      element.modalImg[0].removeAttribute('src');
      element.modalInfo[0].innerHTML = '';
      element.morphEl[0].removeAttribute('xlink:href');
      element.morphEl[0].removeAttribute('href');
      element.morphBg[0].removeAttribute('style');
      element.morphImg[0].removeAttribute('style');
    }
  };

  var extendProps = function () {
    // Variables
    var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;
    // Check if a deep merge
    if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
      deep = arguments[0];
      i++;
    }
    // Merge the object into the extended object
    var merge = function (obj) {
      for ( var prop in obj ) {
        if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
          if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
            extended[prop] = extend( true, extended[prop], obj[prop] );
          } else {
            extended[prop] = obj[prop];
          }
        }
      }
    };
    // Loop through each object and conduct a merge
    for ( ; i < length; i++ ) {
      var obj = arguments[i];
      merge(obj);
    }
    return extended;
  };

  Math.easeOutQuart = function (t, b, c, d) {
    t /= d;
    t--;
    return -c * (t*t*t*t - 1) + b;
  };

  window.MorphImgModal = MorphImgModal;

  MorphImgModal.defaults = {
    element : '',
    searchData: false, // function used to return results
    afterEnter: false // function that runs after new content has been loaded
  };
}());
// File#: _2_menu-bar
// Usage: codyhouse.co/license
(function() {
  var MenuBar = function(element) {
    this.element = element;
    this.items = getChildrenByClassName(this.element, 'menu-bar__item');
    this.mobHideItems = this.element.getElementsByClassName('menu-bar__item--hide');
    this.moreItemsTrigger = this.element.getElementsByClassName('js-menu-bar__trigger');
    initMenuBar(this);
  };

  function initMenuBar(menu) {
    setMenuTabIndex(menu); // set correct tabindexes for menu item
    initMenuBarMarkup(menu); // create additional markup
    checkMenuLayout(menu); // set menu layout
    menu.element.classList.add('menu-bar--loaded'); // reveal menu

    // custom event emitted when window is resized
    menu.element.addEventListener('update-menu-bar', function(event){
      checkMenuLayout(menu);
      if(menu.menuInstance) menu.menuInstance.toggleMenu(false, false); // close dropdown
    });

    // keyboard events 
    // open dropdown when pressing Enter on trigger element
    if(menu.moreItemsTrigger.length > 0) {
      menu.moreItemsTrigger[0].addEventListener('keydown', function(event) {
        if( (event.keyCode && event.keyCode == 13) || (event.key && event.key.toLowerCase() == 'enter') ) {
          if(!menu.menuInstance) return;
          menu.menuInstance.selectedTrigger = menu.moreItemsTrigger[0];
          menu.menuInstance.toggleMenu(!menu.subMenu.classList.contains('menu--is-visible'), true);
        }
      });

      // close dropdown on esc
      menu.subMenu.addEventListener('keydown', function(event) {
        if((event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape')) { // close submenu on esc
          if(menu.menuInstance) menu.menuInstance.toggleMenu(false, true);
        }
      });
    }
    
    // navigate menu items using left/right arrows
    menu.element.addEventListener('keydown', function(event) {
      if( (event.keyCode && event.keyCode == 39) || (event.key && event.key.toLowerCase() == 'arrowright') ) {
        navigateItems(menu.items, event, 'next');
      } else if( (event.keyCode && event.keyCode == 37) || (event.key && event.key.toLowerCase() == 'arrowleft') ) {
        navigateItems(menu.items, event, 'prev');
      }
    });
  };

  function setMenuTabIndex(menu) { // set tabindexes for the menu items to allow keyboard navigation
    var nextItem = false;
    for(var i = 0; i < menu.items.length; i++ ) {
      if(i == 0 || nextItem) menu.items[i].setAttribute('tabindex', '0');
      else menu.items[i].setAttribute('tabindex', '-1');
      if(i == 0 && menu.moreItemsTrigger.length > 0) nextItem = true;
      else nextItem = false;
    }
  };

  function initMenuBarMarkup(menu) {
    if(menu.mobHideItems.length == 0 ) { // no items to hide on mobile - remove trigger
      if(menu.moreItemsTrigger.length > 0) menu.element.removeChild(menu.moreItemsTrigger[0]);
      return;
    }

    if(menu.moreItemsTrigger.length == 0) return;

    // create the markup for the Menu element
    var content = '';
    menu.menuControlId = 'submenu-bar-'+Date.now();
    for(var i = 0; i < menu.mobHideItems.length; i++) {
      var item = menu.mobHideItems[i].cloneNode(true),
        svg = item.getElementsByTagName('svg')[0],
        label = item.getElementsByClassName('menu-bar__label')[0];

      svg.setAttribute('class', 'mg0-icon menu__icon');
      content = content + '<li role="menuitem"><span class="menu__content js-menu__content">'+svg.outerHTML+'<span>'+label.innerHTML+'</span></span></li>';
    }

    menu.moreItemsTrigger[0].setAttribute('role', 'button');
    menu.moreItemsTrigger[0].setAttribute('aria-expanded', 'false');
    menu.moreItemsTrigger[0].setAttribute('aria-controls', menu.menuControlId);
    menu.moreItemsTrigger[0].setAttribute('aria-haspopup', 'true');

    var subMenu = document.createElement('menu'),
      customClass = menu.element.getAttribute('data-menu-class');
    subMenu.setAttribute('id', menu.menuControlId);
    subMenu.setAttribute('class', 'menu js-menu '+customClass);
    subMenu.innerHTML = content;
    document.body.appendChild(subMenu);

    menu.subMenu = subMenu;
    menu.subItems = subMenu.getElementsByTagName('li');

    menu.menuInstance = new Menu(menu.subMenu); // this will handle the dropdown behaviour
  };

  function checkMenuLayout(menu) { // switch from compressed to expanded layout and viceversa
    var layout = getComputedStyle(menu.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
    menu.element.classList.toggle('menu-bar--collapsed', layout == 'collapsed');
  };

  function navigateItems(list, event, direction, prevIndex) { // keyboard navigation among menu items
    event.preventDefault();
    var index = (typeof prevIndex !== 'undefined') ? prevIndex : Array.prototype.indexOf.call(list, event.target),
      nextIndex = direction == 'next' ? index + 1 : index - 1;
    if(nextIndex < 0) nextIndex = list.length - 1;
    if(nextIndex > list.length - 1) nextIndex = 0;
    // check if element is visible before moving focus
    (list[nextIndex].offsetParent === null) ? navigateItems(list, event, direction, nextIndex) : moveFocusFn(list[nextIndex]);
  };

  function checkMenuClick(menu, target) { // close dropdown when clicking outside the menu element
    if(menu.menuInstance && !menu.moreItemsTrigger[0].contains(target) && !menu.subMenu.contains(target)) menu.menuInstance.toggleMenu(false, false);
  };

  function getChildrenByClassName(el, className) {
    var children = el.children,
    childrenByClass = [];
    for (var i = 0; i < children.length; i++) {
      if (children[i].classList.contains(className)) childrenByClass.push(children[i]);
    }
    return childrenByClass;
  };

  function moveFocusFn(element) {
    element.focus();
    if (document.activeElement !== element) {
      element.setAttribute('tabindex','-1');
      element.focus();
    }
  };

  // init MenuBars objects
  var menuBars = document.getElementsByClassName('js-menu-bar');
  if( menuBars.length > 0 ) {
    var j = 0,
      menuBarArray = [];
    for( var i = 0; i < menuBars.length; i++) {
      var beforeContent = getComputedStyle(menuBars[i], ':before').getPropertyValue('content');
      if(beforeContent && beforeContent !='' && beforeContent !='none') {
        (function(i){menuBarArray.push(new MenuBar(menuBars[i]));})(i);
        j = j + 1;
      }
    }
    
    if(j > 0) {
      var resizingId = false,
        customEvent = new CustomEvent('update-menu-bar');
      // update Menu Bar layout on resize  
      window.addEventListener('resize', function(event){
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 150);
      });

      // close menu when clicking outside it
      window.addEventListener('click', function(event){
        menuBarArray.forEach(function(element){
          checkMenuClick(element, event.target);
        });
      });

      function doneResizing() {
        for( var i = 0; i < menuBars.length; i++) {
          (function(i){menuBars[i].dispatchEvent(customEvent)})(i);
        };
      };
    }
  }
}());
// File#: _2_full-screen-select
(function() {
	var CustomSelect = function(element) {
		this.element = element;
		this.items = this.element.children;
		initCustomSelect(this);
	};

	function initCustomSelect(select) {
		// arrow navigation
		select.element.addEventListener('keydown', function(event){
			if( event.keyCode && event.keyCode == 40 || event.key && event.key.toLowerCase() == 'arrowdown' ) {
				selectOption(select, 1); // go to next option
			} else if( event.keyCode && event.keyCode == 38 || event.key && event.key.toLowerCase() == 'arrowup' ) {
				selectOption(select, -1); // go to prev option
			}
		});
	};

	function selectOption(select, direction) {
		var focusElement = document.activeElement,
			index = Array.prototype.indexOf.call(select.items, focusElement.closest('li'));
		if(index < 0) return;
		index = index + direction;
		if( index < 0 ) index = select.items.length - 1;
		if( index >= select.items.length) index = 0;
		moveFocus(select.items[index].getElementsByTagName(focusElement.tagName)[0]);
	};

	function moveFocus(element) {
    element.focus();
    if (document.activeElement !== element) {
      element.setAttribute('tabindex','-1');
      element.focus();
    }
  };

	//initialize the CustomSelect objects
	var customSelect = document.getElementsByClassName('js-full-screen-select');
	if( customSelect.length > 0 ) {
		for( var i = 0; i < customSelect.length; i++) {
			(function(i){new CustomSelect(customSelect[i]);})(i);
		}
	}
}());
// File#: _3_testimonial-banner
// Usage: codyhouse.co/license
(function() {
  var Tbanner = function(element) {
    this.element = element;
    this.slideshowContent = this.element.getElementsByClassName('js-t-banner__content-slideshow');
    this.slideshowBg = this.element.getElementsByClassName('js-t-banner__bg-slideshow');
    this.navControls = this.element.getElementsByClassName('js-slideshow__control');

    initSlideshow(this);
    initBannerNavigation(this);
  };

  function initSlideshow(banner) {
    // init background and content slideshows
    banner.slideshowContentObj = new Slideshow({element: banner.slideshowContent[0], navigation: false}); 
    banner.slideshowBgObj = new Slideshow({element: banner.slideshowBg[0], navigation: false});
  };

  function initBannerNavigation(banner) {
    if(banner.navControls.length < 2) return;
    // use arrows to navigate the slideshow
    banner.navControls[0].addEventListener('click', function(){
      updateSlideshow(banner, 'prev');
    });

    banner.navControls[1].addEventListener('click', function(){
      updateSlideshow(banner, 'next');
    });
  };

  function updateSlideshow(banner, direction) {
    if(direction == 'next') {
      banner.slideshowContentObj.showNext();
      banner.slideshowBgObj.showNext();
    } else {
      banner.slideshowContentObj.showPrev();
      banner.slideshowBgObj.showPrev();
    }
  };

  // init Tbanner obj
  var tBanner = document.getElementsByClassName('js-t-banner');
  if(tBanner.length > 0) {
    for( var i = 0; i < tBanner.length; i++) {
      new Tbanner(tBanner[i]);
    }
  }
}());
// File#: _3_light-dark-switch
// Usage: codyhouse.co/license
(function() {
  var LdSwitch = function(element) {
    this.element = element;
    this.icons = this.element.getElementsByClassName('js-ld-switch-icon');
    this.selectedIcon = 0;
    this.isSystem = false;
    // icon animation classes
    this.iconClassIn = 'ld-switch-btn__icon-wrapper--in';
    this.iconClassOut = 'ld-switch-btn__icon-wrapper--out';
    // mediaQueryList
    this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    this.eventBind = false;
    saveThemeLabels(this);
    initLdSwitch(this);
  };

  function saveThemeLabels(switchOb) {
    switchOb.themes = ['default', 'dark', 'system'];
    switchOb.options = switchOb.element.querySelectorAll('option');

    var lightTheme = switchOb.options[0].getAttribute('data-option-theme'),
      darkTheme = switchOb.options[1].getAttribute('data-option-theme');
    if(lightTheme) switchOb.themes[0] = lightTheme;
    if(darkTheme) switchOb.themes[1] = darkTheme;
  };

  function initLdSwitch(switchOb) {
    // set initail state
    setStartIcon(switchOb);

    // detect change in the selected theme
    switchOb.element.addEventListener('change', function(event){
      setTheme(switchOb, event.target.value);
    });
  };

  function setStartIcon(switchOb) {
    var selectedOptionIndex = switchOb.element.querySelector('select').selectedIndex;
    if(selectedOptionIndex === 0) return;
    setTheme(switchOb, selectedOptionIndex, true);
  };

  function setTheme(switchOb, value, init) {
    var theme = switchOb.themes[0],
      iconIndex = value;

    // update local storage
    localStorage.setItem('ldSwitch', switchOb.themes[value]);

    // get theme value and icon index
    if(value == 1) {
      theme = switchOb.themes[1];
    } else if(value == 2) {
      // user selected system -> check if we should show light or dark theme
      var isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if(isDarkTheme) {
        iconIndex = 3;
        theme = switchOb.themes[1];
      }
    }

    // update theme value
    updateThemeValue(theme);

    // update visible icon
    updateIcon(switchOb, iconIndex, switchOb.selectedIcon, init);

    // check if we need to add/remove matchMedia events
    setMatchMediaEvents(switchOb, value == 2, switchOb.isSystem);
    switchOb.isSystem = value == 2 ? true : false;
  };

  function updateIcon(switchOb, newIcon, oldIcon, init) {
    if(init) { // we are only setting the initial status of the switcher
      switchOb.icons[oldIcon].classList.remove(switchOb.iconClassIn);
      switchOb.icons[newIcon].classList.add(switchOb.iconClassIn);
      switchOb.selectedIcon = newIcon;
      return;
    }
    switchOb.icons[oldIcon].classList.remove(switchOb.iconClassIn);
    switchOb.icons[oldIcon].classList.add(switchOb.iconClassOut);

    switchOb.icons[newIcon].classList.add(switchOb.iconClassIn);

    switchOb.icons[newIcon].addEventListener('transitionend', function cb(){
      switchOb.icons[oldIcon].classList.remove(switchOb.iconClassOut);
      switchOb.icons[newIcon].removeEventListener('transitionend', cb);
      switchOb.selectedIcon = newIcon;
    });
  };

  function updateThemeValue(theme) {
    document.getElementsByTagName('html')[0].setAttribute('data-theme', theme);
  };

  function setMatchMediaEvents(switchOb, addEvent, removeEvent) {
    if(addEvent) {
      switchOb.eventBind = systemUpdated.bind(switchOb);
      switchOb.mediaQueryList.addEventListener("change", switchOb.eventBind);
    } else if(removeEvent) switchOb.mediaQueryList.removeEventListener("change", switchOb.eventBind);
  };

  function systemUpdated() {
    var isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = isDarkTheme ? this.themes[1] : this.themes[0],
      newIndex = isDarkTheme ? 3 : 2,
      oldIcon = isDarkTheme ? 2 : 3;
    updateIcon(this, newIndex, oldIcon);
    updateThemeValue(theme);
  };

  window.LdSwitch = LdSwitch;
  var ldSwitches = document.getElementsByClassName('js-ld-switch');
  if( ldSwitches.length > 0 ) {
    for( var i = 0; i < ldSwitches.length; i++) {
      new LdSwitch(ldSwitches[i]);
    }
  }
}());
// File#: _3_drop-menu
// Usage: codyhouse.co/license
(function() {
  var DropMenu = function(element) {
    this.element = element;
    this.innerElement = this.element.getElementsByClassName('js-drop-menu__inner');
    this.trigger = document.querySelector('[aria-controls="'+this.element.getAttribute('id')+'"]');
    this.autocompleteInput = false;
    this.autocompleteList = false;
    this.animationDuration = parseFloat(getComputedStyle(this.element).getPropertyValue('--drop-menu-transition-duration')) || 0.3;
    // store some basic classes
    this.menuIsVisibleClass = 'drop-menu--is-visible';
    this.menuLevelClass = 'js-drop-menu__list';
    this.menuBtnInClass = 'js-drop-menu__btn--sublist-control';
    this.menuBtnOutClass = 'js-drop-menu__btn--back';
    this.levelInClass = 'drop-menu__list--in';
    this.levelOutClass = 'drop-menu__list--out';
    // store the max height of the element
    this.maxHeight = false;
    // store drop menu layout 
    this.layout = false;
    // vertical gap - desktop layout
    this.verticalGap = parseInt(getComputedStyle(this.element).getPropertyValue('--drop-menu-gap-y')) || 4;
    // store autocomplete search results
    this.searchResults = [];
    // focusable elements
    this.focusableElements = [];
    initDropMenu(this);
  };

  function initDropMenu(menu) {
    // trigger drop menu opening/closing
    toggleDropMenu(menu);
    // toggle sublevels
    menu.element.addEventListener('click', function(event){
      // check if we need to show a new sublevel
      var menuBtnIn = event.target.closest('.'+menu.menuBtnInClass);
      if(menuBtnIn) showSubLevel(menu, menuBtnIn);
      // check if we need to go back to a previous level
      var menuBtnOut = event.target.closest('.'+menu.menuBtnOutClass);
      if(menuBtnOut) hideSubLevel(menu, menuBtnOut);
    });
    // init automplete search
    initAutocomplete(menu);
    // close drop menu on focus out
    initFocusOut(menu);
  };

  function toggleDropMenu(menu) { // toggle drop menu
    if(!menu.trigger) return;
    // actions to be performed when closing the drop menu
    menu.dropMenuClosed = function(event) {
      if(event.propertyName != 'visibility') return;
      if(getComputedStyle(menu.element).getPropertyValue('visibility') != 'hidden') return;
      menu.element.removeEventListener('transitionend', menu.dropMenuClosed);
      menu.element.removeAttribute('style');
      resetAllLevels(menu); // go back to main list
      resetAutocomplete(menu); // if autocomplte is enabled -> reset input fields
    };

    // on mobile - close drop menu when clicking on close btn
    menu.element.addEventListener('click', function(event){
      var target = event.target.closest('.js-drop-menu__close-btn');
      if(!target || !dropMenuVisible(menu)) return;
      menu.trigger.click();
    });

    // click on trigger
    menu.trigger.addEventListener('click', function(event){
      menu.element.removeEventListener('transitionend', menu.dropMenuClosed);
      var isVisible = dropMenuVisible(menu);
      menu.element.classList.toggle( menu.menuIsVisibleClass, !isVisible);
      isVisible ? menu.trigger.removeAttribute('aria-expanded') : menu.trigger.setAttribute('aria-expanded', true);
      if(isVisible) {
        menu.element.addEventListener('transitionend', menu.dropMenuClosed);
      } else {
        menu.element.addEventListener('transitionend', function cb(){
          menu.element.removeEventListener('transitionend', cb);
          focusFirstElement(menu, menu.element);
        });
        getLayoutValue(menu);
        setDropMenuMaxHeight(menu); // set max-height
        placeDropMenu(menu); // desktop only
      }
    });
  };

  function dropMenuVisible(menu) {
    return menu.element.classList.contains( menu.menuIsVisibleClass);
  };

  function showSubLevel(menu, menuBtn) {
    var mainLevel = menuBtn.closest('.'+menu.menuLevelClass),
      subLevel = getChildrenByClassName(menuBtn.parentNode, menu.menuLevelClass);
    if(!mainLevel || subLevel.length == 0 ) return;
    // trigger classes
    subLevel[0].classList.add(menu.levelInClass);
    mainLevel.classList.add(menu.levelOutClass);
    mainLevel.classList.remove(menu.levelInClass);
    // animate height of main element
    animateDropMenu(menu, mainLevel.offsetHeight, subLevel[0].offsetHeight, function(){
      focusFirstElement(menu, subLevel[0]);
    });
  };

  function hideSubLevel(menu, menuBtn) {
    var subLevel = menuBtn.closest('.'+menu.menuLevelClass),
      mainLevel = subLevel.parentNode.closest('.'+menu.menuLevelClass);
    if(!mainLevel || !subLevel) return;
    // trigger classes
    subLevel.classList.remove(menu.levelInClass);
    mainLevel.classList.add(menu.levelInClass);
    mainLevel.classList.remove(menu.levelOutClass);
    // animate height of main element
    animateDropMenu(menu, subLevel.offsetHeight, mainLevel.offsetHeight, function(){
      var menuBtnIn = getChildrenByClassName(subLevel.parentNode, menu.menuBtnInClass);
      if(menuBtnIn.length > 0) menuBtnIn[0].focus();
      // if primary level -> reset height of element + inner element
      if(mainLevel.classList.contains('js-drop-menu__list--main') && menu.layout == 'desktop') {
        menu.element.style.height = '';
        if(menu.innerElement.length > 0) menu.innerElement[0].style.height = '';
      }
    });
  };

  function animateDropMenu(menu, initHeight, finalHeight, cb) {
    if(menu.innerElement.length < 1) {
      if(cb) setTimeout(function(){cb();}, menu.animationDuration*1000);
      return;
    }
    if(menu.layout == 'mobile') {
      menu.innerElement[0].style.height = finalHeight+"px";
      if(cb) setTimeout(function(){cb();}, menu.animationDuration*1000);
      return;
    } else {
      menu.innerElement[0].style.height = "";
    }
    var resetHeight = false;
    // make sure init and final height are smaller than max height
    if(initHeight > menu.maxHeight) initHeight = menu.maxHeight;
    if(finalHeight > menu.maxHeight) {
      resetHeight = finalHeight;
      finalHeight = menu.maxHeight;
    }
    var change = finalHeight - initHeight,
      currentTime = null,
      duration = menu.animationDuration*1000;

    var animateHeight = function(timestamp){  
      if (!currentTime) currentTime = timestamp;         
      var progress = timestamp - currentTime;
      if(progress > duration) progress = duration;
      var val = Math.easeOutQuart(progress, initHeight, change, duration);
      menu.element.style.height = val+"px";
      if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
      } else {
        menu.innerElement[0].style.height = resetHeight ? resetHeight+'px' : '';
        if(cb) cb();
      }
    };
    
    //set the height of the element before starting animation -> fix bug on Safari
    menu.element.style.height = initHeight+"px";
    window.requestAnimationFrame(animateHeight);
  };

  function resetAllLevels(menu) {
    var openLevels = menu.element.getElementsByClassName(menu.levelInClass),
      closeLevels = menu.element.getElementsByClassName(menu.levelOutClass);
    while(openLevels[0]) {
      openLevels[0].classList.remove(menu.levelInClass);
    }
    while(closeLevels[0]) {
      closeLevels[0].classList.remove(menu.levelOutClass);
    }
  };

  function focusFirstElement(menu, level) {
    var element = getFirstFocusable(level);
    element.focus();
  };

  function getFirstFocusable(element) {
    var elements = element.querySelectorAll(focusableElString);
    for(var i = 0; i < elements.length; i++) {
			if(elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length) {
				return elements[i];
			}
		}
  };

  function getFocusableElements(menu) { // all visible focusable elements
    var elements = menu.element.querySelectorAll(focusableElString);
    menu.focusableElements = [];
    for(var i = 0; i < elements.length; i++) {
			if( isVisible(menu, elements[i]) ) menu.focusableElements.push(elements[i]);
		}
  };

  function isVisible(menu, element) {
    var elementVisible = false;
    if( (element.offsetWidth || element.offsetHeight || element.getClientRects().length) && getComputedStyle(element).getPropertyValue('visibility') == 'visible') {
      elementVisible = true;
      if(menu.element.contains(element) && element.parentNode) elementVisible = isVisible(menu, element.parentNode);
    }
    return elementVisible;
  };

  function initAutocomplete(menu) {
    if(!menu.element.classList.contains('js-autocomplete')) return;
    // get list of search results
    getSearchResults(menu);
    var autocompleteCharacters = 1;
    menu.autocompleteInput = menu.element.getElementsByClassName('js-autocomplete__input');
    menu.autocompleteList = menu.element.getElementsByClassName('js-autocomplete__results');
    new Autocomplete({
      element: menu.element,
      characters: autocompleteCharacters,
      searchData: function(query, cb) {
        var data = [];
        if(query.length >= autocompleteCharacters) {
          data = menu.searchResults.filter(function(item){
            return item['label'].toLowerCase().indexOf(query.toLowerCase()) > -1;
          });
        }
        cb(data);
      }
    });
  };

  function resetAutocomplete(menu) {
    if(menu.autocompleteInput && menu.autocompleteInput.length > 0) {
      menu.autocompleteInput[0].value = '';
    }
  };

  function getSearchResults(menu) {
    var anchors = menu.element.getElementsByClassName('drop-menu__link');
    for(var i = 0; i < anchors.length; i++) {
      menu.searchResults.push({label: anchors[i].textContent, url: anchors[i].getAttribute('href')});
    }
  };

  function setDropMenuMaxHeight(menu) {
    if(!menu.trigger) return;
    if(menu.layout == 'mobile') {
      menu.maxHeight = '100%';
      menu.element.style.maxHeight = menu.maxHeight;
      if(menu.autocompleteList.length > 0) menu.autocompleteList[0].style.maxHeight = 'calc(100% - '+menu.autocompleteInput[0].offsetHeight+'px)';
    } else {
      menu.maxHeight = window.innerHeight - menu.trigger.getBoundingClientRect().bottom - menu.verticalGap - 15;
      menu.element.style.maxHeight = menu.maxHeight + 'px';
      if(menu.autocompleteList.length > 0) menu.autocompleteList[0].style.maxHeight = (menu.maxHeight - menu.autocompleteInput[0].offsetHeight) + 'px';
    }
  };

  function getLayoutValue(menu) {
    menu.layout = getComputedStyle(menu.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
  };

  function placeDropMenu(menu) {
    if(menu.layout == 'mobile') {
      menu.element.style.top = menu.element.style.left = menu.element.style.right = '';
    } else {
      var selectedTriggerPosition = menu.trigger.getBoundingClientRect();
			
      var left = selectedTriggerPosition.left,
        right = (window.innerWidth - selectedTriggerPosition.right),
        isRight = (window.innerWidth < selectedTriggerPosition.left + menu.element.offsetWidth);

      var rightVal = 'auto', leftVal = 'auto';
      if(isRight) {
        rightVal = right+'px';
      } else {
        leftVal = left+'px';
      }

      var topVal = (selectedTriggerPosition.bottom+menu.verticalGap)+'px';
      if( isRight && (right + menu.element.offsetWidth) > window.innerWidth) {
        rightVal = 'auto';
        leftVal = parseInt((window.innerWidth - menu.element.offsetWidth)/2)+'px';
      }
      menu.element.style.top = topVal;
      menu.element.style.left = leftVal;
      menu.element.style.right = rightVal;
    }
  };

  function closeOnResize(menu) {
    getLayoutValue(menu);
    if(menu.layout == 'mobile' || !dropMenuVisible(menu)) return;
    menu.trigger.click();
  };

  function closeOnClick(menu, target) {
    if(menu.layout == 'mobile' || !dropMenuVisible(menu)) return;
    if(menu.element.contains(target) || menu.trigger.contains(target)) return;
    menu.trigger.click();
  };

  function initFocusOut(menu) {
    menu.element.addEventListener('keydown', function(event){
      if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
        getFocusableElements(menu);
        if( (menu.focusableElements[0] == document.activeElement && event.shiftKey) || (menu.focusableElements[menu.focusableElements.length - 1] == document.activeElement && !event.shiftKey)) {
          menu.trigger.click();
        }
      } else if(event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' && dropMenuVisible(menu)) {
        menu.trigger.click();
			}
    });
  };

  function getChildrenByClassName(el, className) {
    var children = el.children,
      childrenByClass = [];
    for (var i = 0; i < children.length; i++) {
      if (children[i].classList.contains(className)) childrenByClass.push(children[i]);
    }
    return childrenByClass;
  };

  Math.easeOutQuart = function (t, b, c, d) {
    t /= d;
    t--;
    return -c * (t*t*t*t - 1) + b;
  };

  // init DropMenu objects
  var dropMenus = document.getElementsByClassName('js-drop-menu');
  var focusableElString = '[href], input:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable], summary';
  if( dropMenus.length > 0 ) {
    var dropMenusArray = [];
    for( var i = 0; i < dropMenus.length; i++) {(function(i){
      dropMenusArray.push(new DropMenu(dropMenus[i]));
    })(i);}

    // on resize -> close all drop menu elements
		window.addEventListener('resize', function(event){
			dropMenusArray.forEach(function(element){
				closeOnResize(element);
			});
    });
    
    // close drop menu when clicking outside it
		window.addEventListener('click', function(event){
      dropMenusArray.forEach(function(element){
				closeOnClick(element, event.target);
			});
		});
  }
}());
// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

// File#: _3_wizard-form
// Usage: codyhouse.co/license
(function() {
  var WizardForm = function(element, formValidator) {
    this.element = element;
    this.steps = this.element.getElementsByClassName('js-wiz-form__step');
    this.currentIndex = 0;
    this.stepPrevClass = 'wiz-form__step--prev';
    this.stepNextClass = 'wiz-form__step--next';
    this.currentClass = 'js-wiz-form__step--current';
    // navigation
    this.navPrev = this.element.getElementsByClassName('js-wiz-form__prev');
    this.navNext = this.element.getElementsByClassName('js-wiz-form__next');
    this.formSubmit = this.element.getElementsByClassName('js-wiz-form__submit');
    // step bar
    this.stepsBar = this.element.getElementsByClassName('js-wiz-form__step-indicator');
    if(this.stepsBar.length > 0) {
      this.stepsBarCurrent = this.stepsBar[0].getElementsByClassName('js-wiz-form__current-step');
      this.stepsBarTot = this.stepsBar[0].getElementsByClassName('js-wiz-form__tot-steps');
    }
    // form validator
    this.formValidator = formValidator;
    this.formValidatorSteps = [];
    
    initWizardForm(this);
  };

  WizardForm.prototype.showStep = function(index) {
    this.currentIndex = index - 1;
		updateForm(this)
	};

  function initWizardForm(form) {
    // get selected step
    getSelectedStep(form);
    // reset navigation
    resetNav(form);
    setBarTotalSteps(form);
    resetStepBar(form);
    // init form validator
    if(form.formValidator) initFormValidator(form);
    // update form steps
    form.element.addEventListener('click', function(event) {
      if(form.formValidator && event.target.closest('.js-wiz-form__next')) {
        // change step only if no errors are found
        form.formValidatorSteps[form.currentIndex].validate(function(errors) {
          if(errors.length == 0) changeStep(form, event);
        });
      } else {
        changeStep(form, event);
      }
    });
  };

  function changeStep(form, event) {
    if(event.target.closest('.js-wiz-form__next')) updateFormStep(form, 'next');
    if(event.target.closest('.js-wiz-form__prev')) updateFormStep(form, 'prev');
  };

  function getSelectedStep(form) {
    var selectedStep = form.element.getElementsByClassName(form.currentClass);
    form.currentIndex = (selectedStep.length > 0) ? Util.getIndexInArray(form.steps, selectedStep[0]): 0;
    setStepsClass(form);
  };

  function setStepsClass(form) {
    for(var i = 0; i < form.steps.length; i++) {
      if(i < form.currentIndex) {
        Util.addClass(form.steps[i], form.stepPrevClass);
        Util.removeClass(form.steps[i], form.stepNextClass+' '+form.currentClass);
      } else if( i > form.currentIndex) {
        Util.addClass(form.steps[i], form.stepNextClass);
        Util.removeClass(form.steps[i], form.stepPrevClass+' '+form.currentClass);
      } else {
        Util.addClass(form.steps[i], form.currentClass);
        Util.removeClass(form.steps[i], form.stepNextClass+' '+form.stepPrevClass);
      }
    }
  };

  function resetNav(form) {
    if(form.navPrev.length > 0) {
      form.currentIndex > 0 ? Util.removeClass(form.navPrev[0], 'wiz-form__item-hidden') : Util.addClass(form.navPrev[0], 'wiz-form__item-hidden');
    }
    if(form.navNext.length > 0 && form.formSubmit.length > 0) {
      if(form.currentIndex == (form.steps.length - 1)) {
        Util.addClass(form.navNext[0], 'wiz-form__item-hidden');
        Util.removeClass(form.formSubmit[0], 'wiz-form__item-hidden');
      } else {
        Util.removeClass(form.navNext[0], 'wiz-form__item-hidden');
        Util.addClass(form.formSubmit[0], 'wiz-form__item-hidden');
      }
    }
  };

  function setBarTotalSteps(form) {
    if(form.stepsBarTot && form.stepsBarTot.length > 0) {
      form.stepsBarTot[0].textContent = form.steps.length;
      form.stepsBar[0].style.setProperty('--steps-v2-steps-nr', form.steps.length);
    }
  };

  function resetStepBar(form) {
    if(form.stepsBarCurrent && form.stepsBarCurrent.length > 0) {
      form.stepsBar[0].style.setProperty('--step-v2-current-step', form.currentIndex + 1);
      form.stepsBarCurrent[0].textContent = form.currentIndex + 1;
    }
  };

  function updateFormStep(form, direction) {
    // update current step
    if(direction == 'next') form.currentIndex = form.currentIndex + 1;
    else form.currentIndex = form.currentIndex - 1;
    updateForm(form);
  };

  function updateForm(form) {
    if(form.currentIndex < 0) form.currentIndex = 0;
    if(form.currentIndex > form.steps.length) form.currentIndex = form.steps.length;
    if(form.currentIndex < form.steps.length) {
      setStepsClass(form); // update form visible step
      resetNav(form);
      resetStepBar(form);
    } else {
      form.currentIndex = form.steps.length - 1;
      // form will be submitted here
    }
  };

  function initFormValidator(form) {
    var opts = form.formValidator;
    for(var i = 0; i < form.steps.length; i++) {
      opts.element = form.steps[i];
      form.formValidatorSteps.push(new FormValidator(opts));
    }
  };

  window.WizardForm = WizardForm;
}());
// File#: _3_mega-site-navigation
// Usage: codyhouse.co/license
(function() {
  var MegaNav = function(element) {
    this.element = element;
    this.search = this.element.getElementsByClassName('js-mega-nav__search');
    this.searchActiveController = false;
    this.menu = this.element.getElementsByClassName('js-mega-nav__nav');
    this.menuItems = this.menu[0].getElementsByClassName('js-mega-nav__item');
    this.menuActiveController = false;
    this.itemExpClass = 'mega-nav__item--expanded';
    this.classIconBtn = 'mega-nav__icon-btn--state-b';
    this.classSearchVisible = 'mega-nav__search--is-visible';
    this.classNavVisible = 'mega-nav__nav--is-visible';
    this.classMobileLayout = 'mega-nav--mobile';
    this.classDesktopLayout = 'mega-nav--desktop';
    this.layout = 'mobile';
    // store dropdown elements (if present)
    this.dropdown = this.element.getElementsByClassName('js-dropdown');
    // expanded class - added to header when subnav is open
    this.expandedClass = 'mega-nav--expanded';
    // check if subnav should open on hover
    this.hover = this.element.getAttribute('data-hover') && this.element.getAttribute('data-hover') == 'on';
    initMegaNav(this);
  };

  function initMegaNav(megaNav) {
    setMegaNavLayout(megaNav); // switch between mobile/desktop layout
    initSearch(megaNav); // controll search navigation
    initMenu(megaNav); // control main menu nav - mobile only
    initSubNav(megaNav); // toggle sub navigation visibility
    
    megaNav.element.addEventListener('update-menu-layout', function(event){
      setMegaNavLayout(megaNav); // window resize - update layout
    });
  };

  function setMegaNavLayout(megaNav) {
    var layout = getComputedStyle(megaNav.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
    if(layout == megaNav.layout) return;
    megaNav.layout = layout;
    megaNav.element.classList.toggle(megaNav.classDesktopLayout, megaNav.layout == 'desktop');
    megaNav.element.classList.toggle(megaNav.classMobileLayout, megaNav.layout != 'desktop');
    if(megaNav.layout == 'desktop') {
      closeSubNav(megaNav, false);
      // if the mega navigation has dropdown elements -> make sure they are in the right position (viewport awareness)
      triggerDropdownPosition(megaNav);
    } 
    closeSearch(megaNav, false);
    resetMegaNavOffset(megaNav); // reset header offset top value
    resetNavAppearance(megaNav); // reset nav expanded appearance
  };

  function resetMegaNavOffset(megaNav) {
    document.documentElement.style.setProperty('--mega-nav-offset-y', megaNav.element.getBoundingClientRect().top+'px');
  };

  function closeNavigation(megaNav) { // triggered by Esc key press
    // close search
    closeSearch(megaNav);
    // close nav
    if(megaNav.menu[0].classList.contains(megaNav.classNavVisible)) {
      toggleMenu(megaNav, megaNav.menu[0], 'menuActiveController', megaNav.classNavVisible, megaNav.menuActiveController, true);
    }
    //close subnav 
    closeSubNav(megaNav, false);
    resetNavAppearance(megaNav); // reset nav expanded appearance
  };

  function closeFocusNavigation(megaNav) { // triggered by Tab key pressed
    // close search when focus is lost
    if(megaNav.search[0].classList.contains(megaNav.classSearchVisible) && !document.activeElement.closest('.js-mega-nav__search')) {
      toggleMenu(megaNav, megaNav.search[0], 'searchActiveController', megaNav.classSearchVisible, megaNav.searchActiveController, true);
    }
    // close nav when focus is lost
    if(megaNav.menu[0].classList.contains(megaNav.classNavVisible) && !document.activeElement.closest('.js-mega-nav__nav')) {
      toggleMenu(megaNav, megaNav.menu[0], 'menuActiveController', megaNav.classNavVisible, megaNav.menuActiveController, true);
    }
    // close subnav when focus is lost
    for(var i = 0; i < megaNav.menuItems.length; i++) {
      if(!megaNav.menuItems[i].classList.contains(megaNav.itemExpClass)) continue;
      var parentItem = document.activeElement.closest('.js-mega-nav__item');
      if(parentItem && parentItem == megaNav.menuItems[i]) continue;
      closeSingleSubnav(megaNav, i);
    }
    resetNavAppearance(megaNav); // reset nav expanded appearance
  };

  function closeSearch(megaNav, bool) {
    if(megaNav.search.length < 1) return;
    if(megaNav.search[0].classList.contains(megaNav.classSearchVisible)) {
      toggleMenu(megaNav, megaNav.search[0], 'searchActiveController', megaNav.classSearchVisible, megaNav.searchActiveController, bool);
    }
  } ;

  function initSearch(megaNav) {
    if(megaNav.search.length == 0) return;
    // toggle search
    megaNav.searchToggles = document.querySelectorAll('[aria-controls="'+megaNav.search[0].getAttribute('id')+'"]');
    for(var i = 0; i < megaNav.searchToggles.length; i++) {(function(i){
      megaNav.searchToggles[i].addEventListener('click', function(event){
        // toggle search
        toggleMenu(megaNav, megaNav.search[0], 'searchActiveController', megaNav.classSearchVisible, megaNav.searchToggles[i], true);
        // close nav if it was open
        if(megaNav.menu[0].classList.contains(megaNav.classNavVisible)) {
          toggleMenu(megaNav, megaNav.menu[0], 'menuActiveController', megaNav.classNavVisible, megaNav.menuActiveController, false);
        }
        // close subnavigation if open
        closeSubNav(megaNav, false);
        resetNavAppearance(megaNav); // reset nav expanded appearance
      });
    })(i);}
  };

  function initMenu(megaNav) {
    if(megaNav.menu.length == 0) return;
    // toggle nav
    megaNav.menuToggles = document.querySelectorAll('[aria-controls="'+megaNav.menu[0].getAttribute('id')+'"]');
    for(var i = 0; i < megaNav.menuToggles.length; i++) {(function(i){
      megaNav.menuToggles[i].addEventListener('click', function(event){
        // toggle nav
        toggleMenu(megaNav, megaNav.menu[0], 'menuActiveController', megaNav.classNavVisible, megaNav.menuToggles[i], true);
        // close search if it was open
        if(megaNav.search[0].classList.contains(megaNav.classSearchVisible)) {
          toggleMenu(megaNav, megaNav.search[0], 'searchActiveController', megaNav.classSearchVisible, megaNav.searchActiveController, false);
        }
        resetNavAppearance(megaNav); // reset nav expanded appearance
      });
    })(i);}
  };

  function toggleMenu(megaNav, element, controller, visibleClass, toggle, moveFocus) {
    var menuIsVisible = element.classList.contains(visibleClass);
    element.classList.toggle(visibleClass, !menuIsVisible);
    toggle.classList.toggle(megaNav.classIconBtn, !menuIsVisible);
    menuIsVisible ? toggle.removeAttribute('aria-expanded') : toggle.setAttribute('aria-expanded', 'true');
    if(menuIsVisible) {
      if(toggle && moveFocus) toggle.focus();
      megaNav[controller] = false;
    } else {
      if(toggle) megaNav[controller] = toggle;
			getFirstFocusable(element).focus(); // move focus to first focusable element
    }
  };

  function getFirstFocusable(element) {
    var focusableEle = element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
		  firstFocusable = false;
    for(var i = 0; i < focusableEle.length; i++) {
      if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
        firstFocusable = focusableEle[i];
        break;
      }
    }
    return firstFocusable;
  };

  function initSubNav(megaNav) {
    // toggle subnavigation visibility
    megaNav.element.addEventListener('click', function(event){
      toggleSubNav(megaNav, event, 'click');
    });

    if(megaNav.hover) { // data-hover="on" => use mouse events 
      megaNav.element.addEventListener('mouseover', function(event) {
        if(megaNav.layout != 'desktop') return;
        toggleSubNav(megaNav, event, 'mouseover')
      });

      megaNav.element.addEventListener('mouseout', function(event){
        if(megaNav.layout != 'desktop') return;
        var mainItem = event.target.closest('.js-mega-nav__item');
        if(!mainItem) return;
        var triggerBtn = mainItem.getElementsByClassName('js-mega-nav__control');
        if(triggerBtn.length < 1) return;
        var itemExpanded = mainItem.classList.contains(megaNav.itemExpClass);
        if(!itemExpanded) return;
        var mainItemHover = event.relatedTarget;
        if(mainItemHover && mainItem.contains(mainItemHover)) return;
        
        mainItem.classList.toggle(megaNav.itemExpClass, !itemExpanded);
        itemExpanded ? triggerBtn[0].removeAttribute('aria-expanded') : triggerBtn[0].setAttribute('aria-expanded', 'true');
      });
    }
  };

  function toggleSubNav(megaNav, event, eventType) {
    var triggerBtn = event.target.closest('.js-mega-nav__control');
    if(!triggerBtn) return;
    var mainItem = triggerBtn.closest('.js-mega-nav__item');
    if(!mainItem) return;
    var itemExpanded = mainItem.classList.contains(megaNav.itemExpClass);
    if(megaNav.hover && itemExpanded && megaNav.layout == 'desktop' && eventType != 'click') return;
    mainItem.classList.toggle(megaNav.itemExpClass, !itemExpanded);
    itemExpanded ? triggerBtn.removeAttribute('aria-expanded') : triggerBtn.setAttribute('aria-expanded', 'true');
    if(megaNav.layout == 'desktop' && !itemExpanded) closeSubNav(megaNav, mainItem);
    // close search if open
    closeSearch(megaNav, false);
    resetNavAppearance(megaNav); // reset nav expanded appearance
  };

  function closeSubNav(megaNav, selectedItem) {
    // close subnav when a new sub nav element is open
    if(megaNav.menuItems.length == 0 ) return;
    for(var i = 0; i < megaNav.menuItems.length; i++) {
      if(megaNav.menuItems[i] != selectedItem) closeSingleSubnav(megaNav, i);
    }
  };

  function closeSingleSubnav(megaNav, index) {
    megaNav.menuItems[index].classList.remove(megaNav.itemExpClass);
    var triggerBtn = megaNav.menuItems[index].getElementsByClassName('js-mega-nav__control');
    if(triggerBtn.length > 0) triggerBtn[0].removeAttribute('aria-expanded');
  };

  function triggerDropdownPosition(megaNav) {
    // emit custom event to properly place dropdown elements - viewport awarness
    if(megaNav.dropdown.length == 0) return;
    for(var i = 0; i < megaNav.dropdown.length; i++) {
      megaNav.dropdown[i].dispatchEvent(new CustomEvent('placeDropdown'));
    }
  };

  function resetNavAppearance(megaNav) {
    ( (megaNav.element.getElementsByClassName(megaNav.itemExpClass).length > 0 && megaNav.layout == 'desktop') || megaNav.element.getElementsByClassName(megaNav.classSearchVisible).length > 0 ||(megaNav.element.getElementsByClassName(megaNav.classNavVisible).length > 0 && megaNav.layout == 'mobile'))
      ? megaNav.element.classList.add(megaNav.expandedClass)
      : megaNav.element.classList.remove(megaNav.expandedClass);
  };

  //initialize the MegaNav objects
  var megaNav = document.getElementsByClassName('js-mega-nav');
  if(megaNav.length > 0) {
    var megaNavArray = [];
    for(var i = 0; i < megaNav.length; i++) {
      (function(i){megaNavArray.push(new MegaNav(megaNav[i]));})(i);
    }

    // key events
    window.addEventListener('keyup', function(event){
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) { // listen for esc key events
        for(var i = 0; i < megaNavArray.length; i++) {(function(i){
          closeNavigation(megaNavArray[i]);
        })(i);}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) { // close search or nav if it looses focus
        for(var i = 0; i < megaNavArray.length; i++) {(function(i){
          closeFocusNavigation(megaNavArray[i]);
        })(i);}
			}
    });

    window.addEventListener('click', function(event){
      if(!event.target.closest('.js-mega-nav')) closeNavigation(megaNavArray[0]);
    });
    
    // resize - update menu layout
    var resizingId = false,
      customEvent = new CustomEvent('update-menu-layout');
    window.addEventListener('resize', function(event){
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 200);
    });

    function doneResizing() {
      for( var i = 0; i < megaNavArray.length; i++) {
        (function(i){megaNavArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };

    (window.requestAnimationFrame) // init mega site nav layout
      ? window.requestAnimationFrame(doneResizing)
      : doneResizing();
  }
}());
// File#: _3_hiding-nav
// Usage: codyhouse.co/license
(function() {
  var hidingNav = document.getElementsByClassName('js-hide-nav');
  if(hidingNav.length > 0 && window.requestAnimationFrame) {
    var mainNav = Array.prototype.filter.call(hidingNav, function(element) {
      return element.classList.contains('js-hide-nav--main');
    }),
    subNav = Array.prototype.filter.call(hidingNav, function(element) {
      return element.classList.contains('js-hide-nav--sub');
    });
    
    var scrolling = false,
      previousTop = window.scrollY,
      currentTop = window.scrollY,
      scrollDelta = 10,
      scrollOffset = 150, // scrollY needs to be bigger than scrollOffset to hide navigation
      headerHeight = 0; 

    var navIsFixed = false; // check if main navigation is fixed
    if(mainNav.length > 0 && mainNav[0].classList.contains('hide-nav--fixed')) navIsFixed = true;

    // store button that triggers navigation on mobile
    var triggerMobile = getTriggerMobileMenu();
    var prevElement = createPrevElement();
    var mainNavTop = 0;
    // list of classes the hide-nav has when it is expanded -> do not hide if it has those classes
    var navOpenClasses = hidingNav[0].getAttribute('data-nav-target-class'),
      navOpenArrayClasses = [];
    if(navOpenClasses) navOpenArrayClasses = navOpenClasses.split(' ');
    getMainNavTop();
    if(mainNavTop > 0) {
      scrollOffset = scrollOffset + mainNavTop;
    }
    
    // init navigation and listen to window scroll event
    getHeaderHeight();
    initSecondaryNav();
    initFixedNav();
    resetHideNav();
    window.addEventListener('scroll', function(event){
      if(scrolling) return;
      scrolling = true;
      window.requestAnimationFrame(resetHideNav);
    });

    window.addEventListener('resize', function(event){
      if(scrolling) return;
      scrolling = true;
      window.requestAnimationFrame(function(){
        if(headerHeight > 0) {
          getMainNavTop();
          getHeaderHeight();
          initSecondaryNav();
          initFixedNav();
        }
        // reset both navigation
        hideNavScrollUp();

        scrolling = false;
      });
    });

    function getHeaderHeight() {
      headerHeight = mainNav[0].offsetHeight;
    };

    function initSecondaryNav() { // if there's a secondary nav, set its top equal to the header height
      if(subNav.length < 1 || mainNav.length < 1) return;
      subNav[0].style.top = (headerHeight - 1)+'px';
    };

    function initFixedNav() {
      if(!navIsFixed || mainNav.length < 1) return;
      mainNav[0].style.marginBottom = '-'+headerHeight+'px';
    };

    function resetHideNav() { // check if navs need to be hidden/revealed
      currentTop = window.scrollY;
      if(currentTop - previousTop > scrollDelta && currentTop > scrollOffset) {
        hideNavScrollDown();
      } else if( previousTop - currentTop > scrollDelta || (previousTop - currentTop > 0 && currentTop < scrollOffset) ) {
        hideNavScrollUp();
      } else if( previousTop - currentTop > 0 && subNav.length > 0 && subNav[0].getBoundingClientRect().top > 0) {
        setTranslate(subNav[0], '0%');
      }
      // if primary nav is fixed -> toggle bg class
      if(navIsFixed) {
        var scrollTop = window.scrollY || window.pageYOffset;
        mainNav[0].classList.toggle('hide-nav--has-bg', (scrollTop > headerHeight + mainNavTop));
      }
      previousTop = currentTop;
      scrolling = false;
    };

    function hideNavScrollDown() {
      // if there's a secondary nav -> it has to reach the top before hiding nav
      if( subNav.length  > 0 && subNav[0].getBoundingClientRect().top > headerHeight) return;
      // on mobile -> hide navigation only if dropdown is not open
      if(triggerMobile && triggerMobile.getAttribute('aria-expanded') == "true") return;
      // check if main nav has one of the following classes
      if( mainNav.length > 0 && (!navOpenClasses || !checkNavExpanded())) {
        setTranslate(mainNav[0], '-100%'); 
        mainNav[0].addEventListener('transitionend', addOffCanvasClass);
      }
      if( subNav.length  > 0 ) setTranslate(subNav[0], '-'+headerHeight+'px');
    };

    function hideNavScrollUp() {
      if( mainNav.length > 0 ) {setTranslate(mainNav[0], '0%'); mainNav[0].classList.remove('hide-nav--off-canvas');mainNav[0].removeEventListener('transitionend', addOffCanvasClass);}
      if( subNav.length  > 0 ) setTranslate(subNav[0], '0%');
    };

    function addOffCanvasClass() {
      mainNav[0].removeEventListener('transitionend', addOffCanvasClass);
      mainNav[0].classList.add('hide-nav--off-canvas');
    };

    function setTranslate(element, val) {
      element.style.transform = 'translateY('+val+')';
    };

    function getTriggerMobileMenu() {
      // store trigger that toggle mobile navigation dropdown
      var triggerMobileClass = hidingNav[0].getAttribute('data-mobile-trigger');
      if(!triggerMobileClass) return false;
      if(triggerMobileClass.indexOf('#') == 0) { // get trigger by ID
        var trigger = document.getElementById(triggerMobileClass.replace('#', ''));
        if(trigger) return trigger;
      } else { // get trigger by class name
        var trigger = hidingNav[0].getElementsByClassName(triggerMobileClass);
        if(trigger.length > 0) return trigger[0];
      }
      
      return false;
    };

    function createPrevElement() {
      // create element to be inserted right before the mainNav to get its top value
      if( mainNav.length < 1) return false;
      var newElement = document.createElement("div"); 
      newElement.setAttribute('aria-hidden', 'true');
      mainNav[0].parentElement.insertBefore(newElement, mainNav[0]);
      var prevElement =  mainNav[0].previousElementSibling;
      prevElement.style.opacity = '0';
      return prevElement;
    };

    function getMainNavTop() {
      if(!prevElement) return;
      mainNavTop = prevElement.getBoundingClientRect().top + window.scrollY;
    };

    function checkNavExpanded() {
      var navIsOpen = false;
      for(var i = 0; i < navOpenArrayClasses.length; i++){
        if(mainNav[0].classList.contains(navOpenArrayClasses[i].trim())) {
          navIsOpen = true;
          break;
        }
      }
      return navIsOpen;
    };
    
  } else {
    // if window requestAnimationFrame is not supported -> add bg class to fixed header
    var mainNav = document.getElementsByClassName('js-hide-nav--main');
    if(mainNav.length < 1) return;
    if(mainNav[0].classList.contains('hide-nav--fixed')) mainNav[0].classList.add('hide-nav--has-bg');
  }
}());
// File#: _3_looping-slideshow-v2
// Usage: codyhouse.co/license
(function() {
  var LoopSlideshow2 = function(element) {
    this.element = element;
    this.slides = this.element.getElementsByClassName('js-slideshow-pm__item');
    this.videos = getSlideshowVideo(this);
    this.loader = this.element.getElementsByClassName('js-loop-slideshow-v2__loader');
    this.slideshoObj = false;
    this.slideshoDotNav = false;
    this.timeoutId = false;
    this.defaultLoop = this.element.getAttribute('data-loop') ? this.element.getAttribute('data-loop') : 5000;
    this.fillingCSS = '--loop-slideshow-filling-v2';
    this.animating = false;
    this.observer = false;
    initLoopSlideshow2(this);
    initLoopSlideshow2Events(this);
  };

  function getSlideshowVideo(el) {
    var videos = [];
    for(var i = 0; i < el.slides.length; i++) {
      videos.push(el.slides[i].querySelector('video'));
    }
    return videos;
  };

  function initLoopSlideshow2(el) {
    // init SlideshowPrew object
    var prewNav = (el.element.getAttribute('data-pm-nav') && el.element.getAttribute('data-pm-nav') == 'on' ) ? true : false, 
			swipe = (el.element.getAttribute('data-swipe') && el.element.getAttribute('data-swipe') == 'on') ? true : false;
    el.slideshoObj = new SlideshowPrew({element: el.element, navClass: 'loop-slideshow-v2__navigation', navItemClass: 'loop-slideshow-v2__nav-item', navBtnClass: 'loop-slideshow-v2__nav-btn', prewNav: prewNav, swipe: swipe});

    // store nav dot items
    el.slideshoDotNav = el.element.getElementsByClassName('js-slideshow-pm__nav-item');
    
    // use intersection observer to trigger start/stop of loop and video play
    el.observer = new IntersectionObserver(loopSlideshowObserve.bind(el));
    el.observer.observe(el.element);
  };

  function initLoopSlideshow2Events(el) {
    el.element.addEventListener('newSlide', function(event) { 
      // new slide has been selected
      clearTimeout(el.timeoutId);
      window.cancelAnimationFrame(el.animating);
      playVideo(el, event.detail);
    });
  };

  function loopSlideshowObserve(entries) {
    clearTimeout(this.timeoutId);
    window.cancelAnimationFrame(this.animating);
    this.timeoutId = false;
    this.animating = false;
    entries[0].isIntersecting ? playSlideshow(this) : pauseSlideshow(this);
  };

  function playVideo(el, index) {
    for(var i = 0; i < el.videos.length; i++) {
      if(i == index) {
        var delay = el.defaultLoop;
        if(el.videos[i]) {
          el.videos[i].pause();
          el.videos[i].currentTime = 0;
          el.videos[i].play();
          delay = 1000 * (el.videos[i].duration % 60);
        }
        startLoaderAnim(el, delay, i);
      } else if(el.videos[i]) {
        el.videos[i].pause();
      }
    }
  };

  function playSlideshow(el) {
    playVideo(el, el.slideshoObj.selectedSlide);
  };

  function pauseSlideshow(el) {
    var video = el.videos[el.slideshoObj.selectedSlide]
    if(video) video.pause();
  };

  function startLoaderAnim(el, duration, index) {
    window.cancelAnimationFrame(el.animating);
    if(isNaN(duration)) {
      return setTimeout(function(){
        startLoaderAnim(el, 1000 * (el.videos[index].duration % 60), index);
      }, 100);
    }

    // start loader animation
    resetDotNav(el);
    animateFilling(el, el.loader[0], index, duration);

    // timeout for next slide
    el.timeoutId = setTimeout(function(){
      nextSlide(el);
    }, duration);
  };

  function nextSlide(el) {
    if(el.slideshoObj.selectedSlide == el.slides.length - 1) {
      el.slideshoObj.showItem(0);
    } else {
      el.slideshoObj.showNext();
    }
  };

  function resetDotNav(el) {
    // reset dot filling to zero
    for(var i = 0; i < el.slideshoDotNav.length; i++) setFilling(el.slideshoDotNav[i], el.fillingCSS, 0);
    window.cancelAnimationFrame(el.animating);
    el.currentTime = false;
  };

  function animateFilling(el, loader, index, duration) {
    var strokeOffset = 144.44; // stroke-dashoffset of js-loop-slideshow-v2__loader 
    el.animating = window.requestAnimationFrame(function(timestamp){
      if(!el.currentTime) el.currentTime = timestamp;
      var progress = timestamp - el.currentTime;
      if(progress > duration) progress = duration;
      setFilling(loader, el.fillingCSS, ((1 - progress/duration)*strokeOffset).toFixed(3)); // animate arrow
      if(el.slideshoDotNav.length > index) setFilling(el.slideshoDotNav[index], el.fillingCSS, (progress/duration).toFixed(3)); // animte nav dot filling on small devices
      
      if(progress < duration) {
        animateFilling(el, loader, index, duration);
      } else {
        // animation is over
        el.animating = false;
        el.currentTime = false;
      }
    });
  };

  function setFilling(element, property, value) {
    element.style.setProperty(property, value);
  };

  //initialize the LoopSlideshow2 objects
	var slideshow = document.getElementsByClassName('js-loop-slideshow-v2');
  if( slideshow.length > 0 ) {
    for( var i = 0; i < slideshow.length; i++) {
      (function(i){
        new LoopSlideshow2(slideshow[i]);
      })(i);
    }
  }
}());
// File#: _3_looping-slideshow
// Usage: codyhouse.co/license
(function() {
  var LoopSlideshow = function(element) {
    this.element = element;
    this.slideshowObj = false;
    this.navItems = this.element.getElementsByClassName('js-slideshow__nav-item');
    this.autoplayInterval = 5000;
    this.autoplayPaused = false;
    this.fillingCSS = '--loop-slideshow-filling';
    this.pauseBtnClass = 'js-loop-slideshow__pause-btn';
    this.pauseBtn = this.element.getElementsByClassName(this.pauseBtnClass);
    this.animating = false;
    this.currentTime = false;

    initLoopSlideshow(this);
    initEvents(this);
  };

  function initLoopSlideshow(obj) {
    var autoplay = true,
			autoplayInterval = (obj.element.getAttribute('data-autoplay-interval')) ? obj.element.getAttribute('data-autoplay-interval') : obj.autoplayInterval,
			swipe = (obj.element.getAttribute('data-swipe') && obj.element.getAttribute('data-swipe') == 'on') ? true : false;
		obj.slideshowObj = new Slideshow({element: obj.element, navigation: true, autoplay : autoplay, autoplayInterval : autoplayInterval, swipe : swipe, navigationClass: 'loop-slideshow__navigation', navigationItemClass: 'loop-slideshow__nav-item', autoplayOnHover: true, autoplayOnFocus: true});
    // update autoplay interval
    obj.autoplayInterval = autoplayInterval;
    // filling effect for first item
    initFilling(obj, obj.slideshowObj.selectedSlide);
  };

  function initEvents(obj) {
    obj.element.addEventListener('newItemSelected', function(event){
      // new slide has been selected
      initFilling(obj, event.detail);
      toggleAutoplay(obj, false);
    });

    // custom click on image -> animate slideshow
    obj.element.addEventListener('click', function(event){
      if(event.target.closest('.js-loop-slideshow__pause-btn')) {
        toggleAutoplay(obj, !obj.autoplayPaused); // pause/play autoplay
      } else if(event.target.closest('.js-slideshow__item')) {
        showNewSlide(obj, event);
      }
    });
  };

  function initFilling(obj, index) {
    cancelFilling(obj);

    for(var i = 0; i < obj.navItems.length; i++) {
      setFilling(obj.navItems[i], obj.fillingCSS, 0);
    }
    // trigger animation
    obj.currentTime = false;
    animateFilling(obj, index);
  };

  function cancelFilling(obj) {
    if(obj.animating) { // clear previous animation
      window.cancelAnimationFrame(obj.animating);
      obj.animating = false;
    }
  };

  function animateFilling(obj, index) {
    obj.animating = window.requestAnimationFrame(function(timestamp){
      if(!obj.currentTime) obj.currentTime = timestamp;
      var progress = timestamp - obj.currentTime;
      if(progress > obj.autoplayInterval) progress = obj.autoplayInterval;
      setFilling(obj.navItems[index], obj.fillingCSS, (progress/obj.autoplayInterval).toFixed(3));
      
      if(progress < obj.autoplayInterval) {
        animateFilling(obj, index);
      } else {
        // animation is over
        obj.animating = false;
        obj.currentTime = false;
      }
    });
  };

  function setFilling(element, property, value) {
    element.style.setProperty(property, value);
  };

  function showNewSlide(obj, event) {
    // check if we should go next or prev
    var boundingRect = obj.element.getBoundingClientRect(),
      isNext = event.clientX > boundingRect.left + boundingRect.width/2;

    isNext ? obj.slideshowObj.showNext() : obj.slideshowObj.showPrev();
  };

  function toggleAutoplay(obj, bool) {
    obj.autoplayPaused = bool;
    if(obj.autoplayPaused) {
      cancelFilling(obj);
      obj.slideshowObj.pauseAutoplay();
    } else {
      obj.slideshowObj.startAutoplay();
      initFilling(obj, obj.slideshowObj.selectedSlide);
    }
    if(obj.pauseBtn.length > 0) {
      // update btn appearance
      obj.pauseBtn[0].classList.toggle('btn-states--state-b', obj.autoplayPaused);
      // update pressed status 
      obj.autoplayPaused ? obj.pauseBtn[0].setAttribute('aria-pressed', 'true'): obj.pauseBtn[0].setAttribute('aria-pressed', 'false');
    }
  };

  //initialize the ThumbSlideshow objects
	var slideshow = document.getElementsByClassName('js-loop-slideshow');
  if( slideshow.length > 0 ) {
    for( var i = 0; i < slideshow.length; i++) {
      (function(i){
        new LoopSlideshow(slideshow[i]);
      })(i);
    }
  }
}());
// File#: _3_lightbox
// Usage: codyhouse.co/license

(function() {
  var Lightbox = function(element) {
    this.element = element;
    this.id = this.element.getAttribute('id');
    this.slideshow = this.element.getElementsByClassName('js-lightbox__body')[0];
    this.slides = this.slideshow.getElementsByClassName('js-slideshow__item');
    this.thumbWrapper = this.element.getElementsByClassName('js-lightbox_thumb-list');
    lazyLoadLightbox(this);
    initSlideshow(this);
    initThumbPreview(this);
    initThumbEvents(this);
  }

  function lazyLoadLightbox(modal) {
    // add no-transition class to lightbox - used to select the first visible slide
    modal.element.classList.add('lightbox--no-transition');
    //load first slide media when modal is open
    modal.element.addEventListener('modalIsOpen', function(event){
      setSelectedItem(modal, event);
      var selectedSlide = modal.slideshow.getElementsByClassName('slideshow__item--selected');
      modal.selectedSlide = Array.prototype.indexOf.call(modal.slides, selectedSlide[0]);
      if(selectedSlide.length > 0) {
        if(modal.slideshowObj) modal.slideshowObj.selectedSlide = modal.selectedSlide;
        lazyLoadSlide(modal);
        resetVideos(modal, false);
        resetIframes(modal, false);
        updateThumb(modal);
      }
      modal.element.classList.remove('lightbox--no-transition');
    });
    modal.element.addEventListener('modalIsClose', function(event){ // add no-transition class
      modal.element.classList.add('lightbox--no-transition');
    });
    // lazyload media of selected slide/prev slide/next slide
    modal.slideshow.addEventListener('newItemSelected', function(event){
      // 'newItemSelected' is emitted by the Slideshow object when a new slide is selected
      var prevSelected = modal.selectedSlide;
      modal.selectedSlide = event.detail;
      lazyLoadSlide(modal);
      resetVideos(modal, prevSelected); // pause video of previous visible slide and start new video (if present)
      resetIframes(modal, prevSelected);
      updateThumb(modal);
    });
  };

  function lazyLoadSlide(modal) {
    setSlideMedia(modal, modal.selectedSlide);
    setSlideMedia(modal, modal.selectedSlide + 1);
    setSlideMedia(modal, modal.selectedSlide - 1);
  };

  function setSlideMedia(modal, index) {
    if(index < 0) index = modal.slides.length - 1;
    if(index > modal.slides.length - 1) index = 0;
    setSlideImgs(modal, index);
    setSlidesVideos(modal, index, 'video');
    setSlidesVideos(modal, index, 'iframe');
  };

  function setSlideImgs(modal, index) {
    var imgs = modal.slides[index].querySelectorAll('img[data-src]');
    for(var i = 0; i < imgs.length; i++) {
      imgs[i].src = imgs[i].getAttribute('data-src');
    }
  };

  function setSlidesVideos(modal, index, type) {
    var videos = modal.slides[index].querySelectorAll(type+'[data-src]');
    for(var i = 0; i < videos.length; i++) {
      videos[0].src = videos[0].getAttribute('data-src');
      videos[0].removeAttribute('data-src');
    }
  };

  function initSlideshow(modal) { 
    if(modal.slides.length <= 1) {
      hideSlideshowElements(modal);
      return;
    } 
    var swipe = (modal.slideshow.getAttribute('data-swipe') && modal.slideshow.getAttribute('data-swipe') == 'on') ? true : false;
    modal.slideshowObj = new Slideshow({element: modal.slideshow, navigation: false, autoplay : false, swipe : swipe});
  };

  function hideSlideshowElements(modal) { // hide slideshow controls if gallery is composed by one item only
    var slideshowNav = modal.element.getElementsByClassName('js-slideshow__control');
    if(slideshowNav.length > 0) {
      for(var i = 0; i < slideshowNav.length; i++) slideshowNav[i].classList.add('lp5-hide');
    }
    var slideshowThumbs = modal.element.getElementsByClassName('js-lightbox_footer');
    if(slideshowThumbs.length > 0) slideshowThumbs[0].classList.add('lp5-hide');
  };

  function resetVideos(modal, index) {
    if(index) {
      var actualVideo = modal.slides[index].getElementsByTagName('video');
      if(actualVideo.length > 0 ) actualVideo[0].pause();
    }
    var newVideo = modal.slides[modal.selectedSlide].getElementsByTagName('video');
    if(newVideo.length > 0 ) {
      setVideoWidth(modal, modal.selectedSlide, newVideo[0]);
      newVideo[0].play();
    }
  };

  function resetIframes(modal, index) {
    if(index) {
      var actualIframe = modal.slides[index].getElementsByTagName('iframe');
      if(actualIframe.length > 0 ) {
        actualIframe[0].setAttribute('data-src', actualIframe[0].src);
        actualIframe[0].removeAttribute('src');
      }
    }
    var newIframe = modal.slides[modal.selectedSlide].getElementsByTagName('iframe');
    if(newIframe.length > 0 ) {
      setVideoWidth(modal, modal.selectedSlide, newIframe[0]);
    }
  };

  function resizeLightbox(modal) { // executed when window has been resized
    if(!modal.selectedSlide) return; // modal not active
    var video = modal.slides[modal.selectedSlide].getElementsByTagName('video');
    if(video.length > 0 ) setVideoWidth(modal, modal.selectedSlide, video[0]);
    var iframe = modal.slides[modal.selectedSlide].getElementsByTagName('iframe');
    if(iframe.length > 0 ) setVideoWidth(modal, modal.selectedSlide, iframe[0]);
  };

  function setVideoWidth(modal, index, video) {
    var videoContainer = modal.slides[index].getElementsByClassName('js-lightbox__media-outer');
    if(videoContainer.length == 0 ) return;
    var videoWrapper = videoContainer[0].getElementsByClassName('js-lightbox__media-inner');
    var maxWidth = (video.offsetWidth/video.offsetHeight)*videoContainer[0].offsetHeight;
    if(maxWidth < modal.slides[index].offsetWidth) {
      videoWrapper[0].style.width = maxWidth+'px';
      videoWrapper[0].style.paddingBottom = videoContainer[0].offsetHeight+'px';
    } else {
      videoWrapper[0].removeAttribute('style')
    }
  };

  function initThumbPreview(modal) {
    if(modal.thumbWrapper.length < 1) return;
    var content = '';
    for(var i = 0; i < modal.slides.length; i++) {
      var activeClass = modal.slides[i].classList.contains('slideshow__item--selected') ? ' lightbox__thumb--active': '';
      content = content + '<li class="lightbox__thumb js-lightbox__thumb'+activeClass+'"><img src="'+modal.slides[i].querySelector('[data-thumb]').getAttribute('data-thumb')+'">'+'</li>';
    }
    modal.thumbWrapper[0].innerHTML = content;
  };

  function initThumbEvents(modal) {
    if(modal.thumbWrapper.length < 1) return;
    modal.thumbSlides = modal.thumbWrapper[0].getElementsByClassName('js-lightbox__thumb');
    modal.thumbWrapper[0].addEventListener('click', function(event){
      var selectedThumb = event.target.closest('.js-lightbox__thumb');
      if(!selectedThumb || selectedThumb.classList.contains('lightbox__thumb--active')) return;
      modal.slideshowObj.showItem(Array.prototype.indexOf.call(modal.thumbSlides, selectedThumb));
    });
  };

  function updateThumb(modal) {
    if(modal.thumbWrapper.length < 1) return;
    // update selected thumb classes
    var selectedThumb = modal.thumbWrapper[0].getElementsByClassName('lightbox__thumb--active');
    if(selectedThumb.length > 0) selectedThumb[0].classList.remove('lightbox__thumb--active');
    modal.thumbSlides[modal.selectedSlide].classList.add('lightbox__thumb--active');
    // update thumb list position (if selected thumb is outside viewport)
    var offsetThumb = modal.thumbSlides[modal.selectedSlide].getBoundingClientRect(),
      offsetThumbList = modal.thumbWrapper[0].getBoundingClientRect();
    if(offsetThumb.left < offsetThumbList.left) {
      modal.thumbWrapper[0].scrollTo(modal.thumbSlides[modal.selectedSlide].offsetLeft - offsetThumbList.left, 0);
    } else if(offsetThumb.right > offsetThumbList.right) {
      modal.thumbWrapper[0].scrollTo( (offsetThumb.right - offsetThumbList.right) + modal.thumbWrapper[0].scrollLeft, 0);
    }
  };

  function keyboardNavigateLightbox(modal, direction) {
    if(!modal.element.classList.contains('modal--is-visible')) return;
    if(!document.activeElement.closest('.js-lightbox__body') && document.activeElement.closest('.js-modal')) return
    (direction == 'next') ? modal.slideshowObj.showNext() : modal.slideshowObj.showPrev();
  };

  function setSelectedItem(modal, event) {
    // if a specific slide was selected -> make sure to show that item first
    var selectedItemId = false;
    if(event.detail) {
      var elTarget = event.detail.closest('[aria-controls="'+modal.id+'"]');
      if(elTarget) selectedItemId = elTarget.getAttribute('data-lightbox-item');
    } 
   
    if(!selectedItemId || !modal.slideshowObj) return;
    var selectedItem = document.getElementById(selectedItemId);
    if(!selectedItem) return;
    var lastSelected = modal.slideshow.getElementsByClassName('slideshow__item--selected');
    if(lastSelected.length > 0 ) lastSelected[0].classList.remove('slideshow__item--selected');
    selectedItem.classList.add('slideshow__item--selected');
  };

  window.Lightbox = Lightbox;

  // init Lightbox objects
  var lightBoxes = document.getElementsByClassName('js-lightbox');
  if( lightBoxes.length > 0 ) {
    var lightBoxArray = [];
    for( var i = 0; i < lightBoxes.length; i++) {
      (function(i){ lightBoxArray.push(new Lightbox(lightBoxes[i]));})(i);
      
      // resize video/iframe
      var resizingId = false;
      window.addEventListener('resize', function(event){
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 300);
      });

      function doneResizing() {
        for( var i = 0; i < lightBoxArray.length; i++) {
          (function(i){resizeLightbox(lightBoxArray[i]);})(i);
        };
      };

      // Lightbox gallery navigation with keyboard
      window.addEventListener('keydown', function(event){
        if(event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright') {
          updateLightbox('next');
        } else if(event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft') {
          updateLightbox('prev');
        }
      });

      function updateLightbox(direction) {
        for( var i = 0; i < lightBoxArray.length; i++) {
          (function(i){keyboardNavigateLightbox(lightBoxArray[i], direction);})(i);
        };
      };
    }
  }
}());

(function ($) {
	$.fn.scroller = function (options) {
		var settings = $.extend({
		  'topLoader' : 'loading_bar_top',
		  'bottomLoader' : 'loading_bar_bottom',
		  'pager' : 'pager',
		  'countAttr' : 'data-count',
		  'minPagerInterval' : 3,
		  'loadDistance' : 0.3}, options);
		var requestInProgress = 0;
		var info;
		var edgeDistance;
		var pager;
		var $container = this;
		var $topLoader;
		var $bottomLoader;
		var $firstVisible;
		var entryPositions;
		var entryHeights;
		$.fn.getSequence = function () {
      return this.attr(settings.countAttr);
    }
    $.fn.getSequenceInt = function () {
      return parseInt(this.attr(settings.countAttr));
    }
		var updateInfo = function () {
		  $.getJSON(settings.infoURL + '/' + info.numEntries,
			function(data) {
			  var oldNumEntries = info.numEntries
			  info.numEntries = data.numEntries;
			  var entriesAdded = info.numEntries - oldNumEntries;
			  if (entriesAdded > 0) {
			    if (oldNumEntries==0) {
			      loadPage(1);
			    } else if (nearBottom()) {
			      /* if loading the next entry results in a new page, load entire page
        			 otherwise, append to the current page */
        		var lastPostSequenceInt = lastPost().getSequenceInt();
					  var oldPageNum = entryToPage(lastPostSequenceInt);
					  var newPageNum = entryToPage(lastPostSequenceInt+1);
					  if (oldPageNum == newPageNum) {
					    requestNext();
					    console.log("appending next")
					  } else {
					    requestNext();
					    console.log("requesting next")
					    
					  }
		      }
			    updatePager();
			    setTimeout(updateInfo,500);
			  } else {
			    setTimeout(updateInfo,2000);
			  }
			});
		}
		
		var updatePosition = function () {
		 var currentScrollTop = $container.scrollTop();
		 var initialOffset = entryPositions[0];
		 var numEntries = $container.children('div[class=entry]').length;
		 for (var i=0;i<numEntries;i++) {
		 	if ((entryPositions[i]+entryHeights[i]-initialOffset)>currentScrollTop) {
		 		$firstVisible = $container.children(':nth-child('+(i+1)+')');
		 		break;
		 	}
		 }
			highlightLink();
		};
		var updateHash = function () {
		  location.hash=$firstVisible.getSequence();
		}
		var highlightLink = function () {
		  if ($firstVisible == undefined) return;
			$pager.children().removeClass('current_link');
			var $link = $pager.children(':first');	
			while (parseInt($link.attr('data-position')) <= parseInt($firstVisible.getSequence())) {
				$link = $link.next();		
			}
			if ($link) {
			  var $prev = $link.prev();
			  $link = $prev.length > 0 ? $prev : $link;
				$link.addClass('current_link');
			}
			return;
		}
		var firstPost = function () {
			return $container.children('div[class=entry]:first');
		}
		var lastPost = function () {
			return $container.children('div[class=entry]:last');
		}
		var cacheEntryPositions = function() {
			entryPositions = $.map($container.children('div[class=entry]'), function (n, i) {
				return $(n).position().top;
			})
			entryHeights = $.map($container.children('div[class=entry]'), function (n, i) {
				return $(n).height();
			})	
		}
		var bindScrollerActions = function () {
		  $container.bind('scrollstop', updateHash);
			$container.bind("scroll", scrollHandler);
		}
		var unbindScrollerActions = function () {
		  $container.unbind('scrollstop');
			$container.unbind("scroll");
		}
		var scrollHandler = function () {
		      $(window).scrollLeft(0);
		      updatePosition();
			    var scrollTop = $container.scrollTop();
					if(requestInProgress) {
						if (atVeryTop()) {
							$topLoader.fadeIn('fast');
						}
						else if (atVeryBottom()) {
							$bottomLoader.fadeIn('fast');
						}
					} else {
						if (nearBottom()) {
							requestNext();
							}
					  if (nearTop()) {
							requestPrev();
						}
					}
		}
	
		var updatePager = function () {
			var numLinks = $container.height()/15.0;
			var interval = Math.ceil(info.numEntries/numLinks);
			interval = Math.max(interval, settings.minPagerInterval)
			
			/* round interval to nearest nth */
			var factor = Math.pow(10, (info.numEntries + '').length-1)/100;
			interval = Math.ceil(interval / factor) * factor;
			var str = '';
			var link ='';
			for (var i=1; i <= info.numEntries; i += interval) {
				link = "<a href='#" + i + "' data-position='" + i + "'>"+i+"</a>";
				str += link;
			}
			$pager.html(str);
			$pager.children().click(function () { loadPage($(this).attr('data-position'))});	
			highlightLink();
		}	
		var atVeryTop = function () {
			return $container.scrollTop() == 0;
		}
		var atVeryBottom = function () {
			return heightNow() - $container.height()  == $container.scrollTop();
		}
		var getCurrentEntryNum = function () {
		  var hash = location.hash;
		  return hash ? hash.slice(1, hash.length) : 1;
		}
		var setup = function () {						
		  /* register elements */
		  $topLoader = $('#' + settings.topLoader).hide();
	    $bottomLoader = $('#' + settings.bottomLoader).hide();
	    $pager = $('#' + settings.pager);
	    
	    info = {};
	    info.numEntries = settings.numEntries;
	    info.perPage = settings.perPage;
	    info.numPages = Math.ceil(info.numEntries/info.perPage);
	    info.maxEntriesHeld = 3 * info.perPage;
	    loadPage(getCurrentEntryNum());
	    $(window).resize(function(event) { updateSize();});
	    setTimeout(updateInfo,100);
		}
		var entryToPage = function (entryNum) {
		  return Math.ceil(Math.min(info.numEntries, entryNum)/info.perPage);
		}
		var updateSize = function () {
			setSize();			
			updatePager();
			highlightLink();
		}
		var setSize = function () {
			height = $(window).height();
			$container.height(height);
			edgeDistance = height*settings.loadDistance;
		}
		var nearTop = function () {
			return $container.scrollTop() < edgeDistance;
		}
		var nearBottom = function () {
			return $container.scrollTop() + $container.height() > heightNow() - edgeDistance;
		}
		var clearTop = function () {
			var scrollTop = $container.scrollTop();
			var oldHeight = heightNow();
			var elementCount = $container.children('div[class=entry]').length;
			while (elementCount > info.maxEntriesHeld) {
				$container.children(':first').remove();
				elementCount--;
			}
			var newHeight = heightNow();
			$container.scrollTop(scrollTop-(oldHeight-newHeight));
		}
		var clearBottom = function (pixelsAdded) {
			var scrollTop=$container.scrollTop();
			var elementCount = $container.children('div[class=entry]').length
			while(elementCount > info.maxEntriesHeld) {
				$container.children('div[class=entry]:last').remove();
				elementCount--;
			}
			$container.scrollTop(scrollTop+pixelsAdded);
		}
		var loadPage = function (position) {
			$('#cover').fadeIn('fast');
			unbindScrollerActions();
			if (entryToPage(position) == 0) return;
			$.get(settings.requestURL + entryToPage(position),
			function(data) {
				$container.html(data);
				$container.scrollTop(0);
				cacheEntryPositions();
				moveToEntry(position);
				updatePager();
			})
		}
		var moveToEntry = function (post_id) {
		  post_id = Math.min(post_id, info.numEntries);
			selector = $container.children('div['+settings.countAttr+'=' + post_id + ']').first();
			correctElement = $(selector);
			// console.log(correctElement);
			if (correctElement.length > 0) {
				var scrollTop=correctElement.position().top;
				$container.scrollTop(scrollTop);
				$firstVisible = correctElement;
				$('#cover').fadeOut();		
				bindScrollerActions();
			}
		}
		var requestNext = function () {
			requestInProgress=1;
			var last = lastPost();
			var position = parseInt(last.getSequence())+1;
			if (position > info.numEntries) {
			  $bottomLoader.fadeOut();
				requestInProgress=0;
				return;
			}	
			var wasAtVeryBottom = atVeryBottom();
			$.get(settings.requestURL + entryToPage(position),
			function(data) {
			  var $added = $(data).filter('.entry').filter(function (index) {
    		    return $(this).getSequenceInt() >= position });
				$container.append($added);
				cacheEntryPositions();
				clearTop();
			  $bottomLoader.fadeOut();
				requestInProgress=0;
				if (wasAtVeryBottom) {
				  moveForward(10);
				};
			})
		}
		var moveForward = function (pixels) {
		  $container.scrollTop($container.scrollTop()+pixels);
		}
		var heightNow = function () {
		  return $container.attr('scrollHeight');
		}
		var requestPrev = function () {
			requestInProgress=1;
			var first = firstPost();
			var position = parseInt(first.getSequence())-1;
			if (position < 1) {
				$topLoader.fadeOut();
				requestInProgress=0;
				return;
			}
			oldHeight = heightNow();
			var wasAtVeryTop = atVeryTop();
			$.get(settings.requestURL + entryToPage(position),
			function(data) {
			  var $added = $(data).filter('.entry').filter(function (index) {
			    return $(this).getSequenceInt() <= position });
				$container.prepend($added);
				cacheEntryPositions();			
				newHeight = heightNow();
				clearBottom(newHeight-oldHeight);
				$topLoader.fadeOut();
				requestInProgress=0;
				if (wasAtVeryTop) {
				  moveForward(-10);
			  }
			})
		}
		setup();
		setSize();
		return this;
	};
})(jQuery);
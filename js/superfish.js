
/*
 * Superfish v1.4.8 - jQuery menu widget
 * Copyright (c) 2008 Joel Birch
 *
 * Dual licensed under the MIT and GPL licenses:
 * 	http://www.opensource.org/licenses/mit-license.php
 * 	http://www.gnu.org/licenses/gpl.html
 *
 * CHANGELOG: http://users.tpg.com.au/j_birch/plugins/superfish/changelog.txt
 */

;(function($){
	$.fn.superfish = function(op){

		var sf = $.fn.superfish,
			c = sf.c,
			$arrow = $("<span></span>").addClass(c.arrowClass).css({float: 'right', width: '12px', padding: '0px', margin: '0px'});
			over = function(){
				var $$ = $(this), menu = getMenu($$);
				clearTimeout(menu.sfTimer);
				$$.showSuperfishUl().siblings().hideSuperfishUl();
			},
			out = function(){
				var $$ = $(this), menu = getMenu($$), o = sf.op;
				clearTimeout(menu.sfTimer);
				menu.sfTimer=setTimeout(function(){
					o.retainPath=($.inArray($$[0],o.$path)>-1);
					$$.hideSuperfishUl();
					if (o.$path.length && $$.parents(['li.',o.hoverClass].join('')).length<1){over.call(o.$path);}
				},o.delay);	
			},
			getMenu = function($menu){
				var menu = $menu.parents(['ul.',c.menuClass,':first'].join(''))[0];
				sf.op = sf.o[menu.serial];
				return menu;
			},
			clickMenu = function($item){
				if (sf.op.onBeforeLoad != undefined)
					sf.op.onBeforeLoad.call(this);
				$this = this;
				$(sf.op.target).load($(this).attr('url'), function() {
					sf.op.onLoad.call($this);
				});
				$('li.'+c.activeClass).each(function() {
					$(this).removeClass(c.activeClass);
				});
				if (($tab = $(this).parent().parent().parent()).is('li')) {
					$(this).parent().parent().hide();
					$(this).parent().addClass(c.activeClass);
					$tab.addClass(c.activeClass);//.find('a:first').attr('url',$(this).attr('url')).text($(this).text());
					//addArrow($tab.find('a:first'));
				}
				else if ($(this).parent().has('ul')) {
					$('>ul',$(this).parent()).hide();
					$(this).parent().addClass(c.activeClass);
				}
				
			},
			addArrow = function($a){ $a.addClass(c.anchorClass).prepend($arrow.clone()); };
			
		return this.each(function() {
			var s = this.serial = sf.o.length;
			var o = $.extend({},sf.defaults,op);
			$(this).children('li').each(function() {
				$(this).addClass([c.menuClass,c.menuClass2].join(' ')).filter('li:not(:has(ul))').hover(function(){$(this).addClass(o.hoverClass);}, function(){ $(this).removeClass(o.hoverClass)});
			});
			o.$path = $('li.'+o.pathClass,this).slice(0,o.pathLevels).each(function(){
				$(this).addClass([o.hoverClass,c.bcClass].join(' '))
					.filter('li:has(ul)').removeClass(o.pathClass);
			});
			sf.o[s] = sf.op = o;
			
			$('li:has(ul)',this)[($.fn.hoverIntent && !o.disableHI) ? 'hoverIntent' : 'hover'](over,out).each(function() {
				$('>ul',this).css({ position: 'absolute', top: '2.2em', left: '0', display: 'inline', zIndex: '10000000', padding: '1px'}).hide().addClass(c.subMenuItemClass)
					.find('li').addClass(c.subMenuItemClass).css({clear:'both', width: '100%', margin: '0px', border: '0px'})
					.hover(function() {$(this).addClass(c.submenuHoverClass);}, function() {$(this).removeClass(c.submenuHoverClass);});
				if (o.autoArrows) addArrow( $('>a:first-child',this) );
			})
			.not('.'+c.bcClass)
				.hideSuperfishUl();
			
			var $a = $('a',this);
			$a.each(function(i){
				var $li = $a.eq(i).parents('li');
				$a.eq(i).focus(function(){over.call($li);}).blur(function(){out.call($li);}).click(function(){
					clickMenu.call(this, $li);
				});
			});
			o.onInit.call(this);
			
		}).each(function() {
			var menuClasses = [c.menuClass];
			if (sf.op.dropShadows  && !($.browser.msie && $.browser.version < 7)) menuClasses.push(c.shadowClass);
			$(this).addClass(menuClasses.join(' '));
		});
	};

	var sf = $.fn.superfish;
	sf.o = [];
	sf.op = {};
	sf.IE7fix = function(){
		var o = sf.op;
		if ($.browser.msie && $.browser.version > 6 && o.dropShadows && o.animation.opacity!=undefined)
			this.toggleClass(sf.c.shadowClass+'-off');
		};
	sf.c = {
		bcClass     : 'ui-state-default ui-corner-top',
		menuClass   : 'ui-state-default',
		menuClass2	: 'ui-corner-top',
		activeClass	: 'ui-state-active',
		anchorClass : 'sf-test',
		arrowClass  : 'ui-icon ui-icon-carat-1-s',
		shadowClass : 'sf-shadow',
		subMenuItemClass	: 'ui-state-default',
		submenuHoverClass	: 'ui-state-active'
	};
	sf.defaults = {
		hoverClass	: 'ui-state-hover',
		pathClass	: 'overideThisToUse',
		pathLevels	: 1,
		delay		: 300,
		animation	: {opacity:'show'},
		speed		: 'normal',
		target		: '#contentFrame',
		autoArrows	: true,
		dropShadows : false,
		disableHI	: false,		// true disables hoverIntent detection
		onInit		: function(){}, // callback functions
		onBeforeShow: function(){},
		onShow		: function(){},
		onHide		: function(){},
		onBeforeLoad		: function(){},
		onLoad		: function(){}
	};
	$.fn.extend({
		hideSuperfishUl : function(){
			var o = sf.op,
				not = (o.retainPath===true) ? o.$path : '';
			o.retainPath = false;
			var $ul = $(['li.',o.hoverClass].join(''),this).add(this).not(not).removeClass(o.hoverClass)
					.find('>ul').hide().css('visibility','hidden');
			o.onHide.call($ul);
			return this;
		},
		showSuperfishUl : function(){
			var o = sf.op,
				sh = sf.c.shadowClass+'-off',
				$ul = this.addClass(o.hoverClass)
					.find('>ul:hidden').show().css('visibility','visible');
			sf.IE7fix.call($ul);
			o.onBeforeShow.call($ul);
			$ul.animate(o.animation,o.speed,function(){ sf.IE7fix.call($ul); o.onShow.call($ul); });
			return this;
		}
	});

})(jQuery);

jQuery(function(c){var b=window.BRUSHED||{};var a=c("#menu").clone().attr("id","navigation-mobile");b.mobileNav=function(){var d=c(window).width();if(d<=979){if(c("#mobile-nav").length>0){a.insertAfter("#menu");c("#navigation-mobile #menu-nav").attr("id","menu-nav-mobile")}}else{c("#navigation-mobile").css("display","none");if(c("#mobile-nav").hasClass("open")){c("#mobile-nav").removeClass("open")}}};b.listenerMenu=function(){c("#mobile-nav").on("click",function(d){c(this).toggleClass("open");if(c("#mobile-nav").hasClass("open")){c("#navigation-mobile").slideDown(500,"easeOutExpo")}else{c("#navigation-mobile").slideUp(500,"easeOutExpo")}d.preventDefault()});c("#menu-nav-mobile a").on("click",function(){c("#mobile-nav").removeClass("open");c("#navigation-mobile").slideUp(350,"easeOutExpo")})};b.slider=function(){c.supersized({slideshow:1,autoplay:1,start_slide:1,stop_loop:0,random:0,slide_interval:7000,transition:1,transition_speed:800,new_window:1,pause_hover:0,keyboard_nav:1,performance:1,image_protect:1,min_width:0,min_height:0,vertical_center:1,horizontal_center:1,fit_always:0,fit_portrait:1,fit_landscape:0,slide_links:"blank",thumb_links:0,thumbnail_navigation:0,slides:[{image:"include/img/slider-images/image01.jpg",title:'<div class="slide-content"> </div>',thumb:"",url:""},{image:"include/img/slider-images/image04.jpg",title:'<div class="slide-content"> </div>',thumb:"",url:""},{image:"include/img/slider-images/image05.jpg",title:'<div class="slide-content"> </div>',thumb:"",url:""},{image:"include/img/slider-images/image02.jpg",title:'<div class="slide-content"> </div>',thumb:"",url:""},{image:"include/img/slider-images/image03.jpg",title:'<div class="slide-content"> </div>',thumb:"",url:""}],progress_bar:0,mouse_scrub:1})};b.nav=function(){c(".sticky-nav").waypoint("sticky")};b.filter=function(){if(c("#projects").length>0){var e=c("#projects");e.imagesLoaded(function(){e.isotope({animationEngine:"best-available",itemSelector:".item-thumbs",layoutMode:"fitRows"})});var d=c("#options .option-set"),f=d.find("a");f.click(function(){var k=c(this);if(k.hasClass("selected")){return false}var i=k.parents(".option-set");i.find(".selected").removeClass("selected");k.addClass("selected");var g={},h=i.attr("data-option-key"),j=k.attr("data-option-value");j=j==="false"?false:j;g[h]=j;if(h==="layoutMode"&&typeof changeLayoutMode==="function"){changeLayoutMode(k,g)}else{e.isotope(g)}return false})}};b.fancyBox=function(){if(c(".fancybox").length>0||c(".fancybox-media").length>0||c(".fancybox-various").length>0){c(".fancybox").fancybox({padding:0,beforeShow:function(){this.title=c(this.element).attr("title");this.title="<h4>"+this.title+"</h4><p>"+c(this.element).parent().find("img").attr("alt")+"</p>"},helpers:{title:{type:"inside"},}});c(".fancybox-media").fancybox({openEffect:"none",closeEffect:"none",helpers:{media:{}}})}};b.contactForm=function(){c("#contact-submit").on("click",function(){$contact_form=c("#contact-form");var d=$contact_form.serialize();c.ajax({type:"POST",url:"include/php/contact.php",data:d,dataType:"json",success:function(e){if(e.status){c("#contact-form input").val("");c("#contact-form textarea").val("")}c("#response").empty().html(e.html)}});return false})};b.tweetFeed=function(){var d=-64;c("#ticker").tweet({modpath:"include/js/twitter/",username:"Bluxart",page:1,avatar_size:0,count:10,template:"{text}{time}",filter:function(e){return !/^@\w+/.test(e.tweet_raw_text)},loading_text:"loading ..."}).bind("loaded",function(){var e=c(this).find(".tweet_list");var f=function(){setTimeout(function(){e.find("li:first").animate({marginTop:d+"px"},500,"linear",function(){c(this).detach().appendTo(e).removeAttr("style")});f()},5000)};f()})};b.menu=function(){c("#menu-nav, #menu-nav-mobile").onePageNav({currentClass:"current",changeHash:false,scrollSpeed:750,scrollOffset:30,scrollThreshold:0.5,easing:"easeOutExpo",filter:":not(.external)"})};b.goSection=function(){c("#nextsection").on("click",function(){$target=c(c(this).attr("href")).offset().top-30;c("body, html").animate({scrollTop:$target},750,"easeOutExpo");return false})};b.goUp=function(){c("#goUp").on("click",function(){$target=c(c(this).attr("href")).offset().top-30;c("body, html").animate({scrollTop:$target},750,"easeOutExpo");return false})};b.scrollToTop=function(){var e=c(window).width(),f=false;var d=c("#back-to-top");d.click(function(g){c("body,html").animate({scrollTop:"0"},750,"easeOutExpo");g.preventDefault()});c(window).scroll(function(){f=true});setInterval(function(){if(f){f=false;if(c(window).scrollTop()>1000){d.css("display","block")}else{d.css("display","none")}}},250)};b.utils=function(){c(".item-thumbs").bind("touchstart",function(){c(".active").removeClass("active");c(this).addClass("active")});c(".image-wrap").bind("touchstart",function(){c(".active").removeClass("active");c(this).addClass("active")});c("#social ul li").bind("touchstart",function(){c(".active").removeClass("active");c(this).addClass("active")})};b.accordion=function(){var d=c(".accordion-heading.accordionize");d.delegate(".accordion-toggle","click",function(e){if(c(this).hasClass("active")){c(this).removeClass("active");c(this).addClass("inactive")}else{d.find(".active").addClass("inactive");d.find(".active").removeClass("active");c(this).removeClass("inactive");c(this).addClass("active")}e.preventDefault()})};b.toggle=function(){var d=c(".accordion-heading.togglize");d.delegate(".accordion-toggle","click",function(e){if(c(this).hasClass("active")){c(this).removeClass("active");c(this).addClass("inactive")}else{c(this).removeClass("inactive");c(this).addClass("active")}e.preventDefault()})};b.toolTip=function(){c("a[data-toggle=tooltip]").tooltip()};b.slider();c(document).ready(function(){Modernizr.load([{test:Modernizr.placeholder,nope:"include/js/placeholder.js",complete:function(){if(!Modernizr.placeholder){Placeholders.init({live:true,hideOnFocus:false,className:"yourClass",textColor:"#999"})}}}]);c("body").jpreLoader({splashID:"#jSplash",showSplash:true,showPercentage:true,autoClose:true,splashFunction:function(){c("#circle").delay(250).animate({opacity:1},500,"linear")}});b.nav();b.mobileNav();b.listenerMenu();b.menu();b.goSection();b.goUp();b.filter();b.fancyBox();b.contactForm();b.tweetFeed();b.scrollToTop();b.utils();b.accordion();b.toggle();b.toolTip()});c(window).resize(function(){b.mobileNav()})});
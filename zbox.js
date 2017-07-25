(function() {
	/*
	 * Zbox - v1.0.1
	 * Copyright (c) 2015 Lenon Mauer
	 */

	window.Zbox = function(options) {

		"use strict";

		this.main_div	= null;
		this.overlay 	= null;
		this.modal 		= null;
		this.header 	= null;
		this.header_span = null;
		this.body 		= null;
		this.img 		= null;
		this.dimensions = {};
		this.maxSize 	= {};

		this.configs = {
				
			/* Image elements to apply zbox. */
			"querySelector" : ".zbox-img",

			/* overlay click close the modal. */
			"overlayClick"  : true,
			
			/* Time in ms to fade effect. */
			"fadeTime" 		: 100,
			
			"background" 	: true,
			
			/* HTML message to display when image is loading. */
			"loading" 		: "<span>Loading image ...</span>",

			/* Callback on errors (IMG 404). */
			"onerror"		: null
		};

		this.setConfigs(options);

		return {
		
			show 		: show(this),
			hide 		: hide(this),
			setConfigs 	: setConfigs(this)
		};
	};

	var show = function(zbox) {

		return function(url){

			if(typeof url == "object") {

				url.preventDefault();
				url = this;
			}

			zbox.show(url);
		};
	};

	function updateMaxSize(zbox) {
		return function(){
			zbox.updateMaxSize();
		};
	}

	var hide = function(zbox) {
		return function(){
			zbox.hide();
		};
	};

	var setConfigs = function(zbox){

		return function(configs){

			zbox.setConfigs(configs);
		};
	};

	/* Changes the configurations for init function. */
	Zbox.prototype.setConfigs = function (object) {
		this.configs = this.extend(object, this.configs);
		this.init();
	};
		
	/* Initializes the zbox. */
	Zbox.prototype.init = function() {
		this.createHTML();
		this.addCSS();
		this.addListeners();
		this.updateMaxSize();
	};
		
	/* Creates the HTML. */
	Zbox.prototype.createHTML = function() {

		if(document.querySelector("#zbox") !== null){
			document.querySelector("#zbox").parentNode.removeChild(document.querySelector("#zbox"));
		}

		this.main_div 	= document.createElement("div");
		this.overlay 	= document.createElement("div");
		this.modal 		= document.createElement("div");
		this.header 	= document.createElement("div");
		this.header_span = document.createElement("span");
		this.body 		= document.createElement("div");

		this.main_div.id 			= "zbox";
		this.overlay.className 		= "zbox-overlay";
		this.modal.className 		= "zbox-modal";
		this.header.className 		= "zbox-header";
		this.header_span.innerHTML 	= "&times;";
		this.body.className 		= "zbox-body";

		document.body.appendChild(this.main_div);
		
		this.main_div.appendChild(this.overlay);
		this.main_div.appendChild(this.modal);
		
		this.modal.appendChild(this.header);
		this.modal.appendChild(this.body);

		var prev = document.createElement('a');
		prev.className = "prev";
        prev.innerHTML = '&#10094;';
		this.modal.appendChild(prev);

		var next = document.createElement('a');
		next.className = "next";
        next.innerHTML = '&#10095;';
		this.modal.appendChild(next);
	};

	/* Apply the CSS effects. */
	Zbox.prototype.addCSS = function() {

		this.main_div.style.opacity 	= "0";
		this.main_div.style.display		= "none";
		
		this.overlay.style.display		= "inherit";
		this.overlay.style.zIndex 		= "1040";
		this.overlay.style.position		= "fixed";
		this.overlay.style.background	= "rgba(255, 255, 255, 0.92)";
		this.overlay.style.left			= "0";
		this.overlay.style.top			= "0";
		this.overlay.style.padding		= "0";
		this.overlay.style.margin		= "0";
		this.overlay.style.height		= "100%";
		this.overlay.style.width		= "100%";
		
		this.modal.style.position 			= "absolute";
		this.modal.style.zIndex 			= "1040";
		this.modal.style.padding 			= "0";
		this.modal.style.margin 			= "0";
		this.modal.style.color 				= "#666";
		this.modal.style.left 				= "50%";
		this.modal.style.transform 			= "translateX(-50%)";
		this.modal.style.webkitUserSelect   = "none";
		this.modal.style.userSelect    		= "none";
		this.modal.style.mozUserSelect    	= "none";
		
		this.header.style.textAlign 	= "right";
		this.header.style.fontSize 		= "44px";
		this.header.style.lineHeight 	= "0";
		this.header.style.position 		= "absolute";
		this.header.style.width 		= "100%";

		this.header_span.style.cursor 	= "pointer";
		this.header_span.style.margin 	= "0 -11px 0 -11px";
		
		this.body.style.fontSize 		= "1.2em";
		this.body.style.padding 		= "0.5em";
		this.body.style.borderRadius 	= "2px";
		
		if(this.configs.background) {
			this.body.style.boxShadow 	= "0.1em 0.5em 0.7em rgba(0, 0, 0, 0.25)";
			this.body.style.background 	= "#fff";
		}
	};

	/* Adds listeners. */
	Zbox.prototype.addListeners = function() {

		var t_imgs = document.querySelectorAll(this.configs.querySelector);
		
		if(t_imgs.length)
			for(var i=0; i<t_imgs.length;i++)
				t_imgs[i].addEventListener("click", show(this), false);

		if(this.configs.overlayClick)
			this.overlay.addEventListener("click", hide(this), false);
			
		window.onresize = updateMaxSize(this);
	};

	/* Updates the maximum and minimum sizes for the image. */
	Zbox.prototype.updateMaxSize = function () {
		this.maxSize.height = window.innerHeight * 0.8;
		this.maxSize.width  = window.innerWidth * 0.8;
	};

	/* Shows a image element into zbox. */
	Zbox.prototype.show = function(t_img) {

		var t_src	= t_img.src || t_img.href || t_img;
		var zbox  	= this;
		var img 	= new Image();
		var top 	= window.scrollY || document.documentElement.scrollTop;

		if(!t_src.length) {

			if(typeof this.configs.onerror == "function"){
				this.configs.onerror();
			}

			return false;
		}

		if(this.main_div.style.opacity != "0")
			return false;
		
		zbox.modal.style.top = (30+top)+"px";

		zbox.body.innerHTML = zbox.configs.loading;
		
		img.addEventListener("load", function() {

			if(img !== null) {
			
				zbox.body.innerHTML = "";
			
				zbox.dimensions.height = img.height;
				zbox.dimensions.width  = img.width;
				zbox.changeDimensions(img);
				zbox.body.appendChild(img);
			}
		});

		img.addEventListener("error", function() {

			zbox.fade(zbox.main_div, "out", 1);
			
			if(typeof zbox.configs.onerror == "function")
				zbox.configs.onerror();
		});

		zbox.fade(zbox.main_div, "in", zbox.configs.fadeTime);

		img.src = t_src;
	};

	/* Hides zbox. */
	Zbox.prototype.hide = function() {
		this.fade(this.main_div, "out", this.configs.fadeTime);
	};

	/* Zbox fade effect. */
	Zbox.prototype.fade = function(element, type, time, callback) {

		var zbox  = this;
		callback  = callback || function(){};

		if(zbox.fade.animationFrame){
			cancelAnimationFrame(zbox.fade.animationFrame);
		}

		var start = null;

		function animationTick(timestamp){

			if (!start){
				start = timestamp;
				if(type == "in"){
					element.style.display = "";
				}
			} 

			var progress = timestamp - start;
			var opacity = progress / (time);

			if(type == "out"){
				opacity = 1 - opacity;
			}

			element.style.opacity = opacity;

			if( isFinished() ){
				roundFinalOpacity();
				callback.call();
			} else {
				requestAnimationFrame(animationTick);
			}

			function roundFinalOpacity(){
				if( type == "in" ){
					element.style.opacity = "1";
				} else {
					element.style.display = "none";
					element.style.opacity = "0";
				}
			}

			function isFinished(){
				return type == "in" ? opacity >= 1 : opacity <= 0;
			}
		}

		zbox.fade.animationFrame = requestAnimationFrame(animationTick);
	};

	/* Changes the size of image. */
	Zbox.prototype.changeDimensions = function(img) {

		var value;
		var orientation = this.dimensions.width >= this.dimensions.height ? "width" : "height";

		if(this.dimensions.width > this.maxSize.width && this.dimensions.height > this.maxSize.height) {

			var l = orientation == "width" ? "height" : "width";
			var s = this.maxSize[orientation] / (this.dimensions[orientation] / this.dimensions[l]);

			value = s > this.maxSize[l] ?this. maxSize[orientation] * this.maxSize[l] / s : this.maxSize[orientation];

		} else if(this.dimensions.width > this.maxSize.width) {
		
			orientation = "width";
			value 		= this.maxSize[orientation];

		} else if(this.dimensions.height > this.maxSize.height) {

			orientation = "height";
			value 		= this.maxSize[orientation];
		
		} else {

			value = this.dimensions[orientation];
		}

		img.style[orientation] = value+"px";
	};

	/* Extends a object into a target object. */
	Zbox.prototype.extend = function (object, target) {

		if(typeof object != "object")
			object = {};

		for(var i in object) {

			if(typeof object[i] == "object") {
			
				if(target.hasOwnProperty(i)) {

					if(typeof object[i] == typeof target[i]) {
					
						target[i] = this.extend(object[i], target[i]);
					}
				}

			} else {

				if(target.hasOwnProperty(i))
					target[i] = object[i];
			}
		}
			
		return target;
	};

}(window));
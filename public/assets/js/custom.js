/*--------------------- Copyright (c) 2023 -----------------------
[Master Javascript]
Project: PixaSocial HTML
-------------------------------------------------------------------*/
(function ($) {
	"use strict";
	var PixaSocial = {
		initialised: false,
		version: 1.0,
		mobile: false,
		init: function () {
			if (!this.initialised) {
				this.initialised = true;
			}
			else {
				return;
			}
			/*---------------------- PixaSocial Functions Calling ----------------------*/

			this.BottomTop();											
			this.TextCopy();											
		},

		/*---------------------- PixaSocial Functions Calling ----------------------*/

		// Bottom To Top
		BottomTop: function () {
			if ($('#button').length > 0) {
				var btn = $('#button');
				$(window).scroll(function () {
					if ($(window).scrollTop() > 300) {
						btn.addClass('show');
					} else {
						btn.removeClass('show');
					}
				});
				btn.on('click', function (e) {
					e.preventDefault();
					$('html, body').animate({ scrollTop: 0 }, '300');
				});
			}
		},
		// Bottom To Top
		
		// Test Copy
		TextCopy: function(){
			// Admin Email Copy
		$("#username-img").click(function () {			
			var textToCopy = $("#username")[0];
			var range = document.createRange();
			range.selectNode(textToCopy);
			window.getSelection().addRange(range);	
			try {				
				document.execCommand("copy");
				alert("Copied");
			} catch (err) {
				console.error("Unable to copy text: " + err);
			}				
			window.getSelection().removeAllRanges();
		});
	
		// Admin Password Copy
		$("#admin-passwrd-img").click(function () {			
			var textToCopy = $("#admin-password")[0];
			var range = document.createRange();
			range.selectNode(textToCopy);
			window.getSelection().addRange(range);	
			try {				
				document.execCommand("copy");
				alert("Copied");
			} catch (err) {
				console.error("Unable to copy text: " + err);
			}				
			window.getSelection().removeAllRanges();
		});
	
		// User Email Copy
		$("#usereamil-img").click(function () {			
			var textToCopy = $("#user-email")[0];
			var range = document.createRange();
			range.selectNode(textToCopy);
			window.getSelection().addRange(range);	
			try {				
				document.execCommand("copy");
				alert("Copied");
			} catch (err) {
				console.error("Unable to copy text: " + err);
			}				
			window.getSelection().removeAllRanges();
		});
	
		// User Password Copy
		$("#user-passwrd-img").click(function () {			
			var textToCopy = $("#user-password")[0];
			var range = document.createRange();
			range.selectNode(textToCopy);
			window.getSelection().addRange(range);	
			try {				
				document.execCommand("copy");
				alert("Copied");
			} catch (err) {
				console.error("Unable to copy text: " + err);
			}				
			window.getSelection().removeAllRanges();
		});

		// Demo User Email Copy
		$("#demo-usereamil-img").click(function () {			
			var textToCopy = $("#demo-user-email")[0];
			var range = document.createRange();
			range.selectNode(textToCopy);
			window.getSelection().addRange(range);	
			try {				
				document.execCommand("copy");
				alert("Copied");
			} catch (err) {
				console.error("Unable to copy text: " + err);
			}				
			window.getSelection().removeAllRanges();
		});
	
		// User Password Copy
		$("#demo-user-passwrd-img").click(function () {			
			var textToCopy = $("#demo-user-password")[0];
			var range = document.createRange();
			range.selectNode(textToCopy);
			window.getSelection().addRange(range);	
			try {				
				document.execCommand("copy");
				alert("Copied");
			} catch (err) {
				console.error("Unable to copy text: " + err);
			}				
			window.getSelection().removeAllRanges();
		});
		}
		// Test Copy
	};

	PixaSocial.init();
}(jQuery));	
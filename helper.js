var HELPER =
(function() {
	this.hide = function(element) {
		element.style.display = "none";
		
		return;
	}

	this.show = function(element) {
		element.style.display = "inline-block";
		
		return;
	}

	this.addClickListener = function(element, callback) {
		if(element) {
			element.addEventListener('click', callback);
		}
		
		return;
	}
	
	return this;
})();

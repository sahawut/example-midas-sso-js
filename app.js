
var APP =
(function() {
	var viewFrame = document.getElementById("view-frame").contentDocument,
		viewWindow = document.getElementById("view-frame").contentWindow,
		thisApp = this,
		idToken = localStorage.id_token;
	
	this.lock = new Auth0Lock(AUTH0_VARIABLES.clientID, AUTH0_VARIABLES.domain);
	
	this.goHome = function() {
		viewWindow.location.href = ROUTES.profile;
		
		return;
	}
	
	this.logout = function() {
		localStorage.removeItem('id_token');
		localStorage.removeItem('profile');
		window.location.href = CONTEXT;
		
		return;
	}
	
	this.hasRole = function(profile, role) {
		return (profile && profile.app_metadata && profile.app_metadata.roles &&
			(profile.app_metadata.roles.indexOf(role) > -1));
	}
	
	function getProfile(idToken) {
		thisApp.lock.getProfile(idToken, function (err, profile) {
			var adminBtn,
				userBtn;
			
			if(err) {
				removeExpiredIfAny('id_token');
				removeExpiredIfAny('profile');
				
				return alert('There was an error getting the profile: ' + err.message);
			}
			
			localStorage.setItem('id_token', idToken);
			localStorage.setItem('profile', JSON.stringify(profile));
			
			HELPER.show(document.getElementById('btn-profile'));
			HELPER.show(document.getElementById('btn-logout'));
			
			if(thisApp.hasRole(profile, 'ISG_ADMIN')) {
				adminBtn = document.getElementById('btn-admin');
				adminBtn.href = ROUTES.admin;
				HELPER.show(adminBtn);
			}
			
			if(thisApp.hasRole(profile, 'ISG_USER')) {
				userBtn = document.getElementById('btn-user');
				userBtn.href = ROUTES.user;
				HELPER.show(document.getElementById('btn-user'));
			}
			
			document.getElementById('profile-nickname').innerHTML = ", " + profile.nickname + "!";
			viewWindow.location.href = ROUTES.profile;
			
			return;
		});
	}
	
	function onAuthenticated(authResult) {
		var removeExpiredIfAny;
		
		getProfile(authResult.idToken);
		removeExpiredIfAny = localStorage.removeItem;
		
		return;
	}
	
	HELPER.addClickListener(document.getElementById('btn-logout'), this.logout);
	HELPER.addClickListener(document.getElementById('btn-profile'), this.goHome);
	this.lock.on("authenticated", onAuthenticated);
	
	if(idToken) {
		getProfile(idToken);
	}
	
	return this;
})();

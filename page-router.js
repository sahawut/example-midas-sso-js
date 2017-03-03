if(window.parent !== window) {
	(function route(APP, ROUTES, HELPER) {
			var route = window.location.pathname,
				parentDocument = window.parent.document,
				profile;
			
			if(localStorage.getItem('id_token')) {
				profile = JSON.parse(localStorage.getItem('profile'));
				
				switch(route) {
					case "":
					case "/":
					case ROUTES.login:
						window.location.href = ROUTES.profile;
					break;
					
					case ROUTES.user:
						if(!APP.hasRole(profile, 'ISG_USER')) {
							alert("Unauthorized");
							window.location.href = ROUTES.context;
						}
						else {
							console.log("This user is authorized to access this page.");
						}
					break;
					
					case ROUTES.admin:
						if(!APP.hasRole(profile, 'ISG_ADMIN')) {
							alert("Unauthorized");
							window.location.href = ROUTES.context;
						}
						else {
							console.log("This user is authorized to access this page.");
						}
					break;
					
					case ROUTES.profile:
					default:
					break;
				}
			}
			else { // user is not logged in.
				// Call logout just to be sure our local session is cleaned up.
				if(route !== ROUTES.login) {
					APP.logout();
				}
				else {
					HELPER.addClickListener(document.getElementById('btn-login'), function() {
						APP.lock.show();
						
						return;
					});
				}
			}
			
			return;
	})(window.parent.APP, window.parent.ROUTES, window.parent.HELPER);
}
else {
	window.location.href = window.location.origin;
}

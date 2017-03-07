/*
profile page-specific script
*/

(function displayProfile(HELPER) {
	var profile = JSON.parse(localStorage.profile),
		htmlNode,
		i;
	
	document.getElementById('profile-name').innerHTML = profile.name;
	document.getElementById('profile-picture').src = profile.picture;
	
	for(i = 0; i < profile.roles.length; i++) {
		htmlNode = document.createElement("li");
		htmlNode.innerHTML = profile.roles[i];
		document.getElementById('profile-roles').appendChild(htmlNode);
	}
	
	HELPER.show(document.getElementById("profile"));
	
	return;
})(window.parent.HELPER);

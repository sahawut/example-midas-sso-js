window.addEventListener('load', function() {
  var lock = new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN);

  addClickListener(document.getElementById('btn-login'), function(){lock.show();});
  addClickListener(document.getElementById('btn-logout'), logout);
  lock.on("authenticated", onAuthenticated);
  route();

  function onAuthenticated(authResult) {
    lock.getProfile(authResult.idToken, function (err, profile) {
      if (err) {
        removeExpiredIfAny('id_token');
        removeExpiredIfAny('profile');
        return alert('There was an error getting the profile: ' + err.message);
      }
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('profile', JSON.stringify(profile));
      route();
    });
    var removeExpiredIfAny = localStorage.removeItem;
  }

  function route() {
    var USER_ROUTE = "/user.html";
    var ADMIN_ROUTE = "/admin.html";

    var locationPath = window.location.pathname;
    if (localStorage.getItem('id_token')) {
      var profile = JSON.parse(localStorage.getItem('profile'));
      var route = locationPath.replace(CONTEXT, '');
      switch(route) {
		case "":
        case "/":
          hide(document.getElementById('btn-login'));
          show(document.getElementById('btn-logout'));
          var baseUrl = window.location.href.split(CONTEXT)[0] + CONTEXT;
          if (hasRole(profile, 'ISG_ADMIN')){
            var adminBtn = document.getElementById('btn-go-admin');
            adminBtn.href = baseUrl + ADMIN_ROUTE;
            show(adminBtn);
          }
          if (hasRole(profile, 'ISG_USER')){
              var uerBtn = document.getElementById('btn-go-user');
              uerBtn.href = baseUrl + USER_ROUTE;
              show(document.getElementById('btn-go-user'));
          }
          break;
        case USER_ROUTE:
          if (true != hasRole(profile, 'ISG_USER')) {
            window.location.href = CONTEXT;
          } else {
            show(document.querySelector('.container'));
            show(document.getElementById('btn-logout'));
            document.getElementById('nickname').textContent = profile.nickname;
          }
          break;
        case ADMIN_ROUTE:
          if (true != hasRole(profile, 'ISG_ADMIN')) {
            window.location.href = CONTEXT;
          } else {
            show(document.querySelector('.container'));
            show(document.getElementById('btn-logout'));
            document.getElementById('nickname').textContent = profile.nickname;
          }
          break;
      }
    } else { // user is not logged in.
      // Call logout just to be sure our local session is cleaned up.
      if (CONTEXT + '/' != locationPath) {
        logout();
      }
    }
  }

  function logout() {
    localStorage.removeItem('id_token');
    localStorage.removeItem('profile');
    window.location.href = CONTEXT;
  }

  function hide(element) {
    element.style.display = "none";
  }

  function show(element) {
    element.style.display = "inline-block";
  }

  function addClickListener(button, callback) {
    if (button) {
      button.addEventListener('click', callback);
    }
  }

  function hasRole(profile, role) {
    return !!(profile &&
    profile.app_metadata &&
    profile.app_metadata.roles &&
    profile.app_metadata.roles.indexOf(role) > -1);
  }
});

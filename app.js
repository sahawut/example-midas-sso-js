window.addEventListener('load', function() {
    var auth0 = newAuth0();

    if (doesUserLogInLocally()) {
        showThePage();
    } else {
        var isHandlingCallbackFromAuth0 = handleCallbackFromAuth0(toAuthResultFromLocationHash());
        if (! isHandlingCallbackFromAuth0)
            auth0.getSSOData(onSsoDataHandlingAuthentication);
    }

    setInterval(logoutIfLoggedOutGloballyByAnotherApp, 5000);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Helper function section
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function handleCallbackFromAuth0(authResult) {
        if (authResult.idToken){
            new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN).getProfile(authResult.idToken, onUserProfile);
            return true;
        }
        return false;

        function onUserProfile(error, profile) {
            if (! error) {
                localStorage.setItem(KEY_LOCAL_STORAGE_USER_TOKEN, authResult.idToken);
                localStorage.setItem(KEY_LOCAL_STORAGE_PROFILE, JSON.stringify(profile));
                showThePage(authResult.state);
            }
        }
    }

    function onSsoDataHandlingAuthentication(err, data) {
        var hasSsoSession = !err && data && data.sso;
        if (hasSsoSession)
            redirectToAuth0ForSso();
        else
            redirectTo(toMidasAccountsUrl('/sso'));

        function redirectToAuth0ForSso() {
            auth0.signin({
                connection: data.lastUsedConnection.name,
                state: window.location.href,
                scope: 'openid name picture roles'
            });
        }
    }

    function logout() {
        localStorage.removeItem(KEY_LOCAL_STORAGE_USER_TOKEN);
        localStorage.removeItem(KEY_LOCAL_STORAGE_PROFILE);
        redirectTo(toMidasAccountsUrl('/signoff', 'Logged off successfully'));
    }

    function logoutIfLoggedOutGloballyByAnotherApp() {
        if (! doesUserLogInLocally()) return;
        auth0.getSSOData(onSsoDataHandlingLogoutIfNoSsoSession);

        function onSsoDataHandlingLogoutIfNoSsoSession(err, data) {
            var hasSsoSession = !err && data && data.sso;
            if (! hasSsoSession)
                logout();
        }
    }

    function newAuth0() {
        return new Auth0({
            domain: AUTH0_DOMAIN,
            clientID: AUTH0_CLIENT_ID,
            callbackURL: toAbsoluteUrl('/'),
            callbackOnLocationHash: true
        });
    }

    function toAbsoluteUrl(path) {
        path = path || "";
        return window.location.href.split(CONTEXT)[0] + CONTEXT + path;
    }

    function doesUserLogInLocally() {
        return !! (localStorage.getItem(KEY_LOCAL_STORAGE_USER_TOKEN));
    }

    function showThePage(targetUrl) {
        if (targetUrl)
            redirectTo(targetUrl);

        var locationPath = window.location.pathname;
        document.body.style.display = 'inline';
        routeByUserRole(locationPath.replace(CONTEXT, ''));

        function routeByUserRole(route) {
            var profile = JSON.parse(localStorage.getItem(KEY_LOCAL_STORAGE_PROFILE));
            switch (route) {
                case "":
                case "/":
                    showLandingPageComponents();
                    break;
                case ROUTE_USER:
                    secureRoute(ROLE_ISG_USER);
                    break;
                case ROUTE_ADMIN:
                    secureRoute(ROLE_ISG_ADMIN);
                    break;
            }

            function showLandingPageComponents() {
                var baseUrl = toAbsoluteUrl();
                hide(document.getElementById('btn-login'));
                showCommonComponentsInAllPages();
                showProfile(profile);
                if (hasRole(profile, ROLE_ISG_ADMIN)) {
                    rewireAndShowButtonById('btn-go-admin', baseUrl + ROUTE_ADMIN);
                }
                if (hasRole(profile, ROLE_ISG_USER)) {
                    rewireAndShowButtonById('btn-go-user', baseUrl + ROUTE_USER);
                }
            }

            function secureRoute(requiredRole) {
                if (!hasRole(profile, requiredRole)) {
                    if (profile)
                        redirectTo('unauthorized.html');
                    else
                        redirectTo(CONTEXT);

                } else{
                    showCommonComponentsInAllPages();
                }
            }

            function showCommonComponentsInAllPages() {
                var buttonLogout = document.getElementById('btn-logout');
                show(buttonLogout);
                addClickListener(buttonLogout, logout);
                show(document.querySelector('.container'));
                document.getElementById('nickname').textContent = profile.nickname;
            }

            function rewireAndShowButtonById(id, route) {
                var button = document.getElementById(id);
                button.href = route;
                show(button);
            }
        }
    }

    function showProfile(profile) {
        var htmlNode,
            i;

        document.getElementById('profile-name').innerHTML = profile.name;
        document.getElementById('profile-picture').src = profile.picture;

        for(i = 0; i < profile.roles.length; i++) {
            htmlNode = document.createElement("li");
            htmlNode.innerHTML = profile.roles[i];
            document.getElementById('profile-roles').appendChild(htmlNode);
        }
        show(document.getElementById("profile"));
    }

    function toAuthResultFromLocationHash() {
        return {
            idToken: getParameterByName('id_token'),
            state: getParameterByName('state')
        };
    }

    function toMidasAccountsUrl(endpoint, message, title) {
        title = title || "JS Example";
        message = message || "Please login to use the services";
        return MIDAS_ACCOUNTS_URL + endpoint + '?returnToUrl='
            + encodeURIComponent(window.location) + '&title=' + title + '&message=' + message;
    }

    function hasRole(profile, role) {
        return !!(profile &&
        profile.app_metadata &&
        profile.app_metadata.roles &&
        profile.app_metadata.roles.indexOf(role) > -1);
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

    function redirectTo(href) {
        window.location.href = href;
    }

    function getParameterByName(name, url) {
        name = name.replace(/[\[\]]/g, "\\$&");
        url = url || window.location.href;
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
});

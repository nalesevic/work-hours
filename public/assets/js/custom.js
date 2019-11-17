$(document).ready(function() {

  $("main#spapp > section").height($(document).height() - 60);

  var app = $.spapp({pageNotFound : 'error_404'}); // initialize

  // define routes
  app.route({view: 'register', load: 'register.html' });
  app.route({view: 'login', load: 'login.html' });
  app.route({view: 'dashboard', load: 'dashboard.html' });
  app.route({
    view: 'logout',
    onCreate: function() {
      window.localStorage.removeItem("token");
      localStorage.removeItem("prevSkip");
      window.location.href = "index.html";
    },
  });
  

  // run app
  app.run();

});
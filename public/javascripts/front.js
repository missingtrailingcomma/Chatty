$('#loginButton').on('click', function() {
  $('#frontForm').attr('action', '/login');
  $('#frontForm').submit();
});

$('#signUpButton').on('click', function () {
  $('#frontForm').attr('action', '/signup');
  $('#frontForm').submit();
});

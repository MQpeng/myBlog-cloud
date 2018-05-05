'use strict'

Parse.Cloud.beforeSave('Staff', function(request, response) {
  let staffObject = request.object;
  userSignUp(staffObject)

  response.success();
});

function userSignUp(staffObject){
  let phoneNumber = staffObject.get('staffPhone');
  var user = new Parse.User();
  user.set("username", phoneNumber);
  user.set("password", "123456");
  user.set("phone", phoneNumber);
  user.signUp(null, {
    success: function(user) {
      Parse.User.logOut()
    },
    error: function(user, error) {
      console.log("Error: " + error.code + " " + error.message);
    }
  });
}

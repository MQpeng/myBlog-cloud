'use strict'

Parse.Cloud.afterSave('Staff', function(request, response) {
  let staffObject = request.object;
  userSignUp(staffObject)

  response.success();
});

function userSignUp(staffObject){
  let phoneNumber = staffObject.get('staffPhone');
  let objectId = staffObject.id;
  var user = new Parse.User();
  user.set("username", phoneNumber);
  user.set("password", "123456");
  user.set("phone", phoneNumber);
  user.set('staff',{
    "__type": "Pointer",
    "className": "Staff",
    "objectId": objectId
  })
  user.signUp(null, {
    success: function(user) {
      Parse.User.logOut()
    },
    error: function(user, error) {
      console.log("Error: " + error.code + " " + error.message);
    }
  });
}

isSecure = function() {
    return Meteor.settings && Meteor.settings.public && Meteor.settings.public.isSecure
}

Accounts.config({restrictCreationByEmailDomain: function(email) {
    emails = isSecure() && Meteor.settings.authorizedEmails
    if(emails) {  //Check if there are any specified authorizedEmails
          for(var i = 0; i < emails.length; i++) {
                  if(email === emails[i])
          return true
      }
              return false
    } else {
          return true
    }
}})

// Helper function for checking that user is authorized
var checkUserAuth = function() {
  if(! Meteor.userId() && Meteor.settings.authorizedEmails) {
    throw new Meteor.Error("not-authorized")
  }
}



if (Meteor.isClient) {
  // Check if logged in
  Template.registerHelper("loggedIn", function() {
    if(isSecure()) {
      return Meteor.userId()
    } else {
      return true
    }
  })

  /* BEGIN DEFAULT */
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
  /* END DEFAULT*/
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });
}

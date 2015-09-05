
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

  Template.navDropdown.helpers({
    sortToTop: function (thisSection) {
      console.log(thisSection);
      sections = ["Intro",
                  "Readings",
                  "Writings",
                  "Toys"];
      sections.unshift((sections.splice(sections.indexOf(thisSection),1))[0]);
      return sections;
    },
    link: function(name) {
      if(name==="Intro") {
        name = "";
      } else {
        name = name.toLowerCase();
      }
      return "/" + name;
    },
    state: function() {
      Session.setDefault("navDropdownState", "collapsed");
      return Session.get("navDropdownState");
    }
  });
  Template.navDropdown.events({
    "click .navDropdownContainer.collapsed": function(event) {
      event.stopPropagation();
      event.preventDefault();
      Session.set("navDropdownState", "expanded");
    },
    "click .navDropdownContainer.expanded .item": function(event) {
      Session.set("navDropdownState", "collapsed");
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });
}

Meteor.startup(function() {
  Router.configure({
    layoutTemplate: 'LoginLayout'
  });
});

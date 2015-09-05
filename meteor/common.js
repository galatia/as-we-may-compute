Readings = new Mongo.Collection("readings");
Intro = new Mongo.Collection("intro");

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
var isUserAuthorized = function(that) {
  return (!isSecure()) || that.userId;
}

if (Meteor.isClient) {
  Meteor.subscribe('readings');
  Meteor.subscribe('intro');

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
    "click .navDropdownContainer.expanded": function(event) {
      event.stopPropagation();
    },
    "click .navDropdownContainer.expanded a": function(event) {
      event.stopPropagation();
      event.preventDefault();
      Router.go(event.currentTarget.getAttribute('href'));
      Session.set("navDropdownState", "collapsed");
    }
  });
  Template.body.events({
    "click body": function(event) {
      Session.set("navDropdownState", "collapsed");
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Readings.remove({});
    var bib = JSON.parse(Assets.getText("bib.json"));
    bib.forEach(function(item) {
      Readings.insert(item);     
    });
    Meteor.publish("readings", function() {
      if(isUserAuthorized(this)) {
        return Readings.find();
      }
    });
    var introFragment = Assets.getText("intro.html");
    var bioFragment = Assets.getText("bio.html");
    Meteor.publish("intro", function() {
      if(isUserAuthorized(this)) {
        this.added("intro", "intro", {fragment: introFragment});
        this.added("intro", "bio", {fragment: bioFragment});
        this.ready();
      }
    });
  });
}

Meteor.startup(function() {
  Router.configure({
    layoutTemplate: 'LoginLayout'
  });
});

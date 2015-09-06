Readings = new Mongo.Collection("readings");
Intro = new Mongo.Collection("intro");
Authors = new Mongo.Collection("authors");

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

  var isIntroPage = function(name) {
    return name.toLowerCase()==="as we may compute";
  };
  Template.navDropdown.helpers({
    sortToTop: function (thisSection) {
      console.log(thisSection);
      sections = ["AS WE MAY COMPUTE",
                  "READINGS",
                  "WRITINGS",
                  "PLAY-THINGS"
                 ];
      sections.unshift((sections.splice(sections.indexOf(thisSection.toUpperCase()),1))[0]);
      return sections;
    },
    isIntroPage: function(name) {
      return isIntroPage(name);
    },
    link: function(name) {
      if(isIntroPage(name)) {
        name = "";
      } else {
        name = name.toLowerCase();
      }
      return "/" + name;
    },
    state: function() {
      Session.setDefault("navDropdownState", "collapsed");
      return Session.get("navDropdownState");
    },
    icon: function() {
      if(Session.equals("navDropdownState", "collapsed")) {
        return 'chevron-thin-down';
      } else return 'chevron-thin-up';
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
      event.preventDefault();
      var target = event.currentTarget.getAttribute('href')
      if (target==='/' || document.location.pathname.indexOf(target) !== 0) {
        Router.go(target);
      }
      Session.set("navDropdownState", "collapsed");
    }
  });
  Template.body.events({
    "click body": function(event) {
      Session.set("navDropdownState", "collapsed");
    },
    "click .laptop": function(event) {
      Router.go("/");
    }
  });
  Template.LoginLayout.helpers({
    containerClass: function() {
       return Router.current().route.getName();
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Readings.remove({});
    Authors.remove({});
    var bib = JSON.parse(Assets.getText("bib.json"));
    bib.forEach(function(item) {
      item.urltitle=item.title.replace(/ /g,'-').replace(/[^a-zA-Z0-9-_.+!*'()]/g,'');
      Readings.insert(item);
      item.author.forEach(function(author) {
        Authors.upsert(author, {$set: author});
      });
    });
    Meteor.publish("readings", function() {
      if(isUserAuthorized(this)) {
        return [Readings.find(), Authors.find()];
      }
    });
    var removeHeader = function(str) { return str.replace(/<h1.*<\/h1>/,""); }
    var introFragment = removeHeader(Assets.getText("intro.html"));
    var bioFragment = removeHeader(Assets.getText("bio.html"));
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

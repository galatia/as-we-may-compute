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
    sections: function() {
      return ["AS WE MAY COMPUTE",
              "READINGS",
              "WRITINGS",
              "PLAY-THINGS"
             ];
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
    }
  });
  Template.navDropdown.events({
    'click a': function(event) {
      event.preventDefault();
      var target = event.currentTarget.getAttribute('href')
      if (target==='/' || document.location.pathname.indexOf(target) !== 0) {
        Router.go(target);
      }
    }
  });
  Template.dropdown.created = function() {
    this.state = new ReactiveVar("collapsed");
    window.dropdownStates = window.dropdownStates || []
    window.dropdownStates.push(this.state);
    var stateVar = Template.currentData().stateVar;
    if(stateVar) {
      Session.setDefault(stateVar, Template.currentData().default);
    }
  }
  Template.dropdown.helpers({
    sortToTop: function (list) {
      var stateVar = Template.currentData().stateVar;
      if (stateVar) {
        var current = Session.get(stateVar);
        if (current) {
          list = list.slice();
          list.unshift((list.splice(list.map(function(x) {return (x.key || x).toLowerCase();}).indexOf(current.toLowerCase()),1))[0]);
        }
      }
      return list;
    },
    state: function() {
      return Template.instance().state.get();
    },
    icon: function() {
      if(Template.instance().state.get() === "collapsed") {
        return 'chevron-thin-down';
      } else return 'chevron-thin-up';
    }
  });
  Template.dropdown.events({
    "click .dropdownContainer.collapsed": function(event) {
      event.stopPropagation();
      event.preventDefault();
      Template.instance().state.set("expanded");
    },
    "click .dropdownContainer.expanded": function(event) {
      event.stopPropagation();
      Template.instance().state.set("collapsed");
    },
    "click .dropdownContainer.expanded .item": function(event) {
      var stateVar = Template.currentData().stateVar;
      var key = $(event.target).attr("data-key");
      if(stateVar) {
        Session.set(stateVar, key);
      }
    }
  });
  Template.body.events({
    "click body": function(event) {
      dropdownStates.forEach(function(state) {
        state.set("collapsed");
      });
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

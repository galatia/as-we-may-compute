Router.route('/', function() {
  this.render('intro');
}, {name: 'intro'});

if (Meteor.isClient) {
  Template.intro.created = function() {
    this.state = new ReactiveDict();
    this.state.set('expanded', false);
  };
  Template.intro.helpers({
    fragment: function(id) {
      return Intro.findOne(id).fragment;
    },
    settings: function() { return Meteor.settings.public; },
    expanded: function() { return Template.instance().state.get('expanded'); }
  });
  Template.intro.events({
    'click .byline': function(event, template) {
      template.state.set('expanded', !template.state.get('expanded'));
    }
  });
}

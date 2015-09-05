Router.route('/readings', function() {
  this.render('readings');
});

if (Meteor.isClient) {
  Template.readingList.helpers({
    filteredReadings: function() {
      return Readings.find({}, {sort: ["author.0.name", "title"]});
    }
  });
  Template.reading.created = function() {
    this.state = new ReactiveDict();
    this.state.set('expanded', false);
  };
  Template.reading.helpers({
    mapTitle: function(title) {
      return title.replace(/\$[^$]+\$/,function(tex) {
        return katex.renderToString(tex.slice(1,-1));
      });
    },
    mapAuthors: function(authors) {
      var len = authors.length;
      if(len==1) { return authors; }
      return authors.map(function(val, ind) {
        if(ind == len-1) {
          val.and = true;
        }
        if(ind < len-1 && len > 2) {
          val.sep = true;
        }
        return val;
      });
    },
    expanded: function() {
      return Template.instance().state.get('expanded');
    }
  });
  Template.reading.events({
    'click': function(event, template) {
      template.state.set('expanded', !template.state.get('expanded'));
      console.log(template.state.get('expanded'));
    }
  });
}

Router.route('/readings', function() {
  this.render('readings');
}, {name: 'readings'});
Router.route('/readings/:urltitle', function() {
  this.render('singleReading', {data: Readings.findOne({urltitle: this.params.urltitle})});
});

if (Meteor.isClient) {
  Template.filterSentence.onRendered(function() { 
    Meteor.typeahead.inject();
  });
  Template.readingList.helpers({
    filteredReadings: function() {
      return Readings.find({}, {sort: ["author.0.name", "title"]});
    }
  });
  Template.reading.created = function() {
    this.state = new ReactiveDict();
    this.state.set('expanded', false);
  };
  Template.basicCitation.helpers({
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
    }
  });
  Template.reading.helpers({
    expanded: function() {
      return Template.instance().state.get('expanded');
    },
    symbol: function() {
      if (this.notes) {
        if (Template.instance().state.get('expanded')) {
          return      'minus';
        } else return 'plus';
      } else return   'dot-single';
    }
  });
  Template.reading.events({
    'click .expandable': function(event, template) {
      template.state.set('expanded', !template.state.get('expanded'));
      console.log(template.state.get('expanded'));
    }
  });
  Template.singleReading.events({
    'click .icon-chevron-thin-left': function() {
      Router.go('/readings');
    }
  });
}

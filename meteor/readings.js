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
  var doKatex = function(str) {
    return str.replace(/\$[^$]+\$/,function(tex) {
      return katex.renderToString(tex.slice(1,-1));
    });
  };
  Template.registerHelper("katex", doKatex);
  Template.readingTitle.helpers({
    conjureUrl: function() {
      var url = this.link && this.link.filter(function(x) { return x.url; }).shift().url;
      if(!url && this.identifier) {
        var arxiv_id = this.identifier.filter(function(x) { return x.type=="arxiv"; }).shift().id;
        if(arxiv_id) {
          url = "http://arxiv.org/pdf/" + arxiv_id + ".pdf";
        } else {
          var doi = this.identifier.filter(function(x) { return x.type=="doi" }).shift().id;
          if(doi) {
            url = "http://dx.doi.org/" + doi;
          }
        }
      }
      return url;
    }
  });
  Template.basicCitation.helpers({
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
    },
    'click .expandable a': function(event) {
      event.stopPropagation();
    }
  });
  Template.singleReading.events({
    'click .icon-chevron-thin-left': function() {
      Router.go('/readings');
    }
  });
}

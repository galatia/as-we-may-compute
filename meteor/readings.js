Router.route('/readings', function() {
  this.render('readings');
}, {name: 'readings'});
Router.route('/readings/:urltitle', function() {
  this.render('singleReading', {data: Readings.findOne({urltitle: this.params.urltitle})});
});

if (Meteor.isClient) {
  Template.filterSentence.onRendered(function() { 
    Meteor.typeahead.inject();
    setTimeout(function() {
      $('.tt-input').each(function() {
        var el = $(this);
        var update = function(ev, sug) {
          console.log(ev);
          var id = 'text-width-tester';
          var tag = $('#' + id);
          if(!tag.length) {
            tag = $('<span id="'+id+'" style="opacity:0; height:0px"></span>');
            $('body').append(tag);
          }
          tag.css({"font-family": el.css('font-family'),
                   "font-weight": el.css('font-weight'),
                   "font-size":   el.css('font-size'),
                   "letter-spacing":   el.css('letter-spacing'),
                   "padding":     el.css('padding')})
          var str = (el.typeahead('val') || el.val() || el.attr('placeholder')).replace(/ /g, ' ');
          console.log("str: '"+str+"'");
          tag.html(str);
          var w = tag.width();
          console.log("w: "+ w);
          if (el.val() && sug) {
            console.log(sug);
            tag.html(sug.value.replace(/ /g, '&nbsp;'));
            var w2 = tag.width();
            w = w2>w? w2:w;
            console.log("w2: "+ w2);
          }
          $('.tt-input').width(w);
        }
        update();
        el.bind('typeahead:render', update);
        el.bind('typeahead:select', update);
        el.bind('typeahead:autocomplete', update);
        el.bind('blur', update);
      });
    },5);
  });
  Template.filterSentence.authors = function() {
    return Authors.find({},{sort: ["name"]}).fetch().map(function(x) {return x.name;});
  };
  Template.readingList.helpers({
    filteredReadings: function() {
      return Readings.find({}, {sort: ["author.0.name", "year"]});
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
      return authors.map(function(val, ind) {
        if(len > 1) {
          if(ind == len-1) {
            val.and = true;
          }
          if(ind < len-1 && len > 2) {
            val.sep = true;
          }
        }
        var comma = val.name.lastIndexOf(',')
        if(comma<0) {
          var space = val.name.lastIndexOf(' ');
          val.given   = val.name.slice(0,space);
          val.surname = val.name.slice(space+1);
        } else {
          val.surname = val.name.slice(0,comma);
          val.given   = val.name.slice(comma+2);
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
      } else return   false;
    }
  });
  Template.reading.events({
    'click .expandable': function(event, template) {
      template.state.set('expanded', !template.state.get('expanded'));
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

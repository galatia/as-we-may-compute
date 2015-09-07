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
          tag.html(str);
          var w = tag.width();
          if (el.val() && sug) {
            tag.html(sug.value.replace(/ /g, '&nbsp;'));
            var w2 = tag.width();
            w = w2>w? w2:w;
          }
          $('.typeahead').width(w);
        }
        el.bind('typeahead:render', update);
        el.bind('typeahead:select', update);
        el.bind('typeahead:autocomplete', update);
        el.bind('blur', update);
        update();
      });
    },150);
    Session.setDefault('readingSort1', 'author');
    Session.setDefault('readingSort2', 'year');
  });
  var ss = {
    author: {label: "author", spec: ["author.0.name", "asc"]},
    year: {label: "year", spec: ["year", "asc"]},
    yearRev: {label: "year (-)", spec: ["year", "desc"]},
    area: {label: "area", spec: ["areaCombo", "asc"]},
    title: {label: "title", spec: ["title", "asc"]}
  };
  for (var key in ss) {
    ss[key].key = key;
  }
  var sort2s = {
    author:   [ss.year, ss.yearRev, ss.area, ss.title],
    year:     [ss.author, ss.area, ss.title],
    yearRev:  [ss.author, ss.area, ss.title],
    area:     [ss.author, ss.year, ss.yearRev, ss.title]
  }
  Template.filterSentence.helpers({
    authors: function() {
      return Authors.find({},{sort: ["name"]}).fetch().map(function(x) {return x.name;});
    },
    sort1: function() {
      return {class: "sort sort1",
              stateVar: "readingSort1",
              default: 'author',
              options: [ss.author, ss.year, ss.yearRev, ss.area, ss.title]};
    },
    sort2: function() {
      var options = sort2s[Session.get('readingSort1')];
      if(!(options && options.some(function(x) {return x.key == Session.get('readingSort2');}))) {
        Session.set('readingSort2', options[0].key);
      }
      return options && {class: "sort sort2",
                         stateVar: "readingSort2",
                         default: 'year',
                         options: options};
    }
  })
  Template.filterSentence.events({
    'typeahead:select, typeahead:autocomplete, typeahead:change, blur .typeahead': function() {
      Session.set('readingFilter', {"author.name": $('.typeahead[name=author]').val() || undefined});
    },
  });

  Template.readingList.helpers({
    filteredReadings: function() {
      Session.setDefault('readingFilter', {});
      Session.setDefault('readingSort', ["author.0.name", "year"]);
      var s_spec = [ss[Session.get('readingSort1')].spec];
      if(Session.get('readingSort2')) {
        s_spec.push(ss[Session.get('readingSort2')].spec);
      }
      return Readings.find(Session.get('readingFilter'), {sort: s_spec});
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
    },
    areaComboStr: function() {
      return AreaCombos[this.areaCombo];
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

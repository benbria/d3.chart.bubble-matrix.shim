/*! d3.chart.bubble-matrix v0.1.0 - MIT Expat */
(function(mod) {
    // CommonJS, Node.js, browserify.
    if (typeof exports === "object" && typeof module === "object") {
        module.exports = mod(require('d3'),
                             require('d3.chart'),
                             require('d3.chart.base'),
                             requure('lodash'));
        return;
    }
    // AMD.
    if (typeof define === "function" && define.amd) {
        return define(['d3', 'd3.chart', 'd3.chart.base', 'lodash'], mod);
    }
    // Plain browser (no strict mode: `this === window`).
    this.d3ChartBubbleMatrix = mod(this.d3, this.d3Chart,
                                   this.d3ChartBase, this._);
})(function(d3, d3Chart, d3ChartBase, ld) {
  "use strict";
  var exports = {};

(function(){
  exports.makeProp = function(name, fn){
    return function(it){
      if (it == null) {
        return this[name];
      }
      this[name] = it;
      if (fn != null) {
        fn(it);
      }
      return this;
    };
  };
  exports.textRuler = function(svgSel){
    var onTmpText, ruler;
    onTmpText = function(str, fn){
      var el, result;
      el = svgSel.append('text').text(str);
      result = fn(el);
      el.remove();
      return result;
    };
    ruler = ld.memoize(function(str){
      return onTmpText(str, function(it){
        return it.node().getComputedTextLength();
      });
    });
    ruler.extentOfChar = ld.memoize(function(char){
      if (char.length < 1) {
        throw new Error('char can\'t be empty');
      }
      if (char.length > 1) {
        throw new Error('can get extent of a full string');
      }
      return onTmpText(char, function(it){
        return it.node().getExtentOfChar(0);
      });
    });
    ruler.onTmpText = onTmpText;
    return ruler;
  };
  exports.layers = {};
}).call(this);

(function(){
  var o, STROKE_WIDTH, bubbleEnter, bubbleMerge, bubbleExit, bubbleMergeTransition, transformRow;
  o = {
    events: {}
  };
  STROKE_WIDTH = 0.15;
  o.dataBind = function(data){
    var chart;
    chart = this.chart();
    if (chart.colKey_) {
      chart.bubbleKey_ = function(d, i){
        return chart.colKey_(data.cols[i]);
      };
    } else {
      chart.bubbleKey_ = undefined;
    }
    return this.selectAll('g.row').data(data.rows, chart.rowKey_);
  };
  o.insert = function(){
    var chart;
    chart = this.chart();
    return this.append('g').classed('row', true);
  };
  bubbleEnter = function(sel, chart){
    this.attr('r', 0);
    this.attr('fill', function(d){
      return chart.colorScale_(chart.color_(d));
    });
    this.attr('opacity', 0);
    return this.attr('cx', function(d, i){
      return chart.xScale_(i);
    });
  };
  bubbleMerge = function(sel, chart){
    return this.attr('stroke-width', STROKE_WIDTH * chart.radiusScale_(1));
  };
  bubbleExit = function(sel, chart){
    return this.remove();
  };
  bubbleMergeTransition = function(sel, chart){
    this.attr('opacity', 1);
    this.attr('cx', function(d, i){
      return chart.xScale_(i);
    });
    this.attr('r', function(d){
      return chart.radiusScale_(chart.size_(d));
    });
    return this.attr('fill', function(d){
      return chart.colorScale_(chart.color_(d));
    });
  };
  transformRow = function(sel, chart){
    return this.attr('transform', function(d, i){
      return "translate(0," + chart.yScale_(i) + ")";
    });
  };
  o.events['enter'] = function(){
    var chart;
    chart = this.chart();
    return this.call(transformRow, chart);
  };
  o.events['merge'] = function(){
    var chart, key, bubbles;
    chart = this.chart();
    if (chart.bubbleKey_ != null) {
      key = function(d, i){
        if (this instanceof Array) {
          return chart.bubbleKey_(d, i);
        }
        return this.__key__;
      };
    }
    bubbles = this.selectAll('circle').data(function(d){
      return chart.rowData_(d);
    }, key);
    bubbles.enter().append('circle').call(bubbleEnter, chart);
    bubbles.exit().call(bubbleExit, chart);
    bubbles.call(bubbleMerge, chart);
    if (key != null) {
      bubbles.each(function(d, i){
        return this.__key__ = chart.bubbleKey_(d, i);
      });
    }
    return bubbles.transition().call(bubbleMergeTransition, chart);
  };
  o.events['update:transition'] = function(){
    var chart;
    chart = this.chart();
    return this.call(transformRow, chart);
  };
  o.events['exit'] = function(){
    return this.remove();
  };
  exports.layers['bubble'] = o;
}).call(this);

(function(){
  var o, RADIUS_PADDING, STROKE_WIDTH, bubbleEnter, bubbleMerge, bubbleMergeTransition;
  o = {
    events: {}
  };
  RADIUS_PADDING = 0.1;
  STROKE_WIDTH = 0.15;
  o.dataBind = function(data){
    var chart, delta, delta2;
    chart = this.chart();
    chart.yScale_.domain(d3.range(0, data.length));
    chart.xScale_.domain(d3.range(0, chart.rowData_(data[0]).length));
    delta = chart.xScale_(1) - chart.xScale_(0);
    delta2 = chart.yScale_(1) - chart.yScale_(0);
    delta = delta < delta2 ? delta : delta2;
    chart.radiusScale_.range([0, delta * (1 - RADIUS_PADDING) / 2]);
    return this.selectAll('g.row').data(data);
  };
  o.insert = function(){
    var chart;
    chart = this.chart();
    return this.append('g').classed('row', true);
  };
  bubbleEnter = function(sel, chart){
    this.attr('r', 0);
    return this.attr('fill', 'white');
  };
  bubbleMerge = function(sel, chart){
    this.attr('cx', function(d, i){
      return chart.xScale_(i);
    });
    return this.attr('stroke-width', STROKE_WIDTH * chart.radiusScale_(1));
  };
  bubbleMergeTransition = function(sel, chart){
    this.delay(function(d, i, j){
      return i * 10 + j * 10;
    });
    this.duration(300);
    this.attr('r', function(d){
      return chart.radiusScale_(chart.radius_(d));
    });
    return this.each(function(d){
      var color;
      color = chart.colorScale_(chart.color_(d));
      return d3.select(this).transition().attr('fill', color);
    });
  };
  o.events['merge'] = function(){
    var chart, bubbles;
    chart = this.chart();
    this.attr('transform', function(d, i){
      return "translate(0," + chart.yScale_(i) + ")";
    });
    bubbles = this.selectAll('circle').data(function(d){
      return chart.rowData_(d);
    });
    bubbles.enter().append('circle').call(bubbleEnter, chart);
    return bubbles.call(bubbleMerge, chart);
  };
  o.events['merge:transition'] = function(){
    var chart;
    chart = this.chart();
    return this.selectAll('circle').call(bubbleMergeTransition, chart);
  };
  exports.bubblesOptions = o;
}).call(this);

(function(){
  var o, transformCol;
  o = {
    events: {}
  };
  o.dataBind = function(data){
    var chart;
    chart = this.chart();
    return this.selectAll('text').data(data.cols, chart.colKey_);
  };
  o.insert = function(){
    var chart;
    chart = this.chart();
    return this.append('text').attr('opacity', 0);
  };
  transformCol = function(sel, chart){
    var bottom, slanted;
    bottom = chart.bottomMargin_;
    slanted = chart.slanted_;
    return this.attr('transform', function(d, i){
      var result;
      result = "translate(" + chart.xScale_(i) + "," + bottom + ")";
      if (slanted) {
        result += 'rotate(45)';
      }
      return result;
    });
  };
  o.events['enter'] = function(){
    return this.call(transformCol, this.chart());
  };
  o.events['merge'] = function(){
    var chart;
    chart = this.chart();
    return this.text(chart.colHeader_);
  };
  o.events['enter:transition'] = function(){
    return this.attr('opacity', 1);
  };
  o.events['update:transition'] = function(){
    var chart;
    chart = this.chart();
    return this.call(transformCol, chart);
  };
  o.events['exit'] = function(){
    return this.remove();
  };
  exports.layers['col-header'] = o;
}).call(this);

(function(){
  var o, transformRow;
  o = {
    events: {}
  };
  o.dataBind = function(data){
    var chart;
    chart = this.chart();
    return this.selectAll('text').data(data.rows, chart.rowKey_);
  };
  o.insert = function(){
    var chart;
    chart = this.chart();
    return this.append('text').attr('opacity', 0).attr('dy', '.38em');
  };
  transformRow = function(sel, chart){
    var width, left;
    width = chart.width();
    left = chart.rowHeaderLeft_;
    return this.attr('transform', function(d, i){
      return "translate(" + left + "," + chart.yScale_(i) + ")";
    });
  };
  o.events['enter'] = function(){
    var chart;
    chart = this.chart();
    return this.call(transformRow, chart);
  };
  o.events['merge'] = function(){
    var chart;
    chart = this.chart();
    return this.text(function(){
      return chart.rowHeader_.apply(this, arguments);
    });
  };
  o.events['enter:transition'] = function(){
    return this.attr('opacity', 1);
  };
  o.events['update:transition'] = function(){
    var chart;
    chart = this.chart();
    return this.call(transformRow, chart);
  };
  o.events['exit:transition'] = function(){
    return this.attr('opacity', 0).remove();
  };
  exports.layers['row-header'] = o;
}).call(this);

(function(){
  var o, TICK_HEIGHT, transformThread;
  o = {
    events: {}
  };
  TICK_HEIGHT = 1;
  o.dataBind = function(data){
    var chart;
    chart = this.chart();
    return this.selectAll('g.thread').data(data.rows, chart.rowKey_);
  };
  o.insert = function(){
    var chart, g;
    chart = this.chart();
    g = this.append('g').classed('thread', true).attr('opacity', 0);
    g.append('path');
    return g;
  };
  transformThread = function(sel, chart){
    return this.attr('transform', function(d, i){
      return "translate(0," + chart.yScale_(i) + ")";
    });
  };
  o.events['enter'] = function(){
    return this.call(transformThread, this.chart());
  };
  o.events['merge'] = function(){
    var chart, range, left, tickHeight, path;
    chart = this.chart();
    range = chart.xScale_.range();
    left = chart.leftMargin_;
    tickHeight = TICK_HEIGHT * chart.radiusScale_(1);
    path = "M " + left + " -" + tickHeight / 2 + " v " + tickHeight;
    path += "M " + left + " 0 H " + range[range.length - 1];
    return this.select('path').attr('d', path);
  };
  o.events['enter:transition'] = function(){
    return this.attr('opacity', 1);
  };
  o.events['update:transition'] = function(){
    var chart;
    chart = this.chart();
    return this.call(transformThread, chart);
  };
  o.events['exit:transition'] = function(){
    return this.attr('opacity', 0).remove();
  };
  exports.layers['thread'] = o;
}).call(this);

(function(){
  var makeProp, HZ_PADDING, VT_PADDING, RADIUS_PADDING, DEFAULT_PALETTE, defaultColorScale;
  makeProp = exports.makeProp;
  HZ_PADDING = 1.0;
  VT_PADDING = 1.0;
  RADIUS_PADDING = 0.1;
  DEFAULT_PALETTE = ['#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac'];
  defaultColorScale = function(){
    return d3.scale.quantize().domain([0, 1]).range(DEFAULT_PALETTE);
  };
  exports.bubbleMatrix = d3.chart('BaseChart').extend('BubbleMatrix', {
    initialize: function(){
      var i$, ref$, len$, layer, gr, results$ = [];
      this.loadDefaults_();
      this.base.classed('d3-chart-bubble-matrix', true);
      this.xScale_ = d3.scale.ordinal();
      this.yScale_ = d3.scale.ordinal();
      this.radiusScale_ = d3.scale.sqrt();
      this.leftMargin_ = 0;
      this.ruler_ = exports.textRuler(this.base);
      for (i$ = 0, len$ = (ref$ = ['thread', 'bubble', 'row-header', 'col-header']).length; i$ < len$; ++i$) {
        layer = ref$[i$];
        gr = this.base.append('g').classed(layer, true);
        results$.push(this.layer(layer, gr, exports.layers[layer]));
      }
      return results$;
    },
    loadDefaults_: function(){
      this.rows_ || this.rows(function(it){
        return it.rows;
      });
      this.rowHeader_ || this.rowHeader(function(it){
        return it.name;
      });
      this.rowData_ || this.rowData(function(it){
        return it.values;
      });
      this.column_ || this.columns(function(it){
        return it.columns;
      });
      this.colHeader_ || this.colHeader(function(it){
        return it;
      });
      this.size_ || this.size(function(it){
        return it[0];
      });
      this.color_ || this.color(function(it){
        return it[1];
      });
      this.colorScale_ || this.colorScale(defaultColorScale());
      return this.slanted_ || this.slanted(false);
    },
    transform: function(data){
      var rows, cols, left, bottom, xDelta, yDelta, delta, right, padding;
      rows = this.rows_(data);
      cols = this.columns_(data);
      left = this.updateLeftMargin_(rows, this.width());
      bottom = this.getMaxBottom_(cols, this.height());
      xDelta = (this.width() - left) / cols.length;
      yDelta = (bottom - 0) / rows.length;
      this.xScale_.domain(d3.range(0, cols.length));
      this.yScale_.domain(d3.range(0, rows.length));
      delta = xDelta < yDelta ? xDelta : yDelta;
      right = left + delta * cols.length;
      bottom = delta * rows.length;
      this.xScale_.rangePoints([left, right], HZ_PADDING);
      this.yScale_.rangePoints([0, bottom], VT_PADDING);
      padding = this.ruler_.extentOfChar('W').height;
      this.bottomMargin_ = bottom + padding * 1.3;
      delta = this.xScale_(1) - this.xScale_(0);
      this.radiusScale_.range([0, delta * (1 - RADIUS_PADDING) / 2]);
      return {
        rows: rows,
        cols: cols
      };
    },
    updateLeftMargin_: function(data, width){
      var leftMargin, padding, this$ = this;
      leftMargin = this.leftMargin_;
      this.rowHeaderLeft_ = ld.reduce(data, function(r, d){
        var ref$;
        return r > (ref$ = this$.ruler_(this$.rowHeader_(d))) ? r : ref$;
      });
      padding = this.ruler_.extentOfChar('W').width;
      this.rowHeaderLeft_ += padding;
      this.leftMargin_ = this.rowHeaderLeft_ + padding;
      if (this.leftMargin_ !== leftMargin) {
        this.trigger('margin', this.leftMargin_);
      }
      return this.leftMargin_ + this.ruler_.extentOfChar('W').width;
    },
    getMaxBottom_: function(data, height){
      return height - 2 * this.ruler_.extentOfChar('W').height;
    },
    rows: makeProp('rows_'),
    rowHeader: makeProp('rowHeader_'),
    rowKey: makeProp('rowKey_'),
    rowData: makeProp('rowData_'),
    columns: makeProp('columns_'),
    colHeader: makeProp('colHeader_'),
    colKey: makeProp('colKey_'),
    size: makeProp('size_'),
    color: makeProp('color_'),
    sizeDomain: makeProp('sizeDomain_', function(it){
      return this.radiusScale_.domain(it);
    }),
    colorScale: makeProp('colorScale_'),
    slanted: makeProp('slanted_')
  });
}).call(this);

    return exports.bubbleMatrix;
});

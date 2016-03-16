# d3.chart.bubble-matrix shim

Shim repository for https://github.com/benbria/d3.chart.bubble-matrix.
It keeps the compiled files separate and is exposed
to bower.

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css"
              href="d3.chart.bubble-matrix.css">
        <link rel="stylesheet" type="text/css"
              href="d3.chart.bubble-matrix.default.css">
    </head>
    <body>
        <div id='vis'>
        <script src="lodash/dist/lodash.js"></script>
        <script src="d3/d3.js"></script>
        <script src="d3.chart/d3.chart.js"></script>
        <script src="d3.chart.base/d3.chart.base.js"></script>
        <script src="d3.chart.bubble-matrix/d3.chart.bubble-matrix.js"></script>
        <script src="example.js"></script>
    </body>
</html>
```



```js
/*! example.js */
var data = {
    columns: ['the', 'cake', 'is', 'a', 'lie'],
    rows: [
        {name: 'foo', values: [[0.13, 0.69], [0.84, 0.49], [0.31, 0.97],
                               [0.75, 0.29], [0.64, 0.9]]},
        {name: 'bar', values: [[0.98, 0.96], [0.13, 0.7], [0.27, 0.64],
                               [0.17, 0.24], [0.94, 0.3]]},
        {name: 'baz', values: [[0.94, 0.1], [0.39, 0.63], [0.07, 0.27],
                               [0.98, 0.02], [0.25, 0.94]]},
        {name: 'glo', values: [[0.3, 0.14], [0.39, 0.4], [0.54, 0.23],
                               [0.35, 0.47], [0.71, 0.71]]}
    ]
  };

var chart = d3.select('#vis')
        .append('svg')
        .chart('BubbleMatrix')
        .width(400).height(200);

chart.draw(data);
```


"use strict";

$(function () {
  var CHART_MARGIN = 60;
  var CHART_HEIGHT = 400;
  var CHART_WIDTH = 600;
  var CATEGORY_LABELS = {
    heightClass: "Height",
    weightClass: "Weight",
    handedness: "Handedness - Right:R, Left:L or Both:B"
  };


  var useQuantiles = location.search.indexOf("linear-scale") === -1;

  console.log("start loading");
  d3.csv("/data/baseball_data.csv", function (error, data) {
    var enrichedData = prepareData(data);

    displayBasicStatistics(data);

    var avgNonZero = data.filter(function(item) {
      return item.avg !== 0;
    }).map(function (item) {
      return Object.assign({}, item, {Filter: "exclude zero batting average"});
    });

    enrichedData = enrichedData.concat(avgNonZero);

    console.log("finished loading");
    drawChartOne(enrichedData);
    drawChartTwo(enrichedData);
    drawChartThree(enrichedData);
  });

  function convertNumberFields(entry) {
    entry.height = +entry.height;
    entry.weight = +entry.weight;
    entry.avg = +entry.avg;
    entry.HR = +entry.HR;
  }

  function Bounds(lowerBound, upperBound) {
    this.lowerBound=lowerBound;
    this.upperBound=upperBound;

    this.toString = function() {
      return this.lowerBound + " - " + this.upperBound;
    }
  }

  /*
   * Renders total number of entries, number of players with zero batting average and number of players with zero homeruns in the overview.
   */
  function displayBasicStatistics(data) {
    var hrZero = data.filter(function (item) {
      return item.HR === 0;
    });

    var avgZero = data.filter(function (item) {
      return item.avg === 0;
    });

    $("#TotalPlayersOutput").text(data.length);
    $("#ZeroBattingAvgOutput").text(avgZero.length);
    $("#ZeroHomerunsOutput").text(hrZero.length);
  }

  /*
   * Prepare the data to use in the charts:
   * - convert fields containing number values (heigt, weight, avg, HR) to number types
   * - add weight and height class
   * @return the prepared data
   */
  function prepareData(data) {
    data.forEach(convertNumberFields);

    var weightScale = d3.scale.quantile().domain(data.map(function (item) {
      return item.weight;
    })).range(d3.range(10));

    var heightScale = d3.scale.quantile().domain(data.map(function (item) {
      return item.height;
    })).range(d3.range(6));

    data.forEach(function (entry) {
      addWeightClass(weightScale, entry);
      addHeightClass(heightScale, entry);
      entry.Filter = "unfiltered"
    });

    return data;
  }

  /*
   * Adds a weight class to the given entry. Depending on the config variable 'useQuantiles' the weight class is determined differently.
   * - using quantiles: returns the bounds of the quantile the entries is contained in.
   * - without quantiles: returns the next lower multiple of ten as the lower boundary of the weightclass
   */
  function addWeightClass(weightScale, entry) {
    if (useQuantiles) {
      var weightScaleBounds = weightScale.invertExtent(weightScale(entry.weight));
      entry.weightClass = new Bounds(weightScaleBounds[0], weightScaleBounds[1]);
    } else {
      entry.weightClass = entry.weight - (entry.weight % 10);
    }
  }

  /*
   * Adds a height class to the given entry. Depending on the config variable 'useQuantiles' the height class is determined differently.
   * - using quantiles: returns the bounds of the quantile the entries is contained in.
   * - without quantiles: returns the next lower multiple of two as the lower boundary of the heightclass
   */
  function addHeightClass(heightScale, entry) {
    if (useQuantiles) {
      var heightScaleBounds = heightScale.invertExtent(heightScale(entry.height));
      entry.heightClass = new Bounds(heightScaleBounds[0], heightScaleBounds[1]);
    } else {
      entry.heightClass = entry.height - (entry.height % 2);
    }
  }

  function createSVG(container) {
    return d3.select(container)
      .append("svg")
      .attr("width", CHART_WIDTH + 2 * CHART_MARGIN)
      .attr("height", CHART_HEIGHT + 2 * CHART_MARGIN)
      .append('g')
      .attr('class', 'chart');
  }

  function createChartWithBoundaries(container, data) {
    var myChart = new dimple.chart(createSVG(container), data);
    myChart.setBounds(CHART_MARGIN, CHART_MARGIN, CHART_WIDTH, CHART_HEIGHT);
    return myChart;
  }

  function drawChartOne(data) {
    var myChart = createChartWithBoundaries("#ChartOne", data);
    showBattingAverageAndHomerunsByCategory(myChart, "handedness");
  }

  function drawChartTwo(data) {
    var myChart = createChartWithBoundaries("#ChartTwo", data);
    showBattingAverageAndHomerunsByCategory(myChart, "weightClass", "weightClass");
  }

  function drawChartThree(data) {
    var myChart = createChartWithBoundaries("#ChartThree", data);
    showBattingAverageAndHomerunsByCategory(myChart, "heightClass", "heightClass");
  }
  
  /*
   * Adds the 'Batting Average' and 'Homeruns' series to the given chart and configures the x axis depending on the given category and draws the chart. 
   * A category could be the 'weightClass', 'heightClass' or the handedness. The third parameter is option and used if a special ordering of the categroy values is neccessary.
   */
  function showBattingAverageAndHomerunsByCategory(chart, category, categoryOrdering) {
    var x = chart.addCategoryAxis("x", category);
    if (categoryOrdering) {
      x.addOrderRule(categoryOrdering);
    }
    x.title = CATEGORY_LABELS[category];
    var y1 = chart.addMeasureAxis("y", "avg");
    y1.tickFormat = ',.3f';
    y1.title = "Batting Average";
    var battingAverageSeries = chart.addSeries("Batting Average", dimple.plot.line, [x, y1]);
    battingAverageSeries.aggregate = dimple.aggregateMethod.avg;

    var y2 = chart.addMeasureAxis("y", "HR");
    y2.title = "Homeruns";
    y2.tickFormat = ',.1f';
    var homerunAverageSeries = chart.addSeries("Homeruns", dimple.plot.line, [x, y2]);
    homerunAverageSeries.aggregate = dimple.aggregateMethod.avg;
    chart.addLegend(50, 10, 500, 25);
    var storyboard = chart.setStoryboard("Filter");
    chart.draw();
  }
});


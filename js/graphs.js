//import { Chart } from "https://unpkg.com/frappe-charts@1.1.0/dist/frappe-charts.esm.js";
import {Chart} from "./frappe-charts.min.esm.js";

var graphDataCache = [];

export function renderFrappeChart(){
	new Chart("#frappechart", {
	  // or DOM element
	  data: {
	    labels: [
	      "12am-3am",
	      "3am-6am",
	      "6am-9am",
	      "9am-12pm",
	      "12pm-3pm",
	      "3pm-6pm",
	      "6pm-9pm",
	      "9pm-12am"
	    ],

	    datasets: [
	      {
		name: "Some Data",
		chartType: "bar",
		values: [25, 40, 30, 35, 8, 52, 17, 4]
	      }
	      ,
	      {
		name: "Another Set",
		chartType: "bar",
		values: [25, 50, -10, 15, 18, 32, 27, 14]
	      }
	    ],

	    yMarkers: [
		{ label: "Marker", value: 70, options: { labelPos: "left" } }
			],
	    yRegions: [
		{ label: "Region", start: -10, end: 50, options: { labelPos: "right" } }
	    ]
	  },

	  title: "My Awesome Chart",
	  type: "bar", // or 'bar', 'line', 'pie', 'percentage'
	  height: 300,
	  colors: ["purple", "#ffa3ef", "light-blue"],
	  maxSlices: 3,
	  axisOptions: {
	    xAxisMode: "tick",
	    xIsSeries: true
	  },
	  barOptions: {
	    stacked: true,
	    spaceRatio: 0.5
	  },
	  tooltipOptions: {
	    formatTooltipX: (d) => (d + "").toUpperCase(),
	    formatTooltipY: (d) => d + " pts"
	  }
	});
}

export function renderGraph(divId, nm, data, valattr){
	let d = data.map(e => ({"name": e.name, "y": e[valattr] }));
	Highcharts.chart(divId, {
	    chart: {
		plotBackgroundColor: null,
		plotBorderWidth: null,
		plotShadow: false,
		type: 'pie'
	    },
	    title: {
		text: nm
	    },
	    tooltip: {
		pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
	    },
	    plotOptions: {
		pie: {
		    allowPointSelect: true,
		    cursor: 'pointer',
		    dataLabels: {
			enabled: false
		    },
		    showInLegend: true
		}
	    },
	    series: [{
		name: nm,
		colorByPoint: true,
		data: d
	    }]
	});
}


export	function renderGroupGraph(divId, nm, data, N, geeklistId, attr, valattr){
	var chartdata = getTopN(attr, valattr, N, geeklistId, data);
	var cats = chartdata.map(e => e.cat);
	var chartseries = getAreaChartSeries(chartdata, cats, valattr);
			
	renderAreaChart(divId, cats, chartseries, nm, N);
		
	function getTopN(attr, valattr, n, baseObjectId, d){
		var baseTopN = d.find(e => e.geeklist.objectid === baseObjectId).graphdata[attr].sort((a,b)=>(a[valattr] < b[valattr] ? 1 : -1)).slice(0,n);
			  
		var topNs = [];
		//TODO: For each geeklist, sort by year, then by name. Then find top 10.
		d.sort((a,b)=>(a.geeklist.year < b.geeklist.year ? -1 : 1)).forEach(function(v){
			var distinctYear = (d.filter(e => e.geeklist.year === v.geeklist.year).length === 1);
			var key = '' + v.geeklist.year + (distinctYear ? '' : ' (' + v.geeklist.objectid + ')');
		    
			var graphData = v.graphdata[attr];
		    
			var topN = graphData.filter(e => baseTopN.find(f => f.objectid === e.objectid)); 
		    
			topNs.push({"cat": key, "topN": topN});
		  });
		  
		  return topNs
	}
}
		
export function renderAreaChart(chartId, cats, series, nm, N){
	var title = 'Breakdown by top ' + N + ' ' + nm + ' over time';
	
	Highcharts.chart(chartId, {
	      chart: {
		  type: 'area'
	      },
	      title: {
		  text: title				      },
	      subtitle: {
		  text: 'Source: Boardgameeek.com'
	      },
	      xAxis: {
		  categories: cats, 
		  tickmarkPlacement: 'on',
		  title: {
		      enabled: false
		  }
	      },
	      yAxis: {
		  labels: {
		      format: '{value}%'
		  },
		  title: {
		      enabled: false
		  }
	      },
	      tooltip: {
		  pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b> ({point.y:,.0f})<br/>',
		  split: true
	      },
	      plotOptions: {
		  area: {
		      stacking: 'percent',
		      lineColor: '#ffffff',
		      lineWidth: 1,
		      marker: {
			  lineWidth: 1,
			  lineColor: '#ffffff'
		      }
		  }
	      },
	      series: series
	});

}

export function getAreaChartSeries(data, cats, valattr){
	var series = [];
  
	data.map(e => e.topN).forEach(function(topN, idxTopN){
	    topN.forEach(function(v, i){
		var s = series.find(e => (e.name === v.name));

		if(s === undefined){
		  let a = new Array(cats.length).fill(0);

		  s = {"name": v.name, "data": a};
		  series.push(s);
		}
			
		//Each series contains data for each topN array
		s.data[idxTopN] = (v[valattr] === undefined ? 0 : v[valattr]);
	      }
	    );
	});
  
	return series
}

export	function renderGraphs(r, geeklistId, valattr){
	var curListData = r.filter(e => e.geeklist.objectid == geeklistId)[0];
	
	renderGraph("graphMechanics", "Mechanics", curListData.graphdata.boardgamemechanic, valattr);		
	renderGroupGraph("graphGroupMechanics", "Mechanics", r, 5, parseInt(geeklistId), "boardgamemechanic", valattr);
						
	renderGraph("graphCategories", "Categories", curListData.graphdata.boardgamecategory, valattr);
	renderGroupGraph("graphGroupCategories", "Categories", r, 5, parseInt(geeklistId), "boardgamecategory", valattr);
}

export function  getGraphData(geeklistId){
	var url = "./data/getGeeklistGraphData?geeklistid=" + parseInt(geeklistId);
	var data = graphDataCache.find(e => e.geeklistId === geeklistId);
	
	if(data === undefined){
		return fetch(url).then(r => r.json()).then(function(r){
			graphDataCache.push({'geeklistId': geeklistId, 'data': r});
			
			return Promise.resolve(r)
		})
	}else{
		return Promise.resolve(data.data)
	}

}

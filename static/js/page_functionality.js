//Settings
var view = "heatmap";
var monthNames = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
	];

var mbm = document.getElementById("mbm");
var hbh = document.getElementById("hbh");
var filter = document.getElementById("filter");
var reset = document.getElementById("reset");

//Activate Map
L.mapbox.accessToken = 'pk.eyJ1IjoiYnJldHRyb21lcm8iLCJhIjoiMDNmMGMyNDlmYTNhOTE1OTMxMDBlOTlmMzlhYWI1NzcifQ.8h_c4cDzPK3GMVVDlbE-VQ';

var map = L.mapbox.map('map', 'mapbox.streets')
	.setView([-35.3075, 149.124417], 12);

// Heat Map Layer
var heatmap = L.heatLayer( locations, 
	{
		minOpacity: 0.4,
		maxZoom: 18,
		radius: 30,
		blur: 15,
		max: 1.0
	})
	.addTo(map);

// Marker Layer
var featureLayer = L.mapbox.featureLayer( markers, 
	{
		id: "markers",
		interactive: true,
		type: "symbol",
		source: "markers",
	});

// Layer Toggle
function changeView(layer) {
	if (map.hasLayer(window.filteredLayer)) {
		if (layer == "heatmap") {
			view = "heatmap";
		} else if (layer == "featureLayer") {
			view = "markers";
		}
		filterByDate();
	} else {
		removeAllData();	
		if (layer == "heatmap") {
			heatmap.addTo(map);
			view = "heatmap";
		} else if (layer == "featureLayer") {
			featureLayer.addTo(map);
			view = "markers";
		}
	}
};

function monthlyLoop() {
	// Disable buttons
	mbm.disabled = true;
	hbh.disabled = true;
	$('#mButton').attr('disabled', 'disabled');
	$('#hButton').attr('disabled', 'disabled');
	
	//Delay value
	window.delay = 1000*$( "#slider" ).slider( "value" );
	
	// Remove current layer
	removeAllData();
	
	var records = markers["features"];
	i = 0;
	timedLoop(i, "monthly", records);
};

function hourlyLoop() {
	// Disable buttons
	mbm.disabled = true;
	hbh.disabled = true;
	$('#hButton').attr('disabled', 'disabled');
	$('#mButton').attr('disabled', 'disabled');
	
	//Delay value
	window.delay = 1000*$( "#slider" ).slider( "value" );
	
	// Remove current layer
	removeAllData();

	var records = markers["features"];
	i = 0;
	timedLoop(i, "hourly", records);
};

function timedLoop(i, type, records) {
    setTimeout(function(x) {
		var features = [];
		
		//Remove previous layer and legend
		if (i > 0) {
			map.removeLayer(filteredLayer);
			map.legendControl.removeLegend(legendText);
		}
		
		// If currently viewing markers:
		if (view == "markers") {
		
			//Data for monthly loop
			if (type == "monthly") {
				var max_i = 48;
				var year = Math.floor(i/12) + 2012
				var month = i%12
				for (record in records) {
					current_record = records[record];
					record_month = new Date(current_record["other_info"]["date"]).getMonth();
					record_year = new Date(current_record["other_info"]["date"]).getFullYear();
					if (record_month == month && record_year == year) {
						features.push(current_record);
					}; //if correct month
				}; // loop
				window.legendText = '<div class="my-legend"><p><span class="legend">' + monthNames[month] + ' ' + year + '</span></p></div>'
			}; // if monthly
		
			//Data for hourly loop
			if (type == "hourly") {
				var max_i = 24;
				for (record in records) {
					current_record = records[record];
					record_hour = Number(current_record["other_info"]["time"].substr(0,2));
					if (record_hour == i) {
						features.push(current_record);
					} // if correct hour
				} // loop
				if (i == 23) {j = 0;} else {j = i+1;}
				window.legendText = '<div class="my-legend"><p><span class="legend">' + i + ':00 - ' + j + ':00' + '</span></p></div>'
			} // if hourly
			
			var filtered = {features: features};
		
			//Create layer object
			window.filteredLayer = L.mapbox.featureLayer( filtered, 
				{
					id: "filtered",
					interactive: true,
					type: "symbol",
					source: "filtered",
				});
		
		// If heatmap layer:
		} else if (view == "heatmap") {
			
			//Data for monthly loop
			if (type == "monthly") {
				var max_i = 48;
				var year = Math.floor(i/12) + 2012
				var month = i%12
				
				for (record in records) {
					current_record = records[record];
					record_month = new Date(current_record["other_info"]["date"]).getMonth();
					record_year = new Date(current_record["other_info"]["date"]).getFullYear();
					if (record_month == month && record_year == year) {
						row = [];
						row.push(current_record["geometry"]["coordinates"][1]);
						row.push(current_record["geometry"]["coordinates"][0]);
						row.push(1);
						features.push(row);
					};
				}; // loop
				window.legendText = '<div class="my-legend"><p><span class="legend">' + monthNames[month] + ' ' + year + '</span></p></div>'
			}; // if monthly
		
			//Data for hourly loop
			if (type == "hourly") {
				var max_i = 24;
				for (record in records) {
					current_record = records[record];
					record_hour = Number(current_record["other_info"]["time"].substr(0,2));
					if (record_hour == i) {
						row = [];
						row.push(current_record["geometry"]["coordinates"][1]);
						row.push(current_record["geometry"]["coordinates"][0]);
						row.push(1);
						features.push(row);
					} // if correct hour
				} // loop
				if (i == 23) {j = 0;} else {j = i+1;}
				window.legendText = '<div class="my-legend"><p><span class="legend">' + i + ':00 - ' + j + ':00' + '</span></p></div>'
			} // if hourly
			var filtered = features
			
			// Heat Map Layer
			window.filteredLayer = L.heatLayer( filtered, 
				{
					minOpacity: 0.4,
					maxZoom: 18,
					radius: 30,
					blur: 15,
					max: 1.0
				})
			
		} // if heatmap
		
		//Add New layer to map
		filteredLayer.addTo(map);
		
		// Add Text
		map.legendControl.addLegend(legendText);
		
		//Advance loop
		i = i + 1
		if (i <= max_i) {
			timedLoop(i, type, records);
		}
		// If last loop, redisplay all data
		else if (i > max_i) {
			//Reenable buttons
			mbm.disabled = false;
			hbh.disabled = false;
			$('#mButton').removeAttr( "disabled" );
			$('#hButton').removeAttr( "disabled" );
			map.legendControl.removeLegend(legendText);
			
			// Reset All Data	
			removeAllData();
			resetData();
		}
	}, delay);
};

// Filter Data by selected dates
function filterByDate() {
	
	// Take Date values from date selector 
	var drp = $('input[name="daterange"]').data('daterangepicker');
	var startDate = new Date(drp.startDate);
	var endDate = new Date(drp.endDate);
	
	//Remove All Layers
	removeAllData();
	
	// Filter the data
	var records = markers["features"];
	var features = [];
	if (view == "markers") {
		for (record in records) {
			current_record = records[record];
			record_date = new Date(current_record["other_info"]["date"]);
			if (record_date >= startDate && record_date <= endDate) {
				features.push(current_record);
			}; //if correct month
		}; // loop
		//window.legendText = '<div class="my-legend"><p><span class="legend">' + monthNames[month] + ' ' + year + '</span></p></div>'
	
		//Create layer object
		var filtered = {features: features};
		window.filteredLayer = L.mapbox.featureLayer( filtered, 
			{
				id: "filtered",
				interactive: true,
				type: "symbol",
				source: "filtered",
			});
	
	// If heatmap layer:
	} else if (view == "heatmap") {
		//Data for monthly loop
		for (record in records) {
			current_record = records[record];
			record_date = new Date(current_record["other_info"]["date"]);
			if (record_date >= startDate && record_date <= endDate) {
				row = [];
				row.push(current_record["geometry"]["coordinates"][1]);
				row.push(current_record["geometry"]["coordinates"][0]);
				row.push(1);
				features.push(row);
			};
		}; // loop
		//window.legendText = '<div class="my-legend"><p><span class="legend">' + monthNames[month] + ' ' + year + '</span></p></div>'

		// Heat Map Layer
		var filtered = features;
		window.filteredLayer = L.heatLayer( filtered, 
			{
				minOpacity: 0.4,
				maxZoom: 18,
				radius: 30,
				blur: 15,
				max: 1.0
			})
		
	} // if heatmap
	
	//Add New layer to map
	filteredLayer.addTo(map);
};

function removeAllData() {
	// Remove all Existing Layers
	if (map.hasLayer(featureLayer)) {
		map.removeLayer(featureLayer);
	}
	if (map.hasLayer(heatmap)) {
		map.removeLayer(heatmap);
	}
	if (map.hasLayer(window.filteredLayer)) {
		map.removeLayer(filteredLayer);
	}
};

function resetData() {
	// Add fresh data
	if (view == "markers") {
		featureLayer.addTo(map);
	} else if (view == "heatmap") {
		heatmap.addTo(map);
	}
};

// Layer Toggle Input
$('input[name=optradio]:radio').change(function() {
	changeView(this.value);
});
					
// Loop button events
$(mbm).on('click', monthlyLoop);
$(hbh).on('click', hourlyLoop);

// Filter button events
$(filter).on('click', filterByDate);
$(reset).on('click', function() {removeAllData(); resetData();});

// Speed Slider
$(function() {
    $( "#slider" ).slider({
		range: "min",
      	value:1.5,
      	min: 0.25,
      	max: 3,
      	step: 0.25,
      	slide: function( event, ui ) {
        	$( "#amount" ).val( ui.value + " seconds" );
      	}
    });
    $( "#amount" ).val($( "#slider" ).slider( "value" ) + " seconds");
});

//Date Picker
$(function() {
    $('input[name="daterange"]').daterangepicker();
});
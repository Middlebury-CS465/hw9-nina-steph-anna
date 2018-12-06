const margins = {top:10, bottom:60, left:90, right:20};
const width = 1000;
const height = 600;

// Vis 1 - grid

// Data shaping for vis1 (squares)
const deathsbygender = {Total:1233,Male:905,Female:328}
const deathsbyrace = { White: 996, Black: 58, Asian: 12, Hispanic: 143, Other: 24}
const deathsbyage = {"<15": 0, "15-24": 67, "25-34": 396,"35-44": 314,
  "45-54": 263, "55-64": 160, "65+": 33, "Unknown": 0}

const genderAsList = []
for(i=0; i < deathsbygender.Male; i++){genderAsList.push("M")}
for(i=0; i < deathsbygender.Female; i++){genderAsList.push("F")}

const ageAsList = []
const age_keys = Object.keys(deathsbyage);
for(i=0; i < age_keys.length; i++){
  let current_key = age_keys[i];
  for(j=0; j < deathsbyage[current_key]; j++){
    ageAsList.push(current_key);
  }
};

const raceAsList = [];
const race_keys = Object.keys(deathsbyrace);
for(i=0; i < race_keys.length; i++){
  let current_key = race_keys[i];
  for(j=0; j < deathsbyrace[current_key]; j++){
    raceAsList.push(current_key);
  }
}

const vis1_array = []
for(i=0; i <genderAsList.length; i++){
  vis1_array.push([genderAsList[i], raceAsList[i], ageAsList[i]]);
}



// Map Vis & Anna's section
const town_width = 300;
const town_height = 300;

// Set up Prescrip vs. Deaths by County scatterplot
const chart3 = d3.select("#vis3")
    .attr("width", width + margins.right + margins.left)
    .attr("height", height + margins.top + margins.bottom);

const scatterplot = chart3.append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`);

scatterplot.append("text")
  .attr("text-anchor", "middle")
  .attr("transform", `translate(${width/2}, ${height+margins.bottom-10})`)
  .text("Schedule II Opioid Prescriptions (Total, 2013 - 2017)");

scatterplot.append("text")
  .attr("text-anchor", "middle")
  .attr("transform", `translate(${-(margins.left/1.5)}, ${height/2})rotate(-90)`)
  .text("Opioid Related Deaths (total 2013-2017)");


// Set up map
const chart4 = d3.select("#vis4")
    .attr("width", width + margins.right + margins.left)
    .attr("height", height + margins.top + margins.bottom);

const map = chart4.append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`);

// create projection to map from lat,lon data to x,y, coordinates
// Center on Massachusetts
const projection = d3.geoAlbers()
  .scale( 19000 )
  .rotate( [71.057,0] )
  .center( [-0.5, 42.15] )
  .translate( [width/2,height/2] );

//create path tool to translate GeoJSON into SVG path data
const mapPath = d3.geoPath().projection(projection);

//create coloring tool
const color_scale = d3.scaleQuantize()
  .range(colorbrewer.YlGnBu[8]); //YlOrBr

//the metric we are showing: (so far this does not change)
let metric = "TotalDeathsPerCapita";



// Set up DeathsPerCapita per year by Town Scatterplot
const chart5 = d3.select("#vis5")
  .attr("width", town_width + margins.right + margins.left)
  .attr("height", town_height + margins.top + margins.bottom);

const town_plot = chart5.append("g")
  .attr("transform", `translate(${margins.left}, ${margins.top})`);





// Load data
Promise.all([
  d3.csv("county_deaths.csv"),
  d3.csv("city_deaths.csv"),
  d3.json("mass_counties.json"),
  d3.json("mass_towns.json")
  ]).then(function(data){

  // VIS 1
  const vis1_width = 900;
  const vis1_height = 120;
  const gridSize = 8;
  const numPerRow=Math.floor(vis1_width/gridSize)

  const grid_scale = d3.scaleLinear()
  .domain([0, numPerRow -1])
  .range([0, gridSize * numPerRow])

  d3.select('#vis1').attr("width", vis1_width + 10).attr("height", vis1_height)
  let current = d3.select("#vis1").selectAll(".death_rect")
    .data(vis1_array)

  let enter_set=current.enter()

  enter_set.append("rect")
    .attr("class", "death_rect")
    .attr('x', (d, i) => {
      const n = i % numPerRow
      return grid_scale(n)
    })

    .attr('y', (d, i) => {
      const n = Math.floor(i / numPerRow)+2 // <-D
      return grid_scale(n)
    })
    .attr("height", gridSize+"px")
    .attr("width", gridSize+"px")
    .style("fill", "lightgray")
    .attr("stroke", "white")
    .attr("stroke-width", "1")

  // color functions for squares
  const gridColors = {
    "M": "blue",
    "F":"pink",
    "White": "#bababa",
    "Black": "#404040",
    "Asian": "#f4a582",
    "Hispanic": "#ca0020",
    "Other": "lightpurple",
    "15-24": "#fef0d9",
    "25-34": "#fdd49e",
    "35-44": "#fdbb84",
    "45-54": "#fc8d59",
    "55-64": "#e34a33",
    "65+": "#e34a33"
  }

  const updateGridColors = function(index){
    d3.selectAll('.death_rect')
      .style("fill", (d) => gridColors[d[index]]);//.style
  }//updateGridColors

  const gridCaptions = [
    // "Between January and September of 2018, there were <b>1,233</b> opioid-related overdose deaths." +
    // "( <span style='background-color: lightgray;'>&nbsp; &nbsp;&nbsp;</span>"+
    // "1 square = 1 death <span style='width:10px;'></span>) <br>" +
    // "Click through to explore the demographic breakdown",

    //Gender
    "<span style='color: blue;'> 73% </span> of the victims of deadly overdoses were <span style='color: blue;'> male </span>" +
    ", while the remaining <span style='color: pink;'>27%</span> were <span style='color: pink;'>female</span> <br><br>" +
    " <span style='background-color: blue;'>&nbsp; &nbsp;&nbsp;</span> Male" +
    " <span style='background-color: pink;'>&nbsp; &nbsp;&nbsp;</span> Female",

    //Race
    // white non-hispanic: 81% of deaths, 72% of population
    // Hispanic: < 1 % but 7% of population
    // Black: 4% but 8.8% of population
    "Looking at the breakdown by race, we can see that this is affecting white males the most. "+
    "While 72.1 of Massachusetts residents are White (Non-Hispanic), "+
    "<span style='color:" + gridColors["White"] + "'> <b>81% of opioid overdose victims</b></span> are white. <br>" +
    "Compare this to Hispanics, which make up 7% of the MA population but less than 1% of opioid deaths. <br><br>" +
    " <span style='background-color:" + gridColors["White"] +";'>&nbsp; &nbsp;&nbsp;</span>" + " White &nbsp;&nbsp;" +
    " <span style='background-color:" + gridColors["Black"] +";'>&nbsp; &nbsp;&nbsp;</span>" + " Black &nbsp;&nbsp;" +
    " <span style='background-color:" + gridColors["Asian"] +";'>&nbsp; &nbsp;&nbsp;</span>" + " Asian &nbsp;&nbsp;" +
    " <span style='background-color:" + gridColors["Hispanic"] +";'>&nbsp; &nbsp;&nbsp;</span>" + " Hispanic &nbsp;&nbsp;" +
    " <span style='background-color:" + gridColors["Other"] +";'>&nbsp; &nbsp;&nbsp;</span>" + " Other/Unknown &nbsp;&nbsp;",
    // Age
    "We can also see the age of these victims is relatively spread, though affecting those under 24 and over 55 less often. " +
    "However, it's important to note the implications of these numbers. <br>"+
    "<b>58%</b> of all deaths of Massachusetts residents between the ages of <b>25 and 44</b> were caused by opioids, " +
    "compared to 34% for those aged 45-64 <br><br>" +
    " <span style='background-color:" + gridColors["15-24"] +";'>&nbsp; &nbsp;&nbsp;</span>" + " 15-24 &nbsp;&nbsp;" +
    " <span style='background-color:" + gridColors["25-34"] +";'>&nbsp; &nbsp;&nbsp;</span>" + " 25-34 &nbsp;&nbsp;" +
    " <span style='background-color:" + gridColors["35-44"] +";'>&nbsp; &nbsp;&nbsp;</span>" + " 35-44 &nbsp;&nbsp;" +
    " <span style='background-color:" + gridColors["45-54"] +";'>&nbsp; &nbsp;&nbsp;</span>" + " 45-54 &nbsp;&nbsp;" +
    " <span style='background-color:" + gridColors["55-64"] +";'>&nbsp; &nbsp;&nbsp;</span>" + " 55-64 &nbsp;&nbsp;" +
    " <span style='background-color:" + gridColors["65+"] +";'>&nbsp; &nbsp;&nbsp;</span>" + " 65+"
  ]

  const updateGridCaption = function(index){
    d3.select('#vis1_caption').html(gridCaptions[index]);
  }

  let vis1_index = 0;
  d3.select('#vis1_next').on("click", function(){
    if(vis1_index < 3){
      updateGridColors(vis1_index);
      updateGridCaption(vis1_index);
      if(vis1_index === 2){
        d3.select('#vis1_next').html("Restart")
      }
      vis1_index = vis1_index + 1;

    } else {
      vis1_index = 0;
      updateGridColors(vis1_index);
      updateGridCaption(vis1_index)
      d3.select('#vis1_next').html("Next")
    }
  });


  // END VIS 1

  // START VIS 3 ==========
  const county_data = data[0];
  const town_data = data[1];
  const county_map_data = data[2];
  const town_map_data = data[3];

  let selectedCounty = "Barnstable";

  //convert map data from TopoJSON to GeoJSON
  const ma_counties = topojson.feature(county_map_data, county_map_data.objects.mass_counties);
  const ma_towns = topojson.feature(town_map_data, town_map_data.objects.ma_towns);

  console.log(ma_towns);

  // set domain of map color scale
  color_scale.domain(d3.extent(county_data, (d) => +d[metric]));

  // nest the county level data
  let countyData = d3.nest()
    .key((d) => d.County)
    .entries(county_data);

  //nest the town level data
  let townData = d3.nest()
    .key((d) => d.County)
    .entries(town_data);

  console.log(townData);

  // x and y scales for chart3 (county scatterplot)
    const x_scale = d3.scaleLinear()
        .range([0, width])
        .domain([0, d3.max(countyData, (d) => +d.values[0].TotalPrescriptions)]);

    const y_scale = d3.scaleLinear()
         .range([height, 0])
         .domain([0, d3.max(countyData, (d) => +d.values[0].TotalDeathsAllYears)]);

    const x_axis = scatterplot.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x_scale));

    const y_axis = scatterplot.append("g")
        .call(d3.axisLeft(y_scale));

    //Create scatterplot points, bind nested countyData
    let points = scatterplot.selectAll(".newPoints")
    .data(countyData, (d) => d)
    .enter()
    .append("circle")
    .attr("class", "newPoints")
    .attr("cx", (d) => x_scale(+d.values[0].TotalPrescriptions))
    .attr("cy", (d) => y_scale(+d.values[0].TotalDeathsAllYears))
    .attr("r", 6) // (d) => (+d.values[0].Population) * .000001
    .style("fill", color_scale(.0025));

    points.on("mouseover", function(d){
      const coordinates = [d3.event.pageX, d3.event.pageY];

    d3.select("#tooltip")
      .style("left", (coordinates[0]+25) + "px")
      .style("top", (coordinates[1]+10) + "px")
      .classed("hidden", false);

    d3.select("#countyname_tooltip").text(d.key);
    d3.select("#prescriptions_tooltip").text(d.values[0].TotalPrescriptions);
    d3.select("#deaths_tooltip").text(d.values[0].TotalDeathsAllYears);

    });

    points.on("mouseout", function(d) {
      d3.select("#tooltip").classed("hidden", true)
    });

     // Add regression line to scatterplot
     // y = (.03156)x - 100.1
     scatterplot.append("line")
        .attr("x1", x_scale(0))
        .attr("x2", x_scale(91295))
        .attr("y1", y_scale(-100.1))
        .attr("y2", y_scale(.03156 * 91295 - 100.1))
        .style("stroke", "lightgray")

    console.log("here i am")



    // create map of countyData, so we can easily find records for a particular county
    const county_map = d3.map();
    countyData.forEach((d) => {county_map.set(d.values[0].County, d.values[0])});


    //Loop through all of the path data, attaching appropriate record to each one
    for (let i = 0; i < ma_counties.features.length; i++) {
      let name = ma_counties.features[i].properties.NAME;
      ma_counties.features[i].properties.value = county_map.get(name);
    }

    //create the counties in the map SVG
    const counties = map.selectAll(".county-borders")
      .data(ma_counties.features, (d) => d)
      .enter()
      .append("path")
      .attr("d", mapPath)
      .attr("class", ".county-borders");

    //style each county to set fill color based on metric
    counties.style("fill", function(d) {
      if (d.properties.value) {
        return color_scale(+d.properties.value[metric]);
      } else{
        return "red";
      }
    });

  /*
    // Add town layer to map
    // create map of townData, so we can easily find records for a particular town
    const town_map = d3.map();
    townData.forEach((d) => {town_map.set(d.values[0].City, d.values[0])});
    console.log(townData[0].values[0].City)

    //Loop through all of the path data, attaching appropriate record to each one
    for (let i = 0; i < ma_towns.features.length; i++) {
      let name = ma_towns.features[i].properties.TOWN;
    //  console.log(name);
    //  console.log(town_map.get(name));
      ma_towns.features[i].properties.value = town_map.get(name);
  //console.log(ma_towns.features[i].properties.value);
    }

    //create the towns in the map SVG
    const towns = map.selectAll(".town-borders")
      .data(ma_towns.features, (d) => d)
      .enter()
      .append("path")
      .attr("d", mapPath)
      .attr("class", "town-borders");

    //temp styling
    towns.style("fill", "none")
      .style("stroke", "white");

  */




    //event handlers
    counties.on("mouseover", function(d){
      const coordinates = [d3.event.pageX, d3.event.pageY];

      d3.select("#mapTooltip")
        .style("left", (coordinates[0]+25) + "px")
        .style("top", (coordinates[1]+10) + "px")
        .classed("hidden", false);

      d3.select("#countyname").text(d.properties.value.County);
      d3.select("#deaths").text(+d.properties.value.TotalDeathsAllYears);
    });

    counties.on("mouseout", function(d) {
    //  console.log("mouseout")
      d3.select("#mapTooltip").classed("hidden", true)
    });

    // Clicking a county on the map updates the final scatterplot
    counties.on("click", function(item_data) {

      selectedCounty = item_data.properties.NAME;

      update_town_vis();

    });




    /**
     Function to update final scatterplot (chart5) based on user selected county.
     (clicked on map)
    **/
    const update_town_vis = function() {
      names=[];
      const key = chart5.append("g")
      .attr("transform", `translate(${5}, ${margins.top})`);
      // Filter townData to just the selectedCounty
      let filtered_town_data = townData.filter((d) => d.key == selectedCounty)[0].values
      const data= d3.nest()
        .key(function(d) { return d.City; })
        .map(filtered_town_data);

      let cities=data.keys();

      for (i=0; i<data.size(); i++){

        const name=cities[i];

        const selected=data.get(name);

        const name_obj = {name:name, data:selected, color: null};
        names.push(name_obj)
      }

      var x_scale = d3.scaleLinear()
        .range([0, town_width])
        .domain([2013, 2017])

      var y_scale = d3.scaleLinear()
        .range([town_height, 0])
        .domain([0,0.005]);

      let colorScale= d3.scaleOrdinal()
      .range(["red", "green", "blue", "orange", "yellow", "purple", "pink", "indigo","#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

      const line = d3.line()
        .x(function(d){

          return x_scale(+d["Year"])}
        )
        .y(function(d){

          return y_scale(+d["DeathsPerCapita"])}
        )

        //current set
        let current=town_plot.selectAll(".namelines")
          .data(names, (d)=>d)


        //exit set
        current.exit().remove();

        //enter set
        let new_lines=current.enter()
              .append("path")
              .attr("class", "namelines")
              .on('mouseover', function(d){

                const tooltip=d3.select("#tooltipCityMap");

                tooltip.classed("hidden", false);

                d3.select("#name").text(d.name);

                d3.select("#pop").text(+d.data[0]["Population"]);


                const coordinates = [d3.event.pageX, d3.event.pageY];

                tooltip.style("left", (coordinates[0]+25) + "px");
                tooltip.style("top", (coordinates[1]+25) + "px");


              })
              .on('mouseout', function(d){
                const tooltip=d3.select("#tooltipCityMap");
                tooltip.classed("hidden", true);
              })



        current=current.merge(new_lines);

        current.attr("d", function(d){

            return line(d.data);
        })
        .style("stroke", function(d,i){

          return colorScale(i)})
        .style("fill", "none")
        .attr('stroke-width', function(d) {
            if (d.name==="Average"){

              return 3;
            }
            else{

              return 1;
            }

         })

         town_plot.append("text")
           .attr("text-anchor", "middle")
           .attr("transform", `translate(${town_width/2}, ${town_height+margins.bottom-10})`)
           .text("Year");

         town_plot.append("text")
           .attr("text-anchor", "middle")
           .attr("transform", `translate(${-(margins.left/1.5)}, ${town_height/2})rotate(-90)`)
           .text("Deaths per Capita");


          const x_axis_town = town_plot.append("g")
              .attr("transform", `translate(0, ${town_height})`)
              .call(d3.axisBottom(x_scale).tickFormat(d3.format("d")))

          const y_axis_town = town_plot.append("g")
              .call(d3.axisLeft(y_scale));
    }



});

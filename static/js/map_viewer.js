

d3.selectAll("#items").on("click", function () {
      selected = this.value;
      console.log(selected)
      //d3.select("#map-holder svg").remove();
      //d3.select("#legend-holder svg").remove();
      //plotData(selected);
      changeData(selected);
   });

plotData("Price")

// DEFINE VARIABLES
// Define size of map group
// Full world map is 2:1 ratio
// Using 12:5 because we will crop top and bottom of map
w = 1000;
h = 600;
// variables for catching min and max zoom factors
var minZoom;
var maxZoom;

var countriesData = {};
var color;

var spaceForLegend = 200; //  Margin required to show legend on the right.
var legendHeight = 300;
var legendWidth = 20;
var legendTopMargin = 10;
// Define map projection
var projection = d3
   .geoEquirectangular()
   .center([0, 15]) // set centre to further North
   .scale([w/(2*Math.PI)]) // scale to fit group width
   .translate([w/2,h/2]) // ensure centred in group
;

// Define map path
var path = d3
   .geoPath()
   .projection(projection)
;

function countryClick(code)
{
    alert(code);
    
    selected = code;          
    d3.selectAll(".country").classed("country-on", false);
    selectedCountry = d3.select("#country"+selected);
    console.log(selected,selectedCountry);
    selectedCountry.classed("country-on", true);
    //console.log(path.bounds(d), path.bounds(d)[0][0], path.centroid(d));
    var bounds0_0 = selectedCountry.attr("bounds0_0");
    var bounds0_1 = selectedCountry.attr("bounds0_1");
    var bounds1_0 = selectedCountry.attr("bounds1_0");
    var bounds1_1 = selectedCountry.attr("bounds1_1");
    var centroid_0 = selectedCountry.attr("centroid_0");
    var centroid_1 = selectedCountry.attr("centroid_1");
    boxZoom([[bounds0_0,bounds0_1],[bounds1_0,bounds1_1]], [centroid_0,centroid_1], 20);
}

function mouseover(postal, name) {
  country = d3.select("#country" + postal);  
  d3.select("#countryLabel" + postal).style("display", "block");
  country.style("stroke-width","2");
  country.style("fill","#FC8D59");
  country.style("stroke","#BADA55");
  country.style("fill-opacity","1");
}

function mouseout(postal, name) {  
  country = d3.select("#country" + postal);  
  d3.select("#countryLabel" + postal).style("display", "none");
  country.style("fill",function(d) {
    if (name in countriesData)
      return color(countriesData[d.properties.name]);
    else
      return "white";
  });
  country.style("stroke-width",null);
  country.style("stroke","black");
}

// apply zoom to countriesGroup
function zoomed() {
   t = d3
      .event
      .transform
   ;
   countriesGroup.attr(
      "transform","translate(" + [t.x, t.y] + ")scale(" + t.k + ")"
   );
   //console.log(zoomScaleForcountryLabel);
   countryLabels.attr("transform",function(d){
                  transformContent = d3.select(this).attr("transform");
                  transformContent = transformContent.substr(0,transformContent.indexOf("scale"))
                  transformContent += "scale("+(1.0/t.k).toString()+")";
                  //console.log(transformContent);
                  return transformContent;
                });
}

// Define map zoom behaviour
var zoom = d3
   .zoom()
   .on("zoom", zoomed)
;

function getTextBox(selection) {
  selection.each(function(d) {
    d.bbox = this.getBBox();
  });
}

function changeData(item) {
  d3.csv("/static/world_data/MyDataExport.csv",function(data){

    countriesData = {};
    minVal = 100.0; // Value of percentage
    maxVal = 0.0;


    data.forEach(function(d){
        val = parseFloat(d[item]);
        countriesData[d['country']] = val;
        if(val < minVal) minVal = val;
        if(val > maxVal) maxVal = val;
    });
    minVal = minVal.toFixed(0);
    maxVal = maxVal.toFixed(0);
    console.log(minVal,maxVal,countriesData);

    var color = d3.scaleLinear().range(["red", "green"]);
    color.domain([minVal,maxVal]);

    d3.selectAll(".country")
      .transition()
      .duration(500)
      .style("fill",function(d) {
          countryName = d3.select(this).attr("countryName");
          if (countryName in countriesData)
            return color(countriesData[d.properties.name]);
          else
            return "white";
       });

    d3.selectAll('.countryName')
      .text(function(d) {
          countryName = d3.select(this).attr("countryName");
          if (countryName in countriesData)
            return (countryName+': '+countriesData[countryName].toString()+"%");
          else
            return countryName;
       })
       .call(getTextBox);


    d3.select('#map-legend #legend-min-text')
      .transition()
      .duration(500)
      .text(minVal+'%');

    d3.select('#map-legend #legend-max-text')
      .transition()
      .duration(500)
      .text(maxVal+'%');

  });
}

function plotData(item) {

  // get map data
  d3.json(
    "/static/world_data/custom2.geo.json",
    function(json) {

      d3.csv("/static/world_data/MyDataExport.csv",function(data){

          countriesData = {};
          minVal = 100.0; // Value of percentage
          maxVal = 0.0;
          zoomScaleForcountryLabel = 1.0;
          isZoomInitialized = false;
          jsonCountries = {};

          data.forEach(function(d){
              val = parseFloat(d[item]);
              countriesData[d['country']] = val;
              if(val < minVal) minVal = val;
              if(val > maxVal) maxVal = val;
          });
          minVal = minVal.toFixed(0);
          maxVal = maxVal.toFixed(0);
          console.log(minVal,maxVal,countriesData);

          var svg = d3
            .select("#map-holder")
            .append("svg")
            // set to the same size as the "map-holder" div
            .attr("width", $("#map-holder").width())
            .attr("height", $("#map-holder").height())
            // add zoom functionality
            .call(zoom)
          ;

          countriesGroup = svg
             .append("g")
             .attr("id", "map")
          ;
          // add a background rectangle
          countriesGroup
             .append("rect")
             .attr("x", 0)
             .attr("y", 0)
             .attr("width", w)
             .attr("height", h)
          ;

          color = d3.scaleLinear().range(["red", "green"]);
          color.domain([minVal,maxVal]);

          //console.log(minVal,maxVal);
          json.features.forEach(function(d) {
             jsonCountries[d.properties.name] = 1;
             //if (!(d.properties.name in countriesData))
             //   console.log(d.properties.name);
          });
          //console.log("countries from JSON: ",jsonCountries,"\n\n")

          /*for (r in countriesData) {
            if (!(r in jsonCountries))
              console.log("\""+r+"\"");
          };*/

          // draw a path for each feature/country
          countries = countriesGroup
             .selectAll("path")
             .data(json.features)
             .enter()
             .append("path")
             .attr("d", path)
             .attr("id", function(d, i) {
                return "country" + d.properties.postal;
             })
             .style("fill",function(d) {
                if (d.properties.name in countriesData)
                  return color(countriesData[d.properties.name]);
                else
                  return "white";
             })
             .attr("countryName",function(d) {
                return d.properties.name;
             })
             .attr("bounds0_0",function(d, i) { return path.bounds(d)[0][0]; })
             .attr("bounds0_1",function(d, i) { return path.bounds(d)[0][1]; })
             .attr("bounds1_0",function(d, i) { return path.bounds(d)[1][0]; })
             .attr("bounds1_1",function(d, i) { return path.bounds(d)[1][1]; })
             .attr("centroid_0",function(d, i) { return path.centroid(d)[0]; })
             .attr("centroid_1",function(d, i) { return path.centroid(d)[1]; })
             .attr("class", "country")
             // add a mouseover action to show name label for feature/country
             .on("mouseover", function(d, i) {
                mouseover(d.properties.postal, d.properties.name);
                /*d3.select("#countryLabel" + d.properties.postal).style("display", "block");
                d3.select(this).style("stroke-width","2");
                d3.select(this).style("fill","#FC8D59");
                d3.select(this).style("stroke","#BADA55");
                d3.select(this).style("fill-opacity","1");*/
             })
             .on("mouseout", function(d, i) {
                mouseout(d.properties.postal, d.properties.name);
                /*d3.select("#countryLabel" + d.properties.postal).style("display", "none");
                d3.select(this).style("stroke-width",null);
                d3.select(this).style("fill",function(d) {
                    if (d.properties.name in countriesData)
                      return color(countriesData[d.properties.name]);
                    else
                      return "white";
                });
                d3.select(this).style("stroke","black");*/
             })
             // add an onclick action to zoom into clicked country
             .on("click", function(d, i) {
                d3.selectAll(".country").classed("country-on", false);
                d3.select(this).classed("country-on", true);
                boxZoom(path.bounds(d), path.centroid(d), 20);
             })
          ;

          countryLabels = countriesGroup
             .selectAll("g")
             .data(json.features)
             .enter()
             .append("g")
             .attr("class", "countryLabel")
             .attr("id", function(d) {
                return "countryLabel" + d.properties.postal;
             })
             .attr("transform", function(d) {
                return (
                   "translate(" + path.centroid(d)[0] + "," + path.centroid(d)[1] + ") scale(1.0)"
                );
             })
             // add mouseover functionality to the label
             .on("mouseover", function(d, i) {
                mouseover(d.properties.postal);
                /*d3.select(this).style("display", "block");
                country = d3.select("#country" + d.properties.postal);
                country.style("stroke-width","2");
                country.style("fill","#FC8D59");
                country.style("stroke","#BADA55");
                country.style("fill-opacity","1");*/
             })
             .on("mouseout", function(d, i) {
                 mouseout(d.properties.postal, d.properties.name);
                 /*d3.select(this).style("display", "none");
                 country = d3.select("#country" + d.properties.postal);
                 country.style("fill",function(d) {
                    if (d.properties.name in countriesData)
                      return color(countriesData[d.properties.name]);
                    else
                      return "white";
                 });
                 country.style("stroke-width",null);
                 country.style("stroke","black"); */
             })
             // add an onlcick action to zoom into clicked country
             .on("click", function(d, i) {
                d3.selectAll(".country").classed("country-on", false);
                d3.select("#country" + d.properties.postal).classed("country-on", true);
                boxZoom(path.bounds(d), path.centroid(d), 20);
             })
          ;

          // add the text to the label group showing country name
          countryLabels
             .append("text")
             .attr("class", "countryName")
             .style("text-anchor", "middle")
             .attr("countryName",function(d) {
                return d.properties.name;
             })
             .attr('fill','White')
             //.attr("font-weight", "bold")
             .attr("dx", 0)
             .attr("dy", 0)
             .text(function(d) {
                if (d.properties.name in countriesData)
                  return (d.properties.name+': '+countriesData[d.properties.name].toString()+"%");
                else
                  return d.properties.name;
             })
             .call(getTextBox)
          ;
          // add a background rectangle the same size as the text
          countryLabels
             .insert("rect", "text")
             .attr("class", "countryBg")
             .attr("fill", "black")
             //.style("opacity", 1.0)
             .attr("transform", function(d) {
                return "translate(" + (d.bbox.x - 2) + "," + d.bbox.y + ")";
             })
             .attr("width", function(d) {
                return d.bbox.width + 4;
             })
             .attr("height", function(d) {
                return d.bbox.height;
             })
          ;

          if (!isZoomInitialized) {
                  initiateZoom();
                  isZoomInitialized = true;
          }

          // on window resize
          $(window).resize(function() {
             // Resize SVG
             svg
                .attr("width", $("#map-holder").width())
                .attr("height", $("#map-holder").height())
             ;
             //initiateZoom();
          });

          function initiateZoom(){
            // Define a "min zoom"
            minZoom = Math.max(($("#map-holder").width())/w,$("#map-holder").height()/h);
            // Define a "max zoom"
            maxZoom = 10*minZoom;
            //apply these limits of
            zoom
              .scaleExtent([minZoom, maxZoom]) // set min/max extent of zoom
              .translateExtent([[0, 0], [w, h]]) // set extent of panning
            ;
            // define X and Y offset for centre of map
            midX = (($("#map-holder").width()) - (minZoom*w))/2;
            midY = ($("#map-holder").height() - (minZoom*h))/2;
            // change zoom transform to min zoom and centre offsets
            svg.call(zoom.transform,d3.zoomIdentity.translate(midX, midY).scale(minZoom));
          }

          // zoom to show a bounding box, with optional additional padding as percentage of box size
          function boxZoom(box, centroid, paddingPerc) {
            minXY = box[0];
            maxXY = box[1];
            // find size of map area defined
            zoomWidth = Math.abs(minXY[0] - maxXY[0]);
            zoomHeight = Math.abs(minXY[1] - maxXY[1]);
            // find midpoint of map area defined
            zoomMidX = centroid[0];
            zoomMidY = centroid[1];
            // increase map area to include padding
            zoomWidth = zoomWidth * (1 + paddingPerc / 100);
            zoomHeight = zoomHeight * (1 + paddingPerc / 100);
            // find scale required for area to fill svg
            maxXscale = ($("svg").width()) / zoomWidth;
            maxYscale = $("svg").height() / zoomHeight;
            zoomScale = Math.min(maxXscale, maxYscale);
            // handle some edge cases
            // limit to max zoom (handles tiny countries)
            zoomScale = Math.min(zoomScale, maxZoom);
            // limit to min zoom (handles large countries and countries that span the date line)
            zoomScale = Math.max(zoomScale, minZoom);

            if (zoomScale > 10)
              zoomScale = 10.0;
            // Find screen pixel equivalent once scaled
            offsetX = zoomScale * zoomMidX;
            offsetY = zoomScale * zoomMidY;
            // Find offset to centre, making sure no gap at left or top of holder
            dleft = Math.min(0, ($("svg").width()) / 2 - offsetX);
            dtop = Math.min(0, $("svg").height() / 2 - offsetY);
            // Make sure no gap at bottom or right of holder
            dleft = Math.max(($("svg").width()) - w * zoomScale, dleft);
            dtop = Math.max($("svg").height() - h * zoomScale, dtop);

            zoomScaleForcountryLabel = 1.5/zoomScale;
            if (zoomScaleForcountryLabel > 1.0)
              zoomScaleForcountryLabel = 1.0


            // set zoom
            svg
              .transition()
              .duration(500)
              .call(
                zoom.transform,
                d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
              );
          }

          var svgLegend = d3.select("#legend-holder")
                      .append("svg")
                      .attr("id","map-legend")
                      // set to the same size as the "map-holder" div
                      .attr("width", spaceForLegend)
                      .attr("height", $("#legend-holder").height())
                      .attr("translate","translate("+$("#map").width()+",0)")

          //Append a defs (for definition) element to your SVG
          var defs = svgLegend.append("defs");

          //Append a linearGradient element to the defs and give it a unique id
          var linearGradient = defs.append("linearGradient")
              .attr("id", "linear-gradient");

          //Horizontal gradient
          linearGradient
              .attr("x1", "0%")
              .attr("y1", "0%")
              .attr("x2", "100%")
              .attr("y2", "0%");

          //Set the color for the start (0%)
          linearGradient.append("stop")
              .attr("offset", "0%")
              .attr("stop-color", "red"); //light blue          

          //Set the color for the end (100%)
          linearGradient.append("stop")
              .attr("offset", "100%")
              .attr("stop-color", "green"); //dark blue

          //Draw the rectangle and fill with gradient
          svgLegend.append("rect")
            .attr("id","legend-bar")
            .attr("width", legendHeight)
            .attr("height", legendWidth)
            .attr("transform","translate("+(50)+","+(legendHeight+legendTopMargin)+") rotate(-90)")
            .style("fill", "url(#linear-gradient)");

          svgLegend.append("text")
            .attr("id","legend-min-text")
            .attr("transform","translate("+(50+legendWidth+4)+","+(legendHeight + legendTopMargin-2)+")")
            .attr("font-weight", "bold")
            .text('Negative');

          svgLegend.append("text")
            .attr("id","legend-mid-text")
            .attr("transform","translate("+(50+legendWidth+4)+","+(legendHeight/2.0 + legendTopMargin-2)+")")
            .attr("font-weight", "bold")
            .text('Neutral');

          svgLegend.append("text")
            .attr("id","legend-max-text")
            .attr("transform","translate("+(50+legendWidth+4)+","+(legendTopMargin+15)+")")
            .attr("font-weight", "bold")
            .text('Positive');
      });
    }
  );
};

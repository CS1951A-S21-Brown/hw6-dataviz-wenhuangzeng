let bar_width = (MAX_WIDTH)/1.5, bar_height = 400;

// Set up SVG object with width, height and margin
let svg_barplot = d3.select("#barplot")
    .append("svg")
    .attr("width", bar_width)
    .attr("height", bar_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create a linear scale for the x axis (number of occurrences)
let x_bar = d3.scaleLinear()
    .range([0, bar_width - margin.left - margin.right]);

// Create a scale band for the y axis (artist / song)
let y_bar = d3.scaleBand()
    .range([0, bar_height - margin.top - margin.bottom])
    .padding(0.2);  // Improves readability

// Set up reference to count SVG group
let countRef = svg_barplot.append("g");
// Set up reference to y axis label to update text in setData
let y_axis_label = svg_barplot.append("g").attr("id", "y_bar_label");

// Add x-axis label
svg_barplot.append("text")
    .attr("transform",
        `translate(${(bar_width - margin.left - margin.right) / 2},
        ${(bar_height - margin.top - margin.bottom) + 15})`)
    .style("text-anchor", "middle")
    .text("Global Sales (in millions)")
    .style("font-size", 12)

// Add y-axis label
svg_barplot.append("text")
    .attr("transform", `translate(-160, ${(bar_height - margin.top - margin.bottom) / 2})`)
    .style("text-anchor", "middle")
    .text('Video Games')
    .style("font-size", 12);

// Add chart title
let title = svg_barplot.append("text")
    .attr("transform", `translate(${(bar_width - margin.left - margin.right) / 2}, ${-20})`)
    .style("text-anchor", "middle")
    .style("font-size", 15);


// Initialize color scale
let color;
/**
 * Sets the data on the barplot
 */
function setData(startYear, endYear) {
    // Filter data by year
    let filteredData = data.filter(function(a) {
        return validYear(startYear, endYear, a.Year);
    });
    // Get top 10 gamese
    filteredData = cleanData(filteredData, function(a, b) {
        return parseFloat(b.Global_Sales ) - parseFloat(a.Global_Sales )
    }, NUM_GAMES);
    
    // Define color scale
    color = d3.scaleOrdinal()
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), filteredData.length));

    // Update the x axis domain with the max count of the provided data
    x_bar.domain([0, d3.max(filteredData, function(d) { return parseFloat(d.Global_Sales); })]);
    // Update the y axis domains with the desired attribute
    y_bar.domain(filteredData.map(function(d) { return d.Name + ',' + d.Platform }));
    color.domain(filteredData.map(function(d) { return d.Name + ',' + d.Platform }));

    // Render y-axis label
    y_axis_label.call(d3.axisLeft(y_bar).tickSize(0).tickPadding(5));
    let bars = svg_barplot.selectAll("rect").data(filteredData);

    // Render the bar elements on the DOM
    bars.enter()
        .append("rect")
        // Set up mouse interactivity functions
        .on("mouseover", mouseover_barplot)
        .on("mouseout", mouseout_barplot)
        // .on("click", click_barplot)
        .merge(bars)
        .transition()
        .duration(1000)
        .attr("fill", function(d) { return color(d.Name + ',' + d.Platform) })
        .attr("x", x_bar(0))
        .attr("y", function(d) { return y_bar(d.Name + ',' + d.Platform); })
        .attr("width", function(d) { return x_bar(parseFloat(d.Global_Sales)); })
        .attr("height",  y_bar.bandwidth())
        .attr("id", function(d) { return `rect-${d.Rank}` });
    /*
        In lieu of x-axis labels, display the count of the artist next to its bar on the
        bar plot.
     */
    let counts = countRef.selectAll("text").data(filteredData);
    // Render the text elements on the DOM
    counts.enter()
        .append("text")
        .merge(counts)
        .transition()
        .duration(1000)
        .attr("x", function(d) { return x_bar(parseFloat(d.Global_Sales)) + 10; })
        .attr("y", function(d) { return y_bar(d.Name + ',' + d.Platform) + 10; })
        .style("text-anchor", "start")
        .text(function(d) {return parseFloat(d.Global_Sales);});
    // Add y-axis text and chart title
    title.text(`Games with Top Global Sales (Released from ${startYear} - ${endYear})`);
    // Remove elements not in use if fewer groups in new dataset
    bars.exit().remove();
    counts.exit().remove();
}

/**
 * Cleans the provided data using the given comparator then strips to first numExamples
 * instances
 */
 function cleanData(data, comparator, numExamples) {
    return data.sort(comparator).slice(0, numExamples);
}

// Darken bar fill in barplot on mouseover
let mouseover_barplot = function(d) {
    svg_barplot.select(`#rect-${d.Rank}`).attr("fill", function(d) {
        return darkenColor(color(d.Name + ',' + d.Platform), 0.5);
    });
};

// Restore bar fill to original color on mouseout
let mouseout_barplot = function(d) {
    svg_barplot.select(`#rect-${d.Rank}`).attr("fill", function(d) {
        return color(d.Name + ',' + d.Platform)
    });
};

/**
 * Checks if a date falls within a provided year range
 */
 function validYear(start, end, cur) {
    return (Date.parse(start) <= Date.parse(cur)) &&
        (Date.parse(cur) <= Date.parse(end));
}

/**
 * Returns a darker shade of a given color
 */
 function darkenColor(color, percentage) {
    return d3.hsl(color).darker(percentage);
}
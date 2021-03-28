let stacked_width = (MAX_WIDTH)/1.5, stacked_height = 500;

// Set up SVG object with width, height and margin
let svg_stacked_barplot = d3.select("#stacked")
    .append("svg")
    .attr("width", stacked_width)
    .attr("height", stacked_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create a linear scale for the x axis (number of occurrences)
// let x_bar = d3.scaleLinear()
//     .range([0, stacked_width - margin.left - margin.right]);

// Create a scale band for the y axis (artist / song)
// let y_bar = d3.scaleBand()
//     .range([0, stacked_height - margin.top - margin.bottom])
//     .padding(0.2);  // Improves readability

// Set up reference to count SVG group
// let countRef = svg_stacked_barplot.append("g");
// Set up reference to y axis label to update text in setData
// let y_axis_label = svg_stacked_barplot.append("g").attr("id", "y_bar_label");

// Add x-axis label
svg_stacked_barplot.append("text")
    .attr("transform",
        `translate(${(stacked_width - margin.left - margin.right) / 2},
        ${(stacked_height - margin.top - margin.bottom)})`)
    .style("text-anchor", "middle")
    .text("Regions")
    .style("font-size", 12)

// Add y-axis label
svg_stacked_barplot.append("text")
    .attr("transform", `translate(-100, ${(stacked_height - margin.top - margin.bottom) / 2})`)
    .style("text-anchor", "middle")
    .text('Genre Sales (in millions)')
    .style("font-size", 12);

// Add chart title
svg_stacked_barplot.append("text")
    .attr("transform", `translate(${(stacked_width - margin.left - margin.right) / 2}, ${-20})`)
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .text("Regional Sales Per Genre of Video Game")


/**
 * Sets the data on the stacked barplot
 */
function setStackedData() {
    let parsedData = parseStackedData(data);
    let subgroups = Object.keys(parsedData[0]).slice(1);
    
    let regions = d3.map(parsedData, function(d){
        return d.region;
    }).keys()
    
    // Add X axis
    let x_axis = d3.scaleBand()
        .domain(regions)
        .range([0, stacked_width - margin.left - margin.right])
        .padding([0.2])
    svg_stacked_barplot.append("g")
        .attr("transform", "translate(0," + (stacked_height-140) + ")")
        .call(d3.axisBottom(x_axis).tickSizeOuter(0))

    // Add Y axis
    let y_axis = d3.scaleLinear()
        .domain([0, 4500])
        .range([ stacked_height - margin.top - (margin.bottom*2), 0 ]);
    svg_stacked_barplot.append("g")
        .call(d3.axisLeft(y_axis));

    // color palette = one color per subgroup
    let color = d3.scaleOrdinal(d3.schemePaired);
    //stack the data? --> stack per subgroup
    let stackedData = d3.stack()
        .keys(subgroups)
        (parsedData)

    // When user hover
    let mouseover = function(d) {
        // what subgroup are we hovering?
        let subgroupName = d3.select(this.parentNode).datum().key; // This was the tricky part
        let subgroupValue = d.data[subgroupName];
        // Reduce opacity of all rect to 0.2
        d3.selectAll(".myRect").style("opacity", 0.2)
        // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
        d3.selectAll("."+subgroupName)
            .style("opacity", 1)
        tooltip.style("display", null);
        tooltip.style("opacity", 1);
    }
        
    // When user do not hover anymore
    let mouseout = function(d) {
        // Back to normal opacity: 0.8
        d3.selectAll(".myRect")
            .style("opacity",0.8)
        tooltip.style("display", "none");
    }

    // When user move mouse
    let mousemove = function(d) {
        let xPosition = d3.mouse(this)[0] - 15;
        let yPosition = d3.mouse(this)[1] - 25;
        tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
        tooltip.select("text").text(`${ d.data.region } sales: ${ (d[1]-d[0]).toFixed(2) } millions`);
    }

    // Draw legend
    let legend = svg_stacked_barplot.selectAll(".legend")
        .data(color.range())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(-400," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", stacked_width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) {return color.range().slice().reverse()[i];});

    legend.append("text")
        .attr("x", stacked_width + 5)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d, i) {
            return subgroups[subgroups.length - i - 1];
        });

    // Show the bars
    svg_stacked_barplot.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
        .attr("fill", function(d) { return color(d.key); })
        .attr("class", function(d){ return "myRect " + d.key }) // Add a class to each subgroup: their name
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function(d) { return d; })
        .enter().append("rect")
            .attr("x", function(d) { return x_axis(d.data.region); })
            .attr("y", function(d) { return y_axis(d[1]); })
            .attr("height", function(d) { return y_axis(d[0]) - y_axis(d[1]); })
            .attr("width", x_axis.bandwidth())
            .attr("stroke", "grey")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
    
    // Prep the tooltip bits, initial display is hidden
    let tooltip = svg_stacked_barplot.append("g")
        .attr("class", "tooltip")
        .style("display", "none");
    
    tooltip.append("rect")
        .attr("width", 160)
        .attr("height", 20)
        .attr("fill", "white")
        .style("opacity", 0.5);

    tooltip.append("text")
        .attr("x", 80)
        .attr("dy", "1.2em")
        .style("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-weight", "bold");
}

/**
 * Cleans and parses the provided data for stacked barplot
 */
function parseStackedData(data) {
    let regionalGenreSales = [
        {region: 'NA'},
        {region: 'EU'},
        {region: 'JP'},
        {region: 'Other'},
    ]
    data.forEach(d => {
        const sales = [
            parseFloat(d.NA_Sales), 
            parseFloat(d.EU_Sales), 
            parseFloat(d.JP_Sales), 
            parseFloat(d.Other_Sales)
        ];
        const genre = d.Genre;
        for (let i = 0; i<4; i++) {
            if (genre in regionalGenreSales[i]){
                regionalGenreSales[i][genre] += sales[i];
            } else {
                regionalGenreSales[i][genre] = sales[i];
            }
        }
    })

    // console.log(regionalGenreSales)
    return regionalGenreSales
}
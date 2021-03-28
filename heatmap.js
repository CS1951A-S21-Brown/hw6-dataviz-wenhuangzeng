let heatmap_width = (MAX_WIDTH)/2, heatmap_height = 1200;

// Set up SVG object with width, height and margin
let svg_heatmapt = d3.select("#heatmap")
    .append("svg")
    .attr("width", heatmap_width)
    .attr("height", heatmap_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Add x-axis label
svg_heatmapt.append("text")
    .attr("transform",
        `translate(${(heatmap_width - margin.left - margin.right) / 2},
        ${(heatmap_height - margin.top - margin.bottom)})`)
    .style("text-anchor", "middle")
    .text("Genres")
    .style("font-size", 12)

// Add y-axis label
svg_heatmapt.append("text")
    .attr("transform", `translate(-160, ${(heatmap_height - margin.top - margin.bottom) / 2})`)
    .style("text-anchor", "middle")
    .text('Publishers')
    .style("font-size", 12);

// Add chart title
svg_heatmapt.append("text")
    .attr("transform", `translate(${(heatmap_width - margin.left - margin.right) / 2}, ${-20})`)
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .text("Heatmap of Global Sales of Genres of Video Games from Publishers (with global sales over 35 millions)")


/**
 * Sets the data on the heatmap
 */
function setHeatmapData() {
    let parsedData = parseHeatmapData(data);

    // Labels of row and columns
    const uniquePublishers = parsedData[0];
    const uniqueGenres = parsedData[1];
    const heatmapData = parsedData[2];

    // Build X scales and axis:
    let x = d3.scaleBand()
        .range([ 0, heatmap_width - margin.left - margin.right + 50 ])
        .domain(uniqueGenres)
        .padding(0.1);
        svg_heatmapt.append("g")
        .attr("transform", "translate(0," + (heatmap_height - (margin.bottom*3) - margin.top) + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");

    // Build Y scales and axis:
    let y = d3.scaleBand()
        .range([ heatmap_height - margin.top - (margin.bottom*3), 0 ])
        .domain(uniquePublishers)
        .padding(0.1);
        svg_heatmapt.append("g")
        .call(d3.axisLeft(y));

    // Build color scale
    let color = d3.scaleLinear()
        .range(["white", "#69b3a2"])
        .domain([1,100])

    // create a tooltip
    let tooltip = d3.select("#heatmap")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("font-size", "12px")

    // Three function that change the tooltip when user hover / move / leave a cell
    let mouseover = function(d) {
    tooltip.style("opacity", 1)
    }
    let mousemove = function(d) {
        tooltip
            .html(`The global sales of "` + d.group + `" video games from "` + d.variable + `" is  ` + d.value.toFixed(2) + ` millions.`)
            .style("left", (d3.mouse(this)[0]+280) + "px")
            .style("top", (d3.mouse(this)[1]) + "px")
    }
    let mouseleave = function(d) {
        tooltip.style("opacity", 0)
    }

    // add the squares
    svg_heatmapt.selectAll()
        .data(heatmapData, function(d) {return d.group+':'+d.variable;})
        .enter()
        .append("rect")
            .attr("x", function(d) { return x(d.group) })
            .attr("y", function(d) { return y(d.variable) })
            .attr("width", x.bandwidth() )
            .attr("height", y.bandwidth() )
            .style("fill", function(d) { return color(d.value)} )
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

}

/**
 * Cleans and parses the provided data for heatmap
 */
function parseHeatmapData(data) {
    let publisherCol = data.map(function(d) {
        return d.Publisher
    });
    let genreCol = data.map(function(d) {
        return d.Genre
    });

    const uniquePublishers = [...new Set(publisherCol)].sort();
    const uniqueGenres = [...new Set(genreCol)];

    let heatmapObj = {}
    uniquePublishers.forEach(publisher => {
        heatmapObj[publisher] = {};
        uniqueGenres.forEach(genre => {
            heatmapObj[publisher][genre] = 0;
        })
    })
    
    data.forEach(d => {
        const globalSale = parseFloat(d.Global_Sales);
        const publisher = d.Publisher;
        const genre = d.Genre;
        heatmapObj[publisher][genre] += globalSale;
    })

    heatmapData = [];
    let newUniquePublishers = [];
    uniquePublishers.forEach(publisher => {
        let sumGenreSales = 0;
        let newHeatmapData = [];
        uniqueGenres.forEach(genre => {
            sumGenreSales += heatmapObj[publisher][genre]
            newHeatmapData.push({
                group: genre, 
                variable: publisher, 
                value: heatmapObj[publisher][genre]
            })
        })

        if (sumGenreSales >= 35) {
            heatmapData = heatmapData.concat(newHeatmapData);
            newUniquePublishers.push(publisher);
        }
    })
    // console.log(newUniquePublishers.length)
    return [newUniquePublishers, uniqueGenres, heatmapData];
}

// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 50, left: 250};
const NUM_GAMES = 20;

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
// let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
// let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
// let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

let data;
let cur_start_year = 2016;
let cur_end_year = 2017;

let slider = new Slider('#year', {});

// Load data from video_game.csv file
d3.csv("./data/video_games.csv").then(function(d) {
    data = d;
    setData(cur_start_year, cur_end_year);
    setStackedData();
    setHeatmapData();
});

// Update cur_start_year and cur_end_year on slideStop of range slider
slider.on("slideStop", function(range) {
    cur_start_year = range[0];
    cur_end_year = range[1];
    setData(cur_start_year, cur_end_year);
});
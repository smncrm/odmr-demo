import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";
import { linspace, getTextMarkData } from "./utils.js";
import { computeCentersDict, computePlots, combinePlots, computeZeroFieldSplitting, } from "./physics.js";

// Generate x values
const x = linspace(2.87 - 0.3, 2.87 + 0.3, 1000);
var nv_dict = {
    nv_111: {
        mag_angle: 0,
        ESR_centers: [0],
        plot: [0],
        },
    nv_100: {
        mag_angle: 0,
        ESR_centers: [0],
        plot: [0],
        },
    nv_010: {
        mag_angle: 0,
        ESR_centers: [0],
        plot: [0],
        },
    nv_001: {
        mag_angle: 0,
        ESR_centers: [0],
        plot: [0],
        },
}

// Function to update the plot based on new inputs
function updatePlot(magValue, temp = 300, noise = 0, xValue = 1, yValue = 1, zValue = 1, useAllAxes = false, hyperfine = false, showLabels = false) {

    let noise_centers = noise
    let noise_y = noise * 2
    let updatedY;
    let zeroFieldSplitting = computeZeroFieldSplitting(temp);
    let domainLowerLimit

    computeCentersDict(nv_dict, magValue, xValue, yValue, zValue, zeroFieldSplitting, hyperfine);
    computePlots(nv_dict, x, useAllAxes, noise_centers)
    updatedY = combinePlots(nv_dict, x, useAllAxes, noise_y)

    // Combine x and updated y into a new data array
    const updatedData = x.map((xi, i) => ({ x: xi, y: updatedY[i] }));

    // Create a new plot
    domainLowerLimit = (useAllAxes) ? 0.75 : 0.65
    
    if (showLabels) {
        var textData = getTextMarkData(nv_dict, x, updatedData, useAllAxes)
    } else {
        var textData = [{}]
    }
    const updatedPlot = Plot.plot({
        x: {
            label: "Frequency (GHz)",
            grid: true,
        },
        y: {
            label: "Fluorescence (normalised)",
            grid: true,
            domain: [domainLowerLimit, 1],
        },
        marks: [
            Plot.line(updatedData, {x: "x", y: "y", stroke: "steelblue"}),
            Plot.text(textData, {x:'x', y:'y', text: `label`, fill: 'col'})
        ]
    });

    // Replace the old plot with the new one
    const odmrdiv = document.getElementById("odmr");
    odmrdiv.innerHTML = ""; // Clear the existing plot
    odmrdiv.appendChild(updatedPlot);
}


// Add event listeners to the slider and input fields
const sliderMag = document.getElementById("slider-mag");
const manualInputMag = document.getElementById("manual-input-mag");
const sliderNoise = document.getElementById("slider-noise");
const manualInputNoise = document.getElementById("manual-input-noise");
const sliderTemp = document.getElementById("slider-temp");
const manualInputTemp = document.getElementById("manual-input-temp");
const sliderX = document.getElementById("slider-x");
const manualInputX = document.getElementById("manual-input-x");
const sliderY = document.getElementById("slider-y");
const manualInputY = document.getElementById("manual-input-y");
const sliderZ = document.getElementById("slider-z");
const manualInputZ = document.getElementById("manual-input-z");
const toggleAllAxes = document.getElementById('toggle-all-axes');
const toggleLabels = document.getElementById('toggle-labels');
// const toggleHyperfine = document.getElementById('toggle-hyperfine');

const updatePlotWithInputs = () => {
    const sliderMagValue = parseFloat(sliderMag.value);
    const sliderNoiseValue = parseFloat(sliderNoise.value);
    const sliderTempValue = parseFloat(sliderTemp.value);
    const sliderXValue = parseFloat(sliderX.value);
    const sliderYValue = parseFloat(sliderY.value);
    const sliderZValue = parseFloat(sliderZ.value);
    const useAllAxes = toggleAllAxes.checked;
    const showLabels = toggleLabels.checked;
    // temporarily fix hyperfine parameter until feature is fixed
    const hyperfine = false;
    updatePlot(sliderMagValue, sliderTempValue, sliderNoiseValue, sliderXValue, sliderYValue, sliderZValue, useAllAxes, hyperfine, showLabels);
};


[sliderMag, manualInputMag, sliderNoise, manualInputNoise, sliderTemp, manualInputTemp, sliderX, manualInputX, sliderY, manualInputY, sliderZ, manualInputZ].forEach(input => {
    input.addEventListener("input", updatePlotWithInputs);
});

// add toggleHyperfine to list when feature is fixed
[toggleAllAxes, toggleLabels].forEach(input => { input.addEventListener('change', updatePlotWithInputs); });

// Initial plot rendering with default slider value
updatePlot(parseFloat(sliderMag.value));
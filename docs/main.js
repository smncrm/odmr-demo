import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";
import { linspace } from "./utils.js";
import { multiPeakLorentzian, computeCenters, computeCentersDict, computePlots, computeZeroFieldSplitting, computeAmplitudes, computeLinewidths } from "./physics.js";

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
function updatePlot(magValue, temp = 300, noise = 0, xValue = 1, yValue = 1, zValue = 1, useAllAxes = false, hyperfine = false) {

    let centers
    let amps
    let maxContrast
    let widths
    let updatedY;
    let zeroFieldSplitting = computeZeroFieldSplitting(temp);
    let domainLowerLimit

    console.log(nv_dict)
    computeCentersDict(nv_dict, magValue, xValue, yValue, zValue, zeroFieldSplitting, hyperfine);
    console.log(nv_dict)

    if (useAllAxes) {
        centers = computeCenters(magValue, xValue, yValue, zValue, zeroFieldSplitting, hyperfine);
    } else {
        if (hyperfine) {
            centers = computeCenters(magValue, xValue, yValue, zValue, zeroFieldSplitting, hyperfine).slice(0, 6);
        } else {
            centers = computeCenters(magValue, 1, 1, 1, zeroFieldSplitting, hyperfine).slice(0, 2);
        }
    }
    maxContrast = (useAllAxes) ? -0.2 : -0.3
    widths = computeLinewidths(centers);
    computePlots(nv_dict, x, maxContrast, noise, useAllAxes)
    updatedY = nv_dict['nv_111']['plot']
    // updatedY = multiPeakLorentzian(x, amps, nv_dict['nv_111']['ESR_centers'], widths, noise);

    // Combine x and updated y into a new data array
    const updatedData = x.map((xi, i) => ({ x: xi, y: updatedY[i] }));

    // Create a new plot
    domainLowerLimit = (useAllAxes) ? 0.7 : 0.6
    const updatedPlot = Plot.plot({
        x: {
            label: "Frequency (GHz)",
            grid: true,
        },
        y: {
            label: "Fluorescence (normalised)",
            grid: true,
            // round to first decimal, but use slightly smaller number, hence the division
            domain: [domainLowerLimit, 1],
        },
        marks: [
            Plot.line(updatedData, { x: "x", y: "y", stroke: "steelblue" })
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
const xInput = document.getElementById("x-value");
const yInput = document.getElementById("y-value");
const zInput = document.getElementById("z-value");
const toggleAllAxes = document.getElementById('toggle-all-axes');
const toggleHyperfine = document.getElementById('toggle-hyperfine');

const updatePlotWithInputs = () => {
    const sliderMagValue = parseFloat(sliderMag.value);
    const sliderNoiseValue = parseFloat(sliderNoise.value);
    const sliderTempValue = parseFloat(sliderTemp.value);
    const xValue = parseFloat(xInput.value);
    const yValue = parseFloat(yInput.value);
    const zValue = parseFloat(zInput.value);
    const useAllAxes = toggleAllAxes.checked;
    const hyperfine = toggleHyperfine.checked;
    updatePlot(sliderMagValue, sliderTempValue, sliderNoiseValue, xValue, yValue, zValue, useAllAxes, hyperfine);
};


[sliderMag, manualInputMag, sliderNoise, manualInputNoise, sliderTemp, manualInputTemp, xInput, yInput, zInput].forEach(input => {
    input.addEventListener("input", updatePlotWithInputs);
});

[toggleAllAxes, toggleHyperfine].forEach(input => { input.addEventListener('change', updatePlotWithInputs); });

// Initial plot rendering with default slider value
updatePlot(parseFloat(sliderMag.value));
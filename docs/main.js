import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";
import { linspace } from "./utils.js";
import { multiPeakLorentzian, computeCenters, zeroFieldSplitting } from "./physics.js";

// Parameters
const amps = Array(8).fill(-0.1); // Amplitudes for the Lorentzian peaks
const widths = Array(8).fill(0.005); // Widths for the Lorentzian peaks

// Generate x values
const x = linspace(zeroFieldSplitting - 0.3, zeroFieldSplitting + 0.3, 1000);

// Function to update the plot based on new inputs
function updatePlot(sliderValue, noise = 0, xValue = 1, yValue = 1, zValue = 1, useAllAxes = false) {

    let centers
    let updatedY;

    if (useAllAxes) {
        centers = computeCenters(sliderValue, xValue, yValue, zValue);
        updatedY = multiPeakLorentzian(x, amps, centers, widths, noise);
    } else {
        centers = computeCenters(sliderValue, 1, 1, 1);
        updatedY = multiPeakLorentzian(x, amps.slice(0, 2), centers.slice(0, 2), widths.slice(0, 2), noise);
    }

    // Combine x and updated y into a new data array
    const updatedData = x.map((xi, i) => ({ x: xi, y: updatedY[i] }));

    // Create a new plot
    const updatedPlot = Plot.plot({
        x: {
            label: "Frequency (GHz)",
            grid: true,
        },
        y: {
            label: "Fluorescence (normalised)",
            grid: true,
            domain: [0.4, 1],
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
const xInput = document.getElementById("x-value");
const yInput = document.getElementById("y-value");
const zInput = document.getElementById("z-value");
const toggleSwitch = document.getElementById('toggle-switch');

const updatePlotWithInputs = () => {
    const sliderMagValue = parseFloat(sliderMag.value);
    const sliderNoiseValue = parseFloat(sliderNoise.value);
    const xValue = parseFloat(xInput.value);
    const yValue = parseFloat(yInput.value);
    const zValue = parseFloat(zInput.value);
    const useAllAxes = toggleSwitch.checked;
    console.log("plot updated");
    updatePlot(sliderMagValue, sliderNoiseValue, xValue, yValue, zValue, useAllAxes);
};


[sliderMag, manualInputMag, sliderNoise, manualInputNoise, xInput, yInput, zInput].forEach(input => {
    input.addEventListener("input", updatePlotWithInputs);
});

toggleSwitch.addEventListener('change', updatePlotWithInputs);

// Initial plot rendering with default slider value
updatePlot(parseFloat(sliderMag.value));
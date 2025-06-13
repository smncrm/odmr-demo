import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";
import { linspace } from "./utils.js";
import { multiPeakLorentzian, computeCenters, zeroFieldSplitting } from "./physics.js";

// Parameters
const amps = [-0.1, -0.1, -0.1, -0.1, -0.1, -0.1, -0.1, -0.1]; // Amplitudes for the Lorentzian peaks
const widths = [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01]; // Widths for the Lorentzian peaks

// Generate x values
const x = linspace(zeroFieldSplitting - 0.3, zeroFieldSplitting + 0.3, 1000);

// Function to update the plot based on new inputs
function updatePlot(sliderValue, xValue = 1, yValue = 1, zValue = 1) {
    // Recalculate centers based on the slider value
    const centers = computeCenters(sliderValue, xValue, yValue, zValue);

    // Recalculate Lorentzian values using the slider value
    const updatedY = multiPeakLorentzian(x, amps, centers, widths);

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
const slider = document.getElementById("slider");
const xInput = document.getElementById("x-value");
const yInput = document.getElementById("y-value");
const zInput = document.getElementById("z-value");

const updatePlotWithInputs = () => {
    const sliderValue = parseFloat(slider.value);
    const xValue = parseFloat(xInput.value);
    const yValue = parseFloat(yInput.value);
    const zValue = parseFloat(zInput.value);
    updatePlot(sliderValue, xValue, yValue, zValue);
};

slider.addEventListener("input", updatePlotWithInputs);
[xInput, yInput, zInput].forEach(input => {
    input.addEventListener("input", updatePlotWithInputs);
});

// Initial plot rendering with default slider value
updatePlot(parseFloat(slider.value));
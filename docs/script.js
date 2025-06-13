import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";
import { linspace } from "./utils.js";
import { multiPeakLorentzian, computeCenters, zeroFieldSplitting } from "./physics.js";

// Parameters
const amps = [-0.3, -0.3];
const widths = [0.01, 0.01];

// Generate x values
const x = linspace(zeroFieldSplitting - 0.3, zeroFieldSplitting + 0.3, 1000);

// Function to update the plot based on new inputs
function updatePlot(sliderValue) {
    // Recalculate centers based on the slider value
    const centers = computeCenters(sliderValue);
    // Log the centers for debugging
    console.log("Centers:", centers);
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


// Add an event listener to the slider
const slider = document.getElementById("slider");
slider.addEventListener("input", (event) => {
    const sliderValue = parseFloat(event.target.value); // Get the slider value
    updatePlot(sliderValue); // Update the plot with the new slider value
});

// Initial plot rendering with default slider value
updatePlot(parseFloat(slider.value));
import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";

// Function to generate an array of evenly spaced numbers (similar to np.linspace)
function linspace(start, stop, num) {
    const step = (stop - start) / (num - 1);
    return Array.from({ length: num }, (_, i) => start + i * step);
}

// Single peak Lorentzian function
function singlePeakLorentzian(x, amplitude, center, width, constant = 1) {
    // x is expected to be an array
    return x.map(value => amplitude * (width ** 2 / ((value - center) ** 2 + width ** 2)) + constant);
}

// Multi-peak Lorentzian function
function multiPeakLorentzian(x, amplitudes, centers, widths, constant = 1) {
    // Create an array of ones with the same length as x, multiplied by the constant
    let result = x.map(() => constant);

    // Add each Lorentzian peak to the result
    amplitudes.forEach((amplitude, i) => {
        const center = centers[i];
        const width = widths[i];
        const singlePeak = singlePeakLorentzian(x, amplitude, center, width, 0);
        result = result.map((value, index) => value + singlePeak[index]);
    });

    return result;
}

// Function to update the centers based on the magnetic field strength
function computeCenters(magneticFieldStrength) {
    // Update each center by multiplying with the slider value
    return [2.87 - magneticFieldStrength, 2.87 + magneticFieldStrength];
}


// Function to update the plot based on new inputs
function updatePlot(sliderValue) {
    // Recalculate centers based on the slider value
    const centers = computeCenters(sliderValue);

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

// Parameters
const amps = [-0.3, -0.3];
const centers = computeCenters(0.1);
const widths = [0.01, 0.01];

// Generate x values
const x = linspace(2.7, 3.1, 1000);

// Calculate Lorentzian values
const y = multiPeakLorentzian(x, amps, centers, widths);

// Combine x and y into a data array
const data = x.map((xi, i) => ({ x: xi, y: y[i] }));

// Plot using Observable Plot
const odmrplot = Plot.plot({
    x: {
        label: "Frequency (GHz)",
        grid: true,
    },
    y: {
        label: "Fluorescence (normalised)",
        grid: true,
        domain: [0.66, 1],
    },
    marks: [
        Plot.line(data, { x: "x", y: "y", stroke: "steelblue" })
    ]
});

// Append the plot to the div
const odmrdiv = document.getElementById("odmr");
odmrdiv.appendChild(odmrplot);

// Add an event listener to the slider
const slider = document.getElementById("slider");
slider.addEventListener("input", (event) => {
    const sliderValue = parseFloat(event.target.value); // Get the slider value
    updatePlot(sliderValue); // Update the plot with the new slider value
});

// Initial plot rendering with default slider value
updatePlot(parseFloat(slider.value));
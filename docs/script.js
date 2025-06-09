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

// Parameters
const amps = [-0.3, -0.3];
const centers = [2.83, 2.91];
const widths = [0.01, 0.01];

// Generate x values
const x = linspace(2.7, 3.1, 1000);

// Calculate Lorentzian values
const y = multiPeakLorentzian(x, amps, centers, widths);

// Combine x and y into a data array
const data = x.map((xi, i) => ({ x: xi, y: y[i] }));

// Calculate the min and max of the y values
const yMin = Math.min(...y);
const yMax = Math.max(...y);

// Add some padding to the y-axis range
const yPadding = 0.2 * (yMax - yMin); // 20% padding
const yDomain = [yMin - yPadding, yMax + yPadding];

// Plot using Observable Plot
const odmrplot = Plot.plot({
    x: { label: "Frequency (GHz)" },
    y: { label: "Fluorescence (normalised)", grid: true, domain: yDomain },
    marks: [
        Plot.line(data, { x: "x", y: "y", stroke: "steelblue" })
    ]
});

// Append the plot to the div
const odmrdiv = document.getElementById("odmr");
odmrdiv.appendChild(odmrplot);
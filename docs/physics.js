// Single peak Lorentzian function
function singlePeakLorentzian(x, amplitude, center, width, constant = 1) {
    // x is expected to be an array
    return x.map(value => amplitude * (width ** 2 / ((value - center) ** 2 + width ** 2)) + constant);
}

// Multi-peak Lorentzian function
export function multiPeakLorentzian(x, amplitudes, centers, widths, constant = 1) {
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
// Parameters
export const zeroFieldSplitting = 2.87; // GHz
const gyromagneticRatio = 28.0; // GHz/T
const nv_111 = [1, 1, 1];
const nv_100 = [1, -1, -1];
const nv_010 = [-1, 1, -1];
const nv_001 = [-1, -1, 1];
const nv_axes = [nv_111, nv_100, nv_010, nv_001];

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

// Function to compute the centers based on the magnetic field strength (in mT)
export function computeCenters(magneticFieldStrength) {
    const delta = gyromagneticRatio * magneticFieldStrength / 1000;
    return [zeroFieldSplitting - delta, zeroFieldSplitting + delta];
}

// Function to compute the factor for projecting onto the NV axes, 
// i.e. the cosine of the angle between the magnetic field vector and the NV axes
export function computeProjectionFactor(vector) {
    const normalizedInnerProducts = nv_axes.map(axis => {
        const dotProduct = vector.reduce((sum, value, index) => sum + value * axis[index], 0);
        const norm = Math.sqrt(vector.reduce((sum, value) => sum + value ** 2, 0));
        return dotProduct / norm / Math.sqrt(3); // Normalize by the length of the vector and the NV axis (which is always sqrt(3))
    });
    return normalizedInnerProducts.map(Math.abs);
}
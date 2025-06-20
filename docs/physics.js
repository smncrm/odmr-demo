import { gaussianRandom, arcos } from './utils.js';

// Parameters
const gyromagneticRatio = 28.0; // GHz/T
const nv_111 = [1, 1, 1];
const nv_100 = [1, -1, -1];
const nv_010 = [-1, 1, -1];
const nv_001 = [-1, -1, 1];
const nv_axes = [nv_111, nv_100, nv_010, nv_001];
const hyperfineSplitting = 0.0022; // GHz, hyperfine splitting based on Nitrogen nuclei

// Single peak Lorentzian function
function singlePeakLorentzian(x, amplitude, center, width, noise = 0, constant = 1) {
    // x is expected to be an array
    return x.map(value => amplitude * (width ** 2 / ((value - center) ** 2 + width ** 2)) + constant + noise / 1000 * gaussianRandom(0, 1));
}

// Multi-peak Lorentzian function
export function multiPeakLorentzian(x, amplitudes, centers, widths, noise = 0, constant = 1) {
    // Create an array of ones with the same length as x, multiplied by the constant
    let result = x.map(() => constant);

    // Add each Lorentzian peak to the result
    amplitudes.forEach((amplitude, i) => {
        const center = centers[i] + noise / 1000 * gaussianRandom(0, 1); // Add noise to the center
        const width = widths[i];
        const singlePeak = singlePeakLorentzian(x, amplitude, center, width, noise, 0);
        result = result.map((value, index) => value + singlePeak[index]);
    });

    return result;
}

// Function to compute the factor for projecting onto the NV axes, 
// i.e. the cosine of the angle between the magnetic field vector and the NV axes
export function computeAngles(vector) {
    const normalizedInnerProducts = nv_axes.map(axis => {
        const dotProduct = vector.reduce((sum, value, index) => sum + value * axis[index], 0);
        const norm = Math.sqrt(vector.reduce((sum, value) => sum + value ** 2, 0));
        return dotProduct / norm / Math.sqrt(3); // Normalize by the length of the vector and the NV axis (which is always sqrt(3))
    });
    return normalizedInnerProducts.map(arcos)
}

// Function to update the centers based on the magnetic field strength (mT) and orientation
export function computeCenters(magneticFieldStrength, x = 1, y = 1, z = 1, zeroFieldSplitting = 2.87, hyperfine = false) {
    const mag_field_vector = [x, y, z];
    const angles = computeAngles(mag_field_vector);

    let centers = [];
    angles.forEach(angle => {
        const frequencies = computeESRFrequencies(magneticFieldStrength / 1000, angle, zeroFieldSplitting);
        centers = centers.concat(frequencies);
    });
    if (hyperfine) {
        centers = centers.map(center => [center - hyperfineSplitting, center, center + hyperfineSplitting]);
        centers = centers.flat();
    }

    return centers;
}

// Function to compute the zero-field splitting energy levels based on the temperature in Kelvin
export function computeZeroFieldSplitting(t) {
    // approximation taken from https://journals.aps.org/prx/abstract/10.1103/PhysRevX.2.031001
    return 2.8697 + 0.000097 * t - 0.00000037 * t ** 2 + 0.00000000017 * t ** 3
}

// function to compute the eigenvalues of the effective Hamiltonian without hyperfine splitting
function computeEigValuesHamil(b, theta, D) {
    const B = gyromagneticRatio * b;
    const p = -(1 / 3 * Math.pow(D, 2) + Math.pow(B, 2));
    const q = -1 / 2 * D * Math.pow(B, 2) * Math.cos(2 * theta) - 1 / 6 * D * Math.pow(B, 2) + 2 / 27 * Math.pow(D, 3);
    const l0 = (2 / Math.sqrt(3)) * Math.sqrt(-p) * Math.cos(
        (1 / 3) * arcos((3 * Math.sqrt(3) * q) / (2 * Math.sqrt(Math.pow(-p, 3))))
    );
    const l1 = (2 / Math.sqrt(3)) * Math.sqrt(-p) * Math.cos(
        (1 / 3) * arcos((3 * Math.sqrt(3) * q) / (2 * Math.sqrt(Math.pow(-p, 3)))) - (2 * Math.PI) / 3
    );
    const l2 = (2 / Math.sqrt(3)) * Math.sqrt(-p) * Math.cos(
        (1 / 3) * arcos((3 * Math.sqrt(3) * q) / (2 * Math.sqrt(Math.pow(-p, 3)))) - (4 * Math.PI) / 3
    );
    return [l0, l1, l2];
}

// Function to compute the ESR frequencies based on the magnetic field strength, angle, and zero-field splitting
export function computeESRFrequencies(magneticFieldStrength, theta, zeroFieldSplitting = 2.87) {
    const eigValues = computeEigValuesHamil(magneticFieldStrength, theta, zeroFieldSplitting);
    return [eigValues[0] - eigValues[1],
        eigValues[0] - eigValues[2]
    ];
}

// Function to compute the amplitudes based on the centers
export function computeAmplitudes(centers) {
    // For simplicity, assume the same amplitude for all centers
    // To be modified in the future.
    return centers.map(() => -0.1);
}

// Function to compute the linewidths based on the centers
export function computeLinewidths(centers) {
    // For simplicity, assume a constant linewidth
    return centers.map(() => 0.005);
}
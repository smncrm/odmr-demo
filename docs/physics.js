import { gaussianRandom, arcos } from './utils.js';

// Parameters
const gyromagneticRatio = 28.0; // GHz/T
const nv_111 = [1, 1, 1];
const nv_100 = [1, -1, -1];
const nv_010 = [-1, 1, -1];
const nv_001 = [-1, -1, 1];
const nv_axes = [nv_111, nv_100, nv_010, nv_001];
const hyperfineSplitting = 0.0022; // GHz, hyperfine splitting based on Nitrogen nuclei
const linewidth = 0.007 

// Single peak Lorentzian function
function singlePeakLorentzian(x, amplitude, center, width) {
    // x is expected to be an array
    return x.map(value => amplitude/Math.PI * width / ((value - center) ** 2 + (width ** 2)));
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

// Function to update the centers based on the magnetic field strength (mT) and orientation
export function computeCentersDict(nv_dict, magneticFieldStrength, x = 1, y = 1, z = 1, zeroFieldSplitting = 2.87, hyperfine = false) {
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
    
    let numCentersPerAxis = (hyperfine) ? 6 : 2;

    for (let index = 0; index < 4; index++) {
        let axis = Object.keys(nv_dict)[index];
        nv_dict[axis]['mag_angle'] = angles[index];
        nv_dict[axis]['ESR_centers'] = centers.slice(index * numCentersPerAxis, (index+1)*numCentersPerAxis);
    }
    
    return centers;
}

// Function to compute the plots for each nv axis.
export function computePlots(nv_dict, x, maxContrast, noise_centers = 0) {
    
    let amplitude = maxContrast * Math.PI * linewidth; 

    for (const axis in nv_dict) {
        let result = x.map(() => 0);
        
        // Compute and sum up the Lorentzian for each ESR frequency
        nv_dict[axis]['ESR_centers'].forEach((ESR_center) => {
            let center = ESR_center + noise_centers / 1000 * gaussianRandom(0, 1); // Add noise to the center
            let singlePeak = singlePeakLorentzian(x, amplitude, center, linewidth);
            result = result.map((value, index) => value + singlePeak[index]);
        })
        
        // Scale the result to match the desired maximum contrast
        let minValue = Math.min(...result);
        console.log('min Value in lorentzian ' + minValue)
        nv_dict[axis]['plot'] = result.map((value) => value * maxContrast/minValue);
    }
}

// Function to combine the plots of each nv axis into one y vector
export function combinePlots(nv_dict, x, useAllAxes, noise_y = 0) {
    let result = x.map(() => 0);
    
    const numAxes = (useAllAxes) ? 4 : 1;

    for (let ix = 0; ix < numAxes; ix++) {
        let axis = Object.keys(nv_dict)[ix]
        result = result.map((value, ix) => value + nv_dict[axis]['plot'][ix]);
    }

    // Translate to have upper limit at 1
    result = result.map((value) => value + 1);

    // Add noise and scale the result to still have max value at y=1
    if (noise_y) {
        console.log("yes noise if")
        result = result.map((value) => value + noise_y / 1000 * gaussianRandom(0, 1));
        let maxValue = Math.max(...result);
        result = result.map((value) => value/maxValue);
    }

    return result
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

    const numCenters = centers.length
    const maxContrast = (numCenters == 2) ? 0.3 : 0.2;
    const scaling = computeScaling(centers[0], centers[1])
    return centers.map(() => - maxContrast * Math.PI * linewidth * scaling);
}

// Function to compute the scaling factor of Lorentzians for ESR frequencies belonging to the same NV-axis
export function computeScaling(esr_neg, esr_pos) {
    // When adding two Lorentzians, we still want the max contrast to stay the same, so we scale
    // them dependend on the distance between the centers of the Lorentzians.
    const delta = Math.abs(esr_pos - esr_neg)
    const width = 2*linewidth/(delta + 1)
    return - width/2 * width/(delta**2+width**2) + 1
}

// Function to compute the linewidths based on the centers
export function computeLinewidths(centers) {
    // For simplicity, assume a constant linewidth
    return centers.map(() => linewidth);
}
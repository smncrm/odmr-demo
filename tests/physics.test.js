import { multiPeakLorentzian, computeProjectionFactor, computeCenters, computeZeroFieldSplitting, computeESRFrequencies, computeAmplitudes } from '../docs/physics.js';
import { linspace } from '../docs/utils.js';

describe('multiPeakLorentzian', () => {
    it('should return array of correct size', () => {
        const centers = [0, 1];
        const amplitudes = [1, 1];
        const widths = [1, 1];
        const xValues = linspace(-5, 5, 100); // Generate 100 points between -5 and 5
        const results = multiPeakLorentzian(xValues, amplitudes, centers, widths);
        expect(results).toHaveLength(100);
    });
});


describe('computeCenters', () => {
    it('should give 8 values', () => {
        const magneticFieldStrength = 5; // Example value in mT
        const x = 1; // Example x component of the magnetic field vector
        const y = 1; // Example y component of the magnetic field vector
        const z = 1; // Example z component of the magnetic field vector
        const centers = computeCenters(magneticFieldStrength, x, y, z);
        expect(centers).toHaveLength(8); // Should return 2 centers for each NV axis
    });

    it('should give 24 values when using hyperfine splitting', () => {
        const magneticFieldStrength = 5; // Example value in mT
        const x = 1; // Example x component of the magnetic field vector
        const y = 1; // Example y component of the magnetic field vector
        const z = 1; // Example z component of the magnetic field vector
        const centers = computeCenters(magneticFieldStrength, x, y, z, undefined, true);
        expect(centers).toHaveLength(24); // Should return 6 centers for each NV axis
    });

    it('should compute centers based on magnetic field strength', () => {
        const magneticFieldStrength = 5; // Example value in mT
        const x = 1; // Example x component of the magnetic field vector
        const y = 1; // Example y component of the magnetic field vector
        const z = 1; // Example z component of the magnetic field vector
        const centers = computeCenters(magneticFieldStrength, x, y, z);
        expect(centers[0]).toBeCloseTo(2.73, 3); // Check first center
        expect(centers[1]).toBeCloseTo(3.01, 3); // Check second center
        expect(centers[2]).toBeCloseTo(2.832, 3);
        expect(centers[3]).toBeCloseTo(2.926, 3);
        expect(centers[4]).toBeCloseTo(2.832, 3);
        expect(centers[5]).toBeCloseTo(2.926, 3);
        expect(centers[6]).toBeCloseTo(2.832, 3);
        expect(centers[7]).toBeCloseTo(2.926, 3);
    })
})

describe('computeZeroFieldSplitting', () => {
    it('should return 2.87 at room temperature (300K)', () => {
        expect(computeZeroFieldSplitting(300)).toBeCloseTo(2.87, 2); // Check if it's approximately 2.87 GHz
    });
})

describe('computeESRFrequencies', () => {
    it('should return D for when given 0 magnetic field', () => {
        const b = 0; // Magnetic field strength
        const theta = 0; // Angle
        const D = 2.87; // Zero-field splitting
        expect(computeESRFrequencies(b, theta, D)[0]).toBeCloseTo(D, 3);
        expect(computeESRFrequencies(b, theta, D)[1]).toBeCloseTo(D, 3);
    });

    it('should work for when given 0.01 magnetic field and 0 angle', () => {
        const b = 0.01; // Magnetic field strength
        const theta = 0; // Angle
        const D = 2.87; // Zero-field splitting
        expect(computeESRFrequencies(b, theta, D)[0]).toBeCloseTo(2.59, 3);
        expect(computeESRFrequencies(b, theta, D)[1]).toBeCloseTo(3.15, 3);
    });

    it('should work for when given 0.02 magnetic field and pi/4 angle', () => {
        const b = 0.02; // Magnetic field strength
        const theta = Math.PI / 4; // Angle
        const D = 2.87; // Zero-field splitting
        expect(computeESRFrequencies(b, theta, D)[0]).toBeCloseTo(2.5587, 3);
        expect(computeESRFrequencies(b, theta, D)[1]).toBeCloseTo(3.3451, 3);
    });
})

describe('computeAmplitudes', () => {
    it('should return an array of the correct length', () => {
        const centers = Array(8).fill(0);
        expect(computeAmplitudes(centers)).toHaveLength(centers.length);
    });
})
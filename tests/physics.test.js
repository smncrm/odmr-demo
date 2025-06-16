import { multiPeakLorentzian, computeProjectionFactor, computeCenters, zeroFieldSplitting } from '../docs/physics.js';
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

describe('computeProjectionFactor', () => {
    it('should compute projection factors for a given vector', () => {
        const vector = [1, 1, 1]; // Example vector
        const expectedFactors = [1, 0.333, 0.333, 0.333]; // Expected projection factors (approx)
        const results = computeProjectionFactor(vector);
        expect(results[0]).toBeCloseTo(expectedFactors[0], 3);
        expect(results[1]).toBeCloseTo(expectedFactors[1], 3);
        expect(results[2]).toBeCloseTo(expectedFactors[2], 3);
        expect(results[3]).toBeCloseTo(expectedFactors[3], 3);
    });
});

describe('computeCenters', () => {
    it('should give 8 values for centers', () => {
        const magneticFieldStrength = 5; // Example value in mT
        const x = 1; // Example x component of the magnetic field vector
        const y = 1; // Example y component of the magnetic field vector
        const z = 1; // Example z component of the magnetic field vector
        const centers = computeCenters(magneticFieldStrength, x, y, z);
        expect(centers).toHaveLength(8); // Should return 2 centers for each NV axis
    });

    it('should compute centers based on magnetic field strength', () => {
        const magneticFieldStrength = 5; // Example value in mT
        const x = 1; // Example x component of the magnetic field vector
        const y = 1; // Example y component of the magnetic field vector
        const z = 1; // Example z component of the magnetic field vector
        const centers = computeCenters(magneticFieldStrength, x, y, z);
        expect(centers[0]).toBeCloseTo(2.87 + (28 * magneticFieldStrength / 1000), 3); // Check first center
        expect(centers[1]).toBeCloseTo(2.87 - (28 * magneticFieldStrength / 1000), 3); // Check second center
        expect(centers[2]).toBeCloseTo(2.87 + (28 * 0.333 * magneticFieldStrength / 1000), 3);
        expect(centers[3]).toBeCloseTo(2.87 - (28 * 0.333 * magneticFieldStrength / 1000), 3);
        expect(centers[4]).toBeCloseTo(2.87 + (28 * 0.333 * magneticFieldStrength / 1000), 3);
        expect(centers[5]).toBeCloseTo(2.87 - (28 * 0.333 * magneticFieldStrength / 1000), 3);
        expect(centers[6]).toBeCloseTo(2.87 + (28 * 0.333 * magneticFieldStrength / 1000), 3);
        expect(centers[7]).toBeCloseTo(2.87 - (28 * 0.333 * magneticFieldStrength / 1000), 3);
    })
})

describe('zeroFieldSplitting', () => {
    it('should return 2.87 at room temperature (300K)', () => {
        expect(zeroFieldSplitting(300)).toBeCloseTo(2.87, 2); // Check if it's approximately 2.87 GHz
    });
})
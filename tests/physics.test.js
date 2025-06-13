import { multiPeakLorentzian, computeProjectionFactor } from '../docs/physics.js';
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
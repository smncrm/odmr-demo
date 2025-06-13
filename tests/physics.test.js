import { multiPeakLorentzian } from '../docs/physics.js';
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
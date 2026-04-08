// Function to generate an array of evenly spaced numbers (similar to np.linspace)
export function linspace(start, stop, num) {
    const step = (stop - start) / (num - 1);
    return Array.from({ length: num }, (_, i) => start + i * step);
}

export function getIndexInLinspace(x, linspaced) {
    const steps = linspaced.length;
    const step = (linspaced[steps-1] - linspaced[0])/(steps - 1);
    const center_ix = Math.round(linspaced.length / 2);

    return Math.round((x - linspaced[center_ix])/step + center_ix)
}

// Function to enforce minimum and maximum values on an input element
export function enforceMinMax(el) {
    if (el.value != "") {
        if (parseInt(el.value) < parseInt(el.min)) {
            el.value = el.min;
        }
        if (parseInt(el.value) > parseInt(el.max)) {
            el.value = el.max;
        }
    }
}

// Standard Normal variate using Box-Muller transform.
export function gaussianRandom(mean = 0, stdev = 1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

// Function to compute the arccosine of a value with checking for float rounding errors
export function arcos(value, precision = 6) {
    if (value > 1 && value <= 1 + Math.pow(10, -precision)) {
        value = 1;
    }
    if (value < -1 && value >= -1 - Math.pow(10, -precision)) {
        value = -1;
    }
    // Ensure the value is within the valid range for acos
    if (value < -1 || value > 1) {
        throw new RangeError("Value must be in the range [-1, 1]");
    }
    return Math.acos(value);
}

// Function to create a data array containing {x, y, text} for labelling the dips
export function getTextMarkData(nv_dict, x, updatedData, useAllAxes=false) {
    var d = [];
    for (const axis in nv_dict) {
        let esr_min = nv_dict[axis]['ESR_centers'][0]; 
        let esr_pos = nv_dict[axis]['ESR_centers'][1];
        if (esr_min.toFixed(3) == esr_pos.toFixed(3)) {
            let ix = getIndexInLinspace(esr_min, x);
            let y = updatedData[ix]['y'];
            d.push({x: nv_dict[axis]['ESR_centers'][0]+0.02, y: y, label: axis});
        } else {
            let ix_min =  getIndexInLinspace(esr_min, x);
            let ix_pos =  getIndexInLinspace(esr_pos, x);
            let y_min = updatedData[ix_min]['y'].toFixed(2);
            let y_pos = updatedData[ix_pos]['y'].toFixed(2);
            d.push({x: nv_dict[axis]['ESR_centers'][0]-0.02, y: y_min, label: axis+'-'});
            d.push({x: nv_dict[axis]['ESR_centers'][1]+0.03, y: y_pos, label: axis+'+'});
        }
        if (!useAllAxes) {
            break
        }
    }

    return d
}
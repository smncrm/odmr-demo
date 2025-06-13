// Function to generate an array of evenly spaced numbers (similar to np.linspace)
export function linspace(start, stop, num) {
    const step = (stop - start) / (num - 1);
    return Array.from({ length: num }, (_, i) => start + i * step);
}
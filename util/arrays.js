/**
 * Compares two arrays to determine if they contain the same values, regardless of order.
 *
 * @param {Array} arr1 - The first array to compare.
 * @param {Array} arr2 - The second array to compare.
 * @returns {boolean} - Returns 'true' if both arrays have the same values in any order; 'false' otherwise.
 *
 * @example
 * // Example usage
 * arraysHaveSameValues([1, 2, 3], [3, 2, 1]); // returns true
 * arraysHaveSameValues([1, 2, 3], [4, 5, 6]); // returns false
 */
exports.arraysHaveSameValues = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false; // Check if arrays have the same length
  return arr1.slice().sort().join(",") === arr2.slice().sort().join(","); // Sort and compare array contents
};

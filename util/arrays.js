exports.arraysHaveSameValues = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  return arr1.slice().sort().join(",") === arr2.slice().sort().join(",");
};

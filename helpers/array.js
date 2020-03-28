
// https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

export {
  onlyUnique
};

/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) {
    return string;
  }
  const arr = string.split('');
  const resArr = [];
  let counter = 0;
  let letter = '';
  arr.forEach(item => {
    if (item !== letter) {
      letter = item;
      counter = 0;
    }
    if (counter < size) {
      resArr.push(letter);
    }
    counter++;
  });
  return resArr.join('');
}

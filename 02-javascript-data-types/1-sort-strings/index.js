/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  return [...arr].sort(function(a, b) {
    switch (param) {
    case 'desc' : 
      return b.localeCompare(a, ['ru', 'en'], {caseFirst: 'upper'});
    case 'asc': 
      return a.localeCompare(b, ['ru', 'en'], {caseFirst: 'upper'});
    default: 
      return 0;  
    }
  });
}

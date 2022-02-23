import {sha256} from 'js-sha256';

export function getShaLuhn(entry: string) {
  const value = sha256.array(entry).join('');
  let sum = 0;
  for (let n = 0; n < value.length; n++) {
    let sumVal = parseInt(value[n], 10);
    if (n % 2 === 0) {
      sumVal *= 2;
      if (sumVal > 10) {
        sumVal -= 9;
      }
    }
    sum += sumVal;
  }
  return (entry += (sum * 9) % 10);
}

export function validateShaLuhn(entry: string) {
  console.log('shah', entry, getShaLuhn(entry.slice(0, entry.length - 1)));
  return (
    entry.length > 0 && entry === getShaLuhn(entry.slice(0, entry.length - 1))
  );
}

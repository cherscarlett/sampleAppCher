import {validateShaLuhn} from './shahLuhn';

export function validateLotNumber(lotNumber: string) {
  if (validateShaLuhn(lotNumber) || lotNumber === '0000') {
    return lotNumber;
  }
}

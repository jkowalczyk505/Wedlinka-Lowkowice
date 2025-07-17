export const isPostalCodeValid = (code) => /^\d{2}-\d{3}$/.test(code);

export const parsePostalCodeToDigits = (code) =>
  /^\d{2}-\d{3}$/.test(code)
    ? code.replace("-", "").split("")
    : ["", "", "", "", ""];

export const joinPostalCodeDigits = (digits) =>
  `${digits[0]}${digits[1]}-${digits[2]}${digits[3]}${digits[4]}`;

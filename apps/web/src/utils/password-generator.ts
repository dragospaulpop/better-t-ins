/**
 * Modern password generator utility
 * Adapted from https://github.com/bermi/password-generator
 * Original Copyright(c) 2011-2020 Bermi Ferrer <bermi@bermilabs.com>
 * MIT Licensed
 */

const VOWEL_PATTERN = /[aeiou]$/i;
const CONSONANT_PATTERN = /[bcdfghjklmnpqrstvwxyz]$/i;
// Allow: lowercase, uppercase, digits, and specific special characters
// Exclude: I, l, O (ambiguous letters) and 0 (ambiguous digit)
const DEFAULT_PATTERN = /[a-zA-Z0-9!@#$%^&*()]/;
const DEFAULT_LENGTH = 16;
const CHAR_CODE_START = 33;
const CHAR_CODE_END = 126;
const BYTE_MAX = 256;
const OTHER_CHARS_PROBABILITY = 25;
const PROBABILITY_MAX = 100;

// Characters to exclude (ambiguous: I, l, O, 0)
const EXCLUDED_CHARS = new Set(["I", "l", "O", "0"]);

// Character group patterns
const LOWERCASE_PATTERN = /[a-z]/;
const UPPERCASE_PATTERN = /[A-Z]/;
const DIGIT_PATTERN = /[1-9]/;
const SPECIAL_CHAR_PATTERN = /[!@#$%^&*()]/;

/**
 * Generates a secure random number between min (inclusive) and max (exclusive)
 * using the Web Crypto API
 */
function getSecureRandom(min: number, max: number): number {
  const range = max - min;
  const maxValid = BYTE_MAX - (BYTE_MAX % range);
  const arr = new Uint8Array(1);

  let value: number;
  do {
    crypto.getRandomValues(arr);
    value = arr[0];
  } while (value >= maxValid);

  return min + (value % range);
}

/**
 * Categorizes valid characters into groups
 */
function categorizeChars(validChars: string[]): {
  lowercase: string[];
  uppercase: string[];
  digits: string[];
  special: string[];
} {
  return {
    lowercase: validChars.filter((char) => LOWERCASE_PATTERN.test(char)),
    uppercase: validChars.filter((char) => UPPERCASE_PATTERN.test(char)),
    digits: validChars.filter((char) => DIGIT_PATTERN.test(char)),
    special: validChars.filter((char) => SPECIAL_CHAR_PATTERN.test(char)),
  };
}

/**
 * Checks which character groups are present in a password
 */
function checkGroupsPresent(password: string): {
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasDigits: boolean;
  hasSpecial: boolean;
} {
  return {
    hasLowercase: LOWERCASE_PATTERN.test(password),
    hasUppercase: UPPERCASE_PATTERN.test(password),
    hasDigits: DIGIT_PATTERN.test(password),
    hasSpecial: SPECIAL_CHAR_PATTERN.test(password),
  };
}

/**
 * Ensures password contains at least one character from each available group
 */
function ensureAllGroups(
  password: string,
  charGroups: ReturnType<typeof categorizeChars>
): string {
  const groups = checkGroupsPresent(password);
  const passwordArray = password.split("");
  const missingGroups: Array<keyof typeof groups> = [];

  if (!groups.hasLowercase && charGroups.lowercase.length > 0) {
    missingGroups.push("hasLowercase");
  }
  if (!groups.hasUppercase && charGroups.uppercase.length > 0) {
    missingGroups.push("hasUppercase");
  }
  if (!groups.hasDigits && charGroups.digits.length > 0) {
    missingGroups.push("hasDigits");
  }
  if (!groups.hasSpecial && charGroups.special.length > 0) {
    missingGroups.push("hasSpecial");
  }

  // Replace random characters to include missing groups
  for (const missingGroup of missingGroups) {
    if (passwordArray.length === 0) {
      break;
    }

    // Find a random position to replace
    const replaceIndex = getSecureRandom(0, passwordArray.length);
    let replacementChar: string;

    switch (missingGroup) {
      case "hasLowercase": {
        replacementChar =
          charGroups.lowercase[getSecureRandom(0, charGroups.lowercase.length)];
        break;
      }
      case "hasUppercase": {
        replacementChar =
          charGroups.uppercase[getSecureRandom(0, charGroups.uppercase.length)];
        break;
      }
      case "hasDigits": {
        replacementChar =
          charGroups.digits[getSecureRandom(0, charGroups.digits.length)];
        break;
      }
      case "hasSpecial": {
        replacementChar =
          charGroups.special[getSecureRandom(0, charGroups.special.length)];
        break;
      }
      default: {
        continue;
      }
    }

    passwordArray[replaceIndex] = replacementChar;
  }

  return passwordArray.join("");
}

/**
 * Gets a random character that matches the given pattern
 */
function getRandomMatchingChar(pattern: RegExp, validChars: string[]): string {
  const matchingChars = validChars.filter((char) => pattern.test(char));

  if (matchingChars.length === 0) {
    throw new Error(
      `Could not find characters that match the password pattern ${pattern}. ` +
        "Patterns must match individual characters, not the password as a whole."
    );
  }

  return matchingChars[getSecureRandom(0, matchingChars.length)];
}

/**
 * Generates a memorable password character that respects the pattern
 * Tries to alternate between consonants and vowels when possible, but allows
 * other characters (uppercase, digits, special chars) based on the pattern
 */
function generateMemorableChar(
  currentPrefix: string,
  validChars: string[]
): string {
  // Build character sets from valid chars
  const vowels = validChars.filter(
    (char) => char.length === 1 && VOWEL_PATTERN.test(char.toLowerCase())
  );
  const consonants = validChars.filter(
    (char) => char.length === 1 && CONSONANT_PATTERN.test(char.toLowerCase())
  );
  const otherChars = validChars.filter(
    (char) =>
      char.length === 1 &&
      !VOWEL_PATTERN.test(char.toLowerCase()) &&
      !CONSONANT_PATTERN.test(char.toLowerCase())
  );

  // Determine preferred character type based on last character
  const lastChar = currentPrefix.slice(-1).toLowerCase();
  const lastIsConsonant = CONSONANT_PATTERN.test(lastChar);
  const lastIsVowel = VOWEL_PATTERN.test(lastChar);
  const lastIsLetter = lastIsConsonant || lastIsVowel;

  // When prefix is empty or ends with non-letter, start with consonant
  // Otherwise alternate: consonant -> vowel -> consonant -> vowel
  const preferVowel = lastIsConsonant;
  const preferConsonant = !lastIsLetter || lastIsVowel;

  // Occasionally include other chars (digits, special) for variety
  // Only use other chars randomly, not when we can't alternate
  const randomValue = getSecureRandom(0, PROBABILITY_MAX);
  const shouldUseOtherChars =
    otherChars.length > 0 && randomValue < OTHER_CHARS_PROBABILITY;

  if (shouldUseOtherChars) {
    return otherChars[getSecureRandom(0, otherChars.length)];
  }

  // Choose character based on preference, prioritizing letters
  let candidateChars: string[];
  if (preferVowel && vowels.length > 0) {
    candidateChars = vowels;
  } else if (preferConsonant && consonants.length > 0) {
    candidateChars = consonants;
  } else if (vowels.length > 0) {
    candidateChars = vowels;
  } else if (consonants.length > 0) {
    candidateChars = consonants;
  } else {
    // Fallback to all valid chars only if no letters available
    candidateChars = validChars;
  }

  return candidateChars[getSecureRandom(0, candidateChars.length)];
}

/**
 * Generates a password based on the provided options
 *
 * @param length - The desired length of the password (default: 10)
 * @param memorable - Whether to generate a memorable password alternating consonants/vowels (default: true)
 * @param pattern - Regular expression pattern that each character must match (default: /\w/)
 * @param prefix - Optional prefix to append to the generated password
 * @returns A generated password string
 */
function generatePassword(
  length = DEFAULT_LENGTH,
  memorable = true,
  pattern = DEFAULT_PATTERN,
  prefix = ""
): string {
  if (length <= 0) {
    throw new Error("Password length must be greater than 0");
  }

  // Build valid character set based on pattern, excluding ambiguous characters
  const validChars: string[] = [];
  for (let i = CHAR_CODE_START; i <= CHAR_CODE_END; i += 1) {
    const char = String.fromCharCode(i);
    if (pattern.test(char) && !EXCLUDED_CHARS.has(char)) {
      validChars.push(char);
    }
  }

  if (validChars.length === 0) {
    throw new Error(
      `Could not find characters that match the password pattern ${pattern}. ` +
        "Patterns must match individual characters, not the password as a whole."
    );
  }

  // Categorize characters into groups
  const charGroups = categorizeChars(validChars);

  // Ensure minimum length can accommodate all groups
  const availableGroups = [
    charGroups.lowercase.length > 0,
    charGroups.uppercase.length > 0,
    charGroups.digits.length > 0,
    charGroups.special.length > 0,
  ].filter(Boolean).length;

  if (length < availableGroups) {
    throw new Error(
      `Password length (${length}) must be at least ${availableGroups} to include all character groups.`
    );
  }

  // Generate password characters
  let result = prefix;
  while (result.length < length) {
    const char = memorable
      ? generateMemorableChar(result, validChars)
      : getRandomMatchingChar(pattern, validChars);

    result += char;
  }

  // Ensure all character groups are represented
  result = ensureAllGroups(result, charGroups);

  return result;
}

export function isStrongEnough(
  password: string,
  options: {
    minLength?: number;
    uppercaseMinCount?: number;
    lowercaseMinCount?: number;
    numberMinCount?: number;
    specialMinCount?: number;
  } = MEDIUM_PASSWORD_OPTIONS
): boolean {
  const {
    minLength = MEDIUM_PASSWORD_OPTIONS.minLength,
    uppercaseMinCount = MEDIUM_PASSWORD_OPTIONS.uppercaseMinCount,
    lowercaseMinCount = MEDIUM_PASSWORD_OPTIONS.lowercaseMinCount,
    numberMinCount = MEDIUM_PASSWORD_OPTIONS.numberMinCount,
    specialMinCount = MEDIUM_PASSWORD_OPTIONS.specialMinCount,
  } = options;

  const uc = password.match(new RegExp(UPPERCASE_PATTERN, "g"));
  const lc = password.match(new RegExp(LOWERCASE_PATTERN, "g"));
  const n = password.match(new RegExp(DIGIT_PATTERN, "g"));
  const sc = password.match(new RegExp(SPECIAL_CHAR_PATTERN, "g"));

  return !!(
    password.length >= minLength &&
    uc &&
    uc.length >= uppercaseMinCount &&
    lc &&
    lc.length >= lowercaseMinCount &&
    n &&
    n.length >= numberMinCount &&
    sc &&
    sc.length >= specialMinCount
  );
}

const WEAK_PASSWORD_OPTIONS = {
  minLength: 8,
  uppercaseMinCount: 1,
  lowercaseMinCount: 1,
  numberMinCount: 1,
  specialMinCount: 1,
};
const MEDIUM_PASSWORD_OPTIONS = {
  minLength: 12,
  uppercaseMinCount: 2,
  lowercaseMinCount: 2,
  numberMinCount: 2,
  specialMinCount: 2,
};
const STRONG_PASSWORD_OPTIONS = {
  minLength: 16,
  uppercaseMinCount: 3,
  lowercaseMinCount: 3,
  numberMinCount: 3,
  specialMinCount: 3,
};

const PASSWORD_STRENGTH_VALUES = {
  STRONG: 100,
  MEDIUM: 50,
  WEAK: 25,
  VERY_WEAK: 5,
};

export function passwordStrength(password: string): number {
  if (isStrongEnough(password, STRONG_PASSWORD_OPTIONS)) {
    return PASSWORD_STRENGTH_VALUES.STRONG;
  }
  if (isStrongEnough(password, MEDIUM_PASSWORD_OPTIONS)) {
    return PASSWORD_STRENGTH_VALUES.MEDIUM;
  }
  if (isStrongEnough(password, WEAK_PASSWORD_OPTIONS)) {
    return PASSWORD_STRENGTH_VALUES.WEAK;
  }

  return PASSWORD_STRENGTH_VALUES.VERY_WEAK;
}

export default generatePassword;

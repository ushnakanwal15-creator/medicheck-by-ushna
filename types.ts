export interface MedicineRequest {
  medicineName: string;
  age: number;
  language: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface MedicineResponse {
  medicineName: string;
  summary: string;
  dosageGuidance: string;
  commonSideEffects: string[];
  seriousSideEffects: string[];
  ageSpecificWarnings: string;
  disclaimer: string;
}

export enum LanguageOption {
  ENGLISH = 'English',
  SPANISH = 'Spanish',
  FRENCH = 'French',
  GERMAN = 'German',
  CHINESE = 'Chinese',
  JAPANESE = 'Japanese',
  HINDI = 'Hindi',
  ARABIC = 'Arabic',
  URDU = 'Urdu'
}

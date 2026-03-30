import { DropdownOption, SettingsValues } from "./types";

export const LANGUAGE_OPTIONS: DropdownOption[] = [
  { label: "ქართული", value: "ka" },
  { label: "ინგლისური", value: "en" },
  { label: "რუსული", value: "ru" },
  { label: "გერმანული", value: "de" },
  { label: "ფრანგული", value: "fr" },
  { label: "იაპონური", value: "ja" },
  { label: "არაბული", value: "ar" },
  { label: "ნიდერლანდური", value: "nl" },
  { label: "შვედური", value: "sv" },
  { label: "პოლონური", value: "pl" },
  { label: "თურქული", value: "tr" },
  { label: "კორეული", value: "ko" },
  { label: "ჩინური", value: "zh" },
  { label: "იტალიური", value: "it" },
  { label: "პორტუგალიური", value: "pt" },
  { label: "ესპანური", value: "es" },
  { label: "უკრაინული", value: "uk" },
  { label: "ჩეხური", value: "cs" },
  { label: "ფინური", value: "fi" },
  { label: "ნორვეგიული", value: "no" },
];

export const SPEAKER_OUTPUT_OPTIONS: DropdownOption[] = [
  { label: "მოსაუბრის გამოყოფა", value: "diarization" },
  { label: "გამორთული", value: "off" },
];

export const STT_MODEL_OPTIONS: DropdownOption[] = [
  { label: "STT1", value: "stt1" },
  { label: "STT2", value: "stt2" },
  { label: "STT3 (Pro)", value: "stt3" },
];

export const MICROPHONE_OPTIONS: DropdownOption[] = [
  { label: "მიკროფონი", value: "default" },
  { label: "სისტემის ხმა", value: "external" },
];

export const THEME_OPTIONS: DropdownOption[] = [
  { label: "ნათელი", value: "light" },
  { label: "ბნელი", value: "dark" },
];

export const DEFAULT_SETTINGS: SettingsValues = {
  language: "ka",
  speakerOutput: "diarization",
  sttModel: "stt1",
  microphone: "default",
  punctuation: true,
  autoCorrect: false,
  theme: "light",
};

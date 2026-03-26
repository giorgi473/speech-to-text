export type SettingsValues = {
  language: string;
  speakerOutput: string;
  sttModel: string;
  microphone: string;
  punctuation: boolean;
  autoCorrect: boolean;
};

export type DropdownOption = {
  label: string;
  value: string;
};

export type SettingsModalProps = {
  visible: boolean;
  initialValues?: Partial<SettingsValues>;
  onClose: () => void;
  onSave: (values: SettingsValues) => void;
};

export type ToggleProps = {
  label: string;
  value: boolean;
  onToggle: () => void;
};

export type SearchableDropdownProps = {
  options: DropdownOption[];
  selected: string;
  onSelect: (value: string) => void;
  searchPlaceholder?: string;
};

export type RadiusDropdownProps = {
  options: DropdownOption[];
  selected: string;
  onSelect: (value: string) => void;
  styleWrapper?: any;
};

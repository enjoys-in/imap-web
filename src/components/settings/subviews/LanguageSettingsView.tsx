'use client';

import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useGeneralSettingsStore, type TimeFormat } from '@/stores/useGeneralSettingsStore';
import { useToastStore } from '@/stores/useToastStore';

interface Option {
  value: string;
  label: string;
}

const LANGUAGES: readonly Option[] = [
  { value: 'English (United States)', label: 'English (United States)' },
  { value: 'English (United Kingdom)', label: 'English (United Kingdom)' },
  { value: 'Hindi (India)', label: 'हिन्दी (Hindi)' },
  { value: 'Spanish (Spain)', label: 'Español (Spanish)' },
  { value: 'French (France)', label: 'Français (French)' },
  { value: 'German (Germany)', label: 'Deutsch (German)' },
];

const TIME_ZONES: readonly Option[] = [
  { value: '(UTC-08:00) Pacific Time (US & Canada)', label: '(UTC-08:00) Pacific Time (US & Canada)' },
  { value: '(UTC-05:00) Eastern Time (US & Canada)', label: '(UTC-05:00) Eastern Time (US & Canada)' },
  { value: '(UTC+00:00) Dublin, Edinburgh, Lisbon, London', label: '(UTC+00:00) Dublin, Edinburgh, Lisbon, London' },
  { value: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi', label: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi' },
  { value: '(UTC+09:00) Osaka, Sapporo, Tokyo', label: '(UTC+09:00) Osaka, Sapporo, Tokyo' },
];

const DATE_FORMATS: readonly Option[] = [
  { value: 'M/d/yyyy', label: 'M/d/yyyy (e.g. 11/13/2026)' },
  { value: 'd/M/yyyy', label: 'd/M/yyyy (e.g. 13/11/2026)' },
  { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd (e.g. 2026-11-13)' },
];

const TIME_FORMATS: ReadonlyArray<{ value: TimeFormat; label: string }> = [
  { value: '12h', label: '12-hour (1:00 PM)' },
  { value: '24h', label: '24-hour (13:00)' },
];

const selectClass =
  'w-full sm:w-80 h-8 px-2 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs';

const withCurrent = (options: readonly Option[], current: string): readonly Option[] =>
  options.some((option) => option.value === current)
    ? options
    : [...options, { value: current, label: current }];

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: readonly Option[];
  onChange: (value: string) => void;
  divided?: boolean;
}

function SelectField({ id, label, value, options, onChange, divided }: SelectFieldProps) {
  return (
    <div className={divided ? 'border-t border-neutral-200 dark:border-neutral-800 pt-4' : undefined}>
      <label htmlFor={id} className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-1">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {withCurrent(options, value).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function LanguageSettingsView() {
  const settings = useGeneralSettingsStore();
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);
  const addToast = useToastStore((s) => s.addToast);

  const [language, setLanguage] = useState(settings.language);
  const [timeZone, setTimeZone] = useState(settings.timeZone);
  const [dateFormat, setDateFormat] = useState(settings.dateFormat);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(settings.timeFormat);

  const handleSave = () => {
    updateSettings({ language, timeZone, dateFormat, timeFormat });
    addToast({
      title: 'Language & time settings saved',
      description: 'Your language, time zone and date and time formats were updated.',
      type: 'success',
    });
  };

  return (
    <div className="max-w-3xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Language and time</h2>
        <p className="text-neutral-500 mt-0.5">Customize your display language, time zone, and date formatting.</p>
      </div>

      <div className="space-y-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c]">
        <SelectField id="settings-language" label="Language" value={language} options={LANGUAGES} onChange={setLanguage} />
        <SelectField id="settings-timezone" label="Current time zone" value={timeZone} options={TIME_ZONES} onChange={setTimeZone} divided />
        <SelectField id="settings-date-format" label="Date format" value={dateFormat} options={DATE_FORMATS} onChange={setDateFormat} divided />

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-2">Time format</span>
          <div className="flex items-center gap-4">
            {TIME_FORMATS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timeFormat"
                  checked={timeFormat === option.value}
                  onChange={() => setTimeFormat(option.value)}
                  className="accent-[#0078d4]"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <button
          onClick={handleSave}
          className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Save className="w-3.5 h-3.5" /><span>Save</span>
        </button>
      </div>
    </div>
  );
}

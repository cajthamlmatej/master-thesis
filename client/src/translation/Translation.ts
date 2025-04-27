import {TranslationRecord} from "@/translation/TranslationRecord";
import {TranslationLanguage} from "@/translation/TranslationLanguage";
import Event from "@/utils/Event";

import en from "@/translation/data/en.json";
import cs from "@/translation/data/cs.json";
import {sanitizeAttribute} from "@/utils/Sanitize";

export class Translation {
    public LANGUAGE_CHANGED: Event<string> = new Event();
    private languages: TranslationLanguage[] = [
        {
            label: 'English',
            code: 'en',
            fullIdentifier: 'en-US',
            data: en
        },
        {
            label: 'Česky',
            code: 'cs',
            fullIdentifier: 'cs-CZ',
            data: cs
        }
    ];
    private records: TranslationRecord[] = [];
    private language: string;

    constructor(language: string) {
        this.language = language;

        this.load();
    }

    public changeLanguage(language: string): void {
        if (this.language === language) {
            return;
        }

        this.language = language;
        this.load();
        this.LANGUAGE_CHANGED.emit(language);
    }

    public get(key: string, variables?: Record<string, string | (() => string)>): string {
        const record = this.records.find(record => record.key === key);

        if (!record) {
            console.error("[Translation] Key not found: " + key + " in language " + this.language);
            return "$t_{" + key + "}";
        }

        if (variables) {
            let text = record.value;

            for (const variable in variables) {
                const key = "%" + variable + "%";

                let value = variables[variable];

                if (typeof value === 'function') {
                    value = value();
                }

                value = sanitizeAttribute(value);

                text = text.replace(new RegExp(key, 'gm'), value);
            }

            return text;
        }

        return record.value;
    }

    getLanguage() {
        return this.language;
    }

    getLanguageIdentifier() {
        return this.languages.find(language => language.code === this.language)?.fullIdentifier ?? 'unknown';
    }

    getLanguages() {
        return this.languages;
    }

    doesLanguageExist(language: string) {
        return this.languages.some(lang => lang.code === language);
    }

    doesKeyExist(key: string) {
        return this.records.some(record => record.key === key);
    }

    private load(): void {
        this.records = [];

        const language = this.languages.find(language => language.code === this.language);

        if (!language) {
            console.error("Language not found: " + this.language);
            return;
        }

        const recursive = (data: any, prefix: string) => {
            for (const key in data) {
                if (typeof data[key] === 'object') {
                    recursive(data[key], prefix + key + '.');
                } else {
                    this.records.push({
                        key: prefix + key,
                        value: data[key]
                    });
                }
            }
        }

        recursive(language.data, '');

        console.log("[Translation] Loaded " + this.records.length + " records for language " + this.language);

        console.groupCollapsed("Translation Records");
        for (const record of this.records) {
            console.log(record.key + ": " + record.value);
        }
        console.groupEnd();
    }
}

export const translation = new Translation('en');

export const $t = (key: string, variables?: Record<string, string | (() => string)>): string => {
    return translation.get(key, variables);
}

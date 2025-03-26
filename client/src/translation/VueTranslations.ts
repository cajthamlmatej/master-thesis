import {App} from "vue";
import {translation} from "@/translation/Translation";
import moment from "moment";


import "moment/dist/locale/cs";

export const setupTranslations = (Vue: App<Element>) => {
    Vue.directive("t", {
        beforeMount(el, binding, vnode) {
            let key = el.innerHTML;

            // Save key so it can be used in updated hook
            el.dataset.key = key;

            let variables = {} as Record<string, string | (() => string)>;

            for (const key in binding.value) {
                variables[key] = binding.value[key];
            }

            el.innerHTML = translation.get(key, variables);
        },
        updated(el, binding, vnode) {
            let key = el.dataset.key;

            let variables = {} as Record<string, string | (() => string)>;

            for (const key in binding.value) {
                variables[key] = binding.value[key];
            }

            el.innerHTML = translation.get(key, variables);
        }
    });

    const url = window.location.href;
    const urlParts = url.split("/");
    const language = urlParts[3];

    console.log("[Translation] Language: " + language);
    console.log("[Translation] URL: " + url);

    if (!language) return;

    if (!translation.doesLanguageExist(language)) {
        console.error("[Translation] Language not found: " + language + ". Redirecting to default language.");

        window.location.href = url.replace(urlParts[3], "en");
        return;
    }

    translation.LANGUAGE_CHANGED.on((language) => {
        moment.locale(language);
    });

    translation.changeLanguage(language);
};

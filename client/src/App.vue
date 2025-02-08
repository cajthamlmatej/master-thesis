<template>
    <RouterView :key="language" />

    <Cookies :key="language" />

    <Debug :key="language" />
</template>

<script setup lang="ts">
import Debug from "@/components/Debug.vue";
import Cookies from "@/components/Cookies.vue";
import {useHead} from "unhead";
import {useRoute, useRouter} from "vue-router";
import {useUserStore} from "@/stores/user";
import {translation} from "@/translation/Translation";
import {ref, watch} from "vue";

useHead({
    titleTemplate: (title?: string) => {
        return title ? `${title} — ` + translation.get('web.name') : translation.get('web.name');
    },
});

const router = useRouter();
const userStore = useUserStore();

router.beforeEach((to, from, next) => {
    if(!to.meta.isAuthentication) {
        userStore.load();
    }

    next();
});

const language = ref(translation.getLanguage());

translation.LANGUAGE_CHANGED.on(() => {
    language.value = translation.getLanguage();
});

const route = useRoute();

watch(() => route.params.lang, (lang) => {
    language.value = lang.toString();
});
</script>

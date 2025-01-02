<template>
    <RouterView/>

    <Cookies/>

    <Debug />
</template>

<script setup lang="ts">
import Debug from "@/components/Debug.vue";
import Cookies from "@/components/Cookies.vue";
import {useHead} from "unhead";


useHead({
    titleTemplate: (title?: string) => {
        return title ? `${title} — TODO` : 'TODO';
    },
});
</script>

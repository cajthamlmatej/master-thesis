<template>
    <p>
        For now, everything is in editor!
    </p>
    <p v-if="userStore.user">
        Currently logged as: {{ userStore.user.name }}
    </p>
</template>

<script setup lang="ts">
import {useUserStore} from "@/stores/user";
import {onMounted} from "vue";
import {load} from "@/editor/plugin/quickjs/QuickJSRunner";

const userStore = useUserStore();

onMounted(async () => {
});
</script>

<style lang="scss">
</style>

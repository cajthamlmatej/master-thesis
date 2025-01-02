<template>
    <p>
        For now, everything is in editor!
    </p>
    <p v-if="userStore.user">
        Currently logged as: {{ userStore.user.name }}
    </p>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
</script>

<style lang="scss">
</style>

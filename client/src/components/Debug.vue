<template>
    <p class="debug">{{version}}</p>
</template>

<script setup lang="ts">
const version = `v${import.meta.env.VITE_APP_VERSION}`;
</script>


<style scoped lang="scss">
.debug {
    position: fixed;
    bottom: 0;
    right: 0;

    margin: 0.5em;
    padding: 0.25em 0.5em;

    border-radius: 0.25em;

    font-size: 0.8em;
    font-weight: bold;

    background-color: var(--color-debug-background);
    color: var(--color-debug-text);
}
</style>

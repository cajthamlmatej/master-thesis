<template>
    <p class="debug">{{version}}</p>
</template>

<script setup lang="ts">
const version = `v${import.meta.env.VITE_APP_VERSION}`;
</script>


<style scoped lang="scss">
.debug {
    position: fixed;
    bottom: -2px;
    right: 0;
    background-color: white;
    border-radius: 5px;
    margin: 10px;
    font-size: 0.8em;
    font-weight: bold;
}
</style>

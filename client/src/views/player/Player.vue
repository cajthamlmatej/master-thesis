<template>
    <article class="view">
        <div class="wrapper">
            <Player/>
        </div>
    </article>
</template>

<script lang="ts" setup>
import Player from "@/components/Player.vue";
</script>

<style lang="scss" scoped>
article.view {
    width: 100%;
    height: 100vh;

    .wrapper {
        width: 100%;
        height: 100%;
    }
}
</style>

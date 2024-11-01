<template>
    <article class="editor-view">
        <Editor />
    </article>
</template>

<script setup lang="ts">
import Editor from "@/components/Editor.vue";
</script>

<style lang="scss">
article.editor-view {
    width: 100%;
    height: 100vh;
    min-height: 0;
    min-width: 0;
}
</style>

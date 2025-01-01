<template>
    <article class="editor-view">
        <div class="wrapper">
            <Editor />
        </div>
    </article>
</template>

<script setup lang="ts">
import Editor from "@/components/Editor.vue";
</script>

<style lang="scss">
article.editor-view {
    width: 100%;
    height: 100vh;
    padding: 32px;
    min-height: 0;
    min-width: 0;

    .wrapper {
        width: 100%;
        height: 100%;
    }
}
</style>

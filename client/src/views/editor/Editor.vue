<template>
    <article class="editor-view">
        <div class="wrapper">
            <Editor />
        </div>
    </article>
</template>

<script setup lang="ts">
import Editor from "@/components/editor/Editor.vue";
</script>

<style lang="scss">
article.editor-view {
    width: 100%;
    min-height: 0;
    min-width: 0;
    height: calc(100 * var(--vh, 1vh) - 5em);

    .wrapper {
        width: 100%;
        height: 100%;
    }
}
</style>

<template></template>

<script lang="ts" setup>

import {onMounted, onUnmounted} from "vue";
import {useEditorStore} from "@/stores/editor";
import {TextEditorBlock} from "@/editor/block/base/text/TextEditorBlock";
import {generateUUID} from "@/utils/Generators";
import {ImageEditorBlock} from "@/editor/block/base/image/ImageEditorBlock";
import {useMediaStore} from "@/stores/media";

const mediaStore = useMediaStore();
const editorStore = useEditorStore();

let handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const editor = editorStore.getEditor();
    if (!editor) {
        return;
    }

    const dropPositionX = e.clientX;
    const dropPositionY = e.clientY;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
        const file = files[0];

        const mime = file.type;

        if (mime.startsWith("image/")) {
            const response = await mediaStore.upload(file);

            if (!response) {
                console.error("Failed to upload image:", file);
                return;
            }

            const block = new ImageEditorBlock({
                id: generateUUID(),
                position: editor.screenToEditorCoordinates(dropPositionX, dropPositionY),
                size: {width: 300, height: 300},
                rotation: 0,
                zIndex: 0,
            }, false, undefined, response.media.id);
            editor.addBlock(block);
            block.matchRenderedHeight();
            await mediaStore.load();
        } else {
            console.error("Unsupported file type for drop:", mime);
        }
    }

    const data = e.dataTransfer?.getData("text/plain");
    if (data) {
        const width = editor.getSize().width;
        const block = new TextEditorBlock({
            id: generateUUID(),
            position: editor.screenToEditorCoordinates(dropPositionX, dropPositionY),
            size: {width: Math.max(width / 4, 300), height: 24},
            rotation: 0,
            zIndex: 0,
        }, data, 16);
        editor.addBlock(block);

        block.matchRenderedHeight();
    }
};

let handleOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
};

onMounted(() => {
    document.body.addEventListener("drop", handleDrop);
    document.body.addEventListener("dragover", handleOver);
});

onUnmounted(() => {
    document.body.removeEventListener("drop", handleDrop);
    document.body.removeEventListener("dragover", handleOver);
})

</script>

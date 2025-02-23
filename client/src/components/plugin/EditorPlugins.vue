<template>
    <div class="plugins">
        <PluginManageDialog/>
        <Divider v-if="pluginPanels.length >= 1" />
        <NavigationButton
            v-for="panel in pluginPanels"
            :label="$t('editor.ui.plugin.plugin', {name: panel.name})"
            :tooltip-text="$t('editor.ui.plugin.plugin', {name: panel.name})"
            @click="emits('update:value', panel.name === value ? null : panel.name)"
            :icon="panel.icon"></NavigationButton>

    </div>

    <teleport to="body">
        <PluginPanel
            v-for="panel in pluginPanels"
            :panel="panel as PluginEditorPanel"
            :value="props.value === panel.name"
        />
    </teleport>
</template>

<script setup lang="ts">
import {computed, PropType} from "vue";
import {usePluginStore} from "@/stores/plugin";
import {PluginEditorPanel} from "@/editor/plugin/PluginEditorPanel";
import PluginManageDialog from "@/components/plugin/manage/PluginManageDialog.vue";
import PluginPanel from "@/components/plugin/panel/PluginPanel.vue";
import {$t} from "@/translation/Translation";

const props = defineProps({
    value: String as PropType<string | null>
});

const emits = defineEmits(["update:value"]);

const pluginStore = usePluginStore();
const pluginPanels = computed(() => pluginStore.panels);

// try {
//     pluginManager.loadPlugin(new PluginContext('{"id": "centering", "manifest": 1, "version": "0.1.0", "name": "Centering", "icon": "align-horizontal-distribute"}',
//         "Matěj Cajthaml",
//         `
// export const onPanelMessage = function(message) {
//     const editor = api.editor;
//     if(message === "horizontal-distribute") {
//         const blocks = editor.getBlocks();
//
//         const selectedBlocks = blocks.filter((block) => editor.isBlockSelected(block.id));
//
//         if(selectedBlocks.length <= 0) {
//             return;
//         }
//
//         const size = editor.getSize();
//
//         const totalWidth = selectedBlocks.reduce((acc, block) => acc + block.size.width, 0);
//         const space = size.width - totalWidth;
//         const spaceBetween = space / (selectedBlocks.length - 1);
//
//         const sortedBlocks = selectedBlocks.sort((a, b) => a.position.x - b.position.x);
//
//         let x = 0;
//         for(const block of sortedBlocks) {
//             block.move(x, block.position.y);
//             x += block.size.width + spaceBetween;
//         }
//     }
// };
//
// export const onPanelRegister = function() {
//     return \`
//     <link href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" rel="stylesheet" crossorigin="anonymous">
//
// <section>
//     <button id="horizontal-distribute">
//         <span class="mdi mdi-align-horizontal-distribute"></span>
//     </button>
// </section>
//
//
// <script>
// document.querySelector("#horizontal-distribute").addEventListener("click", () => {
//     window.parent.postMessage({target: "script", message: "horizontal-distribute"}, "*");
// });
// \<\/script>
// \`;
//     };
// `))
//
// //     pluginManager.loadPlugin(new Plugin('{"id": "ava", "version": 1, "name": "Ava pluginecek", "icon": "horse", "allowedOrigins": ["https://api-masterthesis.cajthaml.dev"]}',
// //         `/**
// //  * @typedef BaseBlockPosition
// //  * @type {object}
// //  * @property {number} x The x coordinate of the block.
// //  * @property {number} y The y coordinate of the block.
// //  *
// //  * @typedef BaseBlockSize
// //  * @type {object}
// //  * @property {number} width The width of the block.
// //  * @property {number} height The height of the block.
// //  *
// //  * @typedef BaseBlock
// //  * @type {object}
// //  * @property {string} type The type of the block.
// //  * @property {BaseBlockPosition} position The position of the block.
// //  * @property {BaseBlockSize} size The size of the block.
// //  * @property {number} rotation The rotation of the block in degrees.
// //  * @property {number} zIndex The z-index of the block.
// //  * @property {number} opacity The opacity of the block in the range [0, 1].
// //  *
// //  * @typedef TextBlock
// //  * @type {object}
// //  * @property {string} [type="text"] The type of the block.
// //  * @property {BaseBlockPosition} position The position of the block.
// //  * @property {BaseBlockSize} size The size of the block.
// //  * @property {number} rotation The rotation of the block in degrees.
// //  * @property {number} zIndex The z-index of the block.
// //  * @property {number} opacity The opacity of the block in the range [0, 1].
// //  * @property {string} content The content of the text block.
// //  * @property {number} fontSize The font size of the text block.
// //  *
// //  * @typedef ImageBlock
// //  * @type {object}
// //  * @property {string} [type="image"] The type of the block.
// //  * @property {BaseBlockPosition} position The position of the block.
// //  * @property {BaseBlockSize} size The size of the block.
// //  * @property {number} rotation The rotation of the block in degrees.
// //  * @property {number} zIndex The z-index of the block.
// //  * @property {number} opacity The opacity of the block in the range [0, 1].
// //  * @property {?string} imageUrl The URL of the image. If not present, expects the mediaId to be present.
// //  * @property {?string} mediaId The media ID of the image. If not present, expects the imageUrl to be present.
// //  * @property {boolean} aspectRatio Whether the aspect ratio of the image is locked (image cannot be resized independently).
// //  *
// //  * @typedef CreateBaseBlock
// //  * @type {object}
// //  * @property {string} type The type of the block.
// //  * @property {BaseBlockPosition} position The position of the block.
// //  * @property {BaseBlockSize} size The size of the block.
// //  * @property {number} rotation The rotation of the block in degrees.
// //  * @property {number} zIndex The z-index of the block.
// //  * @property {number} opacity The opacity of the block in the range [0, 1].
// //  *
// //  * @typedef CreateTextBlock
// //  * @type {object}
// //  * @property {string} [type="text"] The type of the block.
// //  * @property {BaseBlockPosition} position The position of the block.
// //  * @property {BaseBlockSize} size The size of the block.
// //  * @property {number} rotation The rotation of the block in degrees.
// //  * @property {number} zIndex The z-index of the block.
// //  * @property {number} opacity The opacity of the block in the range [0, 1].
// //  * @property {string} content The content of the text block.
// //  * @property {number} fontSize The font size of the text block.
// //  *
// //  * @typedef CreateImageBlock
// //  * @type {object}
// //  * @property {string} [type="image"] The type of the block.
// //  * @property {BaseBlockPosition} position The position of the block.
// //  * @property {BaseBlockSize} size The size of the block.
// //  * @property {number} rotation The rotation of the block in degrees.
// //  * @property {number} zIndex The z-index of the block.
// //  * @property {number} opacity The opacity of the block in the range [0, 1].
// //  * @property {?string} imageUrl The URL of the image. If not present, expects the mediaId to be present.
// //  * @property {?string} mediaId The media ID of the image. If not present, expects the imageUrl to be present.
// //  * @property {boolean} aspectRatio Whether the aspect ratio of the image is locked (image cannot be resized independently).
// //  *
// //  * @typedef CreateBlock
// //  * @type {CreateBaseBlock | CreateTextBlock | CreateImageBlock}
// //  *
// //  * @typedef Block
// //  * @type {BaseBlock | TextBlock | ImageBlock}
// //  *
// //  * @typedef EditorApi
// //  * @type {object}
// //  * @property {() => Block[]} getBlocks Returns an array of all blocks in the editor.
// //  * @property {(block: CreateBlock) => void} addBlock Adds a block to the editor. If the parameter block provides and id, it will be ignored and a new id will be generated.
// //  * @property {(blockId: string) => void} removeBlock Removes a block from the editor.
// //  * @property {() => {width: number, height: number}} getSize Returns the size of the editor.
// //  * @property {(width: number, height: number, resizeToFit: boolean) => void} setSize Sets the size of the editor.
// //  *
// //  * @typedef Api
// //  * @type {object}
// //  * @property {(message: string) => void} log Logs a message to the console.
// //  * @property {(url: string) => Promise<string>} fetch Fetches a URL and returns the response as a string.
// //  * @property {EditorApi} editor The editor object.
// //  *
// //  * @global
// //  * @name api
// //  * @type {Api}
// //  * @description The globally injected API object.
// //  */
// //
// // export const onPanelMessage = function(message) {
// //     const editor = api.editor;
// //     if(message === "add") {
// //         const blocks = editor.getBlocks();
// //         const avaBlock = blocks.find((block) => block.content === "Ahoj <b>Avo<\/b>!!!");
// //
// //         if(avaBlock) {
// //             editor.removeBlock(avaBlock.id);
// //         }
// //
// //         editor.addBlock({
// //             type: "text",
// //             position: {
// //                 x: 400,
// //                 y: 100
// //             },
// //             size: {
// //                 width: 200,
// //                 height: 100
// //             },
// //             rotation: 0,
// //             zIndex: 0,
// //             opacity: 1,
// //             content: 'Ahoj <b>Avo<\/b>!!!',
// //             fontSize: 20,
// //         });
// //     }
// // };
// //
// // export const onLoad = function() {
// //     api.log("This should be logged");
// //
// //     const editor = api.editor;
// //     //editor.setSize(400, 400, false);
// //
// //     api.log("This hallo");
// //     api.log(editor.getBlocks());
// //
// //     api.fetch("https://api-masterthesis.cajthaml.dev/material/6791393f642898668545d486").then((response) => {
// //         api.log("cc");
// //     });
// //     api.fetch("https://a-masterthesis.cajthaml.dev/material/6791393f642898668545d486").then((response) => {
// //         api.log("pokakany???");
// //     }).catch((error) => {
// //         api.log("pokakany");
// //     });
// //
// //     // editor.addBlock({
// //     //     type: "text",
// //     //     position: {
// //     //         x: 100,
// //     //         y: 100
// //     //     },
// //     //     size: {
// //     //         width: 200,
// //     //         height: 100
// //     //     },
// //     //     rotation: 0,
// //     //     zIndex: 0,
// //     //     opacity: 1,
// //     //     content: 'Ahoj Avo!!!',
// //     //     fontSize: 20,
// //     // });
// //
// //
// //     api.log("wtf");
// // };
// //
// // export const onPanelRegister = function() {
// //     return \`
// //     <style>
// // * {padding: 0; margin: 0;}
// // body{
// //   background-color: black;
// //   color: white;
// //   display: flex;
// //   flex-direction: column;
// //   padding: 1em;
// // }
// //
// // section {
// //   display: flex;
// //   justify-content: center;
// //   align-items: center;
// //   height: 100%;
// // }
// //
// // button {
// //   padding: 1em;
// //   background-color: white;
// //   color: black;
// //   border: none;
// //   cursor: pointer;
// //   font-size: 1em;
// //   font-weight: bold;
// //   border-radius: 0.5em;
// //   transition: background-color 0.2s;
// // }
// //
// // button:hover {
// //   background-color: #f0f0f0;
// // }
// // </style>
// //
// // <section>
// // <button id="add">
// // Add
// // </button>
// // </section>
// //
// //
// // <script>
// // document.querySelector("#add").addEventListener("click", () => {
// //     window.parent.postMessage({target: "script", message: "add"}, "*");
// // });
// // \<\/script>
// // \`;
// //     };
// // `))
//
// //     pluginManager.loadPlugin(new Plugin('{"id": "dnesniSvatek", "version": 1, "name": "Dnešní svátek", "icon": "calendar-account-outline", "allowedOrigins": ["https://svatkyapi.cz"]}',
// //         `
// //
// // export const onPanelMessage = function(message) {
// //     const editor = api.editor;
// //     if(message === "add") {
// //         editor.addBlock({
// //             type: "iframe",
// //             position: {
// //                 x: 400,
// //                 y: 100
// //             },
// //             size: {
// //                 width: 200,
// //                 height: 200
// //             },
// //             rotation: 0,
// //             zIndex: 0,
// //             opacity: 1,
// //             content: \`
// // <style>
// // * { padding: 0; margin: 0; }
// // body {
// // height: 100vh;
// // width: 100%;}
// //
// // div {
// // height: 100%;
// // width: 100%;
// // display: flex;
// // justify-content: center;
// // align-items: center;
// // }
// //
// // #dnesni {
// // font-size: 2em;
// // color: black;
// // }
// // </style>
// //
// //             <div><p id="dnesni"></p></div>
// //
// //
// //
// // <script>
// // fetch('https://svatkyapi.cz/api/day').then((response) => {
// //     return response.json();
// // }).then((data) => {
// //     document.querySelector("#dnesni").innerText = data.name;
// // }).catch((error) => {
// //     document.querySelector("#dnesni").innerText = "Nepodařilo se načíst svátek";
// // });
// // \<\/script>
// // \`,
// //         });
// //     }
// // };
// //
// // export const onPanelRegister = function() {
// //     return \`
// //     <style>
// // * {padding: 0; margin: 0;}
// // body{
// //   background-color: black;
// //   color: white;
// //   display: flex;
// //   flex-direction: column;
// //   padding: 1em;
// // }
// //
// // section {
// //   display: flex;
// //   justify-content: center;
// //   align-items: center;
// //   height: 100%;
// // }
// //
// // button {
// //   padding: 1em;
// //   background-color: white;
// //   color: black;
// //   border: none;
// //   cursor: pointer;
// //   font-size: 1em;
// //   font-weight: bold;
// //   border-radius: 0.5em;
// //   transition: background-color 0.2s;
// // }
// //
// // button:hover {
// //   background-color: #f0f0f0;
// // }
// // </style>
// //
// // <section>
// // <button id="add">
// // Přidat dnešní svátek
// // </button>
// // </section>
// //
// //
// // <script>
// // document.querySelector("#add").addEventListener("click", () => {
// //     window.parent.postMessage({type: "message", message: "add"}, "*");
// // });
// // \<\/script>
// // \`;
// //     };
// // `))
// } catch (e) {
//     console.error(e);
// }


</script>

<style scoped lang="scss">
.plugins {
    display: flex;
    flex-direction: column;
    //flex-grow: 1;
    gap: 0.5em;
    padding: 0.5em;
    background-color: #f0f0f0;
    box-shadow: inset 0 0 0.5em 0.5em #e0e0e0;
    margin: 0.5em 0;
    overflow-y: auto;
    max-height: 40vh;

    button.button {
        background-color: #f0f0f0;
        color: black;
    }

    &::-webkit-scrollbar {
        width: 0.25em;
    }
}
</style>

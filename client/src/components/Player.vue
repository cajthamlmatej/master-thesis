<template>
    <div class="player-container">
        <div class="player" ref="playerElement" v-once v-html="''" :key="'player'">
        </div>
    </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import Player from "@/editor/player/Player";
import {PlayerDeserializer} from "@/editor/player/PlayerDeserializer";
import {useRoute} from "vue-router";
import {decodeBase64} from "@/utils/Generators";

const playerElement = ref<HTMLElement | null>(null);

let player!: Player;

const route = useRoute();

onMounted(() => {
    if (!playerElement.value) {
        console.error("Editor element not found");
        return;
    }

    let data = ``;

    if(route.query.data) {
        data = decodeBase64(route.query.data as string);
    }

    const deserializer = new PlayerDeserializer();
    player = deserializer.deserialize(data, playerElement.value);
});

</script>

<style scoped lang="scss">
.player-container {
    user-select: none;
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;

    overflow: hidden;
    position: relative;
}
</style>

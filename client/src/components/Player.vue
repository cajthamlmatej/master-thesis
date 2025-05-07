<template>
    <div class="player-container" data-cy="player">
        <div v-once :key="'player'" ref="playerElement" class="player" v-html="''">
        </div>
    </div>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref, watch} from "vue";
import Player from "@/editor/player/Player";
import {usePlayerStore} from "@/stores/player";

const playerStore = usePlayerStore();

const playerElement = ref<HTMLElement | null>(null);

let player: Player;
let loaded = ref(false);

onMounted(() => {
    if (!playerElement.value) {
        console.error("Editor element not found");
        return;
    }

    playerStore.setPlayerElement(playerElement.value);
});
watch(() => playerStore.getPlayer(), (value) => {
    if (!value) return;

    if (player) {
        destroy();
    }

    player = value;

    loaded.value = true;
});

const destroy = () => {
    if (!player) return;

    loaded.value = false;
}

onUnmounted(() => {
    destroy();
});

</script>

<style lang="scss" scoped>
.player-container {
    user-select: none;
    width: 100%;
    height: 100%;
    background-color: black;

    overflow: hidden;
    position: relative;
}
</style>

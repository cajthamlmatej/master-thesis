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

    let data = `{"editor":{"size":{"width":1200,"height":800}},"blocks":[{"id":"c0aefad7-f60d-4cdb-a5a8-074e1c2f3200","type":"text","position":{"x":300,"y":100},"size":{"width":300,"height":36},"rotation":0,"zIndex":1,"locked":false,"content":"<div>Test</div>","fontSize":24},{"id":"a49ae9fd-7217-42a0-8ed9-6afce28a759a","type":"text","position":{"x":420,"y":300},"size":{"width":390,"height":72},"rotation":0,"zIndex":2,"locked":false,"content":"<div>Ahoj</div><div>Světe</div>","fontSize":24},{"id":"a6b762b2-cbe8-48c9-ae81-4e6f9dd7121a","type":"watermark","position":{"x":30,"y":720},"size":{"width":200,"height":50},"rotation":0,"zIndex":3,"locked":false},{"id":"37aa85e8-e9c7-411f-8b71-cd9fc14bb47c","type":"rectangle","position":{"x":20,"y":20},"size":{"width":40,"height":40},"rotation":0,"zIndex":4,"locked":false,"group":"group1","color":"#ff8e3c"},{"id":"eb080762-2a7b-4499-8725-d453896483a2","type":"image","position":{"x":40,"y":500},"size":{"width":200,"height":200},"rotation":-30,"zIndex":5,"locked":false,"group":"group1","imageUrl":"https://ssps.cajthaml.eu/img/logo-main-for-light-main.png"}]}`;

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

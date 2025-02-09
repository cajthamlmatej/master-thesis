<template>
    <article class="view">
        <div v-if="loading" class="loading">
            <p v-t>player.loading</p>

            <p class="icon"><span class="mdi mdi-loading"></span></p>
        </div>
        <div class="wrapper" v-if="material && !loading">
            <Player/>
        </div>
        <div v-else-if="!loading" class="fail">
            <p class="title" v-t>player.not-found.title</p>

            <p v-t>player.not-found.message</p>

            <Button :to="{ name: 'Dashboard' }" color="primary"><span v-t>player.not-found.dashboard</span></Button>

            <div class="language">
                <ChangeLanguage/>
            </div>
        </div>
    </article>
</template>

<script lang="ts" setup>
import Player from "@/components/Player.vue";
import {useMaterialStore} from "@/stores/material";
import {computed, onMounted, ref, watch} from "vue";
import ChangeLanguage from "@/components/ChangeLanguage.vue";

const materialStore = useMaterialStore();

const material = computed(() => materialStore.currentMaterial);

const loading = ref(true);

onMounted(() => {
    materialStore.loaded.then(() => {
        loading.value = false;
    });
})
</script>

<style lang="scss" scoped>
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

article.view {
    width: 100%;
    height: 100vh;

    .wrapper {
        width: 100%;
        height: 100%;
    }

    .loading {
        width: 100%;
        height: 100%;
        background-color: black;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        p {
            color: white;
            font-size: 1.5em;
        }

        .icon {
            font-size: 3em;

            animation: spin 1s linear infinite;
        }
    }

    .fail {
        width: 100%;
        height: 100%;
        background-color: black;

        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        color: white;

        .title {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 1em;
        }

        p:not(.title) {
            font-size: 1.5em;
            width: 50%;
            text-align: center;
            margin-bottom: 1em;
        }
    }
}

.language {
    margin-top: 2em;
    :deep(li) {
        list-style: none;
    }
}
</style>

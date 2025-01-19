<template>
    <p v-if="userStore.user">
        Currently logged as: {{ userStore.user.name }}
    </p>

    <Row class="mt-2" wrap align="stretch">
        <Col cols="12" sm="4" md="3" lg="3" v-for="material in materialStore.materials" :key="material.id">
            <RouterLink class="material" :to="{name: 'Editor', params: {material: material.id}}">
                <article class="material">
                    <p class="title">{{ material.name }}</p>

                    <img v-if="material.slides.length > 0 && material.slides[0]?.thumbnail" :src="material.slides[0]?.thumbnail" alt="thumbnail" class="thumbnail">
                    <div class="placeholder" v-else></div>
                </article>
            </RouterLink>
        </Col>
        <Col cols="12" sm="4" md="3" lg="3">
            <RouterLink :to="{name: 'Editor', params: {material: 'new'}}">
                <article class="add">
                    <p>
                        <span class="mdi mdi-plus"></span>
                    </p>
                </article>
            </RouterLink>
        </Col>
    </Row>
</template>

<script setup lang="ts">
import {useUserStore} from "@/stores/user";
import {onMounted} from "vue";
import {load} from "@/editor/plugin/quickjs/QuickJSRunner";
import {useMaterialStore} from "@/stores/material";

const userStore = useUserStore();
const materialStore = useMaterialStore();

onMounted(async () => {
    await materialStore.load();
});
</script>

<style scoped lang="scss">
a.material {
    text-decoration: none;
}

article.material {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.2s;
    color: var(--color-text);
    text-decoration: none;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    p {
        text-decoration: none;
    }

    &:hover {
        background-color: #f0f0f0;
    }

    .title {
        font-size: 1.2em;
        font-weight: bold;
        line-height: 1.05em;
    }

    .thumbnail, .placeholder {
        width: 100%;
        height: 100px;
        object-fit: cover;
        margin-top: 10px;
        box-shadow: inset var(--shadow-accent);
        background-color: #ffffff;
        opacity: 0.8;
    }
    .placeholder {
        background-image:  linear-gradient(135deg, #f4f4f4 25%, transparent 25%), linear-gradient(225deg, #f4f4f4 25%, transparent 25%), linear-gradient(45deg, #f4f4f4 25%, transparent 25%), linear-gradient(315deg, #f4f4f4 25%, #ffffff 25%);
        background-position:  10px 0, 10px 0, 0 0, 0 0;
        background-size: 10px 10px;
        background-repeat: repeat;
    }
}

.add {
    background: var(--color-primary);
    color: var(--color-text);
    border: 1px solid var(--color-primary);
    border-radius: 5px;
    padding: 10px;
    font-size: 4em;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    transition: background 0.2s;

    &:hover {
        background: var(--color-primary-dark);
    }
}
</style>

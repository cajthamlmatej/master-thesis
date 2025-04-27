<template>

    <Card fluid class="mb-1">
        <div class="flex flex-justify-center flex-justify-sm-space-between flex-align-center flex-wrap gap-1">
            <span class="main-title" v-t>page.featured.title</span>
            <div class="flex flex-align-center gap-1">
                <Dialog>
                    <template #activator="{toggle}">
                        <Button v-tooltip="$t('page.featured.remove.tooltip')"
                                :label="$t('page.featured.remove.tooltip')"
                                color="primary"
                                @click="toggle"
                                icon="minus"/>
                    </template>
                    <template #default="{toggle}">
                        <Card dialog>
                            <p class="title" v-t>page.featured.remove.title</p>

                            <p class="description" v-t>page.featured.remove.description</p>

                            <Select
                                :choices="choicesMaterialsRemove"
                                v-model:value="selectedMaterialRemove"
                            />

                            <div class="flex flex-justify-end">
                                <Button @click="() => {featureMaterialRemove(); toggle()}"
                                        :disabled="!selectedMaterialRemove">
                                    <span v-t>page.featured.remove.remove</span>
                                </Button>
                            </div>
                        </Card>
                    </template>
                </Dialog>
                <Dialog>
                    <template #activator="{toggle}">
                        <Button v-tooltip="$t('page.featured.new.tooltip')"
                                :label="$t('page.featured.new.tooltip')"
                                color="primary"
                                @click="toggle"
                                icon="plus"/>
                    </template>
                    <template #default="{toggle}">
                        <Card dialog>
                            <p class="title" v-t>page.featured.new.title</p>

                            <p class="description" v-t>page.featured.new.description</p>

                            <Select
                                :choices="choicesMaterialsAdd"
                                v-model:value="selectedMaterialAdd"
                            />

                            <div class="flex flex-justify-end">
                                <Button @click="() => {featureMaterialAdd(); toggle()}"
                                        :disabled="!selectedMaterialAdd">
                                    <span v-t>page.featured.new.add</span>
                                </Button>
                            </div>
                        </Card>
                    </template>
                </Dialog>
            </div>
        </div>
    </Card>

    <Card fluid>
        <Alert v-if="featuredMaterials.length <= 0">
            <span v-t>page.featured.empty</span>
        </Alert>
        <Row align="stretch" :gap="1" wrap v-if="featuredMaterials.length >= 1">
            <Col v-for="material in featuredMaterials" :key="material.id" cols="12" lg="4" md="4" sm="6">
                <article class="material" @click="router.push({name: 'Player', params: {material: material.id}})">
                    <div class="image-holder">
                        <img v-if="material.thumbnail"
                             :src="material.thumbnail" alt="thumbnail" class="thumbnail">
                        <div v-else class="placeholder"></div>
                    </div>

                    <div class="meta">
                        <div class="state">
                            <p class="title" v-tooltip="material.name">{{ material.name }}</p>

                            <p class="author" v-tooltip="material.user">{{material.user}}</p>
                        </div>
                    </div>
                </article>
            </Col>
        </Row>
    </Card>
</template>

<script lang="ts" setup>
import Card from "@/components/design/card/Card.vue";
import {useRouter} from "vue-router";
import {computed, onMounted, ref} from "vue";
import {useMaterialStore} from "@/stores/material";
import {$t} from "@/translation/Translation";
import FileInput from "@/components/design/input/FileInput.vue";
import Select from "@/components/design/select/Select.vue";

const router = useRouter();
const materialStore = useMaterialStore();

const featuredMaterials = computed(() => {
    return materialStore.featured;
})

const load = async() => {
    await materialStore.loadFeatured();
    await materialStore.load();
}

onMounted(async() => {
    load();
})

const selectedMaterialAdd = ref<string>();

const choicesMaterialsAdd = computed(() => {
    return materialStore.materials
        .filter(material => !material.featured)
        .map((material) => {
            return {
                value: material.id,
                name: material.name
            }
        })
});
const featureMaterialAdd = async() => {
    const material = materialStore.materials.find(material => material.id === selectedMaterialAdd.value);
    if (!material) return;

    material.featured = true;

    await materialStore.updateMaterialFeatured(material, true);

    selectedMaterialAdd.value = undefined;

    await load();
}

const selectedMaterialRemove = ref<string>();

const choicesMaterialsRemove = computed(() => {
    return materialStore.materials
        .filter(material => material.featured)
        .map((material) => {
            return {
                value: material.id,
                name: material.name
            }
        })
});

const featureMaterialRemove = async() => {
    const material = materialStore.materials.find(material => material.id === selectedMaterialRemove.value);
    if (!material) return;

    await materialStore.updateMaterialFeatured(material, false);

    selectedMaterialRemove.value = undefined;

    await load();
}
</script>

<style lang="scss" scoped>
.main-title {
    font-size: 1.75em;
    font-weight: bold;
    line-height: 1.05em;
}
article.material {
    //border: 1px solid #ccc;
    background-color: var(--color-background-accent);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--color-text);
    text-decoration: none;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    position: relative;

    &:before {
        position: absolute;
        content: '';
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        //box-shadow: inset var(--shadow-accent);
        background-color: rgba(221, 250, 209, 0.04);
        z-index: 3;
        opacity: 0;
        pointer-events: none;
    }

    &:hover {
        //background-color: rgba(231, 222, 253, 0.91);
        box-shadow: var(--shadow-accent);

        &:before {
            opacity: 1;
        }

        .image-holder {
            filter: brightness(1.1);
        }
    }

    &:hover:has(.button:hover), &:hover:has(.actions:hover) {
        //background: white;

        &:before {
            opacity: 0;
        }
    }

    .meta {
        width: 100%;
        justify-content: space-between;
        align-items: end;
        padding: 1em;
        gap: 0.5em;

        display: flex;
        overflow: hidden;

        .title {
            font-size: 1.5em;
            font-weight: bold;
            line-height: 1.05em;

            margin-bottom: 0.4em;


            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .author {
            font-size: 0.75em;
            color: #666;


            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .state {
            flex-grow: 0;
            max-width: 100%;
        }
    }

    .image-holder {
        position: relative;
        border-radius: var(--border-radius);
        width: 100%;
        height: 10em;
        flex-grow: 1;

        background-color: #ffffff;
        overflow: hidden;
        box-shadow: var(--shadow-accent);

        transition: filter 0.2s;

        &:before {
            position: absolute;
            content: '';
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 1;
            //box-shadow: inset var(--shadow-accent);
            background-color: rgba(72, 0, 255, 0.11);
        }

        .thumbnail, .placeholder {
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: -1;
        }

        .placeholder {
            width: 100%;
            height: 100%;
            background-image: linear-gradient(135deg, #f4f4f4 25%, transparent 25%), linear-gradient(225deg, #f4f4f4 25%, transparent 25%), linear-gradient(45deg, #f4f4f4 25%, transparent 25%), linear-gradient(315deg, #f4f4f4 25%, #ffffff 25%);
            background-position: 10px 0, 10px 0, 0 0, 0 0;
            background-size: 10px 10px;
            background-repeat: repeat;
        }
    }
}

</style>

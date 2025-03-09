<template>
    <Card fluid>
        <div class="flex flex-justify-space-between flex-align-center">
            <span v-t class="main-title">page.plugins.title</span>
        </div>
    </Card>

    <Card class="mt-1" fluid>
        <div class="flex flex-justify-space-between">

            <p v-t class="title">page.plugins.yours</p>

            <div>
                <Button color="primary" icon="plus">
                    <span v-t>page.plugins.add</span>
                </Button>
            </div>
        </div>
    </Card>

    <Card class="mt-1" fluid>
        <p v-t class="title">page.plugins.faq</p>
    </Card>
</template>

<script lang="ts" setup>
import {useUserStore} from "@/stores/user";
import {useRouter} from "vue-router";
import Card from "@/components/design/card/Card.vue";

const router = useRouter();

const userStore = useUserStore();
</script>

<style lang="scss" scoped>
.main-title {
    font-size: 1.75em;
    font-weight: bold;
    line-height: 1.05em;
}
</style>

<template>
    <Dialog v-model:value="visible" persistent>
        <template #default>
            <Card data-cy="cookies" dialog>
                <div class="flex flex-justify-space-between header">
                    <p v-t class="title">cookies.title</p>

                    <ChangeLanguage></ChangeLanguage>
                </div>

                <p v-t class="mb-1">cookies.message</p>

                <ul class="mb-1">
                    <li v-t>cookies.items.login</li>
                    <li v-t>cookies.items.logged</li>
                    <li v-t>cookies.items.more</li>
                </ul>

                <p v-t class="mb-1">cookies.not-accept</p>

                <div class="flex flex-justify-end">
                    <Button data-cy="cookies-accept" @click="accept"><span v-t>cookies.accept</span></Button>
                </div>
            </Card>
        </template>
    </Dialog>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";
import ChangeLanguage from "@/components/ChangeLanguage.vue";
import {useRoute, useRouter} from "vue-router";

const visible = ref(false);

const route = useRoute();
const router = useRouter();
onMounted(async () => {
    visible.value = localStorage.getItem("cookies") !== "true";

    await router.isReady();

    if (route.query.cookies === "true") {
        visible.value = false;
    }
});

function accept() {
    localStorage.setItem("cookies", "true");
    visible.value = false;
}
</script>

<style lang="scss" scoped>
.header {
    :deep(li) {
        list-style-type: none;

        .button {
            background-color: #ececec;
            box-shadow: var(--shadow-primary), inset var(--shadow-accent);

            &:hover {
                background-color: #dcdcdc;
            }
        }
    }
}
</style>

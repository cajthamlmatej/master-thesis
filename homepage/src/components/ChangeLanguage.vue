<template>
    <Dialog>
        <template #activator="{ toggle }">
            <button @click="toggle">
                <span class="ml-2">Change language</span>
            </button>
<!--            <NavigationButton :hide-mobile="props.header && !props.neverHide"-->
<!--                              data-cy="translate-button"-->
<!--                              :hide-desktop="!props.header && !props.neverHide" :label="language" icon="translate-variant"-->
<!--                              tooltip-position="bottom" tooltip-text="Language" @click="toggle"></NavigationButton>-->
        </template>
        <template #default>
            <Card dialog data-cy="translate-modal">
                <p class="title">Change language</p>

                <List>
                    <ListItem v-for="language in translation.getLanguages()"
                              :active="translation.getLanguage() == language.code"
                              data-cy="language"
                              hover
                              @click="changeLanguage(language.code)">
                        {{ language.label }}
                    </ListItem>
                </List>
            </Card>
        </template>
    </Dialog>
</template>

<script lang="ts" setup>
import {ref} from "vue";
import {translation} from "@/translation/Translation";
import {useRoute, useRouter} from "vue-router";
import Card from "@/components/design/card/Card.vue";
import List from "@/components/design/list/List.vue";
import ListItem from "@/components/design/list/ListItem.vue";
import Dialog from "@/components/design/dialog/Dialog.vue";

const props = defineProps({
    header: {
        type: Boolean,
        default: true,
    },
    neverHide: {
        type: Boolean,
        default: false,
    }
})

const router = useRouter();
const route = useRoute();
const changeLanguage = (code: string) => {
    const link = router.resolve({
        name: route.name as string,
        params: {
            ...route.params ?? {},
            lang: code
        }
    });

    // Redirect the webpage (can't use router)
    window.location.href = link.href;

    translation.changeLanguage(code);
};
</script>

<style lang="scss" scoped>
button  {
    font-family: "Funnel Sans", serif !important;
    border: none;
    display: block;
    color: white;
    text-decoration: none;
    font-size: 1.2rem;
    padding: 0.4em 0.8em;
    border-radius: 0.5em;
    background-color: transparent;
    transition: background-color 0.3s;
    cursor: pointer;

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    @media (max-width: 1200px) {
        padding: 0.2em 0.6em;
        font-size: 1rem;
    }

    @media (max-width: 950px) {
        padding: 0.4em 0.8em;
        font-size: 0.8rem;
    }
}
</style>

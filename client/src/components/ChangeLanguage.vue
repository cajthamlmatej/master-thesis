<template>
    <Dialog>
        <template #activator="{ toggle }">
            <NavigationButton :hide-desktop="!props.header && !props.neverHide"
                              :hide-mobile="props.header && !props.neverHide"
                              :label="language" data-cy="translate-button"
                              icon="translate-variant"
                              tooltip-position="bottom" tooltip-text="Language" @click="toggle"></NavigationButton>
        </template>
        <template #default>
            <Card data-cy="translate-modal" dialog>
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
import NavigationButton from "@/components/design/navigation/NavigationButton.vue";
import {ref} from "vue";
import {translation} from "@/translation/Translation";
import {useRoute, useRouter} from "vue-router";

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

const language = ref(translation.getLanguage());

translation.LANGUAGE_CHANGED.on(() => {
    language.value = translation.getLanguage();
});

const router = useRouter();
const route = useRoute();
const changeLanguage = (code: string) => {
    router.push({
        name: route.name as string,
        params: {
            ...route.params ?? {},
            lang: code
        },
        query: {
            ...route.query ?? {}
        }
    });

    translation.changeLanguage(code);
};
</script>

<style lang="scss" scoped>

</style>

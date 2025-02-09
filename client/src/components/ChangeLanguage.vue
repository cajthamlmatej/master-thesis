<template>
    <Dialog>
        <template #activator="{ toggle }">
            <NavigationButton tooltip-text="Language" tooltip-position="bottom" :label="language" icon="translate-variant" @click="toggle"></NavigationButton>
        </template>
        <template #default>
            <Card dialog>
                <p class="title">Change language</p>

                <List>
                    <ListItem v-for="language in translation.getLanguages()"
                              :active="translation.getLanguage() == language.code"
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
        }
    });

    translation.changeLanguage(code);
};
</script>

<style lang="scss" scoped>

</style>

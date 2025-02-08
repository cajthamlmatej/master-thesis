<template>
    <article :class="props.class" class="form" @keydown.enter="onSubmit">
        <slot :validationChange="validationChange"></slot>

        <slot :isValid="isValid" :onSubmit="onSubmit" name="submit">
            <Button
                :disabled="!isValid"
                icon="content-save"
                type="submit"
                @click="onSubmit"
            >
                Uložit
            </Button>
        </slot>

        <Transition name="fade">
            <Alert v-if="error" class="mt-1" type="error">
                {{ error }}
            </Alert>
        </Transition>
    </article>
</template>

<script lang="ts" setup>
import {ref} from "vue";

interface ValidationChange {
    id: string;
    isValid: boolean;
}

const isValid = ref(false);
const error = ref<string | undefined>(undefined);

const props = defineProps({
    onSubmit: {
        type: Function,
        default: () => undefined,
    },

    class: {
        type: String,
        default: "",
    },
});

const inputs = ref<ValidationChange[]>([]);
const validationChange = (data: ValidationChange) => {
    const index = inputs.value.findIndex(input => input.id === data.id);

    if (index === -1) {
        inputs.value.push(data);
    } else {
        inputs.value[index] = data;
    }

    isValid.value = inputs.value.every(input => input.isValid);
}

const emits = defineEmits(["update:error"]);

const onSubmit = async (e: Event) => {
    if (!isValid.value) return;

    error.value = undefined;
    e.preventDefault();

    if (props.onSubmit) {
        error.value = await props.onSubmit();
    }
};
</script>

<style lang="scss" scoped>
.form {
    ::v-deep(.button) {
        margin-top: 1rem;
        padding: 0.6em 1em;
    }

    ::v-deep(.input):not(:first-child) {
        margin-top: 1rem;
    }

    ::v-deep(> p) {
        margin-top: 1rem;
    }
}
</style>

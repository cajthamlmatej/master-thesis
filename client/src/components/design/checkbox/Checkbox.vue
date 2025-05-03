<template>
    <article :class="classes">
        <label :for="id" class="visualiser"></label>

        <input :id="id" v-model="proxy" :disabled="disabled || readonly" :readonly="readonly" type="checkbox"/>

        <label :for="id" v-html="label">
        </label>
    </article>
</template>

<script lang="ts" setup>
import {v4} from 'uuid';
import {computed, ref, watch} from "vue";

const id = v4();

const props = defineProps({
    disabled: {
        type: Boolean,
        default: false
    },
    value: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        default: ''
    },
    fluid: {
        type: Boolean,
        default: false
    },

    readonly: {
        type: Boolean,
        default: false
    }
});
const emits = defineEmits(['update:value']);

const proxy = ref<boolean>(props.value);

watch(proxy, (value) => {
    if (props.readonly) {
        return;
    }

    emits('update:value', value);
});

watch(() => props.value, (value) => {
    proxy.value = value;
});

const toggle = () => {
    if (props.disabled) {
        return;
    }

    if (props.readonly) {
        return;
    }

    proxy.value = !proxy.value;
};

const classes = computed(() => {
    return {
        'checkbox': true,
        'checkbox--disabled': props.disabled,
        'checkbox--checked': proxy.value,
        'checkbox--fluid': props.fluid,
        'checkbox--readonly': props.readonly
    }
});
</script>

<style lang="scss" scoped>
.checkbox {
    display: flex;
    flex-shrink: 0;
    flex-grow: 0;
    margin: 0.5rem 0;

    > input {
        display: none;
    }

    > label.visualiser {
        display: flex;
        align-items: center;
        justify-content: center;

        flex-shrink: 0;
        flex-grow: 0;

        width: 1.5rem;
        height: 1.5rem;

        border: var(--checkbox-border-width) solid var(--color-checkbox-border);
        border-radius: 0.5rem;

        cursor: pointer;

        transition: all 0.2s ease-in-out;

        &::before {
            content: '';

            display: block;

            width: 0.8rem;
            height: 0.8rem;
            border-radius: 0.25rem;

            background-color: var(--color-checkbox-background-checked);

            transform: scale(0);
            opacity: 0;

            transition: all 0.2s ease-in-out;
        }
    }

    > label:not(.visualiser) {
        display: flex;
        align-items: center;

        padding-left: 1rem;

        cursor: pointer;

        transition: all 0.2s ease-in-out;

        flex-grow: 5;
    }

    &--checked {
        > label.visualiser {
            &::before {
                transform: scale(1);
                opacity: 1;
            }
        }
    }

    &--disabled {
        opacity: 0.8;

        > label.visualiser {
            cursor: not-allowed;
        }

        > label:not(.visualiser) {
            cursor: not-allowed;
        }
    }

    &--readonly {
        > label.visualiser {
            cursor: not-allowed;
        }

        > label:not(.visualiser) {
            cursor: not-allowed;
        }
    }

    &--fluid {
        width: 100%;
    }
}
</style>
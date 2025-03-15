<template>
    <section :class="classes">
        <label v-if="!hideLabel" :for="id">{{ label }}</label>

        <section class="content">
            <input v-if="props.type !== 'textarea'" :id="id" ref="input" v-model="proxy"
                   :placeholder="placeholder"
                   :readonly="readonly" :type="props.type"/>

            <textarea v-if="props.type === 'textarea'" :id="id" v-model="proxy" :readonly="readonly"/>

            <section v-if="!hideError" class="error">
                {{ firstInvalidValidator }}
            </section>
        </section>
    </section>
</template>

<script lang="ts" setup>
import {computed, onMounted, type PropType, ref, watch} from 'vue';
import {v4} from 'uuid';
import moment from 'moment';

const id = v4();

const props = defineProps({
    type: {
        type: String as PropType<'text' | 'email' | 'password' | 'number' | 'datetime-local' | 'textarea'>,
        default: 'text',
    },
    label: {
        type: String,
        default: '',
    },
    value: {
        type: [String, Number, Date, moment] as PropType<string | number | Date | moment.Moment | undefined>,
        default: '',
    },
    placeholder: {
        type: String,
        default: '',
    },
    validators: {
        type: Array as PropType<((value: any) => boolean | string)[]>,
        default: () => [],
    },


    inline: {
        type: Boolean,
        default: false,
    },
    dense: {
        type: Boolean,
        default: false,
    },
    hideLabel: {
        type: Boolean,
        default: false,
    },
    hideError: {
        type: Boolean,
        default: false,
    },
    required: {
        type: Boolean,
        default: false,
    },

    readonly: {
        type: Boolean,
        default: false
    },

    class: {
        type: String,
        default: '',
    },
});

const proxy = ref<string | number>('');

onMounted(() => {
    if (props.type === 'datetime-local') {

        if (props.value instanceof Date) {
            proxy.value = moment(props.value).format('YYYY-MM-DDTHH:mm');
        } else if (moment.isMoment(props.value)) {
            proxy.value = props.value.format('YYYY-MM-DDTHH:mm');
        } else if (typeof props.value === 'string' && props.value.length > 0) {
            proxy.value = moment(props.value).format('YYYY-MM-DDTHH:mm');
        } else {
            proxy.value = moment().format('YYYY-MM-DDTHH:mm');
        }

        console.groupEnd();
    } else {
        proxy.value = props.value?.toString() ?? '';
    }
});

const isValid = computed(() => {
    if (!proxy.value && props.validators?.length == 0) return true;
    if (!proxy.value) return false;

    let value: any = proxy.value.toString();

    if (props.type === 'datetime-local') {
        value = moment(value);
    }

    return props.validators.every(validator => {
        return validator(value) === true;
    });
});
const firstInvalidValidator = computed(() => {
    if (!proxy.value) return '';

    let value: any = proxy.value.toString();

    if (props.type === 'datetime-local') {
        value = moment(value);
    }

    const validator = props.validators.find(validator => validator(value) !== true);
    if (!validator) return '';

    return validator(proxy.value.toString());
});


const emits = defineEmits(['update:value', 'validationChange']);
watch(proxy, (value, oldValue) => {
    // console.group("Proxy changed");

    let newValue = value as string | number | Date | moment.Moment;

    if (props.type === 'datetime-local') {
        // console.log("Is datetime-local");
        // console.log("Old value", oldValue);
        // console.log("New value before", newValue);

        const oldValueMoment = moment(oldValue);
        newValue = moment(newValue);

        // console.log("Are old and new value the same?", newValue.isSame(oldValueMoment));
        if (newValue.isSame(oldValueMoment)) return;
    }

    emits('update:value', newValue);
    console.groupEnd();
});
watch(() => props.value, (value) => {
    if (props.type === 'datetime-local') {
        // console.group("Setting proxy for datetime-local");
        // console.log("Before", value);

        if (value instanceof Date) {
            proxy.value = moment(value).format('YYYY-MM-DDTHH:mm');
        } else if (moment.isMoment(value)) {
            proxy.value = value.format('YYYY-MM-DDTHH:mm');
        } else if (typeof value === 'string' && value.length > 0) {
            proxy.value = moment(value).format('YYYY-MM-DDTHH:mm');
        } else {
            proxy.value = moment().format('YYYY-MM-DDTHH:mm');
        }

        // console.log("After", proxy.value);
        // console.groupEnd();
    } else {
        proxy.value = props.value?.toString() ?? '';
    }
});
watch(isValid, (value) => {
    emits('validationChange', {
        id: id,
        isValid: value,
    });
});

// Default call to remove dirty state
emits('validationChange', {
    id: id,
    isValid: isValid.value,
});

const classes = computed(() => ({
    'input': true,
    'input--inline': props.inline,
    'input--required': props.required,
    'input--invalid': !isValid.value,
    'input--dense': props.dense,
    'input--readonly': props.readonly,
    [props.class]: true,
}));

const input = ref<HTMLInputElement | null>(null);


defineExpose({
    focus: () => {
        input.value?.focus();
    },
    blur: () => {
        input.value?.blur();
    },
});
</script>

<style lang="scss" scoped>
.input {
    display: flex;
    flex-direction: column;
    gap: 0.5em;

    &.input--inline {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        gap: 3em;

        > .input {
            width: 100%;
            flex: 1;
        }
    }

    &.input--required {
        > label {
            position: relative;

            &::after {
                content: "*";
                color: var(--color-input-required-mark);

                position: absolute;
                top: 0.1em;
                right: -0.75em;
            }
        }
    }

    &.input--invalid {
        > .content {
            > input, > textarea {
                background-color: var(--color-input-invalid-background);
                border: var(--input-invalid-border-width) solid var(--color-input-invalid-border);
            }
        }
    }

    &.input--readonly {
        > .content {
            > input, > textarea {
                border: var(--input-invalid-border-width) solid transparent;
                background-color: var(--color-input-background);
                opacity: 0.7;
            }
        }
    }

    &.input--dense {
        > label {
            font-size: 0.8em;
        }

        > .content {
            > input, > textarea {
                padding: 0.4em 0.6em;
            }
        }
    }

    > label {
        width: min-content;

        display: flex;
        flex-direction: column;
        gap: 0.5em;

        font-size: 0.9em;
        font-weight: 600;
        color: var(--color-input-label);
        white-space: nowrap;

        text-transform: uppercase;
    }

    > .content {
        width: 100%;
        display: flex;
        flex-direction: column;


        input, textarea {
            box-sizing: border-box;

            display: block;
            width: 100%;

            padding: 1em 0.8em;

            background-color: var(--color-input-background);
            border-radius: 0.4em;
            border: var(--input-invalid-border-width) solid transparent;

            box-shadow: var(--shadow-accent);

            font-size: 1em;
            //font-weight: 600;
            color: var(--color-input-text);

            transition: border 0.2s ease-in-out, background-color 0.2s ease-in-out;

            &::placeholder {
                color: var(--color-input-placeholder);
            }
        }

        textarea {
            resize: vertical;
            max-height: 15em;
            min-height: 2em;
        }

        > .error {
            width: 100%;
            min-height: 1.5em;

            padding-left: 0.5em;

            display: flex;
            align-items: center;

            font-size: 0.7em;
            font-weight: 600;
            color: var(--color-input-error-text);
        }
    }
}
</style>

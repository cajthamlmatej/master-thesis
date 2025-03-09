<template>
    <section :class="classes" @drop.prevent="onDrop" @dragover.prevent="onDragOver">
        <div class="content" @click.self="($refs.input as HTMLInputElement).click()" @dragstart.prevent>
            <!--            <span v-if="proxy && proxy.name" @click="($refs.input as HTMLInputElement).click()">{{ proxy.name }}</span>-->
            <!--            <span v-else-if="proxy && typeof proxy === 'string' && proxy.length > 0"-->
            <!--                  @click="($refs.input as HTMLInputElement).click()">{{ selectedFileText }} <a-->
            <!--                :href="File.linkToFile(proxy)" target="_blank"><span class="mdi mdi-link-variant"></span></a></span>-->
            <span
                v-if="proxy"
                @click="($refs.input as HTMLInputElement).click()">{{
                    (proxy.length ?? 0) > 0 ? (proxy[0].name + ' ' + props.andMoreText(proxy.length - 1)) : noSelectedText
                }}</span>
            <span v-else @click="($refs.input as HTMLInputElement).click()">{{ noSelectedText }}</span>

            <span v-if="proxy && proxy.length !== 0" class="remove" @click.exact.prevent.capture="proxy = []">
                <span class="mdi mdi-close"></span>
            </span>
        </div>

        <input
            ref="input"
            :multiple="props.multiple"
            type="file"
            @change="selectFiles"
        />

        <Button color="neutral" fluid icon="upload" @click="openFileSelect"
                @dragstart.prevent>
            {{ uploadText }}
        </Button>
    </section>
</template>

<script lang="ts" setup>
import {computed, type PropType, ref, watch} from 'vue';
import {v4} from 'uuid';
import {$t} from "@/translation/Translation";

const id = v4();

const props = defineProps({
    value: {
        type: [Object, String, Array] as PropType<any>,
        default: '',
    },
    validators: {
        type: Array as PropType<((value: any) => boolean)[]>,
        default: () => [],
    },
    multiple: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },

    uploadText: {
        type: String,
        default: $t('components.file-input.choose'),
    },
    noSelectedText: {
        type: String,
        default: $t('components.file-input.no-selected'),
    },
    selectedFileText: {
        type: String,
        default: $t('components.file-input.selected'),
    },
    andMoreText: {
        type: Function,
        default: (count: number) => {
            if (count === 0)
                return '';

            return $t('components.file-input.and-more', {count: count.toString()});
        }
    },

    fluid: {
        type: Boolean,
        default: false,
    },
});

const proxy = ref(props.value);

const isValid = computed(() => {
    if (props.disabled) return true;
    if (!proxy.value) return false;

    let value: any = proxy.value.toString();

    return props.validators.every(validator => {
        return validator(value) === true;
    });
});
const firstInvalidValidator = computed(() => {
    let value: any = proxy.value.toString();

    const validator = props.validators.find(validator => validator(value) !== true);
    if (!validator) return '';

    return validator(proxy.value.toString());
});


const emits = defineEmits(['update:value', 'validationChange']);
watch(proxy, (value) => {
    if (props.disabled) return;

    let newValue = value;

    emits('update:value', newValue);
});
watch(isValid, (value) => {
    emits('validationChange', {
        id: id,
        isValid: value,
    });
});

watch(() => props.value, (value) => {
    proxy.value = value;

    if (proxy.value?.length === 0) {
        if (input.value)
            input.value.value = '';
    }
});

// Default call to remove dirty state
emits('validationChange', {
    id: id,
    isValid: isValid.value,
});

const over = ref(false);
const debounce = ref<any>(0);
const onDragOver = (event: DragEvent) => {
    event.preventDefault();

    if (props.disabled) return;

    over.value = true;

    if (debounce.value !== 0) {
        clearTimeout(debounce.value);
    }

    debounce.value = setTimeout(() => {
        over.value = false;
    }, 100);
};

const onDrop = (event: DragEvent) => {
    if (props.disabled) return;

    over.value = false;
    proxy.value = event.dataTransfer?.files;
};


const input = ref<HTMLInputElement | null>(null);
const openFileSelect = () => {
    if (props.disabled) return;

    input.value?.click();
};
const selectFiles = (event: Event) => {
    if (props.disabled) return;

    const target = event.target as HTMLInputElement;
    proxy.value = target.files;
};


const classes = computed(() => ({
    'file-input': true,
    'file-input--over': over.value,
    'file-input--fluid': props.fluid,
    'file-input--disabled': props.disabled,
}));
</script>

<style lang="scss" scoped>
.file-input {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 1em;

    position: relative;

    &--fluid {
        width: 100%;
    }

    &--disabled {
        opacity: 0.5;
        pointer-events: none;
    }

    &--over {
        &::before {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            // MDI icons file-upload-outline
            content: "\F0552";
            font: normal normal normal 24px/1 "Material Design Icons";
            color: var(--color-input-text);
            background-color: var(--color-input-background);
            border-radius: 0.4em;
            opacity: 0.5;
            z-index: 1;


            display: flex;
            align-items: center;
            justify-content: center;

            pointer-events: none;
        }

        > ::v-deep(*) {
            pointer-events: none;
        }
    }

    input {
        display: none;
    }

    .content {
        cursor: pointer;

        box-sizing: border-box;

        display: block;
        width: 100%;
        flex-shrink: 100;
        flex-basis: 70%;

        padding: 1em 0.8em;

        color: var(--color-input-text);
        background-color: var(--color-input-background-accent);
        border-radius: 0.4em;
        border: 1px solid transparent;

        font-size: 1em;
        //font-weight: 600;

        transition: border 0.2s ease-in-out, background-color 0.2s ease-in-out;

        // If text overflow, show ellipsis
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        position: relative;

        > span.remove {
            margin-left: 0.5em;
            color: var(--color-input-text);
            font-size: 1.2em;
            font-weight: 600;
            position: absolute;
            right: 0.5em;
            padding: 0.2em;

            top: calc(50% - 0.7em);

            transition: color 0.1s ease-in-out;

            &:hover {
                color: var(--color-input-placeholder);
            }
        }
    }

    ::v-deep(.button) {
        flex-grow: 100;
        flex-basis: 30%;
    }
}
</style>

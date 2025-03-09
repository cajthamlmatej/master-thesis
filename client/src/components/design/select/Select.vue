<template>
    <article ref="selectElement" :class="classes">
        <label v-if="!hideLabel">{{ label }}</label>

        <VDropdown
            ref="dropdown"
            v-model:shown="isPicking"
            :disabled="props.disabled"
            :distance="-1"
            class="dropdown"
            placement="bottom-start"
        >
            <button>
                <section class="wrapper">
                    <span :class="{
                        'mdi-menu-down-outline': !isPicking,
                        'mdi-menu-up-outline': isPicking,
                    }" class="mdi"></span>

                    <section
                        v-if="search"
                        class="search"
                        @click="isPicking = true"
                    >
                        <input
                            ref="searchElement"
                            v-model="searchProxy"
                            :placeholder="$t('components.select.search')"
                            tabindex="-1"
                            type="text"
                        />
                    </section>

                    <section v-else-if="selectedItem" class="selected">
                        <span class="name">{{ title }}</span>
                        <span v-if="showSubtitle" class="subtitle">{{ subtitle }}</span>
                    </section>

                    <section v-else class="no-selection">
                        <span class="name">{{ props.noSelectionText }}</span>
                    </section>
                </section>
            </button>

            <template #popper>
                <section :style="'width: ' + (selectElement?.clientWidth ?? 0) + 'px;'"
                         class="dropdown">
                    <section class="choices">
                        <button v-for="choice in choicesBehindSearch" :key="choice.value"
                                :class="{'choice--selected': isSelected(choice)}"
                                class="choice" @click="select(choice)">
                            <span class="name">{{ choice.name }}</span>
                            <span v-if="choice.subtitle" class="subtitle">{{ choice.subtitle }}</span>
                        </button>

                        <button v-if="choicesBehindSearch.length === 0" class="choice not-found" disabled>
                            <span v-t class="name">components.select.no-results</span>
                        </button>
                    </section>
                </section>
            </template>
        </VDropdown>
    </article>
</template>

<script lang="ts" setup>
import {computed, nextTick, onMounted, onUnmounted, type PropType, ref, watch} from "vue";
import {$t} from "@/translation/Translation";

const props = defineProps({
    choices: {
        type: Array as () => Array<{ name: string; value: string; subtitle?: string }>,
        required: true,

        validator: (value: any) => {
            return value.every((item: any) => {
                return item.hasOwnProperty("name") && item.hasOwnProperty("value")
            });
        },
    },
    value: {
        type: [String, Number, Array] as PropType<string | number | Array<string | number>>,
        required: false,
        default: undefined,
    },


    disabled: {
        type: Boolean,
        required: false,
        default: false,
    },
    multiple: {
        type: Boolean,
        required: false,
        default: false,
    },

    label: {
        type: String,
        required: false,
        default: "",
    },

    forceFirstChoice: {
        type: Boolean,
        required: false,
        default: false,
    },

    showSubtitle: {
        type: Boolean,
        required: false,
        default: false,
    },
    hideLabel: {
        type: Boolean,
        required: false,
        default: false,
    },
    noSelectionText: {
        type: String,
        required: false,
        default: $t("components.select.hint"),
    },

    fluid: {
        type: Boolean,
        required: false,
        default: false,
    },

    dense: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const emits = defineEmits(["update:value"]);

const selectElement = ref<HTMLElement | null>(null);
const isPicking = ref(false);

const dropdown = ref(null);
const select = (choice: any) => {
    //(dropdown.value as any).show();
    // call $_computePositio on dropdown
    (dropdown.value as any).onResize();

    nextTick(() => {
        (dropdown.value as any).onResize();

        nextTick(() => {
            (dropdown.value as any).onResize();
        });
    });

    if (!Array.isArray(props.value)) return emits("update:value", choice.value);

    const value = [...props.value];
    const index = value.indexOf(choice.value);

    if (index >= 0) value.splice(index, 1);
    else value.push(choice.value);

    emits("update:value", value);
};
const isSelected = (choice: any) => {
    if (!Array.isArray(props.value)) return props.value === choice.value;

    return props.value.indexOf(choice.value) >= 0;
};

const selectedItem = computed(() => {
    if (!props.value) return null;
    if (!Array.isArray(props.value)) return props.choices.find((choice) => choice.value === props.value);

    const choices = [];

    for (const value of props.value) {
        const choice = props.choices.find((choice) => choice.value === value);
        if (choice) choices.push(choice);
    }

    return choices;
});

const title = computed(() => {
    if (!selectedItem.value) return props.noSelectionText;
    if (!Array.isArray(selectedItem.value)) return selectedItem.value.name;
    if (selectedItem.value.length <= 0) return props.noSelectionText;

    if (selectedItem.value.length > 3) {
        return `${selectedItem.value.length} označených možností`;
    }

    return selectedItem.value.map((item: any) => item.name).join(", ");
});

const subtitle = computed(() => {
    if (!selectedItem.value) return "";
    if (!Array.isArray(selectedItem.value)) return selectedItem.value.subtitle;

    return "";
});

onMounted(() => {
    if (props.forceFirstChoice && !props.value) {
        select(props.choices[0]);
    }

    window.addEventListener("keydown", onKeyDown);
})

onUnmounted(() => {
    window.removeEventListener("keydown", onKeyDown);
})

const choicesBehindSearch = computed(() => {
    if (!search.value) return props.choices;

    return props.choices.filter((choice) => {
        return choice.name.toLowerCase().includes(searchProxy.value.toLowerCase());
    });
});

const search = ref(false);
const searchProxy = ref("");
const searchElement = ref<HTMLElement | null>(null);

watch(() => isPicking.value, (value) => {
    if (search.value) {
        // Force isPicking to be true
        if (!value) {
            search.value = false;
        }
    }
});

const onKeyDown = async (event: KeyboardEvent) => {
    if (!isPicking.value) return; // Probably is not for us
    if (search.value) {
        if (event.key === " ") {
            event.preventDefault();
            event.stopPropagation();

            searchProxy.value += " ";
        }

        return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (event.key === "Enter" || event.key === "ESCAPE") {
        isPicking.value = !isPicking.value;
    } else {
        search.value = true;

        await nextTick();

        searchProxy.value = '';

        if (searchElement.value) {
            searchElement.value.focus();
        }

        // If not special key, add to search
        if (event.key.length === 1) {
            searchProxy.value += event.key;
        }
    }
};

const classes = computed(() => {
    return {
        "select": true,
        "select--picking": isPicking.value,
        "select--fluid": props.fluid,
        "select--disabled": props.disabled,
        "select--dense": props.dense,
    };
});
</script>

<style lang="scss" scoped>
article.select {
    position: relative;
    z-index: 1;
    padding-bottom: 1em;

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

        margin-bottom: 0.5em;
    }

    > div {
        width: 100%;
        height: 100%;
    }

    button {
        position: relative;
        height: 4em;

        width: 100%;

        z-index: 1;

        border: none;
        padding: 0;

        background-color: transparent;

        cursor: pointer;
        text-align: end;

        color: var(--color-text);

        > .wrapper {
            width: 100%;
            height: 100%;
            background-color: var(--color-select-wrapper-background);
            border: none;
            border-radius: 0.5em;
            padding: 0 0.75em;

            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1em;

            transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

            &:hover {
                background-color: var(--color-select-wrapper-background-hover);
                box-shadow: var(--shadow-primary);
            }

            > span.mdi {
                color: var(--color-select-text);
                font-size: 1.5em;
            }

            > section.selected {
                display: flex;
                flex-direction: column;
                align-items: flex-end;

                > span.name {
                    color: var(--color-select-text);
                    font-size: 1em;
                }

                > span.subtitle {
                    color: var(--color-select-text);
                    font-size: 1em;

                }
            }

            > section.search {
                width: 100%;
                height: 100%;

                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: center;

                > input {
                    width: 100%;
                    height: 100%;

                    border: none;
                    background-color: transparent;

                    color: var(--color-select-text);
                    font-size: 1em;

                    &:focus {
                        outline: none;
                    }
                }
            }

            .no-selection {
                color: var(--color-select-text);
                font-size: 1em;
            }
        }
    }

    button > :not(.choices) {
        position: relative;
        z-index: 102;
    }

    &.select--picking {
        button {
            z-index: 2;
            //
            //&:hover {
            //    background-color: var(--color-select-wrapper-background);
            //}

            > .wrapper {

                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;
            }
        }

        button > section.dropdown {
            border-top: var(--select-dropdown-border-width) solid var(--select-dropdown-border-color);

            opacity: 1;

            transform: scaleY(1);
        }
    }

    &.select--disabled {
        button {
            opacity: 0.5;
            cursor: not-allowed;
            background-color: var(--color-select-background-disabled);

            &:hover {
                background-color: var(--color-select-background-disabled);
            }

            > .wrapper {
                box-shadow: none;
            }
        }
    }

    &.select--fluid {
        button {
            width: 100%;
        }
    }

    &.select--dense {
        padding-bottom: 0.5em;
        display: flex;

        button {
            height: auto;

            > .wrapper {
                padding: 0.5em 1em;
                gap: 1em;

                > span.mdi {
                    font-size: 1.8em;
                }
            }
        }
    }
}
</style>

<style lang="scss">
section.dropdown {
    display: flex;
    width: 100%;

    flex-direction: column;
    overflow-x: hidden;

    //padding: 1em 0;
    //padding-top: 4em+1em;

    background-color: var(--color-select-dropdown-background);

    box-shadow: var(--shadow-primary);
    border-top: var(--select-dropdown-border-width) solid transparent;
    border-radius: 0 0 0.4em 0.4em;

    // squish to 0px transform: scaleY(0);
    transform-origin: top;

    transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out;

    > .choices {
        max-height: 15em;
        overflow-y: auto;
        display: flex;
        flex-direction: column;

        > .choice {
            padding: 0.5em 0.75em;
            margin-top: 0.5px;

            display: flex;
            flex-direction: column;
            align-items: flex-end;

            background-color: transparent;
            border: none;

            cursor: pointer;
            text-align: end;

            transition: background-color 0.3s ease-in-out;

            > span.name {
                color: var(--color-select-text);
                font-size: 1em;
            }

            > span.subtitle {
                color: var(--color-select-text);
                font-size: 1em;
            }


            &:not(.not-found):hover {
                background-color: var(--color-select-dropdown-background-hover);
            }

            &.choice--selected {
                background-color: var(--color-select-dropdown-background-active);
            }
        }
    }
}
</style>

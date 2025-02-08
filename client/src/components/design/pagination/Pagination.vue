<template>
    <section :class="classes">
        <span v-if="props.total > 0">{{ props.page }} / {{ props.total }}</span>

        <Button :disabled="props.page === 1" color="neutral" @click="changePage(props.page - 1)"><span v-t>components.pagination.previous</span>
        </Button>

        <Button :disabled="props.page === props.total || props.total === 0" color="neutral"
                @click="changePage(props.page + 1)"><span v-t>components.pagination.next</span>
        </Button>
    </section>
</template>

<script lang="ts" setup>import {computed} from 'vue';


const props = defineProps({
    total: {
        type: Number,
        required: true,
    },
    pageSize: {
        type: Number,
        required: true,
    },
    page: {
        type: Number,
        required: true,
    },

    fluid: {
        type: Boolean,
        required: false,
        default: false,
    },
})

const emits = defineEmits(['update:page']);

const changePage = (page: number) => {
    let newPage = page;

    if (page < 1) {
        newPage = 1;
    }

    if (page > props.total) {
        newPage = props.total;
    }

    emits('update:page', newPage);
};


const classes = computed(() => {
    return {
        'pagination': true,
        'pagination--fluid': props.fluid,
    };
});
</script>

<style lang="scss" scoped>
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 1rem;

    &--fluid {
        width: 100%;
    }
}
</style>

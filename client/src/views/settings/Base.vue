<template>
    <Row wrap>
        <Col cols="12" md="6">
            <Card fluid>
                <p class="title" v-t>page.user-settings.user.title</p>

                <Input type="password" :label="$t('page.user-settings.user.new-password')" v-model:value="newPassword"
                       :validators="[
                           (v: string) => v.length >= 8 || $t('page.register.fields.password.short'),
                           (v: string) => v.length < 255 || $t('page.register.fields.password.long')
                       ]"></Input>

                <Input type="text" :label="$t('page.user-settings.user.name')" v-model:value="newName"
                       :validators="[
                            (v: string) => !!v || $t('page.register.fields.name.required'),
                            (v: string) => v.length > 3 || $t('page.register.fields.name.short'),
                            (v: string) => v.length < 255 || $t('page.register.fields.name.long')
                       ]"></Input>

                <Divider></Divider>

                <Input type="password" :label="$t('page.user-settings.user.current')"
                       v-model:value="currentPassword"></Input>

                <Alert type="error" v-if="error" class="my-1">
                    <span>{{ error }}</span>
                </Alert>

                <div class="flex flex-justify-end">
                    <Button @click="updateAccount" :loading="loading"
                            :disabled="newName.length <= 3 || newPassword.length <= 3 || currentPassword.length <= 3">
                        <span v-t>page.user-settings.user.change</span>
                    </Button>
                </div>
            </Card>
        </Col>
        <Col cols="12" md="6">
            <Card fluid>
                <p class="title" v-t>page.user-settings.export.title</p>

                <p v-t class="mb-1">page.user-settings.export.description</p>

                <Alert v-if="exported || recent" class="mb-1" type="error">
                    <p v-if="exported" v-t="{date: exportExpiresAt}">page.user-settings.export.exported</p>
                    <p v-else-if="recent" v-t>page.user-settings.export.recent</p>
                </Alert>

                <div class="flex flex-justify-end gap-1">
                    <Button v-if="exported" @click="downloadExport" :loading="loading">
                        <span v-t>page.user-settings.export.download</span>
                    </Button>
                    <Button v-else-if="!recent" @click="processExport" :loading="loading">
                        <span v-t>page.user-settings.export.process</span>
                    </Button>
                </div>
            </Card>
        </Col>
        <!--        <Col cols="12" md="4">-->
        <!--            <Card fluid>-->
        <!--                <p class="title" v-t>page.user-settings.delete.title</p>-->

        <!--                <p v-t>page.user-settings.delete.description</p>-->
        <!--                <p v-t>page.user-settings.delete.warning</p>-->

        <!--                <Input type="password" class="mt-1" :label="$t('page.user-settings.delete.password')" v-model:value="currentPassword"></Input>-->

        <!--                <div class="flex flex-justify-end">-->
        <!--                    <Button class="mt-1" type="error" @click="deleteAccount">-->
        <!--                        <span v-t>page.user-settings.delete.delete</span>-->
        <!--                    </Button>-->
        <!--                </div>-->
        <!--            </Card>-->
        <!--        </Col>-->
    </Row>
</template>

<script lang="ts" setup>
import {$t} from "@/translation/Translation";
import {onMounted, ref} from "vue";
import {useUserStore} from "@/stores/user";
import {useDataExportStore} from "@/stores/dataExport";
import moment from "moment";
import Row from "@/components/design/grid/Row.vue";

const userStore = useUserStore();
const dataExportStore = useDataExportStore();

const exported = ref(false);
const recent = ref(false);
const exportExpiresAt = ref("");

const currentPassword = ref("");
const newPassword = ref("");
const newName = ref("");

const loading = ref(false);
const error = ref(false as boolean | string);

onMounted(async () => {
    loading.value = true;
    newName.value = userStore.user?.name ?? "";

    await load();

    loading.value = false;
})

const load = async() => {
    await dataExportStore.load();
    exported.value = false;
    recent.value = false;

    if (dataExportStore.dataExport) {
        recent.value = true;

        if (dataExportStore.dataExport.completedAt) {
            exported.value = true;
            exportExpiresAt.value = moment(dataExportStore.dataExport.expiresAt).format("DD. MM. YYYY HH:mm");
        }
    }
}

const processExport = async () => {
    if (loading.value) return;

    loading.value = true;

    await dataExportStore.process();
    await load();

    loading.value = false;
};
const downloadExport = () => {
    if (loading.value) return;

    loading.value = true;
    dataExportStore.download();
    loading.value = false;
};
const deleteAccount = () => {

};
const updateAccount = async () => {
    if (loading.value) return;

    loading.value = true;

    const response = await userStore.updateUser({
        name: newName.value,
        password: newPassword.value,
        currentPassword: currentPassword.value
    });

    if (!response) {
        error.value = $t("page.user-settings.user.error");
        loading.value = false;
        return;
    }

    loading.value = false;
};
</script>

<style lang="scss" scoped>
</style>

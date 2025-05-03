<template>
    <Row wrap>
        <Col cols="12" md="4">
            <Card fluid>
                <p v-t class="title">page.user-settings.user.title</p>

                <Input v-model:value="newName" :label="$t('page.user-settings.user.name')" :validators="[
                            (v: string) => !!v || $t('page.register.fields.name.required'),
                            (v: string) => v.length > 3 || $t('page.register.fields.name.short'),
                            (v: string) => v.length < 255 || $t('page.register.fields.name.long')
                       ]"
                       type="text"></Input>

                <Divider></Divider>

                <Input v-model:value="currentPassword" :label="$t('page.user-settings.user.current')"
                       type="password"></Input>

                <Alert v-if="errorUser" class="my-1" type="error">
                    <span>{{ errorUser }}</span>
                </Alert>

                <div class="flex flex-justify-end">
                    <Button :disabled="newName.length <= 3 || currentPassword.length <= 3" :loading="loading"
                            @click="updateAccount">
                        <span v-t>page.user-settings.user.change</span>
                    </Button>
                </div>
            </Card>
        </Col>
        <Col cols="12" md="4">
            <Card fluid>
                <p v-t class="title">page.user-settings.password.title</p>

                <Input v-model:value="newPassword" :label="$t('page.user-settings.password.new-password')" :validators="[
                           (v: string) => v.length >= 8 || $t('page.register.fields.password.short'),
                           (v: string) => v.length < 255 || $t('page.register.fields.password.long')
                       ]"
                       type="password"></Input>
                <Input v-model:value="newPasswordRepeat" :label="$t('page.user-settings.password.new-password-repeat')" :validators="[
                           (v: string) => v.length >= 8 || $t('page.register.fields.password.short'),
                           (v: string) => v.length < 255 || $t('page.register.fields.password.long'),
                           (v: string) => v === newPassword || $t('page.user-settings.password.match')
                       ]"
                       type="password"></Input>

                <Alert v-if="errorPassword" class="my-1" type="error">
                    <span>{{ errorPassword }}</span>
                </Alert>

                <div class="flex flex-justify-end">
                    <Button :disabled="newPassword != newPasswordRepeat || newPassword.length < 8" :loading="loading"
                            @click="updatePassword">
                        <span v-t>page.user-settings.password.change</span>
                    </Button>
                </div>
            </Card>
        </Col>
        <Col cols="12" md="4">
            <Card fluid>
                <p v-t class="title">page.user-settings.export.title</p>

                <p v-t class="mb-1">page.user-settings.export.description</p>

                <Alert v-if="exported || recent" class="mb-1" type="error">
                    <p v-if="exported" v-t="{date: exportExpiresAt}">page.user-settings.export.exported</p>
                    <p v-else-if="recent" v-t>page.user-settings.export.recent</p>
                </Alert>

                <div class="flex flex-justify-end gap-1">
                    <Button v-if="exported" :loading="loading" @click="downloadExport">
                        <span v-t>page.user-settings.export.download</span>
                    </Button>
                    <Button v-else-if="!recent" :loading="loading" @click="processExport">
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
    <Dialog
        v-model:value="finished"
    >
        <Card dialog>
            <p class="title" v-t>page.user-settings.changed.title</p>

            <p v-t>page.user-settings.changed.description</p>
        </Card>
    </Dialog>
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
const newPasswordRepeat = ref("");
const newName = ref("");

const loading = ref(false);
const errorUser = ref(false as boolean | string);
const errorPassword = ref(false as boolean | string);
const finished = ref(false as boolean);

onMounted(async () => {
    loading.value = true;
    newName.value = userStore.user?.name ?? "";

    await load();

    loading.value = false;
})

const load = async () => {
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
    errorUser.value = false;

    const response = await userStore.updateUser({
        name: newName.value,
        currentPassword: currentPassword.value,
    });

    if (!response) {
        errorUser.value = $t("page.user-settings.user.error");
        loading.value = false;
        return;
    }

    loading.value = false;
    finished.value = true;
};
const updatePassword = async () => {
    if (loading.value) return;

    loading.value = true;
    errorPassword.value = false;

    const response = await userStore.updateUser({
        password: newPassword.value
    });

    if (!response) {
        errorPassword.value = $t("page.user-settings.password.error");
        loading.value = false;
        return;
    }

    loading.value = false;
    newPassword.value = "";
    newPasswordRepeat.value = "";
    finished.value = true;
};
</script>

<style lang="scss" scoped>
</style>

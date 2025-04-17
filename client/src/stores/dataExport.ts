import {defineStore} from "pinia";
import {ref, toRaw, watch} from "vue";
import {useAuthenticationStore} from "@/stores/authentication";
import {api} from "@/api/api";
import OneDataExportSuccessDTO from "../../lib/dto/data-export/OneDataExportSuccessDTO";
import fileSaver from "file-saver";

export const useDataExportStore = defineStore("dataExport", () => {
    const authenticationStore = useAuthenticationStore();
    const dataExport = ref<OneDataExportSuccessDTO["dataExport"] | undefined>(undefined);

    const load = async () => {
        dataExport.value = await api.dataExport.get(authenticationStore.parsed!.id).then((res) => res?.dataExport);
    };

    const process = async() => {
        const res = await api.dataExport.create(authenticationStore.parsed!.id);
    }

    const download = async() => {
        const res = await api.dataExport.download(authenticationStore.parsed!.id, dataExport.value?.id!);

        if(!res) return;

        fileSaver.saveAs(res.blob, "data-export.zip");
    }

    return {
        load,
        dataExport,
        process,
        download
    }
});

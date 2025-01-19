export interface UpdateMaterialDTO {
    name?: string;
    slides?: {
        id: string;
        data: string;
    }[];
}
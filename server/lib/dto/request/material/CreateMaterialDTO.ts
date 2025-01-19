export interface CreateMaterialDTO {
    name: string;
    slides: {
        id: string;
        data: string;
    }[];
}
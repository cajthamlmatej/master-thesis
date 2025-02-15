export interface AllMaterialSuccessDTO {
    materials: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        visibility: string;
        method: string;
        automaticTime: number;
        sizing: string;
        thumbnail: string | undefined;
    }[];
}

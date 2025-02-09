export interface AllMaterialSuccessDTO {
    materials: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        visibility: string;
        method: string;
        automaticTime: number;
        sizing: string;
        name: string;
        thumbnail: string | undefined;
    }[];
}
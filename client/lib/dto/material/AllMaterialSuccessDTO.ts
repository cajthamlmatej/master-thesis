export interface AllMaterialSuccessDTO {
    materials: {
        id: string;
        createdAt: Date;
        user: string;
        updatedAt: Date;
        visibility: string;
        method: string;
        automaticTime: number;
        sizing: string;
        name: string;
        thumbnail: string | undefined;
        featured: boolean;
    }[];
}
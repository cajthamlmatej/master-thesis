import {MaterialDTO} from "./MaterialDTO";

export interface AllMaterialSuccessDTO {
    materials: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        thumbnail: string | undefined;
    }[];
}
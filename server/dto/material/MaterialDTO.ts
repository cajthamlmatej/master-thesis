export interface MaterialDTO {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    slides: {
        id: string;
        data: string;
        thumbnail: string | undefined;
        position: number;
    }[];
}
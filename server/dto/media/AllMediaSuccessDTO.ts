export interface AllMediaSuccessDTO {
    media: {
        id: string;
        name: string;
        mimetype: string;
        size: number;
    }[];
}
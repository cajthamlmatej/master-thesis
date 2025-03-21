export interface MaterialDTO {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    plugins: {
        plugin: string;
        release: string;
    }[];
    visibility: string;
    method: string;
    automaticTime: number;
    sizing: string;
    user: string;
    slides: {
        id: string;
        data: {
            editor: {
                size: {
                    width: number;
                    height: number;
                },
                color: string
            },
            blocks: {
                id: string,
                type: string,
                [key: string]: any;
            }[]
        };
        thumbnail: string | undefined;
        position: number;
    }[];
}
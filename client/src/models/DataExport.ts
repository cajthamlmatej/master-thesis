import type moment from "moment";

export default class DataExport {
    id: string;

    user: string;
    createdAt: moment.Moment;
    status: 'PENDING' | 'FINISHED' | 'ARCHIVED';
    finishedAt?: moment.Moment;
    file?: string;

    constructor(id: string, user: string, createdAt: moment.Moment, status: 'PENDING' | 'FINISHED' | 'ARCHIVED', finishedAt?: moment.Moment, file?: string) {
        this.id = id;
        this.user = user;
        this.createdAt = createdAt;
        this.status = status;
        this.finishedAt = finishedAt;
        this.file = file;
    }
}
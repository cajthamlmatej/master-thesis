import {HydratedDocument, Types} from 'mongoose';

/**
 * Represents a repository that manipulates data in the database.
 */
export default abstract class Repository<T> {
    /**
     * Gets document by id.
     * @param id Id of the document.
     */
    public abstract getById(id: string | Types.ObjectId): Promise<HydratedDocument<T> | null>;
}
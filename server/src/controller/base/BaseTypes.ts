import express from "express";

export interface AllRepository<T> {
    getAll(req: express.Request): Promise<T[]>;
}

export interface CreateRepository<T, R> {
    create(data: R): Promise<T>;
}

export interface DeleteRepository<T> {
    delete(id: string): Promise<void>;
    exists(id: string): Promise<boolean>;
}

export interface UpdateRepository<T> {
    update(id: string, data: any): Promise<T>;
    exists(id: string): Promise<boolean>;
}

export interface OneRepository<T> {
    getOneById(id: string): Promise<T | null>;
}
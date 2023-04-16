import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    private static readonly INDEX_DB_NAME = 'local-index';
    private static readonly INDEX_DB_OBJECT_STORE = 'local-index-object';

    private indexDb?: IDBPDatabase;

    constructor() {
        void this.initializeIndexDb();
    }

    public async get<T>(key: string): Promise<T | undefined> {
        if (!this.indexDb) {
            await this.initializeIndexDb();
        }

        if (!this.indexDb) {
            throw new Error('index db failed to opend');
        }

        return await this.indexDb.get(LocalStorageService.INDEX_DB_OBJECT_STORE, key);
    }

    public async set<T>(key: string, value: T): Promise<void> {
        if (!this.indexDb) {
            await this.initializeIndexDb();
        }

        if (!this.indexDb) {
            throw new Error('index db failed to opend');
        }

        await this.indexDb.put(LocalStorageService.INDEX_DB_OBJECT_STORE, value, key);
    }

    public async empty(): Promise<void> {
        if (!this.indexDb) {
            await this.initializeIndexDb();
        }

        if (!this.indexDb) {
            throw new Error('index db failed to opend');
        }

        await this.indexDb.clear(LocalStorageService.INDEX_DB_OBJECT_STORE);
    }

    private initializeIndexDb(): Promise<void> {
        return new Promise((resolve) => {
            openDB(LocalStorageService.INDEX_DB_NAME, 1, {
                upgrade(db) {
                    db.createObjectStore(LocalStorageService.INDEX_DB_OBJECT_STORE);
                },
            }).then((db) => {
                this.indexDb = db;
                resolve();
            });
        });
    }
}

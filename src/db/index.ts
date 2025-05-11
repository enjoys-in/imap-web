
import { UserMailAccountSettings } from '@/lib/types/interfaces/AccountSettings';
import { EmailOnly } from '@/lib/types/interfaces/EmailResponse';
import { MailBoxListResponse } from '@/lib/types/interfaces/MailBoxListResponse.interface';

import Dexie, { type EntityTable,  Table } from 'dexie';

type Tables = {
  imap_mails: EntityTable<EmailOnly, "uid">
  mailboxes: EntityTable<MailBoxListResponse, "path">
  settings: EntityTable<UserMailAccountSettings, "email">
}
type TableValue<T> = T extends Table<infer U, any> ? U : never;
type QueryOperator = 'equals' | 'anyOf' | 'above' | 'below' | 'between';
type PrimaryKeyType<T extends keyof Tables> = Tables[T] extends Table<infer U, infer PK> ? PK : never;
type Primitive = string | number | boolean | bigint | symbol | null | undefined;

type NestedKeys<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends Primitive | Function | Array<any>
  ? `${Prefix}${K & string}`
  : T[K] extends object
  ? `${Prefix}${K & string}` | NestedKeys<T[K], `${Prefix}${K & string}.`>
  : never;
}[keyof T];

type NestedValueFromPath<T, P extends string> =
  P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
  ? NestedValueFromPath<T[Key], Rest>
  : never
  : P extends keyof T
  ? T[P]
  : never;

type QueryWhere<K extends keyof Tables> = {
  field: keyof Tables[K];
  operator?: QueryOperator;
  value: any;
};

type QueryOptions<K extends keyof Tables> = {
  where?: QueryWhere<K>;
  sortBy?: TableValue<Tables[K]>;
  offset?: number;
  limit?: number;
  reverse?: boolean;
  count?: boolean;
  each?: (item: Tables[K]) => void;
  primaryKeys?: boolean;
  raw?: boolean;
};

const db = new Dexie('airsend') as Dexie & Tables;
type TableKeys = keyof Tables;
type TableSchema = {
  [tableName in TableKeys]: string;
}
const tables: TableSchema = {
  imap_mails: 'uid',
  mailboxes: '++id, path',
  settings: "email"

}

db.version(1).stores(tables).upgrade((tx) => {
  // tx. objectStore('mails').index('message_id');

})
export { db }
class AirsendDB {

  constructor() {
    !db.isOpen() && db.open();

  }
  private getPrimaryKeyForTable(tableName: keyof TableSchema): string {
    const schema = tables[tableName];
    const keys = schema.split(',').map(key => key.trim());
    const validKeys = keys.filter(key => !key.startsWith('++'));
    return validKeys[0];
  }

  async openNewDatabase(dbName: string, version: number = 1, objectStores: string[]) {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, version);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBRequest).result;

        objectStores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
          }
        });
      };

      request.onsuccess = () => {
        const db = (request.result as IDBDatabase);
        resolve(db);
      };

      request.onerror = (event) => {
        reject(`Error opening database: ${event}`);
      };
    });
  }
  closeDbConnection() {
    return db.isOpen() && db.close()
  }
  async cleanDb() {
    return db.delete().then(() => db.open())
  }

  private getTable<K extends keyof Tables>(tableName: K) {
    return db.table(tableName);
  }

  async addItem<K extends keyof Tables>(table: K, item: Partial<TableValue<Tables[K]>>) {
    return this.getTable(table).add(item);
  }

  async bulkAddItems<K extends keyof Tables>(table: K, items: TableValue<Tables[K]>[]) {
    return this.getTable(table).bulkAdd(items);
  }

  async putItem<K extends keyof Tables>(table: K, item: Partial<TableValue<Tables[K]>>) {
    return this.getTable(table).put(item);
  }
  async bulkPutItems<K extends keyof Tables>(table: K, item: Tables[K][]) {
    return this.getTable(table).bulkPut(item);
  }
  // 🟢 Read
  async getItemByKey<K extends keyof Tables>(table: K, value: string): Promise<TableValue<Tables[K]> | undefined> {
    return this.getTable(table).get(value);
  }

  async getAllItems<K extends keyof Tables>(table: K, sorted: boolean = false): Promise<Array<TableValue<Tables[K]>>> {
    return this.getTable(table).toArray();
  }
  async getItemsByIndex<K extends keyof Tables>(table: K, where: keyof TableValue<Tables[K]>, equals: string, limit: number = 10): Promise<Array<TableValue<Tables[K]>> | undefined> {
    return this.getTable<K>(table)
      .where(where as unknown as string)
      .equals(equals)
      .reverse()
      .limit(limit)
      .toArray();
  };

  async getItemsChunk<K extends keyof Tables>(
    table: K,
    offset: number,
    limit: number
  ) {
    return this.getTable(table).offset(offset).limit(limit).toArray();
  }
  async query<K extends keyof Tables>(
    table: K,
    options: QueryOptions<K> = {}
  ): Promise<any> {
    const {
      where,
      sortBy,
      offset = 0,
      limit = Infinity,
      reverse = false,
      count = false,
      each,
      primaryKeys = false,
      raw = false,
    } = options;

    const tableRef = this.getTable<K>(table);
    let collection: Dexie.Collection<Tables[K], any>;

    // Apply where clause if present
    if (where) {
      const { field, operator = 'equals', value } = where;
      const clause = tableRef.where(field as any);
      switch (operator) {
        case 'equals':
          collection = clause.equals(value);
          break;
        case 'anyOf':
          collection = clause.anyOf(value);
          break;
        case 'above':
          collection = clause.above(value);
          break;
        case 'below':
          collection = clause.below(value);
          break;
        case 'between':
          if (Array.isArray(value) && value.length === 2) {
            collection = clause.between(value[0], value[1]);
          } else {
            throw new Error("Value for 'between' must be a 2-element array");
          }
          break;
        default:
          throw new Error(`Unsupported operator: ${operator}`);
      }
    } else {
      collection = tableRef.toCollection();
    }

    // // Apply sorting
    // if (sortBy) {
    //   collection = collection.sortBy("sortBy");
    // }

    // collection.count()
    // collection.keys()
    // collection.uniqueKeys()
    // collection.first()
    // collection.filter()
    // collection.last()

    if (reverse) {
      collection = collection.reverse();
    }

    collection = collection.offset(offset).limit(limit);

    // Return raw Dexie collection (optional)
    if (raw) return collection;

    // Return count
    if (count) return await collection.count();

    // Execute `each` callback if provided
    if (each) {
      await collection.each(each);
      return;
    }

    // Return only primary keys
    if (primaryKeys) {
      return await collection.primaryKeys();
    }

    // Default return: array of objects
    return collection.toArray();
  }


  // 🟠 Update
  async updateItem<K extends keyof Tables>(
    table: K,
    field_value: string,
    updated: TableValue<Tables[K]>
  ) {
    return this.getTable(table).update(field_value, updated);
  }

  // 🔴 Delete
  async deleteItem<K extends keyof Tables>(table: K, field_value: any) {
    return this.getTable(table).delete(field_value);
  }

  async bulkDeleteItems<K extends keyof Tables>(table: K, keys: any[]) {
    return this.getTable(table).bulkDelete(keys);
  }

  async pruneOldItems<K extends keyof Tables>(table: K, keyField: keyof Tables[K], maxLimit = 50) {
    const items = await this.getAllItems<K>(table) as any[]

    if (items.length > maxLimit) {
      const oldest = items.slice(0, items.length - maxLimit);
      await this.bulkDeleteItems(table, oldest.map(item => item[keyField]));
    }
  }
  // 🟠 Nested Object Functions

  getNestedValue<
    T,
    P extends NestedKeys<T>
  >(obj: T, path: P): NestedValueFromPath<T, P> | undefined {
    return (path as string).split('.').reduce((o: any, key: string) => (o?.[key] ?? undefined), obj);
  }

  // Get a nested field with strict types for path and primaryKey
  async getNestedItem<T extends keyof Tables>(
    tableName: T,
    primaryKey: PrimaryKeyType<T>,
    path: NestedKeys<TableValue<Tables[T]>>
  ): Promise<any> {
    const table = this.getTable(tableName) as Table<any, any>;
    const record = await table.get(primaryKey);
    if (!record) return undefined;

    const keys = (path as string).split('.');
    let obj = record;

    for (const key of keys) {
      if (obj == null || !(key in obj)) return undefined;
      obj = obj[key];
    }

    return obj;
  }
  async addNestedItem<T extends keyof Tables>(
    tableName: T,
    primaryKeyValue: PrimaryKeyType<T>,
    updates: Partial<Record<NestedKeys<TableValue<Tables[T]>>, any>>
  ): Promise<{ success: boolean; created: boolean; updatedPaths: string[] }> {
    const table = this.getTable(tableName) as Table<any, any>;

    // Try to get existing record
    let record = await table.get(primaryKeyValue);
    const created = !record;


    if (!record) {
      const primaryKey = this.getPrimaryKeyForTable(tableName);
      record = { [primaryKey]: primaryKeyValue } as TableValue<Tables[T]>;
    }

    const updatedPaths: string[] = [];

    for (const [path, value] of Object.entries(updates)) {
      const keys = path.split('.');
      let obj = record;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (typeof obj[key] !== 'object' || obj[key] === null) {
          obj[key] = {};
        }
        obj = obj[key];
      }

      const finalKey = keys[keys.length - 1];
      obj[finalKey] = value;
      updatedPaths.push(path);
    }

    await table.put({ ...record, updatedAt: Date.now?.() });

    return { success: true, created, updatedPaths };
  }

  async updateNestedItem<T extends keyof Tables>(
    tableName: T,
    primaryKey: PrimaryKeyType<T>,  // Primary key is dynamically typed based on the selected table
    path: NestedKeys<TableValue<Tables[T]>>,  // Path is dynamically typed based on the table's entity structure
    value: any
  ): Promise<{ success: boolean; path: string; oldValue?: any; newValue?: any }> {
    const table = this.getTable(tableName) as Table<any, any>;
    const record = await table.get(primaryKey);
    if (!record) return { success: false, path };

    const keys = (path as string).split('.');
    let obj = record;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in obj)) return { success: false, path };
      obj = obj[keys[i]];
    }

    const finalKey = keys[keys.length - 1];
    const oldValue = obj[finalKey];
    obj[finalKey] = value;

    await table.put({ ...record, updatedAt: Date.now?.() });

    return { success: true, path, oldValue, newValue: value };
  }
  async updateMultipleNestedItems<T extends keyof Tables>(
    tableName: T,
    primaryKey: PrimaryKeyType<T>,  // Primary key is dynamically typed based on the selected table
    updates: Partial<Record<NestedKeys<TableValue<Tables[T]>>, any>> // Path is dynamically typed based on the table's entity structure
  ): Promise<{ success: boolean; updated: string[] }> {
    const table = this.getTable(tableName) as Table<any, any>;
    const record = await table.get(primaryKey);
    if (!record) return { success: false, updated: [] };

    const updatedPaths: string[] = [];

    for (const [path, value] of Object.entries(updates)) {
      const keys = path.split('.');
      let obj = record;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in obj)) continue;
        obj = obj[keys[i]];
      }
      const finalKey = keys[keys.length - 1];
      obj[finalKey] = value;
      updatedPaths.push(path);
    }

    await table.put({ ...record, updatedAt: Date.now?.() });
    return { success: true, updated: updatedPaths };
  }


}
export const airsendDB = new AirsendDB();
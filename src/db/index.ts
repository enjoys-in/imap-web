
import { EmailOnly } from '@/lib/types/interfaces/EmailResponse';
import { MailBoxListResponse } from '@/lib/types/interfaces/MailBoxListResponse.interface';
import { MailData } from '@/lib/types/mail.interface';
import Dexie, { type EntityTable, InsertType, Table } from 'dexie';

type Tables = {

  imap_mails: EntityTable<EmailOnly, "message_id">
  mailboxes: EntityTable<MailBoxListResponse, "path">
}
type TableValue<T> = T extends Table<infer U, any> ? U : never;
type QueryOperator = 'equals' | 'anyOf' | 'above' | 'below' | 'between';

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

const tables = {
  mails: '++id,message_id, to',
  mailboxes: '++id,path',
  // attachments: "message_id"
}

db.version(1).stores(tables);
export { db }
class AirsendDB {

  constructor() {
    // super('airsend');
    !db.isOpen() && db.open();

  }

  async openDatabase(dbName: string, version: number = 1, objectStores: string[]) {
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

  async addItem<K extends keyof Tables>(table: K, item: TableValue<Tables[K]>) {
    return this.getTable(table).add(item);
  }

  async bulkAddItems<K extends keyof Tables>(table: K, items: TableValue<Tables[K]>[]) {
    return this.getTable(table).bulkAdd(items);
  }

  async putItem<K extends keyof Tables>(table: K, item: Tables[K]) {
    return this.getTable(table).put(item);
  }
  async bulkPutItems<K extends keyof Tables>(table: K, item: Tables[K][]) {
    return this.getTable(table).bulkPut(item);
  }
  // 🟢 Read
  async getItemByKey<K extends keyof Tables>(table: K, key: any) {
    return this.getTable(table).get(key);
  }

  async getAllItems<K extends keyof Tables>(table: K, sorted: boolean = false) {

    return this.getTable(table).toArray();
  }
  async getItemsByIndex<K extends keyof Tables>(table: K, where: string, equals: string, limit: number = 10) {
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
    key: string,
    updated: Partial<Tables[K]>
  ) {
    return this.getTable(table).update(key, updated);
  }

  // 🔴 Delete
  async deleteItem<K extends keyof Tables>(table: K, key: any) {
    return this.getTable(table).delete(key);
  }

  async bulkDeleteItems<K extends keyof Tables>(table: K, keys: any[]) {
    return this.getTable(table).bulkDelete(keys);
  }




  async pruneOldItems<K extends keyof Tables>(table: K, keyField: keyof Tables[K], maxLimit = 50) {
    const items = await this.getAllItems(table);
    if (items.length > maxLimit) {
      const oldest = items.slice(0, items.length - maxLimit);
      await this.bulkDeleteItems(table, oldest.map(item => item[keyField]));
    }
  }



}
export const airsendDB = new AirsendDB();
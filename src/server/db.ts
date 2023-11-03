import { Base } from "deta";
import type { CompositeType, ObjectType } from "deta/dist/types/types/basic";

export const base = Base("videos");

export interface Video {
  id: string,
  createdAt: string,
  updatedAt: string,
  sharing: boolean,
  delete_after_link_expires: boolean,
  shareLinkExpiresAt: string,
  linkShareSeo: boolean,
  title: string,
}

class DB {
  async create<T>(data: ObjectType): Promise<T> {
    return await base.put(data) as T;
  }

  async findUnique<T>(key: string): Promise<T> {
    return await base.get(key) as T;
  }

  async findMany<T>(query: CompositeType | undefined = undefined): Promise<T[]> {
    const res = await base.fetch(query);
    return res.items as T[];
  }

  async updateMany<T>(query: CompositeType | undefined, updates: ObjectType): Promise<T[]> {
    const { items } = await base.fetch(query);
    for (const item of items) {
      await base.update(updates, item.key as string);
    }
    return await base.fetch(query).then((res) => res.items) as T[];
  }

  async deleteMany<T>(query: CompositeType | undefined): Promise<T[]> {
    const { items } = await base.fetch(query);
    for (const item of items) {
      await base.delete(item.key as string);
    }
    return items as T[];
  }
}

export const db = new DB();

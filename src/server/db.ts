import { Base } from "deta";
import type { CompositeType, ObjectType } from "deta/dist/types/types/basic";

export const base = Base("metadata");

export type VideoMetadata = {
  key: string;
  id: string;
  createdAt: number;
  updatedAt: number;
  sharing: boolean;
  delete_after_link_expires: boolean;
  shareLinkExpiresAt: number | null;
  linkShareSeo: boolean;
  title: string;
};

class DB {
  async create<T extends ObjectType>(data: T): Promise<T | null> {
    return (await base.put(data)) as T | null;
  }

  async findUnique<T extends ObjectType>(key: string): Promise<T | null> {
    return (await base.get(key)) as T | null;
  }

  async findMany<T extends ObjectType>(
    query: CompositeType | undefined = undefined
  ): Promise<T[]> {
    const res = await base.fetch(query);
    return res.items as T[];
  }

  async updateMany<T extends ObjectType>(
    query: CompositeType | undefined,
    updates: ObjectType
  ): Promise<T[]> {
    const { items } = await base.fetch(query);
    for (const item of items) {
      await base.update(updates, item.key as string);
    }
    const res = await base.fetch(query);
    return res.items as T[];
  }

  async deleteMany<T extends ObjectType>(
    query: CompositeType | undefined
  ): Promise<T[]> {
    const { items } = await base.fetch(query);
    for (const item of items) {
      await base.delete(item.key as string);
    }
    return items as T[];
  }
}

export const db = new DB();

import { t } from "elysia";

/** Returns field names array of object schema. */
export function schemaFields<T extends TProperties>(obj: TObject<T>) {
    return Object.keys(obj.properties) as Array<keyof typeof obj.static>;
}
type TObject<T extends TProperties> = ReturnType<typeof t.Object<T>>;
type TProperties = Parameters<typeof t.Object>["0"];

export type MaybePromise<T> = T | Promise<T>;

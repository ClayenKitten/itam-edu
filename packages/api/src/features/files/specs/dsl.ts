export type Token = string | UUID_TOKEN;

export const uuid: unique symbol = Symbol("uuid");
export type UUID_TOKEN = typeof uuid;
export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export type MatchResult = {
    ids: UUID[];
    name: string;
    extension: string | null;
};

export function match<P extends readonly Token[]>(
    path: readonly string[],
    rules: {
        /** File path. */
        pattern: P;
        /** Allowed name of the file. */
        name?: string;
        /** Allowed extensions. */
        extensions?: ReadonlyArray<string>;
    }
): MatchResult | null {
    if (path.length !== rules.pattern.length + 1) return null;

    const ids: UUID[] = [];
    for (let i = 0; i < path.length - 1; i++) {
        const segment = path[i]!;
        const token = rules.pattern[i]!;
        if (typeof token === "string") {
            if (segment !== token) return null;
        } else {
            if (!isUuid(segment)) return null;
            ids.push(segment as UUID);
        }
    }

    const filename = splitFilename(path[path.length - 1]!);
    if (rules.name !== undefined && rules.name !== filename.name) {
        return null;
    }
    if (
        rules.extensions !== undefined &&
        !rules.extensions.includes(filename.extension ?? "")
    ) {
        return null;
    }

    return { ids, name: filename.name, extension: filename.extension };
}

function isUuid(id: string | undefined): id is UUID {
    if (id === undefined) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
        id
    );
}

function splitFilename(filename: string) {
    const parts = filename.split(".");
    const extension = parts.pop() ?? "";
    const name = parts.join(".");
    return { name, extension };
}

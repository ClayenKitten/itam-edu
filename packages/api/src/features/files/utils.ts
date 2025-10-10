export function splitFilename(filename: string): {
    name: string;
    extension: string | null;
} {
    const lastDot = filename.lastIndexOf(".");
    if (lastDot <= 0 || lastDot === filename.length - 1) {
        return { name: filename, extension: null };
    }

    const name = filename.slice(0, lastDot);
    const extension = filename.slice(lastDot + 1);
    return { name, extension };
}

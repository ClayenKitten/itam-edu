export function match(value: string): value is "1" | "2" {
    return value === "1" || value === "2";
}

export function match(value: string): value is "autumn" | "spring" {
    return value === "autumn" || value === "spring";
}

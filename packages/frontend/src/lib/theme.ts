export const themes = ["default", "red", "blue", "green", "pink"] as const;
export type Theme = (typeof themes)[number];

export function getColors(theme: Theme | string) {
    switch (theme) {
        case "red":
            return {
                primary: "#FF6A55",
                primaryBorder: "#FFD6D0",
                onPrimary: "#FFEFEC"
            };
        case "blue":
            return {
                primary: "#2462D6",
                primaryBorder: "#C1E9FF",
                onPrimary: "#E7F4FB"
            };
        case "green":
            return {
                primary: "#34B526",
                primaryBorder: "#9FE197",
                onPrimary: "#E9FAE7"
            };
        case "pink":
            return {
                primary: "#FF70E0",
                primaryBorder: "#FFBCEF",
                onPrimary: "#FFF1FC"
            };
        default:
            return {
                primary: "#6E7CEC",
                primaryBorder: "#CFD4FF",
                onPrimary: "#ECEEFF"
            };
    }
}

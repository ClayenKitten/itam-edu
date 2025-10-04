import { format as formatDate } from "date-fns";
import { ru } from "date-fns/locale";
import type { GlobalRole } from "itam-edu-common";
import type { LessonSchedule } from "./types";

export function formatLessonPlace(schedule: LessonSchedule): string {
    let str = "";
    if (schedule.isOnline) {
        str += "онлайн";
        if (schedule.location) str += " и ";
    }
    if (schedule.location) str += `в ${schedule.location}`;
    if (str === "") return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatLessonSchedule(
    schedule: LessonSchedule | null
): string | null {
    if (!schedule) return null;
    let str = formatLessonPlace(schedule);

    if (str !== "") str += ", ";
    str += formatDate(schedule.date, "d MMMM (cccc), HH:mm", { locale: ru });
    // Capitalize

    return str;
}

export function formatPeriod({
    year,
    semester
}: {
    year: number;
    semester: "autumn" | "spring";
}) {
    if (semester === "autumn") {
        return `Осень ${year}`;
    } else {
        return `Весна ${year}`;
    }
}

export function formatGlobalRole(role: GlobalRole) {
    if (role === "admin") return "Администратор";
    if (role === "supervisor") return "Менеджер";
    if (role === "default") return "Пользователь";
    let guard: never = role;
    return role;
}

/**
 * Returns a noun after number in the correct form.
 *
 * @example
 * ```ts
 * formatNumberAndNoun(1, ["кот", "кота", "котов"]) // "кот"
 * formatNumberAndNoun(4, ["кот", "кота", "котов"]) // "кота"
 * formatNumberAndNoun(7, ["кот", "кота", "котов"]) // "котов"
 * formatNumberAndNoun(12, ["кот", "кота", "котов"]) // "котов"
 * formatNumberAndNoun(22, ["кот", "кота", "котов"]) // "кота"
 * ```
 * */
export function formatNounAfterNum(
    num: number,
    conjugation: [кот: string, кота: string, котов: string]
): string {
    const integer = Math.abs(Math.floor(num));
    const [кот, кота, котов] = conjugation;

    if (integer % 100 >= 11 && integer % 100 <= 19) {
        return котов;
    }
    if (integer % 10 === 1) {
        return кот;
    }
    if (integer % 10 >= 2 && integer % 10 <= 4) {
        return кота;
    }
    return котов;
}

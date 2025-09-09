import { format as formatDate } from "date-fns";
import { ru } from "date-fns/locale";
import type { LessonScheduleDTO } from "itam-edu-api/src/courses/lesson/query";

export function formatLessonSchedule(
    schedule: LessonScheduleDTO | null
): string | null {
    if (!schedule) return null;

    // Location
    let str = "";
    if (schedule.online) {
        str += "онлайн";
        if (schedule.offline) str += " и ";
    }
    if (schedule.offline) str += "офлайн";
    if (schedule.offline?.location) str += ` в ${schedule.offline.location}`;
    // Date
    if (str !== "") str += ", ";
    str += formatDate(schedule.date, "d MMMM (cccc), HH:mm", { locale: ru });
    // Capitalize
    str = str.charAt(0).toUpperCase() + str.slice(1);

    return str;
}

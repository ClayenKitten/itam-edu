import type { LessonPartial } from "$lib/types";

/** Groups lessons by schedule. */
export function groupLessonsBySchedule(lessons: LessonPartial[]): LessonGroups {
    const now = Date.now();
    const twoHoursMs = 2 * 60 * 60 * 1000;
    const dayMs = 24 * 60 * 60 * 1000;

    const groups: LessonGroups = {
        planned: [],
        soon: [],
        ongoing: [],
        ended: [],
        unscheduled: []
    };

    for (const lesson of lessons) {
        if (lesson.schedule === null) {
            groups.unscheduled.push(lesson);
            continue;
        }
        const startMs = new Date(lesson.schedule.date).getTime();
        const endMs = startMs + twoHoursMs;

        if (startMs > now) {
            if (startMs - now <= dayMs) {
                groups.soon.push(lesson);
            } else {
                groups.planned.push(lesson);
            }
        } else if (now <= endMs) {
            groups.ongoing.push(lesson);
        } else {
            groups.ended.push(lesson);
        }
    }

    return groups;
}

/** Lesson groups derived from schedule. */
export type LessonGroups = {
    /** Future lessons, except "soon" ones. */
    planned: LessonPartial[];
    /** Future lessons starting within 2 hours. */
    soon: LessonPartial[];
    /** Started less than 2 hours ago. */
    ongoing: LessonPartial[];
    /** Finished (more than ~2 hours since start). */
    ended: LessonPartial[];
    /** No schedule set. */
    unscheduled: LessonPartial[];
};

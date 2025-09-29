import type {
    CourseQueryDto,
    CourseQueryPartialDto
} from "itam-edu-api/src/courses/query";
import type {
    LessonDTO,
    LessonPartialDTO,
    LessonScheduleDto
} from "itam-edu-api/src/courses/lesson/query";
import type {
    CreateHomeworkDTO,
    HomeworkDTO,
    HomeworkPartialDTO
} from "itam-edu-api/src/courses/homework/query";
import type {
    SubmissionDto,
    SubmissionPartialDto
} from "itam-edu-api/src/courses/submission/query";
import type { CourseChange as CourseChangeDto } from "itam-edu-api/src/courses/changes";
import type { WebNotification } from "itam-edu-api/src/notifications";
import type { StaffMemberDto } from "itam-edu-api/src/courses/staff/schema";
import type { InviteDto } from "itam-edu-api/src/courses/staff/invites/query";
import type { StudentDto } from "itam-edu-api/src/courses/student/schema";
import type { AttendeeDto } from "itam-edu-api/src/courses/lesson/attendance/query";
import type {
    CreateCourseDto,
    UpdateCourseDto
} from "itam-edu-api/src/courses/schema";
import type { CallDto } from "itam-edu-api/src/calls/dao";

export type Course = CourseQueryDto;
export type CoursePartial = CourseQueryPartialDto;
export type CreateCourse = CreateCourseDto;
export type UpdateCourse = UpdateCourseDto;
export type CourseChange = CourseChangeDto;

export type StaffMember = StaffMemberDto;
export type Invite = InviteDto;
export type Student = StudentDto;

export type Lesson = LessonDTO;
export type LessonPartial = LessonPartialDTO;
export type LessonSchedule = LessonScheduleDto;
export type Attendee = AttendeeDto;

export type Homework = HomeworkDTO;
export type HomeworkPartial = HomeworkPartialDTO;
export type CreateHomework = CreateHomeworkDTO;

export type Submission = SubmissionDto;
export type SubmissionPartial = SubmissionPartialDto;

export type Call = CallDto;

export type Notification = WebNotification;

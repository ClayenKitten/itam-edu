import type { User } from "itam-edu-common";
import { randomUUID } from "crypto";
import { inject, injectable } from "inversify";
import { CallDao, type CallDto } from "./dao";
import { LessonRepository } from "../courses/lesson/repository";
import { CourseRepository } from "../courses/repository";
import { LiveKit } from "../../infra/livekit";
import {
    EncodedFileOutput,
    EncodedFileType,
    EncodingOptionsPreset,
    RoomCompositeEgressRequest,
    RoomEgress,
    S3Upload
} from "livekit-server-sdk";
import type { AppConfig } from "itam-edu-common/config";
import { AppError } from "../../errors";
import {
    CourseNotFound,
    LessonNotFound,
    LessonNotScheduledConflict
} from "../courses/errors";

@injectable()
export class CreateCall {
    public constructor(
        @inject("AppConfig")
        private config: AppConfig,
        private dao: CallDao,
        private courseRepo: CourseRepository,
        private lessonRepo: LessonRepository,
        private livekit: LiveKit
    ) {}

    public async invoke(
        actor: User,
        options: CreateCallOptions
    ): Promise<CallDto> {
        if (options.courseId === undefined) {
            if (actor.permissions.calls.create !== true) {
                throw new AppError(
                    "call-creation-not-allowed",
                    "Вы не имеете права создавать звонки.",
                    { httpCode: 403 }
                );
            }
        } else {
            const course = await this.courseRepo.getById(options.courseId);
            const permissions = course?.getPermissionsFor(actor);
            if (!course || !permissions) {
                throw new CourseNotFound(options.courseId);
            }
            if (permissions.calls.manage !== true) {
                throw new AppError(
                    "course-call-creation-not-allowed",
                    "Вы не имеете права создавать звонки в этом курсе.",
                    { httpCode: 403 }
                );
            }
        }

        let id: string = randomUUID();
        let title: string;
        let cover: string | null = null;
        if (options.lessonId !== undefined) {
            const lesson = await this.lessonRepo.load(
                options.courseId,
                options.lessonId
            );
            if (lesson === null) {
                throw new LessonNotFound(options.lessonId);
            }
            if (lesson.schedule === null) {
                throw new LessonNotScheduledConflict(options.lessonId);
            }
            id = lesson.id;
            title = lesson.info.title;
            cover = lesson.info.banner;
        } else {
            title = options.title;
        }
        const call = await this.dao.create(
            id,
            title,
            options.courseId ?? null,
            actor.id,
            cover
        );

        const output = {
            case: "s3",
            value: new S3Upload({
                endpoint: this.config.s3.endpoint,
                bucket: this.config.s3.bucket,
                accessKey: this.config.s3.accessKey,
                secret: this.config.s3.secretKey,
                forcePathStyle: true
            })
        } as const;

        await this.livekit.roomService.createRoom({
            name: id,
            maxParticipants: 1000,
            emptyTimeout: 1 * 60 * 60,
            departureTimeout: 1 * 60 * 60,
            egress: new RoomEgress({
                room: new RoomCompositeEgressRequest({
                    roomName: id,
                    layout: "single-speaker",
                    options: {
                        case: "preset",
                        value: EncodingOptionsPreset.H264_1080P_30
                    },
                    fileOutputs: [
                        new EncodedFileOutput({
                            fileType: EncodedFileType.MP4,
                            filepath: "recordings/{room_name}/{time}",
                            output
                        })
                    ]
                })
            })
        });
        return call;
    }
}

export type CreateCallOptions =
    | {
          title: string;
          courseId?: undefined;
          lessonId?: undefined;
      }
    | {
          title: string;
          courseId: string;
          lessonId?: undefined;
      }
    | {
          title?: undefined;
          courseId: string;
          lessonId: string;
      };

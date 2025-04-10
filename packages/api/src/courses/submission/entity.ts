/** Homework submission. */
export class Submission {
    public constructor(
        public homeworkId: string,
        public studentId: string,
        /**
         * Chat messages of the submission.
         *
         * Must be sorted by date in ascending order.
         * */
        public messages: [SubmissionMessage, ...SubmissionMessage[]]
    ) {}

    public get accepted(): boolean | null {
        return this.messages.at(-1)!.accepted;
    }

    public get lastMessage(): SubmissionMessage {
        return this.messages.at(-1)!;
    }
}

export type SubmissionMessage = {
    id: string;
    /**
     * User that sent the message.
     *
     * If null, message is produced by the system.
     * */
    userId: string;
    content: string;
    sentAt: Date;
    accepted: boolean | null;
};

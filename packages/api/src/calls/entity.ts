export class Call {
    public constructor(
        public id: string,
        public title: string,
        public ownerId: string
    ) {}

    public get metadata(): CallMetadata {
        return {
            ownerId: this.ownerId,
            title: this.title
        };
    }
}

export type CallMetadata = {
    ownerId: string;
    title: string;
};

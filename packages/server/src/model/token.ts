import {Entity, UUIDField, IDField, uuid, EnumField, Field} from "@marcj/marshal";

export enum TokenRole {
    USER = 0,
}

@Entity('token', 'tokens')
export class Token {
    @IDField()
    @UUIDField()
    token: string = uuid();

    @UUIDField()
    target: string;

    @EnumField(TokenRole)
    role: TokenRole;

    @Field()
    created: Date = new Date;

    constructor(target: string, role: TokenRole) {
        this.target = target;
        this.role = role;
    }
}

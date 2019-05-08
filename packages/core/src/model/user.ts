import {Entity, uuid, Field, UUIDField, IDField, EnumField, Optional} from "@marcj/marshal";
import {RoleType} from "./role";
import {IdInterface} from "@marcj/glut-core";
import {Buffer} from "buffer";

@Entity('BaseUser', 'users')
export class BaseUser implements IdInterface {
    @IDField()
    @UUIDField()
    id: string = uuid();

    @Field()
    version: number = 1;

    @Field()
    username: string;

    @Field()
    email: string;

    @EnumField(RoleType)
    role: RoleType = RoleType.regular;

    @Field(Buffer)
    @Optional()
    image?: Buffer;

    @Field()
    created: Date = new Date();

    @Field()
    updated: Date = new Date();

    constructor(username: string, email: string, role: RoleType) {
        this.username = username;
        this.email = email;
        this.role = role;
    }
}

@Entity('User', 'users')
export class User extends BaseUser {
    @Field()
    password: string;

    constructor(username: string, email: string, role: RoleType, password: string) {
        super(username, email, role);
        this.password = password;
    }
}

@Entity('FrontendUser', 'users')
export class FrontendUser extends BaseUser {

}

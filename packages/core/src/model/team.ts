import {uuid, Entity, IDField, UUIDField, Field, EnumField} from "@marcj/marshal";
import {IdInterface} from "@marcj/glut-core";

@Entity('team', 'teams')
export class Team implements IdInterface {
    @IDField()
    @UUIDField()
    id: string = uuid();

    @Field()
    version: number = 1;

    @UUIDField()
    accountId: string;

    @Field()
    name: string;

    @Field()
    created: Date = new Date();

    @Field()
    updated: Date = new Date();

    constructor(accountId: string, name: string) {
        this.accountId = accountId;
        this.name = name;
    }
}

export enum TeamRole {
    regular = 0,
    admin = 1,
}

@Entity('userTeam', 'userTeams')
export class UserTeam {
    @UUIDField()
    user: string;

    @UUIDField()
    team: string;

    @EnumField(TeamRole)
    role: TeamRole = TeamRole.regular;

    constructor(user: string, team: string) {
        this.user = user;
        this.team = team;
    }
}

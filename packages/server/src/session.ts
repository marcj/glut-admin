import {RoleType} from "@glut/admin-core";
import {Injectable} from "injection-js";
import {SessionStack} from '@marcj/glut-server';

export class UserSession {
    constructor(
        public readonly authenticatedUserId: string,
        public readonly chosenAccountId: string,
        public readonly username: string,
        public readonly role: RoleType,
    ) {
    }
}

@Injectable()
export class SessionHelper {
    constructor(private sessionStack: SessionStack) {
    }

    get session() {
        return this.sessionStack.getSession();
    }

    public hasSession() {
        return this.sessionStack.isSet();
    }

    public getUserSession(): UserSession {
        if (!this.session || !(this.session instanceof UserSession)) {
            throw new Error('No user authenticated.');
        }
        return this.session;
    }
}

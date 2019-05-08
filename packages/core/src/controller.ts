import {Collection, EntitySubject} from "@marcj/glut-core";
import {FrontendUser, User} from "./model/user";

export interface AppControllerInterface {
    login(username: string, password: string): Promise<string>;

    getCurrentUser(): Promise<EntitySubject<FrontendUser>>;

    getUsers(): Promise<Collection<FrontendUser>>;

    getUsers(): Promise<Collection<FrontendUser>>;

    getUser(id: string): Promise<EntitySubject<FrontendUser>>;

    removeUser(userId: string): Promise<void>;

    updatePassword(userId: string, password: string): Promise<void>;

    patchUser(userId: string, patches: any): Promise<void>;

    createUser(user: User): Promise<void>;

    createOrganisation(user: User): Promise<void>;
}

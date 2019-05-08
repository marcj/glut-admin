import {Injectable} from 'injection-js';
import {User} from '@glut/admin-core';
import {Database} from '@marcj/marshal-mongo';
import {Token, TokenRole} from '../model/token';

/**
 * This class is server wide, not per connection. So, do not cache stuff based on sessionHelper as it would be never cleared.
 */
@Injectable()
export class PermissionManager {
    constructor(
        private database: Database,
    ) {
    }

    public async getUserForToken(token: string): Promise<User | null> {
        const tokenInstance = await this.database.get(Token, {
            token: token,
            role: TokenRole.USER
        });

        if (!tokenInstance) {
            throw new Error(`No token found for ${token}`);
        }

        const user = await this.database.get(User, {
            id: tokenInstance.target
        });

        if (!user) {
            throw new Error(`No user found anymore for ${tokenInstance.token}`);
        }

        return user;
    }
}

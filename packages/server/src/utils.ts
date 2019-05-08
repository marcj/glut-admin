import {RoleType} from '@glut/admin-core';
import {ClassType, getClassPropertyName} from "@marcj/estdlib";

/**
 * Decorator
 */
export const Role = (role: RoleType) => {
    return (target: Object, property: string) => {
        Reflect.defineMetadata('role', role, target, property);
    };
};

export function getRole<T>(classType: ClassType<T>, actionName: string): RoleType {
    const role = Reflect.getMetadata('role', classType.prototype, actionName);
    if (undefined === role) {
        throw new Error(`Action ${getClassPropertyName(classType, actionName)} has no @Role()`);
    }

    return role;
}

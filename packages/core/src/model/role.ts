//note: Do not add new types between, since we store ids numeric positional ID in the database tokens.
export enum RoleType {
    anonymouse,
    readonly,
    regular,
    admin,
    billing,
    server,
    job,
}

export let RoleHierarchy: {[baseRole: number]: RoleType[]} = {};
RoleHierarchy[RoleType.admin] = [RoleType.regular, RoleType.billing, RoleType.anonymouse];
RoleHierarchy[RoleType.regular] = [RoleType.billing, RoleType.anonymouse];
RoleHierarchy[RoleType.readonly] = [RoleType.anonymouse];
RoleHierarchy[RoleType.server] = [RoleType.anonymouse];
RoleHierarchy[RoleType.billing] = [RoleType.anonymouse];
RoleHierarchy[RoleType.anonymouse] = [];
RoleHierarchy[RoleType.job] = [];

export function hasRole(has: RoleType, needs: RoleType): boolean {
    return has === needs || -1 !== RoleHierarchy[has].indexOf(needs);
}

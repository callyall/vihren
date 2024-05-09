export interface Mutation {
    type: MutationType;
    element: Node;
    target: Node;
}

export enum MutationType {
    Added,
    Removed,
    Updated,
}

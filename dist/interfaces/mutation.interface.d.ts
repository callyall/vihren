export interface Mutation {
    type: MutationType;
    element: Node;
    target: Node;
}
export declare enum MutationType {
    Added = 0,
    Removed = 1,
    Updated = 2
}

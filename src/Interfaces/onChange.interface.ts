import { Mutation } from "./mutation.interface";

export interface OnChange {
    onChange(mutation: Mutation): unknown;
}
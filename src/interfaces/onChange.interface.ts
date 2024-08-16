import { Mutation } from "./mutation.interface";

/**
 * Lifecycle hook that is called when a change in the DOM or data of the component occurs.
 */
export interface OnChange {
    /**
     * Called when a change in the DOM or data of the component occurs.
     */
    onChange(mutation: Mutation): unknown;
}

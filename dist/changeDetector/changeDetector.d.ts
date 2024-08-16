import { Mutation } from "../interfaces/mutation.interface";
import { Observable } from "rxjs";
import { ChangeDetectorInterface } from "../interfaces/changeDetector.interface";
/**
 * Detects changes in the DOM.
 */
export declare class ChangeDetector extends Observable<Mutation> implements ChangeDetectorInterface {
    private readonly root;
    constructor(root: HTMLElement);
    private init;
    onRemoved(): Observable<Mutation>;
    onAdded(): Observable<Mutation>;
    onUpdated(): Observable<Mutation>;
}

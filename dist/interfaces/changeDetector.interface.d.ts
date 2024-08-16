import { Observable } from "rxjs";
import { Mutation } from "./mutation.interface";
/**
 * Interface for the ChangeDetector class.
 */
export interface ChangeDetectorInterface {
    /**
     * Returns an observable that emits when an element is removed from the DOM.
     *
     * @return {Observable<Mutation>}
     */
    onRemoved(): Observable<Mutation>;
    /**
     * Returns an observable that emits when an element is added to the DOM.
     *
     * @return {Observable<Mutation>}
     */
    onAdded(): Observable<Mutation>;
    /**
     * Returns an observable that emits when an element is updated in the DOM.
     *
     * @return {Observable<Mutation>}
     */
    onUpdated(): Observable<Mutation>;
}

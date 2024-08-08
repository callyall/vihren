import { Observable } from "rxjs";
import { Mutation } from "./mutation.interface";

export interface ChangeDetectorInterface {
    onRemoved(): Observable<Mutation>;
    onAdded(): Observable<Mutation>;
    onUpdated(): Observable<Mutation>;
}
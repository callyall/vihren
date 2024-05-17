import { Injectable } from "../../decorators/injectable.decorator/injectable.decorator";
import { filter, map, Observable, Subject } from "rxjs";

@Injectable({ shared: true })
export class ComponentEventEmitter {
    private subject: Subject<ComponentEventData<any, any>>;

    public constructor() {
        this.subject = new Subject<ComponentEventData<any, any>>();
    }

    public emit<S, D>(type: string, data: ComponentEventPayload<S, D>): void {
        this.subject.next({ type, data });
    }

    public on<S, D>(type: string): Observable<ComponentEventPayload<S, D>> {
        return this
            .subject
            .asObservable()
            .pipe(
                filter((e) => e.type === type),
                map((e) => e.data)
            );
    }
}

export interface ComponentEventPayload<S,D> {
    source: S,
    data: D,
}

interface ComponentEventData<S, D> {
    type: string;
    data: ComponentEventPayload<S, D>;
}

import { interval, Observable, SchedulerLike, Subscriber } from "rxjs";
import { Injectable } from "../../decorators/injectable.decorator/injectable.decorator";

@Injectable({ shared: true })
export class TimeService {
    public sleep(ms: number): Promise<void> {
        return new Promise<void>((r) => setTimeout(r, ms));
    }

    public sleepRx(ms: number): Observable<void> {
        return new Observable((subscriber: Subscriber<void>) => {
            const timeout = setTimeout(() => subscriber.next(), ms);

            return () => clearTimeout(timeout);
        });
    }

    public interval(ms: number, scheduler?: SchedulerLike): Observable<number> {
        return interval(ms, scheduler);
    }
}

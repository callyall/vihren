import { Observable, SchedulerLike } from "rxjs";
export declare class TimeService {
    sleep(ms: number): Promise<void>;
    sleepRx(ms: number): Observable<void>;
    interval(ms: number, scheduler?: SchedulerLike): Observable<number>;
}

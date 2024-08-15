import { Injectable, TimeService} from "../../src";
import { map, Observable, take } from "rxjs";

@Injectable({ shared: true })
export class CounterService {
    public constructor(private readonly timeService: TimeService) {}

    public getCounter(): Observable<number> {
        return this.timeService.interval(1000)
            .pipe(
                take(11),
                map((number) => 10 - number)
            )
    }
}

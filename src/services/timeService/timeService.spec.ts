import { TimeService } from "./timeService";

describe('TimeService', () => {
    const period: number = 100;
    const threshold: number = 110;

    let timeService: TimeService;

    beforeAll(() => {
        timeService = new TimeService();
    })

    it('Should sleep for 100ms', async () => {
        const start = Date.now();
        await timeService.sleep(period);
        const end = Date.now();
        expect(end - start).toBeGreaterThanOrEqual(period);
        expect(end - start).toBeLessThan(threshold);
    });

    it('Should sleep for 100ms using RxJS', done => {
        const start = Date.now();
        timeService.sleepRx(period).subscribe({
            next: () => {
                const end = Date.now();
                expect(end - start).toBeGreaterThanOrEqual(period);
                expect(end - start).toBeLessThan(threshold);
                done();
            }
        })
    });

    it('Should run an interval of 100ms', done => {
        let start = Date.now();
        const subscription = timeService.interval(period).subscribe({
            next: (number: number) => {
                const end = Date.now();
                expect(end - start).toBeGreaterThanOrEqual(period);
                expect(end - start).toBeLessThan(threshold);

                if (number < 3) {
                    start = end;
                    return;
                }

                subscription.unsubscribe();
                done();
            }
        });
    });
});

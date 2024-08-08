import { Mutation, MutationType } from "../interfaces/mutation.interface";
import { filter, Observable, Subscriber } from "rxjs";
import { ChangeDetectorInterface } from "../interfaces/changeDetector.interface";


export class ChangeDetector extends Observable<Mutation> implements ChangeDetectorInterface
{
    public constructor(private readonly root: HTMLElement)
    {
        if (!root.parentNode) {
            throw new Error('Root element does not have a parent node');
        }

        super((subscriber) => this.init(subscriber));
    }

    private init(subscriber: Subscriber<Mutation>): () => void
    {
        const observer = new MutationObserver(
            (mutations: MutationRecord[]) => {
                let updated: Mutation[] = [];
                let added: Mutation[] = [];
                let removed: Mutation[] = [];

                for (let mutation of mutations) {
                    if (Array.from(mutation.removedNodes ?? []).find((node) => node === this.root)) {
                        subscriber.complete();
                        return;
                    }

                    if (!this.root.contains(mutation.target)) {
                        continue;
                    }

                    if (['attributes', 'characterData'].includes(mutation.type) && !updated.find((m) => m.element === mutation.target)) {
                        updated.push({ element: mutation.target, type: MutationType.Updated, target: mutation.target });
                    }

                    if (mutation.removedNodes) {
                        for (let node of mutation.removedNodes) {
                            if (!removed.find((m) => m.element === node)) {
                                removed.push({ element: node, type: MutationType.Removed, target: mutation.target });
                            }
                        }
                    }

                    if (mutation.addedNodes.length > 0) {
                        for (let node of mutation.addedNodes) {
                            if (!added.find((m) => m.element === node)) {
                                added.push({ element: node, type: MutationType.Added, target: mutation.target });
                            }
                        }
                    }
                }

                updated = updated.filter((sm) => !removed.find((tm) => tm.element === sm.element));
                added = added.filter((sm) => !removed.find((tm) => tm.element === sm.element));

                removed.forEach((m) => subscriber.next(m));
                added.forEach((m) => subscriber.next(m));
                updated.forEach((m) => subscriber.next(m));
            }
        );

        observer.observe(this.root.parentNode as Node, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
        });

        return () => observer.disconnect();
    }

    public onRemoved(): Observable<Mutation>
    {
        return this.pipe(filter((mutation) => mutation.type === MutationType.Removed));
    }

    public onAdded(): Observable<Mutation>
    {
        return this.pipe(filter((mutation) => mutation.type === MutationType.Added));
    }

    public onUpdated(): Observable<Mutation>
    {
        return this.pipe(filter((mutation) => mutation.type === MutationType.Updated));
    }
}
import { Mutation, MutationType } from "../interfaces/mutation.interface";
import { filter, Observable, Subscriber } from "rxjs";
import { ChangeDetectorInterface } from "../interfaces/changeDetector.interface";

/**
 * Detects changes in the DOM.
 */
export class ChangeDetector extends Observable<Mutation> implements ChangeDetectorInterface {
    private mutationObserver: MutationObserver | null = null;
    private subscribers: Subscriber<Mutation>[] = [];

    public constructor(private readonly rootElement: HTMLElement) {
        if (!rootElement.parentNode) {
            throw new Error('Root element does not have a parent node');
        }

        super((subscriber) => this.init(subscriber));
    }

    private init(subscriber: Subscriber<Mutation>): () => void {
        this.subscribers.push(subscriber);

        if (!this.mutationObserver) {
            this.startMutationObserver();
        }

        return () => this.onTeardown(subscriber);
    }

    private startMutationObserver(): void {

        this.mutationObserver = new MutationObserver(
            (mutations: MutationRecord[]) => {
                let updated: Mutation[] = [];
                let added: Mutation[] = [];
                const removed: Mutation[] = [];

                for (const mutation of mutations) {
                    if (Array.from(mutation.removedNodes ?? []).find((node) => node === this.rootElement)) {
                        this.detach();
                        return;
                    }

                    if (!this.rootElement.contains(mutation.target)) {
                        continue;
                    }

                    if (['attributes', 'characterData'].includes(mutation.type) && !updated.find((m) => m.element === mutation.target)) {
                        updated.push({ element: mutation.target, type: MutationType.Updated, target: mutation.target });
                    }

                    if (mutation.removedNodes) {
                        for (const node of mutation.removedNodes) {
                            if (!removed.find((m) => m.element === node)) {
                                removed.push({ element: node, type: MutationType.Removed, target: mutation.target });
                            }
                        }
                    }

                    if (mutation.addedNodes.length > 0) {
                        for (const node of mutation.addedNodes) {
                            if (!added.find((m) => m.element === node)) {
                                added.push({ element: node, type: MutationType.Added, target: mutation.target });
                            }
                        }
                    }
                }

                updated = updated.filter((sm) => !removed.find((tm) => tm.element === sm.element));
                added = added.filter((sm) => !removed.find((tm) => tm.element === sm.element));

                removed.forEach((m) => this.subscribers.forEach((subscriber) => subscriber.next(m)));
                added.forEach((m) => this.subscribers.forEach((subscriber) => subscriber.next(m)));
                updated.forEach((m) => this.subscribers.forEach((subscriber) => subscriber.next(m)));
            }
        );

        this.mutationObserver.observe(this.rootElement.parentNode as Node, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
        });

    }

    private onTeardown(subscriber: Subscriber<Mutation>): void {
        const index = this.subscribers.indexOf(subscriber);

        if (index) {
            this.subscribers.splice(index, 1);
        }
    }

    private detach(): void {
        this.mutationObserver?.disconnect();
        this.subscribers.forEach((subscriber) => subscriber.complete());
    }

    public onRemoved(): Observable<Mutation> {
        return this.pipe(filter((mutation) => mutation.type === MutationType.Removed));
    }

    public onAdded(): Observable<Mutation> {
        return this.pipe(filter((mutation) => mutation.type === MutationType.Added));
    }

    public onUpdated(): Observable<Mutation> {
        return this.pipe(filter((mutation) => mutation.type === MutationType.Updated));
    }
}
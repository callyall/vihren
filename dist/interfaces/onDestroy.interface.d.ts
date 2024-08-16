/**
 * Lifecycle hook that is called when the component gets removed from the DOM.
 */
export interface OnDestroy {
    /**
     * Called when the component gets removed from the DOM.
     */
    onDestroy(): unknown;
}

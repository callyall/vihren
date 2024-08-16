/**
 * A dynamic component is a component that can be rendered again if changes occur both in the dom and the data that it has.
 */
export interface DynamicComponent {
    /**
     * Render the component template.
     */
    render(): string;
}

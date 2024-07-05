import { CustomElement } from "../../util/CustomElements.js";
declare const Book_base: import("../../util/CustomElements.js").ShadowConstructor & typeof CustomElement;
/** This component handles displaying one view, or, "Page", at a time from a collection.
 * @see Page
 */
export default class Book extends Book_base {
    #private;
    constructor();
    switchByIndex(index: number, pages?: Page[]): Promise<void>;
    switchById(id: string): Promise<void>;
    previous(): Promise<void>;
    next(): Promise<void>;
    attribute_page(_: string | null, page: string | null): Promise<void>;
    attribute_wraparound(_: string | null, wraparound: string | null): Promise<void>;
}
/** This class simply serves as a container for content. It does not have any special functionality on its own.
 * @see Book
 */
export declare class Page extends CustomElement {
}
export {};

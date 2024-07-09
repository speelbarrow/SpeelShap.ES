var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { expect as _expect, waitFor, within, userEvent, getDefaultNormalizer } from "@storybook/test";
import { html } from "lit";
function toHaveCurrent(book, current) {
    return __awaiter(this, void 0, void 0, function* () {
        const elements = book.querySelectorAll("sp-page[slot='current']");
        if (elements.length === 0)
            return {
                message: () => "failed to find any current page",
                pass: false,
            };
        else {
            const r = {
                message: elements.length > 1 ? () => "found multiple current pages" : () => "",
                pass: false,
            };
            for (const element of Array.from(elements)) {
                if (element.id === current)
                    r.pass = true;
            }
            return r;
        }
    });
}
const expect = _expect;
expect.extend({ toHaveCurrent });
export default {
    title: "Components/Book",
    component: "sp-book",
    argTypes: {
        page: {
            control: "inline-radio",
            options: ["foo", "bar", "baz"],
        },
        wraparound: {
            control: "boolean",
            table: {
                disable: true,
            },
        },
        children: {
            table: {
                readonly: true,
            },
        },
    },
    args: {
        page: "",
        wraparound: false,
        children: `<sp-page id="foo"> 
  <span>Foo</span>
</sp-page>
<sp-page id="bar">
  <span>Bar</span>
</sp-page>
<sp-page id="baz">
  <span>Baz</span>
</sp-page>`,
    },
};
function play(args, canvasElement) {
    return __awaiter(this, void 0, void 0, function* () {
        const canvas = within(canvasElement);
        const book = canvas.getByTestId("sp-book");
        const current = book.shadow.querySelector("slot[name='current']");
        yield expect(current).toBeTruthy();
        const assigned = current.assignedNodes();
        yield expect(assigned.length).toBe(1);
        return { canvas, book, current, assigned: assigned[0] };
    });
}
export const Index = {
    args: {
        page: "0",
    },
    argTypes: {
        page: {
            options: ["0", "1", "2"],
        },
    },
    play(_a) {
        return __awaiter(this, arguments, void 0, function* ({ args, canvasElement }) {
            const { book, assigned } = yield play(args, canvasElement);
            expect(book.children.item(parseInt(args.page))).toBe(assigned);
        });
    },
};
export const ID = {
    args: {
        page: "foo",
    },
    play(_a) {
        return __awaiter(this, arguments, void 0, function* ({ args, canvasElement }) {
            const { assigned } = yield play(args, canvasElement);
            expect(assigned.id).toBe(args.page);
        });
    },
};
export const Navigation = {
    args: {
        page: "foo",
    },
    argTypes: {
        wraparound: {
            table: {
                disable: false,
            },
        },
        page: {
            table: {
                disable: true,
            },
        },
    },
    decorators: [
        (story) => {
            const [book, previous, next] = [
                story(),
                document.createElement("button"),
                document.createElement("button"),
            ];
            previous.textContent = "Previous";
            previous.onclick = book.previous.bind(book);
            next.textContent = "Next";
            next.onclick = book.next.bind(book);
            return html `${book}<br>${previous}${next}`;
        },
    ],
    play(_a) {
        return __awaiter(this, arguments, void 0, function* ({ argTypes, args, canvasElement, step }) {
            const { canvas, book } = yield play(args, canvasElement);
            book.removeAttribute("wraparound");
            const list = argTypes.page.options;
            function click(getByText) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield userEvent.click(canvas.getByText(getByText, {
                        normalizer: (text) => getDefaultNormalizer()(text).toLowerCase(),
                    }));
                });
            }
            for (const direction of ["next", "previous"]) {
                yield step(`Cycle through pages using "${direction}" method`, () => __awaiter(this, void 0, void 0, function* () {
                    yield step(`Set initial "page" value to "${list[0]}"`, () => __awaiter(this, void 0, void 0, function* () {
                        book.setAttribute("page", list[0]);
                        yield waitFor(() => __awaiter(this, void 0, void 0, function* () { return yield expect(book).toHaveCurrent(list[0]); }));
                    }));
                    for (const page of list.slice(1))
                        yield step(`Navigate to ${direction} page, ${page}`, () => __awaiter(this, void 0, void 0, function* () {
                            yield click(direction);
                            yield waitFor(() => __awaiter(this, void 0, void 0, function* () { return yield expect(book).toHaveCurrent(page); }));
                        }));
                }));
                list.reverse();
            }
            yield step("Try to navigate to the last page using the `previous` method (expected to fail because wraparound is " +
                "not yet enabled)", () => __awaiter(this, void 0, void 0, function* () {
                yield expect(book).toHaveCurrent(list[0]);
            }));
            yield step("Enable wraparound", () => __awaiter(this, void 0, void 0, function* () { return book.setAttribute("wraparound", ""); }));
            yield step("Navigate to the last page using the `previous` method", () => __awaiter(this, void 0, void 0, function* () {
                yield book.previous();
                yield waitFor(() => __awaiter(this, void 0, void 0, function* () { return yield expect(book).toHaveCurrent(list[list.length - 1]); }));
            }));
            yield step("Navigate to the first page using the `next` method", () => __awaiter(this, void 0, void 0, function* () {
                yield book.next();
                yield waitFor(() => __awaiter(this, void 0, void 0, function* () { return yield expect(book).toHaveCurrent(list[0]); }));
            }));
            if (!args.wraparound) {
                book.removeAttribute("wraparound");
            }
        });
    },
};

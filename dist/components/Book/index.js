var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Book_instances, _Book_current, _Book_page, _Book_updated, _Book_wraparound, _Book_memoPages, _Book_pages, _Book_unsetPage, _Book_switch;
import { CustomElement, withShadow } from "../../util/CustomElements.js";
/** This component handles displaying one view, or, "Page", at a time from a collection.
 * @see Page
 */
class Book extends withShadow(CustomElement) {
    constructor() {
        super();
        _Book_instances.add(this);
        _Book_current.set(this, document.createElement("slot"));
        _Book_page.set(this, null);
        _Book_updated.set(this, true);
        _Book_wraparound.set(this, false);
        _Book_memoPages.set(this, void 0);
        __classPrivateFieldGet(this, _Book_current, "f").name = "current";
        const slot = document.createElement("slot");
        slot.style.display = "none";
        this.shadow.append(__classPrivateFieldGet(this, _Book_current, "f"), slot);
        const m = new MutationObserver((records) => {
            if (__classPrivateFieldGet(this, _Book_updated, "f"))
                return;
            for (const record of records)
                if (record.type === "childList") {
                    __classPrivateFieldSet(this, _Book_updated, true, "f");
                    return;
                }
        });
        m.observe(this, { childList: true });
    }
    switchByIndex(index, pages) {
        return __awaiter(this, void 0, void 0, function* () {
            pages = pages !== null && pages !== void 0 ? pages : yield __classPrivateFieldGet(this, _Book_instances, "m", _Book_pages).call(this);
            if (isNaN(index) || index < 0 || index >= pages.length)
                throw new Error("index out of bounds");
            yield __classPrivateFieldGet(this, _Book_instances, "m", _Book_switch).call(this, pages, index);
        });
    }
    switchById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const pages = yield __classPrivateFieldGet(this, _Book_instances, "m", _Book_pages).call(this);
            const index = pages.findIndex(page => page.id === id);
            if (index === -1)
                throw new Error(`no page with id '${id}'`);
            yield this.switchByIndex(index, pages);
        });
    }
    previous() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _Book_page, "f") === null)
                throw new Error("no page set");
            else if (__classPrivateFieldGet(this, _Book_page, "f")[1] === 0)
                if (__classPrivateFieldGet(this, _Book_wraparound, "f")) {
                    this.switchByIndex((yield __classPrivateFieldGet(this, _Book_instances, "m", _Book_pages).call(this)).length - 1);
                }
                else
                    console.warn("cannot navigate past the first page");
            else
                this.switchByIndex(__classPrivateFieldGet(this, _Book_page, "f")[1] - 1);
        });
    }
    next() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _Book_page, "f") === null)
                throw new Error("no page set");
            else if (__classPrivateFieldGet(this, _Book_page, "f")[1] === (yield __classPrivateFieldGet(this, _Book_instances, "m", _Book_pages).call(this)).length - 1)
                if (__classPrivateFieldGet(this, _Book_wraparound, "f"))
                    this.switchByIndex(0);
                else
                    console.warn("cannot navigate past the last page");
            else
                this.switchByIndex(__classPrivateFieldGet(this, _Book_page, "f")[1] + 1);
        });
    }
    attribute_page(_, page) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (page) {
                this.switchByIndex(parseInt(page)).catch((e) => {
                    if (e.message !== "index out of bounds")
                        throw e;
                    else
                        this.switchById(page);
                });
            }
            else
                __classPrivateFieldGet(this, _Book_instances, "m", _Book_unsetPage).call(this, (_a = __classPrivateFieldGet(this, _Book_page, "f")) === null || _a === void 0 ? void 0 : _a[0]);
        });
    }
    attribute_wraparound(_, wraparound) {
        return __awaiter(this, void 0, void 0, function* () {
            __classPrivateFieldSet(this, _Book_wraparound, wraparound !== null, "f");
        });
    }
}
_Book_current = new WeakMap(), _Book_page = new WeakMap(), _Book_updated = new WeakMap(), _Book_wraparound = new WeakMap(), _Book_memoPages = new WeakMap(), _Book_instances = new WeakSet(), _Book_pages = function _Book_pages() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!__classPrivateFieldGet(this, _Book_memoPages, "f") || __classPrivateFieldGet(this, _Book_updated, "f")) {
            __classPrivateFieldSet(this, _Book_memoPages, Array.from(this.children).filter(e => e instanceof Page), "f");
            __classPrivateFieldSet(this, _Book_updated, false, "f");
        }
        return __classPrivateFieldGet(this, _Book_memoPages, "f");
    });
}, _Book_unsetPage = function _Book_unsetPage(page) {
    return __awaiter(this, void 0, void 0, function* () {
        if (page)
            page.slot = "";
    });
}, _Book_switch = function _Book_switch(pages, index, old) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (old === void 0) { old = (_a = __classPrivateFieldGet(this, _Book_page, "f")) === null || _a === void 0 ? void 0 : _a[0]; }
        __classPrivateFieldGet(this, _Book_instances, "m", _Book_unsetPage).call(this, old);
        pages[index].slot = "current";
        __classPrivateFieldSet(this, _Book_page, [pages[index], index], "f");
    });
};
export default Book;
/** This class simply serves as a container for content. It does not have any special functionality on its own.
 * @see Book
 */
export class Page extends CustomElement {
}
for (const [name, C] of Object.entries({ Book, Page }))
    customElements.define("sp-" + name.toLowerCase(), C);

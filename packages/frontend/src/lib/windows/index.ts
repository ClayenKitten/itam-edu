import LoginWindow from "./LoginWindow.svelte";
import CalendarWindow from "./CalendarWindow.svelte";
import { goto, pushState } from "$app/navigation";
import { page } from "$app/state";
import type { Component } from "svelte";

/**
 * Window is a modal that may be displayed over any page.
 *
 * {@link WindowKind} is defined by `window` query paramter, and additional
 * properties may be gathered from other parameters.
 *
 * Different {@link WindowKind}s have different properties.
 * */
export class MyWindow<KIND extends WindowKind> {
    /** Creates a new window from {@link WindowKind} and corresponding optional properties. */
    public constructor(
        public readonly kind: KIND,
        public properties: WindowProps<(typeof WindowDefinitions)[KIND]> = {}
    ) {}

    /** Creates a new window from {@link URLSearchParams}. */
    public static fromSearchParams(
        searchParams: URLSearchParams
    ): MyWindow<WindowKind> | null {
        const kind = this.getKind(searchParams);
        if (!kind) return null;

        const window = new MyWindow(kind);
        for (const field of window.fields) {
            const value = searchParams.get(field);
            if (!value) continue;
            window.properties[field] = value;
        }
        return window;
    }

    /** Creates a new window from current page. */
    public static get current(): MyWindow<WindowKind> | null {
        return MyWindow.fromSearchParams(page.url.searchParams);
    }

    /** Returns {@link URLSearchParams} form of the window. */
    public get searchParams(): URLSearchParams {
        const params = new URLSearchParams(Object.entries(this.properties));
        params.set(MyWindow.KIND_PARAMETER, this.kind);
        return params;
    }

    /** Returns Svelte {@link Component} that is responsible for rendering the window. */
    public get component(): Component {
        return WindowDefinitions[this.kind].component;
    }

    /** Returns list of properties that may be specified for that window. */
    public get fields() {
        return WindowDefinitions[this.kind].fields;
    }

    private static getKind(searchParams: URLSearchParams): WindowKind | null {
        const _kind = searchParams.get(MyWindow.KIND_PARAMETER);
        if (!_kind || !(_kind in WindowDefinitions)) return null;
        return _kind as WindowKind;
    }

    /** Opens the window. */
    public async open() {
        for (const param of this.searchParams) {
            page.url.searchParams.set(param[0], param[1]);
        }
        await goto(page.url);
    }

    /** Closes the window. */
    public async close() {
        for (const field of this.fields) {
            page.url.searchParams.delete(field);
        }
        page.url.searchParams.delete(MyWindow.KIND_PARAMETER);
        await goto(page.url);
    }

    /** Query parameter that is used to gather {@link WindowKind}. */
    public static readonly KIND_PARAMETER = "window";
}

export const WindowDefinitions = {
    login: { fields: ["code"], component: LoginWindow },
    calendar: { fields: ["month"], component: CalendarWindow }
};
export type WindowKind = keyof typeof WindowDefinitions;

export type WindowProps<
    Definition extends (typeof WindowDefinitions)[WindowKind]
> = Partial<Record<Definition["fields"][number], string>>;

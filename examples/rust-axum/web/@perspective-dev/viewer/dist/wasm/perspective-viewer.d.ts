/* tslint:disable */
/* eslint-disable */

import type {
    ColumnType,
    TableInitOptions,
    ColumnWindow,
    ViewWindow,
    TypedArrayWindow,
    OnUpdateOptions,
    JoinOptions,
    UpdateOptions,
    DeleteOptions,
    ViewConfigUpdate,
    SystemInfo,
} from "@perspective-dev/client";

export type * from "../../src/ts/ts-rs/ViewerConfig.d.ts";
export type * from "../../src/ts/ts-rs/ViewerConfigUpdate.d.ts";
export type * from "../../src/ts/ts-rs/PluginStaticConfig.d.ts";
import type {ViewerConfig} from "../../src/ts/ts-rs/ViewerConfig.d.ts";
import type {ViewerConfigUpdate} from "../../src/ts/ts-rs/ViewerConfigUpdate.d.ts";



/**
 * An instance of a [`Client`] is a connection to a single
 * `perspective_server::Server`, whether locally in-memory or remote over some
 * transport like a WebSocket.
 *
 * The browser and node.js libraries both support the `websocket(url)`
 * constructor, which connects to a remote `perspective_server::Server`
 * instance over a WebSocket transport.
 *
 * In the browser, the `worker()` constructor creates a new Web Worker
 * `perspective_server::Server` and returns a [`Client`] connected to it.
 *
 * In node.js, a pre-instantied [`Client`] connected synhronously to a global
 * singleton `perspective_server::Server` is the default module export.
 *
 * # JavaScript Examples
 *
 * Create a Web Worker `perspective_server::Server` in the browser and return a
 * [`Client`] instance connected for it:
 *
 * ```javascript
 * import perspective from "@perspective-dev/client";
 * const client = await perspective.worker();
 * ```
 *
 * Create a WebSocket connection to a remote `perspective_server::Server`:
 *
 * ```javascript
 * import perspective from "@perspective-dev/client";
 * const client = await perspective.websocket("ws://locahost:8080/ws");
 * ```
 *
 * Access the synchronous client in node.js:
 *
 * ```javascript
 * import { default as client } from "@perspective-dev/client";
 * ```
 */
export class Client {
    free(): void;
    [Symbol.dispose](): void;
    __getClassname(): string;
    /**
     * Unsafely gets a [`View`] by raw ID, useful for JavaScript multi-threaded
     * (via Web Worker) context where a standard `View` cannot otherwise be
     * shared because its wrapper is not serializable.
     *
     * # Safety
     *
     * This method is unsafe because the lifetime of a [`View`] is bound to
     * the [`Client`] which created it.
     *
     * The caller must guarantee that `entity_id` corresponds to a live
     * [`crate::View`] on the connected server (obtained from another
     * [`Client`]'s [`crate::View::get_name`] and forwarded across the
     * serialization boundary).
     *
     * # JavaScript Examples
     *
     * ```javascript
     * const view = client.__unsafe_open_view(name_from_main_thread);
     * const cols = await view.to_columns();
     * ```
     */
    __unsafe_open_view(entity_id: string): View;
    /**
     * Retrieves the names of all tables that this client has access to.
     *
     * `name` is a string identifier unique to the [`Table`] (per [`Client`]),
     * which can be used in conjunction with [`Client::open_table`] to get
     * a [`Table`] instance without the use of [`Client::table`]
     * constructor directly (e.g., one created by another [`Client`]).
     *
     * # JavaScript Examples
     *
     * ```javascript
     * const tables = await client.get_hosted_table_names();
     * ```
     */
    get_hosted_table_names(): Promise<string[]>;
    handle_error(error: string, reconnect?: Function | null): Promise<void>;
    handle_response(value: any): Promise<void>;
    /**
     * Creates a new read-only [`Table`] by performing an INNER JOIN on two
     * source tables. The resulting table is reactive: when either source
     * table is updated, the join is automatically recomputed.
     *
     * # Arguments
     *
     * - `left` - The left source table (a [`Table`] instance or a table name
     *   string).
     * - `right` - The right source table (a [`Table`] instance or a table name
     *   string).
     * - `on` - The column name to join on. Must exist in both tables with the
     *   same type.
     * - `options` - Optional join configuration: `{ join_type?: "inner" |
     *   "left" | "outer", name?: string }`.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * const joined = await client.join(orders_table, products_table, "Product ID", { join_type: "left" });
     * const joined = await client.join("orders", "products", "Product ID", { join_type: "left" });
     * ```
     */
    join(left: any, right: any, on: string, options?: JoinOptions | null): Promise<Table>;
    constructor(send_request: Function, close?: Function | null);
    new_proxy_session(on_response: Function): ProxySession;
    on_error(callback: Function): Promise<number>;
    /**
     * Register a callback which is invoked whenever [`Client::table`] (on this
     * [`Client`]) or [`Table::delete`] (on a [`Table`] belinging to this
     * [`Client`]) are called.
     */
    on_hosted_tables_update(on_update_js: Function): Promise<number>;
    /**
     * Opens a [`Table`] that is hosted on the `perspective_server::Server`
     * that is connected to this [`Client`].
     *
     * The `name` property of [`TableInitOptions`] is used to identify each
     * [`Table`]. [`Table`] `name`s can be looked up for each [`Client`]
     * via [`Client::get_hosted_table_names`].
     *
     * # JavaScript Examples
     *
     * Get a virtual [`Table`] named "table_one" from this [`Client`]
     *
     * ```javascript
     * const tables = await client.open_table("table_one");
     * ```
     */
    open_table(entity_id: string): Promise<Table>;
    /**
     * Remove a callback previously registered via
     * `Client::on_hosted_tables_update`.
     */
    remove_hosted_tables_update(update_id: number): Promise<void>;
    /**
     * Provides the [`SystemInfo`] struct, implementation-specific metadata
     * about the [`perspective_server::Server`] runtime such as Memory and
     * CPU usage.
     *
     * For WebAssembly servers, this method includes the WebAssembly heap size.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * const info = await client.system_info();
     * ```
     */
    system_info(): Promise<SystemInfo>;
    /**
     * Creates a new [`Table`] from either a _schema_ or _data_.
     *
     * The [`Client::table`] factory function can be initialized with either a
     * _schema_ (see [`Table::schema`]), or data in one of these formats:
     *
     * - Apache Arrow
     * - CSV
     * - JSON row-oriented
     * - JSON column-oriented
     * - NDJSON
     *
     * When instantiated with _data_, the schema is inferred from this data.
     * While this is convenient, inferrence is sometimes imperfect e.g.
     * when the input is empty, null or ambiguous. For these cases,
     * [`Client::table`] can first be instantiated with a explicit schema.
     *
     * When instantiated with a _schema_, the resulting [`Table`] is empty but
     * with known column names and column types. When subsqeuently
     * populated with [`Table::update`], these columns will be _coerced_ to
     * the schema's type. This behavior can be useful when
     * [`Client::table`]'s column type inferences doesn't work.
     *
     * The resulting [`Table`] is _virtual_, and invoking its methods
     * dispatches events to the `perspective_server::Server` this
     * [`Client`] connects to, where the data is stored and all calculation
     * occurs.
     *
     * # Arguments
     *
     * - `arg` - Either _schema_ or initialization _data_.
     * - `options` - Optional configuration which provides one of:
     *     - `limit` - The max number of rows the resulting [`Table`] can
     *       store.
     *     - `index` - The column name to use as an _index_ column. If this
     *       `Table` is being instantiated by _data_, this column name must be
     *       present in the data.
     *     - `name` - The name of the table. This will be generated if it is
     *       not provided.
     *     - `format` - The explicit format of the input data, can be one of
     *       `"json"`, `"columns"`, `"csv"` or `"arrow"`. This overrides
     *       language-specific type dispatch behavior, which allows stringified
     *       and byte array alternative inputs.
     *
     * # JavaScript Examples
     *
     * Load a CSV from a `string`:
     *
     * ```javascript
     * const table = await client.table("x,y\n1,2\n3,4");
     * ```
     *
     * Load an Arrow from an `ArrayBuffer`:
     *
     * ```javascript
     * import * as fs from "node:fs/promises";
     * const table2 = await client.table(await fs.readFile("superstore.arrow"));
     * ```
     *
     * Load a CSV from a `UInt8Array` (the default for this type is Arrow)
     * using a format override:
     *
     * ```javascript
     * const enc = new TextEncoder();
     * const table = await client.table(enc.encode("x,y\n1,2\n3,4"), {
     *     format: "csv",
     * });
     * ```
     *
     * Create a table with an `index`:
     *
     * ```javascript
     * const table = await client.table(data, { index: "Row ID" });
     * ```
     */
    table(value: string | ArrayBuffer | Record<string, unknown[]> | Record<string, unknown>[] | Record<string, ColumnType>, options?: TableInitOptions | null): Promise<Table>;
    /**
     * Terminates this [`Client`], cleaning up any [`crate::View`] handles the
     * [`Client`] has open as well as its callbacks.
     */
    terminate(): any;
}

export class CopyDropDownMenuElement {
    free(): void;
    [Symbol.dispose](): void;
    __set_model(parent: PerspectiveViewerElement): void;
    connected_callback(): void;
    hide(): void;
    constructor(elem: HTMLElement);
    open(target: HTMLElement): void;
}

export class ExportDropDownMenuElement {
    free(): void;
    [Symbol.dispose](): void;
    __set_model(parent: PerspectiveViewerElement): void;
    connected_callback(): void;
    hide(): void;
    constructor(elem: HTMLElement);
    open(target: HTMLElement): void;
}

/**
 * JavaScript-facing DuckDB SQL query builder.
 *
 * This struct wraps the Rust `DuckDBSqlBuilder` and exposes it to JavaScript
 * via wasm_bindgen.
 */
export class GenericSQLVirtualServerModel {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Returns the SQL query to list all hosted tables.
     */
    getHostedTables(): string;
    /**
     * Creates a new `JsDuckDBSqlBuilder` instance.
     */
    constructor(args?: any | null);
    /**
     * Returns the SQL query to create a view from a table with the given
     * configuration.
     */
    tableMakeView(table_id: string, view_id: string, config: any): string;
    /**
     * Returns the SQL query to describe a table's schema.
     */
    tableSchema(table_id: string): string;
    /**
     * Returns the SQL query to get the row count of a table.
     */
    tableSize(table_id: string): string;
    /**
     * Returns the SQL query to validate an expression against a table.
     */
    tableValidateExpression(table_id: string, expression: string): string;
    /**
     * Returns the SQL query to get the column count of a view.
     */
    viewColumnSize(view_id: string): string;
    /**
     * Returns the SQL query to delete a view.
     */
    viewDelete(view_id: string): string;
    /**
     * Returns the SQL query to fetch data from a view with the given viewport.
     */
    viewGetData(view_id: string, config: any, viewport: any, schema: any): string;
    /**
     * Returns the SQL query to get the min and max values of a column.
     */
    viewGetMinMax(view_id: string, column_name: string, config: any): string;
    /**
     * Returns the SQL query to describe a view's schema.
     */
    viewSchema(view_id: string): string;
    /**
     * Returns the SQL query to get the row count of a view.
     */
    viewSize(view_id: string): string;
}

/**
 * The `<perspective-viewer-plugin>` element.
 *
 * The default perspective plugin which is registered and activated
 * automcatically when a `<perspective-viewer>` is loaded without plugins.
 * While you will not typically instantiate this class directly, it is simple
 * enough to function as a good "default" plugin implementation which can be
 * extended to create custom plugins.
 *
 * # Example
 * ```javascript
 * class MyPlugin extends customElements.get("perspective-viewer-plugin") {
 *    // Custom plugin overrides
 * }
 * ```
 */
export class PerspectiveDebugPluginElement {
    free(): void;
    [Symbol.dispose](): void;
    clear(): Promise<any>;
    connectedCallback(): void;
    delete(): Promise<any>;
    /**
     * # Notes
     *
     * When you pass a `wasm_bindgen` wrapped type _into_ Rust, it acts like a
     * move. Ergo, if you replace the `&` in the `view` argument, the JS copy
     * of the `View` will be invalid
     */
    draw(view: View): Promise<any>;
    constructor(elem: HTMLElement);
    resize(): Promise<any>;
    restore(_config?: any | null): void;
    restyle(): void;
    save(): any;
    update(view: View): Promise<any>;
    readonly config_column_names: any;
    readonly min_config_columns: any;
    readonly name: string;
    readonly select_mode: string;
}

/**
 * The `<perspective-viewer>` custom element.
 *
 * # JavaScript Examples
 *
 * Create a new `<perspective-viewer>`:
 *
 * ```javascript
 * const viewer = document.createElement("perspective-viewer");
 * window.body.appendChild(viewer);
 * ```
 *
 * Complete example including loading and restoring the [`Table`]:
 *
 * ```javascript
 * import perspective from "@perspective-dev/viewer";
 * import perspective from "@perspective-dev/client";
 *
 * const viewer = document.createElement("perspective-viewer");
 * const worker = await perspective.worker();
 *
 * await worker.table("x\n1", {name: "table_one"});
 * await viewer.load(worker);
 * await viewer.restore({table: "table_one"});
 * ```
 */
export class PerspectiveViewerElement {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Create a new JavaScript Heap reference for this model instance.
     */
    __get_model(): PerspectiveViewerElement;
    connectedCallback(): void;
    /**
     * Copy this viewer's `View` or `Table` data as CSV to the system
     * clipboard.
     *
     * # Arguments
     *
     * - `method` - The `ExportMethod` (serialized as a `String`) to use to
     *   render the data to the Clipboard.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * myDownloadButton.addEventListener("click", async () => {
     *     await viewer.copy();
     * })
     * ```
     */
    copy(method?: string | null): Promise<any>;
    /**
     * Delete the internal [`View`] and all associated state, rendering this
     * `<perspective-viewer>` unusable and freeing all associated resources.
     * Does not delete the supplied [`Table`] (as this is constructed by the
     * callee).
     *
     * Calling _any_ method on a `<perspective-viewer>` after [`Self::delete`]
     * will throw.
     *
     * <div class="warning">
     *
     * Allowing a `<perspective-viewer>` to be garbage-collected
     * without calling [`PerspectiveViewerElement::delete`] will leak WASM
     * memory!
     *
     * </div>
     *
     * # JavaScript Examples
     *
     * ```javascript
     * await viewer.delete();
     * ```
     */
    delete(): Promise<any>;
    /**
     * Download this viewer's internal [`View`] data via a browser download
     * event.
     *
     * # Arguments
     *
     * - `method` - The `ExportMethod` to use to render the data to download.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * myDownloadButton.addEventListener("click", async () => {
     *     await viewer.download();
     * })
     * ```
     */
    download(method?: string | null): Promise<any>;
    /**
     * Restart this `<perspective-viewer>` to its initial state, before
     * `load()`.
     *
     * Use `Self::restart` if you plan to call `Self::load` on this viewer
     * again, or alternatively `Self::delete` if this viewer is no longer
     * needed.
     */
    eject(): Promise<any>;
    /**
     * Exports this viewer's internal [`View`] as a JavaSript data, the
     * exact type of which depends on the `method` but defaults to `String`
     * in CSV format.
     *
     * This method is only really useful for the `"plugin"` method, which
     * will use the configured plugin's export (e.g. PNG for
     * `@perspective-dev/viewer-charts`). Otherwise, prefer to call the
     * equivalent method on the underlying [`View`] directly.
     *
     * # Arguments
     *
     * - `method` - The `ExportMethod` to use to render the data to download.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * const data = await viewer.export("plugin");
     * ```
     */
    export(method?: string | null): Promise<any>;
    /**
     * Flush any pending modifications to this `<perspective-viewer>`.  Since
     * `<perspective-viewer>`'s API is almost entirely `async`, it may take
     * some milliseconds before any user-initiated changes to the [`View`]
     * affects the rendered element.  If you want to make sure all pending
     * actions have been rendered, call and await [`Self::flush`].
     *
     * [`Self::flush`] will resolve immediately if there is no [`Table`] set.
     *
     * # JavaScript Examples
     *
     * In this example, [`Self::restore`] is called without `await`, but the
     * eventual render which results from this call can still be awaited by
     * immediately awaiting [`Self::flush`] instead.
     *
     * ```javascript
     * viewer.restore(config);
     * await viewer.flush();
     * ```
     */
    flush(): Promise<any>;
    /**
     * Get an `Array` of all of the plugin custom elements registered for this
     * element. This may not include plugins which called
     * [`registerPlugin`] after the host has rendered for the first time.
     */
    getAllPlugins(): Array<any>;
    /**
     * Get the underlying [`Client`] for this viewer (as passed to, or
     * associated with the [`Table`] passed to,
     * [`PerspectiveViewerElement::load`]).
     *
     * # Arguments
     *
     * - `wait_for_client` - whether to wait for
     *   [`PerspectiveViewerElement::load`] to be called, or fail immediately
     *   if [`PerspectiveViewerElement::load`] has not yet been called.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * const client = await viewer.getClient();
     * ```
     */
    getClient(wait_for_client?: boolean | null): Promise<any>;
    /**
     * Get this viewer's edit port for the currently loaded [`Table`] (see
     * [`Table::update`] for details on ports).
     */
    getEditPort(): number;
    /**
     * Gets a plugin Custom Element with the `name` field, or get the active
     * plugin if no `name` is provided.
     *
     * # Arguments
     *
     * - `name` - The `name` property of a perspective plugin Custom Element,
     *   or `None` for the active plugin's Custom Element.
     */
    getPlugin(name?: string | null): any;
    /**
     * Get render statistics. Some fields of the returned stats object are
     * relative to the last time [`PerspectiveViewerElement::getRenderStats`]
     * was called, ergo calling this method resets these fields.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * const {virtual_fps, actual_fps} = await viewer.getRenderStats();
     * ```
     */
    getRenderStats(): any;
    /**
     * Return a [`perspective_js::JsViewWindow`] for the currently selected
     * region.
     */
    getSelection(): ViewWindow | undefined;
    /**
     * Get the underlying [`Table`] for this viewer (as passed to
     * [`PerspectiveViewerElement::load`] or as the `table` field to
     * [`PerspectiveViewerElement::restore`]).
     *
     * # Arguments
     *
     * - `wait_for_table` - whether to wait for
     *   [`PerspectiveViewerElement::load`] to be called, or fail immediately
     *   if [`PerspectiveViewerElement::load`] has not yet been called.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * const table = await viewer.getTable();
     * ```
     */
    getTable(wait_for_table?: boolean | null): Promise<any>;
    /**
     * Get the underlying [`View`] for this viewer.
     *
     * Use this method to get promgrammatic access to the [`View`] as currently
     * configured by the user, for e.g. serializing as an
     * [Apache Arrow](https://arrow.apache.org/) before passing to another
     * library.
     *
     * The [`View`] returned by this method is owned by the
     * [`PerspectiveViewerElement`] and may be _invalidated_ by
     * [`View::delete`] at any time. Plugins which rely on this [`View`] for
     * their [`HTMLPerspectiveViewerPluginElement::draw`] implementations
     * should treat this condition as a _cancellation_ by silently aborting on
     * "View already deleted" errors from method calls.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * const view = await viewer.getView();
     * ```
     */
    getView(): Promise<any>;
    /**
     * Get a copy of the [`ViewConfig`] for the current [`View`]. This is
     * non-blocking as it does not need to access the plugin (unlike
     * [`PerspectiveViewerElement::save`]), and also makes no API calls to the
     * server (unlike [`PerspectiveViewerElement::getView`] followed by
     * [`View::get_config`])
     *
     * Returns the [`ViewConfig`] the currently-bound `View` was constructed
     * from, so the value is consistent with what the active plugin is
     * rendering even if a queued [`Self::restore`]/`update_and_render` has
     * already mutated the live config in anticipation of the next draw.
     * Falls back to the live session config when no `View` has yet been
     * created (e.g., after `load` but before the first render).
     */
    getViewConfig(): Promise<any>;
    /**
     * Loads a [`Client`], or optionally [`Table`], or optionally a Javascript
     * `Promise` which returns a [`Client`] or [`Table`], in this viewer.
     *
     * Loading a [`Client`] does not render, but subsequent calls to
     * [`PerspectiveViewerElement::restore`] will use this [`Client`] to look
     * up the proviced `table` name field for the provided
     * [`ViewerConfigUpdate`].
     *
     * Loading a [`Table`] is equivalent to subsequently calling
     * [`Self::restore`] with the `table` field set to [`Table::get_name`], and
     * will render the UI in its default state when [`Self::load`] resolves.
     * If you plan to call [`Self::restore`] anyway, prefer passing a
     * [`Client`] argument to [`Self::load`] as it will conserve one render.
     *
     * When [`PerspectiveViewerElement::load`] resolves, the first frame of the
     * UI + visualization is guaranteed to have been drawn. Awaiting the result
     * of this method in a `try`/`catch` block will capture any errors
     * thrown during the loading process, or from the [`Client`] `Promise`
     * itself.
     *
     * [`PerspectiveViewerElement::load`] may also be called with a [`Table`],
     * which is equivalent to:
     *
     * ```javascript
     * await viewer.load(await table.get_client());
     * await viewer.restore({name: await table.get_name()})
     * ```
     *
     * If you plan to call [`PerspectiveViewerElement::restore`] immediately
     * after [`PerspectiveViewerElement::load`] yourself, as is commonly
     * done when loading and configuring a new `<perspective-viewer>`, you
     * should use a [`Client`] as an argument and set the `table` field in the
     * restore call as
     *
     * A [`Table`] can be created using the
     * [`@perspective-dev/client`](https://www.npmjs.com/package/@perspective-dev/client)
     * library from NPM (see [`perspective_js`] documentation for details).
     *
     * # JavaScript Examples
     *
     * ```javascript
     * import perspective from "@perspective-dev/client";
     *
     * const worker = await perspective.worker();
     * viewer.load(worker);
     * ```
     *
     * ... or
     *
     * ```javascript
     * const table = await worker.table(data, {name: "superstore"});
     * viewer.load(table);
     * ```
     *
     * Complete example:
     *
     * ```javascript
     * const viewer = document.createElement("perspective-viewer");
     * const worker = await perspective.worker();
     *
     * await worker.table("x\n1", {name: "table_one"});
     * await viewer.load(worker);
     * await viewer.restore({table: "table_one", columns: ["x"]});
     * ```
     *
     * ... or, if you don't want to pass your own arguments to `restore`:
     *
     * ```javascript
     * const viewer = document.createElement("perspective-viewer");
     * const worker = await perspective.worker();
     *
     * const table = await worker.table("x\n1", {name: "table_one"});
     * await viewer.load(table);
     * ```
     */
    load(table: any): Promise<any>;
    constructor(elem: HTMLElement);
    /**
     * Force open the settings for a particular column. Pass `null` to close
     * the column settings panel. See [`Self::toggleColumnSettings`] for more.
     */
    openColumnSettings(column_name?: string | null, toggle?: boolean | null): Promise<any>;
    /**
     * Reset the viewer's `ViewerConfig` to the default.
     *
     * # Arguments
     *
     * - `reset_all` - If set, will clear expressions and column settings as
     *   well.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * await viewer.reset();
     * ```
     */
    reset(reset_all?: boolean | null): Promise<any>;
    /**
     * If this element is in an _errored_ state, this method will clear it and
     * re-render. Calling this method is equivalent to clicking the error reset
     * button in the UI.
     */
    resetError(): Promise<any>;
    /**
     * Set the available theme names available in the status bar UI.
     *
     * Calling [`Self::resetThemes`] may cause the current theme to switch,
     * if e.g. the new theme set does not contain the current theme.
     *
     * # JavaScript Examples
     *
     * Restrict `<perspective-viewer>` theme options to _only_ default light
     * and dark themes, regardless of what is auto-detected from the page's
     * CSS:
     *
     * ```javascript
     * viewer.resetThemes(["Pro Light", "Pro Dark"])
     * ```
     */
    resetThemes(themes?: any[] | null): Promise<any>;
    /**
     * Recalculate the viewer's dimensions and redraw.
     *
     * Use this method to tell `<perspective-viewer>` its dimensions have
     * changed when auto-size mode has been disabled via [`Self::setAutoSize`].
     * [`Self::resize`] resolves when the resize-initiated redraw of this
     * element has completed.
     *
     * # Arguments
     *
     * - `options` - An optional object with the following fields:
     *   - `dimensions` - An optional object `{width, height}` providing
     *     explicit size hints (in pixels) for the plugin container. When
     *     provided, the plugin element will be temporarily sized to these
     *     dimensions during resize, then reset.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * await viewer.resize()
     * await viewer.resize({dimensions: {width: 800, height: 600}})
     * ```
     */
    resize(options?: any | null): Promise<any>;
    /**
     * Restores this element from a full/partial
     * [`perspective_js::JsViewConfig`] (this element's user-configurable
     * state, including the `Table` name).
     *
     * One of the best ways to use [`Self::restore`] is by first configuring
     * a `<perspective-viewer>` as you wish, then using either the `Debug`
     * panel or "Copy" -> "config.json" from the toolbar menu to snapshot
     * the [`Self::restore`] argument as JSON.
     *
     * # Arguments
     *
     * - `update` - The config to restore to, as returned by [`Self::save`] in
     *   either "json", "string" or "arraybuffer" format.
     *
     * # JavaScript Examples
     *
     * Loads a default plugin for the table named `"superstore"`:
     *
     * ```javascript
     * await viewer.restore({table: "superstore"});
     * ```
     *
     * Apply a `group_by` to the same `viewer` element, without
     * modifying/resetting other fields - you can omit the `table` field,
     * this has already been set once and is not modified:
     *
     * ```javascript
     * await viewer.restore({group_by: ["State"]});
     * ```
     */
    restore(update: ViewerConfigUpdate): Promise<any>;
    /**
     * Restyle all plugins from current document.
     *
     * <div class="warning">
     *
     * [`Self::restyleElement`] _must_ be called for many runtime changes to
     * CSS properties to be reflected in an already-rendered
     * `<perspective-viewer>`.
     *
     * </div>
     *
     * # JavaScript Examples
     *
     * ```javascript
     * viewer.style = "--psp--color: red";
     * await viewer.restyleElement();
     * ```
     */
    restyleElement(): Promise<any>;
    /**
     * Save this element's user-configurable state to a serialized state
     * object, one which can be restored via the [`Self::restore`] method.
     *
     * # JavaScript Examples
     *
     * Get the current `group_by` setting:
     *
     * ```javascript
     * const {group_by} = await viewer.restore();
     * ```
     *
     * Reset workflow attached to an external button `myResetButton`:
     *
     * ```javascript
     * const token = await viewer.save();
     * myResetButton.addEventListener("clien", async () => {
     *     await viewer.restore(token);
     * });
     * ```
     */
    save(): Promise<ViewerConfig>;
    /**
     * Sets the auto-pause behavior of this component.
     *
     * When `true`, this `<perspective-viewer>` will register an
     * `IntersectionObserver` on itself and subsequently skip rendering
     * whenever its viewport visibility changes. Auto-pause is enabled by
     * default.
     *
     * # Arguments
     *
     * - `autopause` Whether to enable `auto-pause` behavior or not.
     *
     * # JavaScript Examples
     *
     * Disable auto-size behavior:
     *
     * ```javascript
     * viewer.setAutoPause(false);
     * ```
     */
    setAutoPause(autopause: boolean): Promise<any>;
    /**
     * Sets the auto-size behavior of this component.
     *
     * When `true`, this `<perspective-viewer>` will register a
     * `ResizeObserver` on itself and call [`Self::resize`] whenever its own
     * dimensions change. However, when embedded in a larger application
     * context, you may want to call [`Self::resize`] manually to avoid
     * over-rendering; in this case auto-sizing can be disabled via this
     * method. Auto-size behavior is enabled by default.
     *
     * # Arguments
     *
     * - `autosize` - Whether to enable `auto-size` behavior or not.
     *
     * # JavaScript Examples
     *
     * Disable auto-size behavior:
     *
     * ```javascript
     * viewer.setAutoSize(false);
     * ```
     */
    setAutoSize(autosize: boolean): void;
    /**
     * Set the selection [`perspective_js::JsViewWindow`] for this element.
     */
    setSelection(window?: ViewWindow | null): void;
    /**
     * Determines the render throttling behavior. Can be an integer, for
     * millisecond window to throttle render event; or, if `None`, adaptive
     * throttling will be calculated from the measured render time of the
     * last 5 frames.
     *
     * # Arguments
     *
     * - `throttle` - The throttle rate in milliseconds (f64), or `None` for
     *   adaptive throttling.
     *
     * # JavaScript Examples
     *
     * Only draws at most 1 frame/sec:
     *
     * ```rust
     * viewer.setThrottle(1000);
     * ```
     */
    setThrottle(val?: number | null): void;
    /**
     * Asynchronously opens the column settings for a specific column.
     * When finished, the `<perspective-viewer>` element will emit a
     * "perspective-toggle-column-settings" CustomEvent.
     * The event's details property has two fields: `{open: bool, column_name?:
     * string}`. The CustomEvent is also fired whenever the user toggles the
     * sidebar manually.
     */
    toggleColumnSettings(column_name: string): Promise<any>;
    /**
     * Toggle (or force) the config panel open/closed.
     *
     * # Arguments
     *
     * - `force` - Force the state of the panel open or closed, or `None` to
     *   toggle.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * await viewer.toggleConfig();
     * ```
     */
    toggleConfig(force?: boolean | null): Promise<any>;
}

export class ProxySession {
    free(): void;
    [Symbol.dispose](): void;
    close(): Promise<void>;
    handle_request(value: any): Promise<void>;
    constructor(client: Client, on_response: Function);
}

export class Table {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    __getClassname(): string;
    /**
     * Removes all the rows in the [`Table`], but preserves everything else
     * including the schema, index, and any callbacks or registered
     * [`View`] instances.
     *
     * Calling [`Table::clear`], like [`Table::update`] and [`Table::remove`],
     * will trigger an update event to any registered listeners via
     * [`View::on_update`].
     */
    clear(): Promise<void>;
    /**
     * Returns the column names of this [`Table`] in "natural" order (the
     * ordering implied by the input format).
     *
     *  # JavaScript Examples
     *
     *  ```javascript
     *  const columns = await table.columns();
     *  ```
     */
    columns(): Promise<any>;
    /**
     * Delete this [`Table`] and cleans up associated resources.
     *
     * [`Table`]s do not stop consuming resources or processing updates when
     * they are garbage collected in their host language - you must call
     * this method to reclaim these.
     *
     * # Arguments
     *
     * - `options` An options dictionary.
     *     - `lazy` Whether to delete this [`Table`] _lazily_. When false (the
     *       default), the delete will occur immediately, assuming it has no
     *       [`View`] instances registered to it (which must be deleted first,
     *       otherwise this method will throw an error). When true, the
     *       [`Table`] will only be marked for deltion once its [`View`]
     *       dependency count reaches 0.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * const table = await client.table("x,y\n1,2\n3,4");
     *
     * // ...
     *
     * await table.delete({ lazy: true });
     * ```
     */
    delete(options?: DeleteOptions | null): Promise<void>;
    /**
     * Get a copy of the [`Client`] this [`Table`] came from.
     */
    get_client(): Promise<Client>;
    /**
     * Returns the name of the index column for the table.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * const table = await client.table("x,y\n1,2\n3,4", { index: "x" });
     * const index = table.get_index(); // "x"
     * ```
     */
    get_index(): Promise<string>;
    /**
     * Returns the user-specified row limit for this table.
     */
    get_limit(): Promise<number | undefined>;
    /**
     * Returns the user-specified name for this table, or the auto-generated
     * name if a name was not specified when the table was created.
     */
    get_name(): Promise<string>;
    /**
     * Create a unique channel ID on this [`Table`], which allows
     * `View::on_update` callback calls to be associated with the
     * `Table::update` which caused them.
     */
    make_port(): Promise<number>;
    /**
     * Register a callback which is called exactly once, when this [`Table`] is
     * deleted with the [`Table::delete`] method.
     *
     * [`Table::on_delete`] resolves when the subscription message is sent, not
     * when the _delete_ event occurs.
     */
    on_delete(on_delete: Function): Promise<any>;
    /**
     * Removes rows from this [`Table`] with the `index` column values
     * supplied.
     *
     * # Arguments
     *
     * - `indices` - A list of `index` column values for rows that should be
     *   removed.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * await table.remove([1, 2, 3]);
     * ```
     */
    remove(value: any, options?: UpdateOptions | null): Promise<void>;
    /**
     * Removes a listener with a given ID, as returned by a previous call to
     * [`Table::on_delete`].
     */
    remove_delete(callback_id: number): Promise<any>;
    /**
     * Replace all rows in this [`Table`] with the input data, coerced to this
     * [`Table`]'s existing [`perspective_client::Schema`], notifying any
     * derived [`View`] and [`View::on_update`] callbacks.
     *
     * Calling [`Table::replace`] is an easy way to replace _all_ the data in a
     * [`Table`] without losing any derived [`View`] instances or
     * [`View::on_update`] callbacks. [`Table::replace`] does _not_ infer
     * data types like [`Client::table`] does, rather it _coerces_ input
     * data to the `Schema` like [`Table::update`]. If you need a [`Table`]
     * with a different `Schema`, you must create a new one.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * await table.replace("x,y\n1,2");
     * ```
     */
    replace(input: any, options?: UpdateOptions | null): Promise<void>;
    /**
     * Returns a table's [`Schema`], a mapping of column names to column types.
     *
     * The mapping of a [`Table`]'s column names to data types is referred to
     * as a [`Schema`]. Each column has a unique name and a data type, one
     * of:
     *
     * - `"boolean"` - A boolean type
     * - `"date"` - A timesonze-agnostic date type (month/day/year)
     * - `"datetime"` - A millisecond-precision datetime type in the UTC
     *   timezone
     * - `"float"` - A 64 bit float
     * - `"integer"` - A signed 32 bit integer (the integer type supported by
     *   JavaScript)
     * - `"string"` - A [`String`] data type (encoded internally as a
     *   _dictionary_)
     *
     * Note that all [`Table`] columns are _nullable_, regardless of the data
     * type.
     */
    schema(): Promise<Record<string, ColumnType>>;
    /**
     * Returns the number of rows in a [`Table`].
     */
    size(): Promise<number>;
    /**
     * Updates the rows of this table and any derived [`View`] instances.
     *
     * Calling [`Table::update`] will trigger the [`View::on_update`] callbacks
     * register to derived [`View`], and the call itself will not resolve until
     * _all_ derived [`View`]'s are notified.
     *
     * When updating a [`Table`] with an `index`, [`Table::update`] supports
     * partial updates, by omitting columns from the update data.
     *
     * # Arguments
     *
     * - `input` - The input data for this [`Table`]. The schema of a [`Table`]
     *   is immutable after creation, so this method cannot be called with a
     *   schema.
     * - `options` - Options for this update step - see [`UpdateOptions`].
     *
     * # JavaScript Examples
     *
     * ```javascript
     * await table.update("x,y\n1,2");
     * ```
     */
    update(input: string | ArrayBuffer | Record<string, unknown[]> | Record<string, unknown>[] | Record<string, ColumnType>, options?: UpdateOptions | null): Promise<any>;
    /**
     * Validates the given expressions.
     */
    validate_expressions(exprs: any): Promise<any>;
    /**
     * Create a new [`View`] from this table with a specified
     * [`ViewConfigUpdate`].
     *
     * See [`View`] struct.
     *
     * # JavaScript Examples
     *
     * ```javascript
     * const view = await table.view({
     *     columns: ["Sales"],
     *     aggregates: { Sales: "sum" },
     *     group_by: ["Region", "Country"],
     *     filter: [["Category", "in", ["Furniture", "Technology"]]],
     * });
     * ```
     */
    view(config?: ViewConfigUpdate | null): Promise<View>;
}

/**
 * The [`View`] struct is Perspective's query and serialization interface. It
 * represents a query on the `Table`'s dataset and is always created from an
 * existing `Table` instance via the [`Table::view`] method.
 *
 * [`View`]s are immutable with respect to the arguments provided to the
 * [`Table::view`] method; to change these parameters, you must create a new
 * [`View`] on the same [`Table`]. However, each [`View`] is _live_ with
 * respect to the [`Table`]'s data, and will (within a conflation window)
 * update with the latest state as its parent [`Table`] updates, including
 * incrementally recalculating all aggregates, pivots, filters, etc. [`View`]
 * query parameters are composable, in that each parameter works independently
 * _and_ in conjunction with each other, and there is no limit to the number of
 * pivots, filters, etc. which can be applied.
 */
export class View {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    __get_model(): View;
    __unsafe_get_name(): string;
    /**
     * Collapses the `group_by` row at `row_index`.
     */
    collapse(row_index: number): Promise<number>;
    /**
     * Returns an array of strings containing the column paths of the [`View`]
     * without any of the source columns.
     *
     * A column path shows the columns that a given cell belongs to after
     * pivots are applied.
     */
    column_paths(window?: ColumnWindow | null): Promise<any>;
    /**
     * Delete this [`View`] and clean up all resources associated with it.
     * [`View`] objects do not stop consuming resources or processing
     * updates when they are garbage collected - you must call this method
     * to reclaim these.
     */
    delete(): Promise<void>;
    /**
     * Returns this [`View`]'s _dimensions_, row and column count, as well as
     * those of the [`crate::Table`] from which it was derived.
     *
     * - `num_table_rows` - The number of rows in the underlying
     *   [`crate::Table`].
     * - `num_table_columns` - The number of columns in the underlying
     *   [`crate::Table`] (including the `index` column if this
     *   [`crate::Table`] was constructed with one).
     * - `num_view_rows` - The number of rows in this [`View`]. If this
     *   [`View`] has a `group_by` clause, `num_view_rows` will also include
     *   aggregated rows.
     * - `num_view_columns` - The number of columns in this [`View`]. If this
     *   [`View`] has a `split_by` clause, `num_view_columns` will include all
     *   _column paths_, e.g. the number of `columns` clause times the number
     *   of `split_by` groups.
     */
    dimensions(): Promise<any>;
    /**
     * Expand the `group_by` row at `row_index`.
     */
    expand(row_index: number): Promise<number>;
    /**
     * The expression schema of this [`View`], which contains only the
     * expressions created on this [`View`]. See [`View::schema`] for
     * details.
     */
    expression_schema(): Promise<any>;
    /**
     * A copy of the config object passed to the [`Table::view`] method which
     * created this [`View`].
     */
    get_config(): Promise<any>;
    /**
     * Calculates the [min, max] of the leaf nodes of a column `column_name`.
     *
     * # Returns
     *
     * A tuple of [min, max], whose types are column and aggregate dependent.
     */
    get_min_max(name: string): Promise<Array<any>>;
    /**
     * The number of aggregated columns in this [`View`]. This is affected by
     * the "split_by" configuration parameter supplied to this view's
     * contructor.
     *
     * # Returns
     *
     * The number of aggregated columns.
     */
    num_columns(): Promise<number>;
    /**
     * The number of aggregated rows in this [`View`]. This is affected by the
     * "group_by" configuration parameter supplied to this view's contructor.
     *
     * # Returns
     *
     * The number of aggregated rows.
     */
    num_rows(): Promise<number>;
    /**
     * Register a callback with this [`View`]. Whenever the [`View`] is
     * deleted, this callback will be invoked.
     */
    on_delete(on_delete: Function): Promise<any>;
    /**
     * Register a callback with this [`View`]. Whenever the view's underlying
     * table emits an update, this callback will be invoked with an object
     * containing `port_id`, indicating which port the update fired on, and
     * optionally `delta`, which is the new data that was updated for each
     * cell or each row.
     *
     * # Arguments
     *
     * - `on_update` - A callback function invoked on update, which receives an
     *   object with two keys: `port_id`, indicating which port the update was
     *   triggered on, and `delta`, whose value is dependent on the mode
     *   parameter.
     * - `options` - If this is provided as `OnUpdateOptions { mode:
     *   Some(OnUpdateMode::Row) }`, then `delta` is an Arrow of the updated
     *   rows. Otherwise `delta` will be [`Option::None`].
     *
     * # JavaScript Examples
     *
     * ```javascript
     * // Attach an `on_update` callback
     * view.on_update((updated) => console.log(updated.port_id));
     * ```
     *
     * ```javascript
     * // `on_update` with row deltas
     * view.on_update((updated) => console.log(updated.delta), { mode: "row" });
     * ```
     */
    on_update(on_update_js: Function, options?: OnUpdateOptions | null): Promise<any>;
    /**
     * Unregister a previously registered [`View::on_delete`] callback.
     */
    remove_delete(callback_id: number): Promise<any>;
    /**
     * Unregister a previously registered update callback with this [`View`].
     *
     * # Arguments
     *
     * - `id` - A callback `id` as returned by a recipricol call to
     *   [`View::on_update`].
     */
    remove_update(callback_id: number): Promise<void>;
    /**
     * The schema of this [`View`].
     *
     * The [`View`] schema differs from the `schema` returned by
     * [`Table::schema`]; it may have different column names due to
     * `expressions` or `columns` configs, or it maye have _different
     * column types_ due to the application og `group_by` and `aggregates`
     * config. You can think of [`Table::schema`] as the _input_ schema and
     * [`View::schema`] as the _output_ schema of a Perspective pipeline.
     */
    schema(): Promise<any>;
    /**
     * Set expansion `depth` of the `group_by` tree.
     */
    set_depth(depth: number): Promise<void>;
    /**
     * Serializes a [`View`] to the Apache Arrow data format.
     */
    to_arrow(window?: ViewWindow | null): Promise<ArrayBuffer>;
    /**
     * Serializes this [`View`] to JavaScript objects in a column-oriented
     * format.
     */
    to_columns(window?: ViewWindow | null): Promise<object>;
    /**
     * Serializes this [`View`] to a string of JSON data. Useful if you want to
     * save additional round trip serialize/deserialize cycles.
     */
    to_columns_string(window?: ViewWindow | null): Promise<string>;
    /**
     * Serializes this [`View`] to CSV data in a standard format.
     */
    to_csv(window?: ViewWindow | null): Promise<string>;
    /**
     * Serializes this [`View`] to JavaScript objects in a row-oriented
     * format.
     */
    to_json(window?: ViewWindow | null): Promise<Array<any>>;
    /**
     * Render this `View` as a JSON string.
     */
    to_json_string(window?: ViewWindow | null): Promise<string>;
    /**
     * Renders this [`View`] as an [NDJSON](https://github.com/ndjson/ndjson-spec)
     * formatted [`String`].
     */
    to_ndjson(window?: ViewWindow | null): Promise<string>;
    /**
     * Fetches columns from the [`View`] in Arrow format, decodes them, and
     * passes typed array views to `callback`. All arrays are only valid for
     * the duration of the callback — if `callback` returns a `Promise`, it
     * is awaited before the backing Arrow buffer is released, so async
     * callbacks may use the views for the full duration of the awaited
     * work (e.g. across an `await requestAnimationFrame`-backed promise).
     *
     * # Arguments
     *
     * - `window` - Optional [`TypedArrayWindow`] controlling row/column
     *   windowing and output options (e.g., `float32` mode).
     * - `callback` - A JS function called with `(names: string[], values:
     *   TypedArray[], validities: (Uint8Array|null)[], dictionaries:
     *   (string[]|null)[]) => void | Promise<void>`.
     */
    with_typed_arrays(window: TypedArrayWindow | null | undefined, callback: Function): Promise<void>;
}

export class VirtualDataSlice {
    free(): void;
    [Symbol.dispose](): void;
    fromArrowIpc(ipc: Uint8Array): void;
    constructor(config: ViewConfigUpdate);
    setBooleanCol(name: string, index: number, val: any, group_by_index?: number | null): void;
    setCol(dtype: string, name: string, index: number, val: any, group_by_index?: number | null): void;
    setDatetimeCol(name: string, index: number, val: any, group_by_index?: number | null): void;
    setFloatCol(name: string, index: number, val: any, group_by_index?: number | null): void;
    setIntegerCol(name: string, index: number, val: any, group_by_index?: number | null): void;
    setStringCol(name: string, index: number, val: any, group_by_index?: number | null): void;
}

export class VirtualServer {
    free(): void;
    [Symbol.dispose](): void;
    handleRequest(bytes: Uint8Array): Promise<any>;
    constructor(handler: object);
}

export function get_wasm_module(): WebAssembly.Module;

export function get_worker_url(): URL;

/**
 * Register this crate's Custom Elements in the browser's current session.
 *
 * This must occur before calling any public API methods on these Custom
 * Elements from JavaScript, as the methods themselves won't be defined yet.
 * By default, this crate does not register `PerspectiveViewerElement` (as to
 * preserve backwards-compatible synchronous API).
 */
export function init(module: WebAssembly.Module, url: URL): void;

/**
 * Register a plugin globally.
 */
export function registerPlugin(name: string): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_copydropdownmenuelement_free: (a: number, b: number) => void;
    readonly __wbg_perspectivedebugpluginelement_free: (a: number, b: number) => void;
    readonly __wbg_perspectiveviewerelement_free: (a: number, b: number) => void;
    readonly copydropdownmenuelement___set_model: (a: number, b: number) => void;
    readonly copydropdownmenuelement_connected_callback: (a: number) => void;
    readonly copydropdownmenuelement_hide: (a: number, b: number) => void;
    readonly copydropdownmenuelement_new: (a: number) => number;
    readonly copydropdownmenuelement_open: (a: number, b: number) => void;
    readonly exportdropdownmenuelement___set_model: (a: number, b: number) => void;
    readonly exportdropdownmenuelement_hide: (a: number, b: number) => void;
    readonly exportdropdownmenuelement_open: (a: number, b: number) => void;
    readonly get_wasm_module: (a: number) => void;
    readonly get_worker_url: (a: number) => void;
    readonly init: (a: number, b: number) => void;
    readonly perspectivedebugpluginelement_clear: (a: number) => number;
    readonly perspectivedebugpluginelement_config_column_names: (a: number) => number;
    readonly perspectivedebugpluginelement_connectedCallback: (a: number) => void;
    readonly perspectivedebugpluginelement_draw: (a: number, b: number) => number;
    readonly perspectivedebugpluginelement_name: (a: number, b: number) => void;
    readonly perspectivedebugpluginelement_new: (a: number) => number;
    readonly perspectivedebugpluginelement_restore: (a: number, b: number, c: number) => void;
    readonly perspectivedebugpluginelement_save: (a: number, b: number) => void;
    readonly perspectivedebugpluginelement_select_mode: (a: number, b: number) => void;
    readonly perspectiveviewerelement___get_model: (a: number) => number;
    readonly perspectiveviewerelement_connectedCallback: (a: number, b: number) => void;
    readonly perspectiveviewerelement_copy: (a: number, b: number) => number;
    readonly perspectiveviewerelement_delete: (a: number) => number;
    readonly perspectiveviewerelement_download: (a: number, b: number) => number;
    readonly perspectiveviewerelement_eject: (a: number) => number;
    readonly perspectiveviewerelement_export: (a: number, b: number) => number;
    readonly perspectiveviewerelement_flush: (a: number) => number;
    readonly perspectiveviewerelement_getAllPlugins: (a: number) => number;
    readonly perspectiveviewerelement_getClient: (a: number, b: number) => number;
    readonly perspectiveviewerelement_getEditPort: (a: number, b: number) => void;
    readonly perspectiveviewerelement_getPlugin: (a: number, b: number, c: number, d: number) => void;
    readonly perspectiveviewerelement_getRenderStats: (a: number, b: number) => void;
    readonly perspectiveviewerelement_getSelection: (a: number) => number;
    readonly perspectiveviewerelement_getTable: (a: number, b: number) => number;
    readonly perspectiveviewerelement_getView: (a: number) => number;
    readonly perspectiveviewerelement_getViewConfig: (a: number) => number;
    readonly perspectiveviewerelement_load: (a: number, b: number, c: number) => void;
    readonly perspectiveviewerelement_new: (a: number) => number;
    readonly perspectiveviewerelement_openColumnSettings: (a: number, b: number, c: number, d: number) => number;
    readonly perspectiveviewerelement_reset: (a: number, b: number) => number;
    readonly perspectiveviewerelement_resetError: (a: number) => number;
    readonly perspectiveviewerelement_resetThemes: (a: number, b: number, c: number) => number;
    readonly perspectiveviewerelement_resize: (a: number, b: number) => number;
    readonly perspectiveviewerelement_restore: (a: number, b: number) => number;
    readonly perspectiveviewerelement_restyleElement: (a: number) => number;
    readonly perspectiveviewerelement_save: (a: number) => number;
    readonly perspectiveviewerelement_setAutoPause: (a: number, b: number) => number;
    readonly perspectiveviewerelement_setAutoSize: (a: number, b: number) => void;
    readonly perspectiveviewerelement_setSelection: (a: number, b: number, c: number) => void;
    readonly perspectiveviewerelement_setThrottle: (a: number, b: number, c: number) => void;
    readonly perspectiveviewerelement_toggleColumnSettings: (a: number, b: number, c: number) => number;
    readonly perspectiveviewerelement_toggleConfig: (a: number, b: number) => number;
    readonly registerPlugin: (a: number, b: number) => void;
    readonly perspectivedebugpluginelement_update: (a: number, b: number) => number;
    readonly perspectivedebugpluginelement_min_config_columns: (a: number) => number;
    readonly perspectivedebugpluginelement_restyle: (a: number) => void;
    readonly perspectivedebugpluginelement_delete: (a: number) => number;
    readonly perspectivedebugpluginelement_resize: (a: number) => number;
    readonly exportdropdownmenuelement_new: (a: number) => number;
    readonly __wbg_exportdropdownmenuelement_free: (a: number, b: number) => void;
    readonly exportdropdownmenuelement_connected_callback: (a: number) => void;
    readonly __wbg_client_free: (a: number, b: number) => void;
    readonly __wbg_genericsqlvirtualservermodel_free: (a: number, b: number) => void;
    readonly __wbg_proxysession_free: (a: number, b: number) => void;
    readonly __wbg_table_free: (a: number, b: number) => void;
    readonly __wbg_view_free: (a: number, b: number) => void;
    readonly __wbg_virtualdataslice_free: (a: number, b: number) => void;
    readonly __wbg_virtualserver_free: (a: number, b: number) => void;
    readonly client___getClassname: (a: number, b: number) => void;
    readonly client___unsafe_open_view: (a: number, b: number, c: number) => number;
    readonly client_get_hosted_table_names: (a: number) => number;
    readonly client_handle_error: (a: number, b: number, c: number, d: number) => number;
    readonly client_handle_response: (a: number, b: number) => number;
    readonly client_join: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly client_new: (a: number, b: number, c: number) => void;
    readonly client_new_proxy_session: (a: number, b: number) => number;
    readonly client_on_error: (a: number, b: number) => number;
    readonly client_on_hosted_tables_update: (a: number, b: number) => number;
    readonly client_open_table: (a: number, b: number, c: number) => number;
    readonly client_remove_hosted_tables_update: (a: number, b: number) => number;
    readonly client_system_info: (a: number) => number;
    readonly client_table: (a: number, b: number, c: number) => number;
    readonly client_terminate: (a: number, b: number) => void;
    readonly genericsqlvirtualservermodel_getHostedTables: (a: number, b: number) => void;
    readonly genericsqlvirtualservermodel_new: (a: number, b: number) => void;
    readonly genericsqlvirtualservermodel_tableMakeView: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly genericsqlvirtualservermodel_tableSchema: (a: number, b: number, c: number, d: number) => void;
    readonly genericsqlvirtualservermodel_tableSize: (a: number, b: number, c: number, d: number) => void;
    readonly genericsqlvirtualservermodel_tableValidateExpression: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    readonly genericsqlvirtualservermodel_viewColumnSize: (a: number, b: number, c: number, d: number) => void;
    readonly genericsqlvirtualservermodel_viewDelete: (a: number, b: number, c: number, d: number) => void;
    readonly genericsqlvirtualservermodel_viewGetData: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly genericsqlvirtualservermodel_viewGetMinMax: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly genericsqlvirtualservermodel_viewSchema: (a: number, b: number, c: number, d: number) => void;
    readonly genericsqlvirtualservermodel_viewSize: (a: number, b: number, c: number, d: number) => void;
    readonly proxysession_close: (a: number) => number;
    readonly proxysession_handle_request: (a: number, b: number) => number;
    readonly proxysession_new: (a: number, b: number) => number;
    readonly table___getClassname: (a: number, b: number) => void;
    readonly table_clear: (a: number) => number;
    readonly table_columns: (a: number) => number;
    readonly table_delete: (a: number, b: number) => number;
    readonly table_get_client: (a: number) => number;
    readonly table_get_index: (a: number) => number;
    readonly table_get_limit: (a: number) => number;
    readonly table_get_name: (a: number) => number;
    readonly table_make_port: (a: number) => number;
    readonly table_on_delete: (a: number, b: number) => number;
    readonly table_remove: (a: number, b: number, c: number) => number;
    readonly table_remove_delete: (a: number, b: number) => number;
    readonly table_replace: (a: number, b: number, c: number) => number;
    readonly table_schema: (a: number) => number;
    readonly table_size: (a: number) => number;
    readonly table_update: (a: number, b: number, c: number) => number;
    readonly table_validate_expressions: (a: number, b: number) => number;
    readonly table_view: (a: number, b: number) => number;
    readonly view___get_model: (a: number) => number;
    readonly view___unsafe_get_name: (a: number, b: number) => void;
    readonly view_collapse: (a: number, b: number) => number;
    readonly view_column_paths: (a: number, b: number) => number;
    readonly view_delete: (a: number) => number;
    readonly view_dimensions: (a: number) => number;
    readonly view_expand: (a: number, b: number) => number;
    readonly view_expression_schema: (a: number) => number;
    readonly view_get_config: (a: number) => number;
    readonly view_get_min_max: (a: number, b: number, c: number) => number;
    readonly view_num_columns: (a: number) => number;
    readonly view_num_rows: (a: number) => number;
    readonly view_on_delete: (a: number, b: number) => number;
    readonly view_on_update: (a: number, b: number, c: number) => number;
    readonly view_remove_delete: (a: number, b: number) => number;
    readonly view_remove_update: (a: number, b: number) => number;
    readonly view_schema: (a: number) => number;
    readonly view_set_depth: (a: number, b: number) => number;
    readonly view_to_arrow: (a: number, b: number) => number;
    readonly view_to_columns: (a: number, b: number) => number;
    readonly view_to_columns_string: (a: number, b: number) => number;
    readonly view_to_csv: (a: number, b: number) => number;
    readonly view_to_json: (a: number, b: number) => number;
    readonly view_to_json_string: (a: number, b: number) => number;
    readonly view_to_ndjson: (a: number, b: number) => number;
    readonly view_with_typed_arrays: (a: number, b: number, c: number) => number;
    readonly virtualdataslice_fromArrowIpc: (a: number, b: number, c: number) => void;
    readonly virtualdataslice_new: (a: number) => number;
    readonly virtualdataslice_setBooleanCol: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly virtualdataslice_setCol: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
    readonly virtualdataslice_setDatetimeCol: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly virtualdataslice_setFloatCol: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly virtualdataslice_setIntegerCol: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly virtualdataslice_setStringCol: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly virtualserver_handleRequest: (a: number, b: number, c: number) => number;
    readonly virtualserver_new: (a: number, b: number) => void;
    readonly __wasm_bindgen_func_elem_3134: (a: number, b: number) => void;
    readonly __wasm_bindgen_func_elem_13509: (a: number, b: number) => void;
    readonly __wasm_bindgen_func_elem_16653: (a: number, b: number) => void;
    readonly __wasm_bindgen_func_elem_17311: (a: number, b: number) => void;
    readonly __wasm_bindgen_func_elem_17336: (a: number, b: number) => void;
    readonly __wasm_bindgen_func_elem_24562: (a: number, b: number, c: number, d: number) => void;
    readonly __wasm_bindgen_func_elem_5265: (a: number, b: number, c: number) => void;
    readonly __wasm_bindgen_func_elem_5266: (a: number, b: number, c: number) => void;
    readonly __wasm_bindgen_func_elem_5263: (a: number, b: number, c: number) => void;
    readonly __wasm_bindgen_func_elem_16772: (a: number, b: number, c: number) => void;
    readonly __wasm_bindgen_func_elem_17353: (a: number, b: number, c: number) => void;
    readonly __wasm_bindgen_func_elem_14430: (a: number, b: number) => number;
    readonly __wasm_bindgen_func_elem_17314: (a: number, b: number) => void;
    readonly __wbindgen_export: (a: number, b: number) => number;
    readonly __wbindgen_export2: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_export3: (a: number) => void;
    readonly __wbindgen_export4: (a: number, b: number, c: number) => void;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;

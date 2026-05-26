/* tslint:disable */
/* eslint-disable */

export type * from "../../src/ts/ts-rs/ViewWindow.d.ts";
export type * from "../../src/ts/ts-rs/ColumnType.d.ts";
export type * from "../../src/ts/ts-rs/ColumnWindow.d.ts";
export type * from "../../src/ts/ts-rs/TableInitOptions.d.ts";
export type * from "../../src/ts/ts-rs/ViewConfigUpdate.d.ts";
export type * from "../../src/ts/ts-rs/ViewOnUpdateResp.d.ts";
export type * from "../../src/ts/ts-rs/OnUpdateOptions.d.ts";
export type * from "../../src/ts/ts-rs/UpdateOptions.d.ts";
export type * from "../../src/ts/ts-rs/DeleteOptions.d.ts";
export type * from "../../src/ts/ts-rs/Scalar.d.ts";
export type * from "../../src/ts/ts-rs/SystemInfo.d.ts";
export type * from "../../src/ts/ts-rs/SortDir.d.ts";
export type * from "../../src/ts/ts-rs/Filter.d.ts";
export type * from "../../src/ts/ts-rs/ViewConfig.d.ts";
export type * from "../../src/ts/ts-rs/JoinOptions.ts";
export type * from "../../src/ts/ts-rs/JoinType.ts";
export type * from "../../src/ts/ts-rs/TypedArrayWindow.ts";

import type {ColumnWindow} from "../../src/ts/ts-rs/ColumnWindow.d.ts";
import type {ColumnType} from "../../src/ts/ts-rs/ColumnType.d.ts";
import type {ViewWindow} from "../../src/ts/ts-rs/ViewWindow.d.ts";
import type {TypedArrayWindow} from "../../src/ts/ts-rs/TypedArrayWindow.ts";
import type {TableInitOptions} from "../../src/ts/ts-rs/TableInitOptions.d.ts";
import type {JoinOptions} from "../../src/ts/ts-rs/JoinOptions.ts";
import type {JoinType} from "../../src/ts/ts-rs/JoinType.ts";
import type {ViewConfigUpdate} from "../../src/ts/ts-rs/ViewConfigUpdate.d.ts";
import type * as on_update_args from "../../src/ts/ts-rs/ViewOnUpdateResp.d.ts";
import type {OnUpdateOptions} from "../../src/ts/ts-rs/OnUpdateOptions.d.ts";
import type {UpdateOptions} from "../../src/ts/ts-rs/UpdateOptions.d.ts";
import type {DeleteOptions} from "../../src/ts/ts-rs/DeleteOptions.d.ts";
import type {SystemInfo} from "../../src/ts/ts-rs/SystemInfo.d.ts";



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

export function init(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
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
    readonly init: () => void;
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
    readonly __wasm_bindgen_func_elem_860: (a: number, b: number) => void;
    readonly __wasm_bindgen_func_elem_4015: (a: number, b: number) => void;
    readonly __wasm_bindgen_func_elem_11006: (a: number, b: number, c: number, d: number) => void;
    readonly __wasm_bindgen_func_elem_4032: (a: number, b: number, c: number) => void;
    readonly __wasm_bindgen_func_elem_1768: (a: number, b: number) => number;
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

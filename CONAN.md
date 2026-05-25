# Building Perspective 4.5.0 with Conan

This is a snapshot of upstream **perspective-dev/perspective v4.5.0** modified so
the C++ engine's dependencies (Apache Arrow, protobuf, re2, Boost, Abseil,
RapidJSON, date, …) are resolved through **[Conan](https://conan.io) 2.x**
instead of the upstream default, which `git`/`ExternalProject`-downloads them
from GitHub and SourceForge during the CMake build.

Use this when those hosts are blocked (corporate / air-gapped networks) but a
Conan remote — Conan Center, or an internal Artifactory/Nexus mirror — is
reachable. The Conan integration is ported from the `VortexServerRust` project.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Rust** | `nightly-2026-01-01` | Pinned in `rust-toolchain.toml`; `rustup` auto-installs it. |
| **Conan** | 2.x | `pip install conan`. Needs a remote stocked with the packages below (or Conan Center). |
| **CMake** | 3.20+ | Must support the Visual Studio generator you target (see Windows note). |
| **C++ compiler** | C++17 | Windows: **MSVC 2022** ("Desktop development with C++"). Linux: gcc/clang. macOS: Xcode CLT. |
| **Node.js / npm** | 18+ | Only to vendor the example's frontend assets (not needed to compile). |

## How dependencies are resolved

- `rust/perspective-server/conanfile.py` declares the C++ deps. `build.rs` runs
  `conan install` (selecting a profile from `rust/perspective-server/conan/profiles/`
  by target OS) **before** the CMake engine build, then passes Conan's
  `conan_toolchain.cmake` and library paths to CMake and emits the link flags.
- The engine CMake (`cpp/perspective/CMakeLists.txt`, `cpp/protos/CMakeLists.txt`)
  has a **`PSP_USE_CONAN`** switch (auto-on when a Conan toolchain is present):
  it `find_package()`s the Conan packages instead of `psp_build_dep()`
  downloading + building them. The original ExternalProject path is kept as a
  fallback (e.g. WASM builds).
- **Pinned versions matter** (`conanfile.py`):
  - `arrow/18.1.0` with `with_csv/with_zstd/with_lz4=True`, `parquet/with_thrift=False`
    — 18.1 matches 4.5.0's C++ source (newer Arrow changed `BufferReader` / dropped
    `util::string_view`); thrift is off to avoid the blocked `archive.apache.org`.
  - `re2/20211101` — matches 4.5.0's source (`re2::StringPiece::ToString()`, removed
    in newer re2 which aliases `StringPiece` to `std::string_view`).
  - `protobuf/6.33.5`, `abseil/20260107.1`, `boost/1.86.0`, `rapidjson`, `date`,
    `tsl-hopscotch-map`, `tsl-ordered-map`, `exprtk`.
- **CRT**: the Conan profiles use `compiler.runtime=dynamic` (/MD). Rust matches
  (no `+crt-static` — removed from `.cargo/config.toml`), so the final link is
  consistent. The Windows profile pins `compiler.version=194` (VS 2022).

## Build — Windows (PowerShell)

From the repo root:

```powershell
# Only on a TLS-intercepting corporate network (proxy MITM): give Conan a CA
# bundle that includes the corporate root, or its Python downloads fail with
# CERTIFICATE_VERIFY_FAILED. Export the Windows trust store once:
#   Get-ChildItem Cert:\LocalMachine\Root, Cert:\LocalMachine\CA | ForEach-Object {
#     "-----BEGIN CERTIFICATE-----`n" +
#     [Convert]::ToBase64String($_.RawData,'InsertLineBreaks') +
#     "`n-----END CERTIFICATE-----" } | Set-Content corp-roots.pem
$env:CONAN_CACERT_PATH     = "C:\path\to\corp-roots.pem"
$env:CARGO_HTTP_CHECK_REVOKE = "false"   # cargo: skip CRL/OCSP if the proxy blocks it

# If both VS 2022 and a newer VS (e.g. VS 18 / 2026) are installed, force the
# generator CMake actually supports — otherwise Conan picks "Visual Studio 18
# 2026" and CMake errors with "Could not create named generator".
$env:CMAKE_GENERATOR = "Visual Studio 17 2022"

cargo build -p rust-axum --features _hack
```

The first build compiles Arrow from source (the `csv on / thrift off` option set
has no prebuilt Conan binary) — expect ~20–40 min. Subsequent builds are
incremental.

> `--features _hack` enables `perspective/axum-ws`. It's a workaround for a
> feature-unification/rust-analyzer issue in-repo; see `examples/rust-axum/Cargo.toml`.

## Build — Linux / macOS

```bash
cargo build -p rust-axum --features _hack
```

`build.rs` auto-selects `linux-x64-static` / `macos-{x64,arm64}-static` from
`conan/profiles/`. No `CMAKE_GENERATOR` override needed. Set `CONAN_CACERT_PATH`
/ `REQUESTS_CA_BUNDLE` only if your network intercepts TLS.

## Run the example

The `rust-axum` example reads its dataset and serves its frontend bundles from
`node_modules/` relative to the working directory:

```powershell
cd examples\rust-axum
# Vendor the viewer bundles + superstore.arrow (concrete versions; the upstream
# package.json uses a pnpm `catalog:` ref that only resolves inside the monorepo):
npm install --strict-ssl=false `
  @perspective-dev/client@4.5.0 @perspective-dev/viewer@4.5.0 `
  @perspective-dev/viewer-datagrid@4.5.0 @perspective-dev/viewer-charts@4.5.0 `
  superstore-arrow@1.0.0
# Run from the example dir so node_modules/ + src/index.html resolve:
..\..\rust\target\debug\rust-axum.exe
```

Open <http://localhost:3000> — the `<perspective-viewer>` connects to `/ws`,
opens the `my_data_source` table, and renders an interactive grid/charts UI.

## What changed vs. upstream perspective v4.5.0

- `rust/perspective-server/`: added `conanfile.py`, `conan/profiles/`; replaced
  `build.rs` with the Conan orchestrator; `PSP_USE_CONAN` dual-path in
  `cpp/perspective/CMakeLists.txt` and `cpp/protos/CMakeLists.txt`; Conan-aware
  `cmake/modules/`. Manifest: `protobuf-src` optional behind `bundled-protoc`,
  added `which`, dropped the default `python` binding.
- `rust/perspective-client/`: enabled `generate-proto` + `protobuf-src` +
  `omit_metadata` by default (a source checkout ships no generated `proto.rs`
  or metadata docs).
- `.cargo/config.toml`: dropped `+crt-static` (the Conan build links the
  dynamic CRT).

## License

Apache-2.0, © the Perspective Authors.

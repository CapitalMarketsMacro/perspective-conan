# Building Perspective 4.5.0 with Conan

This is a snapshot of upstream **perspective-dev/perspective v4.5.0** modified so
the C++ engine's dependencies (Apache Arrow, protobuf, re2, Boost, Abseil,
RapidJSON, date, …) are resolved through **[Conan](https://conan.io) 2.x**
instead of the upstream default, which `git`/`ExternalProject`-downloads them
from GitHub and SourceForge during the CMake build.

Use this when those hosts are blocked (corporate / air-gapped networks) but a
Conan remote — Conan Center, or an internal Artifactory/Nexus mirror — is
reachable. The Conan integration is ported from the `VortexServerRust` project.

## Getting the source (private repo)

This is a **private** repository under the `CapitalMarketsMacro` org, so you need
collaborator/org access and an authenticated GitHub client:

```bash
# GitHub CLI (uses your `gh auth login` credentials) — simplest:
gh repo clone CapitalMarketsMacro/perspective-conan

# or HTTPS (use a Personal Access Token with `repo` scope as the password):
git clone https://github.com/CapitalMarketsMacro/perspective-conan.git

# or SSH (needs your SSH key registered on GitHub):
git clone git@github.com:CapitalMarketsMacro/perspective-conan.git
```

Use a **full clone, not `--depth 1`** — a shallow clone cannot be re-pushed to a
different remote (`git` fails with `did not receive expected object … /
index-pack failed`). On a TLS-intercepting corporate network you may also need
`git -c http.schannelCheckRevoke=false clone …` (Windows/schannel) so the clone
isn't blocked by CRL/OCSP checks.

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
- **Arrow is committed prebuilt** (`vendor/arrow/*.tgz`) and `build.rs` restores
  it into the Conan cache before installing — see the dedicated section below.
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

## Arrow is vendored as a prebuilt binary (corporate / air-gapped)

Arrow is the one dependency Conan would otherwise **build from source**: the
engine needs `arrow/csv` + `LZ4_FRAME`, so the conanfile sets `with_csv=True` /
`with_lz4=True`, and Conan Center publishes binaries only for *default* options —
so no prebuilt Arrow matches, for any version. On a network that blocks Arrow's
source download (`archive.apache.org` / GitHub) that surfaces as an error in the
recipe's `source()` method.

To make a clean clone build with **no download and no source compile**, the
prebuilt Arrow binary is **committed in the repo** at
`rust/perspective-server/vendor/arrow/arrow-{windows,linux}-x64.tgz`, and
`build.rs` runs `conan cache restore` on it automatically before `conan install`.
Conan then finds Arrow already in the cache and reuses it; everything else
downloads from your Conan remote as usual.

- This is keyed by **package_id**, which is fixed by the committed Conan profile
  (Windows: VS 2022 / **msvc 194**, dynamic CRT, Release) + the pinned dependency
  versions. On a matching toolchain it's reused as-is. If your compiler differs,
  the package_id won't match and Conan falls back to a normal source build — in
  that case regenerate the binary (`conan cache save "arrow/*:*" --file …`) on a
  matching host, or restore the CI artifact below.
- The same binaries are published by CI as `arrow-conan-{windows,linux}-x64.tgz`
  artifacts (and attached to tagged releases) — handy for refreshing the vendored
  copies or for `conan cache restore` on another machine.
- Alternative (kept for reference): vendor the Arrow **source** under
  `rust/perspective-server/vendor/conan-sources/` instead; `build.rs` points
  Conan's `core.sources:download_cache` there for an offline *source* build
  (no download, but still compiles — slower).

## Run the example

**No `npm` is required.** Both the dataset (`data/superstore.arrow`) and the
browser viewer bundles (`web/@perspective-dev/...`, the `cdn`+`wasm`+`css`
builds, ~5 MB) are committed in-repo. The server loads `data/superstore.arrow`
and `src/index.html` references the bundles under `/web/`, all served relative
to the working directory:

```powershell
cd examples\rust-axum
# Run from the example dir so data/, web/ and src/index.html resolve:
..\..\rust\target\debug\rust-axum.exe
```

Open <http://localhost:3000> — the `<perspective-viewer>` connects to `/ws`,
opens the `my_data_source` table, and renders an interactive grid/charts UI,
fully offline.

> To refresh the committed bundles to a new Perspective version, `npm install`
> `@perspective-dev/{client,viewer,viewer-datagrid,viewer-charts}@<ver>` and copy
> each package's `dist/{cdn,wasm,css}` into `examples/rust-axum/web/@perspective-dev/`.

## What changed vs. upstream perspective v4.5.0

- `rust/perspective-server/`: added `conanfile.py`, `conan/profiles/`; replaced
  `build.rs` with the Conan orchestrator; `PSP_USE_CONAN` dual-path in
  `cpp/perspective/CMakeLists.txt` and `cpp/protos/CMakeLists.txt`; Conan-aware
  `cmake/modules/`. Manifest: `protobuf-src` optional behind `bundled-protoc`,
  added `which`, dropped the default `python` binding.
- `rust/perspective-client/`: the generated `src/rust/proto.rs` is **committed**
  (de-ignored in `.gitignore`), and `generate-proto` / `protobuf-src` are now
  **off** by default — so the Rust client no longer builds protobuf from source
  or needs a `protoc` at all; it just compiles the committed `proto.rs`. Only
  `omit_metadata` stays on by default. (Conan's `protoc` still compiles the C++
  side, `cpp/protos`.) To regenerate `proto.rs` after editing `perspective.proto`,
  build with `--features perspective-client/generate-proto,perspective-client/protobuf-src`
  — first re-add the carlocorradini `protobuf-src` patch noted in the root
  `Cargo.toml`.
- `.cargo/config.toml`: dropped `+crt-static` (the Conan build links the
  dynamic CRT).
- **Slimmed to the pure-Rust server**: removed the `perspective-viewer` /
  `perspective-js` (browser/WASM), `perspective-python` (bindings), and
  `metadata` / `lint` / `bundle` (JS tooling) crates, plus the `packages/`,
  `tools/`, `docs/` trees, the pnpm/eslint/prettier config, and the upstream
  pnpm/Python CI. The workspace is now `perspective`, `perspective-client`,
  `perspective-server`, and the `examples/rust-axum` example. The demo's browser
  UI still uses prebuilt `@perspective-dev/viewer` npm bundles at runtime.

## License

Apache-2.0, © the Perspective Authors.

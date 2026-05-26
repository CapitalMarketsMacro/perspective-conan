# Perspective 4.5.0 — Conan C++ dependency build

A fork of [`perspective-dev/perspective`](https://github.com/perspective-dev/perspective)
**v4.5.0** that resolves the C++ engine's native dependencies — Apache Arrow,
protobuf, re2, Boost, Abseil, RapidJSON, date, … — through
**[Conan](https://conan.io) 2.x** instead of the upstream default, which
`git`/`ExternalProject`-downloads and builds them from GitHub and SourceForge
during the CMake build.

This makes the Rust/C++ build work on **corporate or air-gapped networks** where
those hosts are blocked but a Conan remote (Conan Center, or an internal
Artifactory/Nexus mirror) is reachable.

This fork is also **slimmed to the pure-Rust server**: it keeps only the crates
the `rust-axum` example needs — `perspective`, `perspective-client`,
`perspective-server` — plus the example itself. The browser/WASM packages
(`perspective-viewer`, `perspective-js`), the Python bindings
(`perspective-python`), and the JS/pnpm monorepo build tooling (`packages/`,
`tools/`, `docs/`, the metadata/lint/bundle crates) have all been removed. The
demo's web UI loads the Perspective viewer from **prebuilt bundles committed in
the repo** (`examples/rust-axum/web/`) — nothing JS is built or downloaded.

> 🔒 **Private** repository under the `CapitalMarketsMacro` org.

## Repository layout

```
rust/perspective         facade crate (re-exports client + server)
rust/perspective-client   client API + protobuf
rust/perspective-server   C++ engine (Conan-resolved deps) + build.rs
examples/rust-axum        runnable Axum server (the build/release target)
```

## Quick start

Full instructions, dependency-version rationale, and corporate-network/TLS notes
are in **[CONAN.md](CONAN.md)**. The short version (Windows / PowerShell):

```powershell
gh repo clone CapitalMarketsMacro/perspective-conan   # full clone (not --depth 1)
cd perspective-conan

# If both VS 2022 and a newer VS (e.g. VS 18/2026) are installed, pin the
# generator CMake supports:
$env:CMAKE_GENERATOR = "Visual Studio 17 2022"

cargo build -p rust-axum --features _hack
```

On Linux/macOS it's just `cargo build -p rust-axum --features _hack` (profiles
auto-selected).

> Prerequisites: Rust `nightly-2026-01-01` (pinned in `rust-toolchain.toml`),
> Conan 2.x, CMake 3.20+, and a C++17 compiler (MSVC 2022 on Windows).

## Offline / locked-down corporate build

This fork is **self-contained**: a fresh clone builds *and* runs with no source
downloads from GitHub / SourceForge / apache.org and **no `npm`**. The only
network it needs is your **Conan remote** (Conan Center or an internal
Artifactory/Nexus mirror) for the remaining C++ deps, and crates.io (or your
cargo mirror) for Rust crates. What makes it offline-friendly is committed
in-repo:

- **Apache Arrow** — its required `with_csv`/`with_lz4` options have no Conan
  Center prebuilt, so the prebuilt binary is committed at
  `rust/perspective-server/vendor/arrow/arrow-{windows,linux}-x64.tgz` and
  `build.rs` `conan cache restore`s it before `conan install`. No Arrow source
  download, no ~30-min Arrow compile. (Built for VS 2022 / msvc 194; a different
  toolchain falls back to a source build.)
- **protobuf** — the generated `proto.rs` is committed, so the Rust client needs
  no `protoc` and no from-source `protobuf-src`.
- **`hyper-util` pinned to `0.1.17`** — the newer `0.1.18` may be missing from a
  lagging corporate cargo mirror.
- **Demo assets** — the dataset (`examples/rust-axum/data/superstore.arrow`) and
  the viewer bundles (`examples/rust-axum/web/@perspective-dev/...`).

Steps:

```powershell
gh repo clone CapitalMarketsMacro/perspective-conan   # full clone, authenticated
cd perspective-conan

$env:CMAKE_GENERATOR         = "Visual Studio 17 2022"
$env:CONAN_CACERT_PATH       = "C:\path\to\corp-roots.pem"   # if TLS-intercepted
$env:CARGO_HTTP_CHECK_REVOKE = "false"                       # if CRL/OCSP blocked

cargo build -p rust-axum --features _hack

cd examples\rust-axum
..\..\rust\target\debug\rust-axum.exe         # serves http://localhost:3000
```

Open <http://localhost:3000> for the live grid — fully offline, no npm. See
[CONAN.md](CONAN.md) for the TLS root-bundle export and per-dependency rationale.

## What's different from upstream

Only the C++ **dependency-acquisition layer** changed — the Rust and C++ engine
source is upstream Perspective v4.5.0:

- **`rust/perspective-server/`** — added `conanfile.py` + `conan/profiles/`, a
  Conan-driven `build.rs`, and a `PSP_USE_CONAN` `find_package` path in the
  engine CMake (`cpp/perspective` + `cpp/protos`). Arrow `18.1.0` and re2
  `20211101` are pinned to match the 4.5.0 source APIs; the Windows Conan
  profile pins msvc 194 (VS 2022) + the dynamic CRT. The prebuilt Arrow binary
  is committed under `vendor/arrow/` and `build.rs` restores it (see Offline).
- **`rust/perspective-client/`** — the generated `proto.rs` is **committed** and
  `generate-proto`/`protobuf-src` are **off** by default, so the client needs no
  `protoc` / from-source protobuf build; only `omit_metadata` stays on.
- **`.cargo/config.toml`** — dropped `+crt-static` (the Conan build links the
  dynamic CRT, so Rust must match).
- **`Cargo.lock`** — `hyper-util` pinned to `0.1.17` for lagging corporate cargo
  mirrors.

See **[CONAN.md](CONAN.md)** for the reasoning behind each pin and setting.

## Upstream

Tracks Perspective **v4.5.0** (`perspective-dev/perspective` @ `643b74a`). For
the full project — JavaScript/Python packages, documentation, and the original
project README — see [perspective.finos.org](https://perspective.finos.org/) and
the [upstream repository](https://github.com/perspective-dev/perspective).

## License

Apache-2.0, © the Perspective Authors. See [LICENSE.md](LICENSE.md).

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
demo's web UI still loads the Perspective viewer at runtime as **prebuilt npm
bundles** from the public registry (nothing JS is compiled here).

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
gh repo clone CapitalMarketsMacro/perspective-conan
cd perspective-conan

# If both VS 2022 and a newer VS (e.g. VS 18/2026) are installed, pin the
# generator CMake supports:
$env:CMAKE_GENERATOR = "Visual Studio 17 2022"
# On a TLS-intercepting network, also: see CONAN.md (CONAN_CACERT_PATH).

cargo build -p rust-axum --features _hack
```

On Linux/macOS it's just `cargo build -p rust-axum --features _hack` (profiles
auto-selected). To run the example and see live data at <http://localhost:3000>,
see [CONAN.md → Run the example](CONAN.md#run-the-example).

> Prerequisites: Rust `nightly-2026-01-01` (pinned in `rust-toolchain.toml`),
> Conan 2.x, CMake 3.20+, and a C++17 compiler (MSVC 2022 on Windows). The first
> build compiles Arrow from source (~20–40 min); later builds are incremental.

## What's different from upstream

Only the C++ **dependency-acquisition layer** changed — the Rust and C++ engine
source is upstream Perspective v4.5.0:

- **`rust/perspective-server/`** — added `conanfile.py` + `conan/profiles/`, a
  Conan-driven `build.rs`, and a `PSP_USE_CONAN` `find_package` path in the
  engine CMake (`cpp/perspective` + `cpp/protos`). Arrow `18.1.0` and re2
  `20211101` are pinned to match the 4.5.0 source APIs; the Windows Conan
  profile pins msvc 194 (VS 2022) + the dynamic CRT.
- **`rust/perspective-client/`** — `generate-proto` + `protobuf-src` +
  `omit_metadata` enabled by default (a source checkout ships no generated
  `proto.rs` / metadata docs).
- **`.cargo/config.toml`** — dropped `+crt-static` (the Conan build links the
  dynamic CRT, so Rust must match).

See **[CONAN.md](CONAN.md)** for the reasoning behind each pin and setting.

## Upstream

Tracks Perspective **v4.5.0** (`perspective-dev/perspective` @ `643b74a`). For
the full project — JavaScript/Python packages, documentation, and the original
project README — see [perspective.finos.org](https://perspective.finos.org/) and
the [upstream repository](https://github.com/perspective-dev/perspective).

## License

Apache-2.0, © the Perspective Authors. See [LICENSE.md](LICENSE.md).

# Rust

## Look at

- `Cargo.toml` — package name, edition, deps, features, `[workspace]` members.
- `Cargo.lock`.
- `rust-toolchain.toml` or `rust-toolchain` — pinned toolchain.
- `.cargo/config.toml` — build flags, registries.
- Entry: `src/main.rs`, `src/lib.rs`, or `src/bin/<name>.rs`.

## Workspaces

- If `[workspace]` exists, list `members` — each is a separate crate. Map their roles from each `Cargo.toml`'s `description`.

## Tests + benches

- Inline `#[cfg(test)] mod tests` + `tests/` integration dir + `benches/`.
- Ignored: `grep -rIn -E '#\[ignore\]' .`

## Features

- `Cargo.toml` `[features]` — which are default, which gate optional code.

## Tooling

- `clippy.toml`, `rustfmt.toml`.
- `Makefile` or `justfile`.

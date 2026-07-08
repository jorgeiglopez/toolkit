# Go

## Look at

- `go.mod` — module path, Go version, deps.
- `go.sum` — locked deps.
- `go.work` if present — multi-module workspace.
- Entry: `main.go` at root, or `cmd/<binary>/main.go` per binary.

## Layout

- Standard project: `cmd/`, `internal/`, `pkg/`, `api/`.
- Generated code: anything with `// Code generated ... DO NOT EDIT.` headers — trace back to the generator.

## Tests

- `*_test.go` colocated with code.
- Skipped: `grep -rIn -E 't\.Skip\(' .`
- Build tags: `grep -rIn '//go:build' .` — may gate whole files.

## Tooling + run

- `Makefile` is common — note targets.
- `Dockerfile`, `goreleaser.yml`.
- `golangci.yml` / `.golangci.yml` — linters in use.

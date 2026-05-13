.PHONY: all build test fmt lint check clean

all: build

build:
	cd contracts/stellar/bridge && cargo build --release --target wasm32-unknown-unknown

test:
	cd contracts/stellar/bridge && cargo test

fmt:
	cd contracts/stellar/bridge && cargo fmt --all

lint:
	cd contracts/stellar/bridge && cargo clippy --all-targets -- -D warnings

check: fmt lint
	@echo "All checks passed."

clean:
	cd contracts/stellar/bridge && cargo clean

# SousChef

A recipe manager app


## Development

SousChef is a [Tauri](https://v2.tauri.app/start/) application; it's much simpler to run it locally on bare metal because it needs platform-specific components to build its client app. As a result, some dependencies are required on the development host:

* Node/NPM
  * You can [install Node here](https://nodejs.org/en/download/package-manager) with a version manager (I use `fnm`).
  * The project's Node version is specified in `.node_version`.
* Rust
  * You can [install Rust here](https://www.rust-lang.org/tools/install) with `rustup`.
  * The project's Rust version is specified in `rust-toolchain.toml`.

Once you have those dependencies available:

1. Install NPM dependencies with `npm ci`.
2. Run the frontend with `npm start`.
3. In a seperate terminal, run the Tauri app with `cargo tauri dev`.

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
2. Run the application with `npm start`. The Tauri CLI will build and serve the frontend, then launch the Rust app.

Other useful commands:

`npm run build`: Builds the entire app with Tauri, writing binaries to `/src-tauri/target`.

Note: this build command creates a "universal" macOS binary, meaning it can run on Intel or Apple Silicon Macs.
The appropriate Rust target has to be installed to successfully compile. Most likely, you're building on an Apple Silicon Mac,
in which case you'll need to run: `rustup target add x86_64-apple-darwin`.

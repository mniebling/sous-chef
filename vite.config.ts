import type { UserConfig } from 'vite'


export default {
	build: {
		emptyOutDir: true, // otherwise Vite won't overwrite, because dist is outside root
		outDir: '../dist-frontend',
	},
	root: './src',
	server: {
		// Bind to all network interfaces so the server is accessible on localhost outside the container.
		host: '0.0.0.0',
	},
} satisfies UserConfig

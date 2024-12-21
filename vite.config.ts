export default {
	outDir: './dist-frontend',
	root: './src',
	server: {
		// Bind to all network interfaces so the server is accessible on localhost outside the container.
		host: '0.0.0.0',
	},
}

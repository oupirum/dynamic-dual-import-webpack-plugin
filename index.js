
function DynamicDualImportPlugin(options) {
	this.options = options || {};
}

DynamicDualImportPlugin.prototype.apply = function(compiler) {
	const publicPath = compiler.options.output.publicPath;

	compiler.plugin("emit", (compilation, callback) => {
		const cssChunksHash = {};
		for (let i = 0; i < compilation.chunks.length; i++) {
			const chunk = compilation.chunks[i];
			const name = chunk.name || chunk.id;
			if (name) {
				for (let j = 0; j < chunk.files.length; j++) {
					if (/\.css$/.test(chunk.files[j])) {
						cssChunksHash[name] = publicPath + chunk.files[j];
					}
				}
			}
		}

		const hashSource = 'window.__CSS_CHUNKS_HASH__ = ' + JSON.stringify(cssChunksHash) + ';';
		compilation.assets[this.options.cssChunksHashFilename || 'css_chunks_hash.js'] = {
			source: () => {
				return hashSource;
			},
			size: () => {
				return hashSource.length;
			}
		};

		callback();
	});
};

DynamicDualImportPlugin.loader = function(options) {
	return {
		loader: require.resolve('./loader'),
		options: options
	};
};

module.exports = DynamicDualImportPlugin;
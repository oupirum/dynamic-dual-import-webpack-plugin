/*
 * Copied with a little modifications from github.com/faceyspacey/babel-plugin-dual-import
 */

var ADDED = {};

function importCss(chunkName) {
	var href = getHref(chunkName)
	if (!href) {
		if (process.env.NODE_ENV === 'development') {
			if (typeof window === 'undefined' || !window.__CSS_CHUNKS_HASH__) {
				console.warn(
					'[DUAL-IMPORT] no css chunks hash found at "window.__CSS_CHUNKS_HASH__"',
					chunkName
				)
				return Promise.resolve();
			}

			console.warn(
				'[DUAL-IMPORT] no chunk, ',
				chunkName,
				', found in "window.__CSS_CHUNKS_HASH__"'
			)
		}

		return Promise.resolve();
	}

	if (ADDED[href] === true) {
		return Promise.resolve();
	}
	ADDED[href] = true;

	var head = document.getElementsByTagName('head')[0]
	var link = document.createElement('link')

	link.href = href
	link.charset = 'utf-8'
	link.type = 'text/css'
	link.rel = 'stylesheet'
	link.timeout = 30000

	return new Promise(function(resolve, reject) {
		var timeout

		link.onerror = function() {
			link.onerror = link.onload = null // avoid mem leaks in IE.
			clearTimeout(timeout)
			var message = 'could not load css chunk: ' + chunkName;
			reject(new Error(message))
		}

		// link.onload doesn't work well enough, but this will handle it
		// since images can't load css (this is a popular fix)
		var img = document.createElement('img')
		img.onerror = function() {
			link.onerror = img.onerror = null // avoid mem leaks in IE.
			clearTimeout(timeout)
			resolve()
		}

		timeout = setTimeout(link.onerror, link.timeout)
		head.appendChild(link)
		img.src = href
	})
}

function getHref(chunkName) {
	if (typeof window === 'undefined' || !window.__CSS_CHUNKS_HASH__) return null
	return window.__CSS_CHUNKS_HASH__[chunkName]
}

exports.importCss = importCss;

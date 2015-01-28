var co = require('co')
var app = require('koa')()
var PassThrough = require('stream').PassThrough
//var qs = require('querystring')

var EARLY_HEAD = [
	'<!doctype html>',
	'<html>',
	'<head>',
  '  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.2/css/bootstrap.css">',
	'  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.js"></script>',
	'</head>',
  '<body class="container">',
  '<h1>Hello world!</h1>',
	'<blockquote>',
	'  <p><code>?wait={seconds}</code>        - wait time before head flush',
	'  <p><code>?delay={seconds}</code>       - delay after head flush',
	'  <p><code>?chunk={number}</code>        - how many chunks to output',
	'  <p><code>?chunktime={seconds}</code>  - delay between chunks',
	'</blockquote>',
	'<p>Most useful test: use <a href="?wait=2">?wait=2</a> vs <a href="?delay=2">?delay=2</a> to see the difference.',
	'<hr>',
	''
].join('\n');

var junk = '';
while (junk.length < 2048) {
	junk += 'a';
}


app.use(require('koa-compress')({
	flush: require('zlib').Z_SYNC_FLUSH
}))

app.use(function *() {
	var query = this.query
	var wait = Number(query.wait) || .2
	var delay = Number(query.delay) || .2
	var chunk = Number(query.chunk) || 3
	var chunkTime = Number(query.chunktime) || 1

	this.compress = true

	this.type = 'text/html; charset=utf-8'

	var stream = this.body = new PassThrough()

	// stream writing must happend on a different loop
	setImmediate(function() {
		co(function* () {
			if (wait) {
				yield sleep(wait)
			}
			stream.push(EARLY_HEAD)
			if (delay) {
				yield sleep(delay)
			}
			var count = 0
			while (count < chunk) {
				count += 1
				stream.push('<p><strong>' + (new Date()).toJSON() + '</strong>: ' + 'chunk' + count + '...</p>\n')
				stream.push('<p class="hidden">' + junk + '<p>')
				yield sleep(chunkTime)
			}

			stream.push('<p>done.</p>\n')
			stream.push('</body>\n</html>')
			stream.push(null)
		});
	});
})


function sleep(seconds) {
	return function(next) {
		setTimeout(next, seconds * 1000);
	}
}

if (!module.parent) {
	app.listen(process.env.PORT || 3000);
	console.log('Listening on http://127.0.0.1:3000');
}

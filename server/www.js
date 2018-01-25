const express = require('express')
const cors = require('cors')
const spawn = require('child_process').spawn;
const app = express()

// Tools
var tabix = '/Users/chase/Tools/tabix-0.2.6/tabix'

// add middleware
app.use(cors())

app.get('/vcfheader', function (req, res) {
  console.log('vcfHeader request');
  var header = spawn(tabix, ['-H', req.query.vcfURL])
  header.stdout.pipe(res);
});

// app.get('/baiReadDepth', function (req, res) {
// 	var baiReadDepth = spawn('/Users/chase/Code/playground/monolith_test/baiReadDepth.sh', [req.query.baiUrl]);
//   baiReadDepth.stdout.pipe(res);
//   // res.send('Hello World!')
// })

// app.get('/bamstatsalive', function (req, res) {
//   // Convert json regions into samtools regions for easy processing
//   var sam_regions = JSON.parse(req.query.r).map(function(d) { return d.chr + ':' + d.start + '-' + d.end}).join(' ');
//   var args = [ "-b", req.query.b, "-u", req.query.u, "-k", req.query.k, "-r", req.query.r, sam_regions ]

//   var bamstatsalive = spawn('/Users/chase/Code/playground/monolith_test/bamstatsalive.sh', args);
//   bamstatsalive.stdout.pipe(res);
// })

// app.post('/clientbai', function(req, res) {
//     var baiReadDepth = spawn('/Users/chase/Code/minion/bin/bamReadDepther');
//     baiReadDepth.stdout.pipe(res);
//     req.pipe(baiReadDepth.stdin);
// });

// app.post('/clientbam', function(req, res) {
//     console.log('bam request');
//     var args = ["-u", req.query.u, "-k", req.query.k, "-r", req.query.r, '-s']

//     var bamstatsalive = spawn('/Users/chase/Code/playground/monolith_test/bamstatsalive.sh', args);
//     bamstatsalive.stdout.on('error', function(e) { console.log('out = ' + e)})
//     bamstatsalive.stdin.on('error', function(e) { console.log(e)})
//     // baiReadDepth.stdout.pipe(res);
//     req.pipe(bamstatsalive.stdin);
//     bamstatsalive.stdout.pipe(res);
//     // bamstatsalive.stdout.pipe(process.stdout);
//     // var fs = require('fs');
//     // var ws = fs.createWriteStream('test.bam');
//     // bamstatsalive.stdout.pipe(ws);
//     // req.pipe(bamstatsalive.stdin);
// });

app.listen(4000, function () {
  console.log('Example app listening on port 4000!')
})

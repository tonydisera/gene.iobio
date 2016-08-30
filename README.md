# gene.iobio
An iobio app for examining gene variants

## Testing

#### Setup

Make sure all npm packages specified in package.json are installed. Cd into the project directory and run:

```
npm install
```

Next, make sure gulp is installed globally:

```
npm install -g gulp
```

#### Running Tests

###### Unit Tests

To run unit tests in the console with karma:

```
npm test
```

To run unit tests in the browser (useful for debugging and running tests one at a time):

```
gulp jasmine
```

Then open your browser to http://localhost:8888

Configuration for unit tests is managed in `karma.conf.js`.

###### Integration Tests

To run end-to-end integration tests with selenium and nightwatch:

```
gulp e2e
```

This will run a server (i.e. `node server.js`) on port 3008 so that the selenium server (on port 4444) can run tests against it. The server is shut down when the tests are finished.

To specify a specific browser, use the **-e** option, e.g.

```
gulp e2e -e chrome
```

#### Writing Tests

* All unit tests are in the `spec/` directory.

* The `spec/` directory should match the directory structure for app. For example, if you're testing `app/card/bookmarkCard.js`, your test file should be in `spec/card/bookmarkCard_spec.js`

* All spec file names must end in `_spec.js`

* All e2e tests are located in the `e2e/` directory.

* Resources: [Jasmine 2.4 docs](http://jasmine.github.io/2.4/introduction.html), [Jasmine-Jquery docs](https://github.com/velesin/jasmine-jquery), [Nightwatch docs](http://nightwatchjs.org/guide)


#### Debugging

Debugging selenium tests can be difficult.

One way is to inspect the page by using `browser.pause()` in your test and then running it with chrome  
(`gulp e2e -e chrome`).

You can also output any error messages that were logged to the console using `getLog`:

```
module.exports = {
  'Check getting log messages' : function (client) {
    client
      .url('http://jsbin.com/rohilugegi/1/')
      .getLogTypes(function(result) {
        console.log(result);
      })
      .getLog('browser', function(result) {
        console.log(result);
      })
    ;

    return client;
  }
```

Finally, you can use nightwatch to save screenshots to the `e2e/screenshots` folder. See the nightwatch docs for how to save a screenshot. You'll have to enable this feature in `nightwatch.json`





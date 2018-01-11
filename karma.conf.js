// Karma configuration
// Generated on Tue Aug 16 2016 13:24:09 GMT-0400 (EDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        'assets/js/jquery.1.11.1.min.js',
        { pattern: 'templates/*.hbs', watched: false, included: false, served: true, nocache: false },
        { pattern: 'assets/images/**/*.*', watched: false, included: false, served: true, nocache: false },
        'assets/js/**/*.js',
        'app/globalsDeployment.js',
        'app/globals.js',
        'app/util/*.js',
        'app/bam.iobio.js',
        'app/eduTour.js',
        'app/exhibit.js',
        'app/legend.js',
        'app/timeout.js',
        'app/vcf.iobio.js',
        'app/variantTooltip.js',
        'app/welcomePanel.js',
        'app/model/*.js',
        'app/card/*.js',
        'app/d3/*.js',
        'app/app.js',
        'spec/spec_helpers/jasmine-jquery.js',
        'spec/spec_helpers/fixture.conf.js',
        'spec/spec_helpers/color.js',
        'spec/spec_helpers/**/*',
        'spec/fixtures/**/*',
        'spec/**/*_spec.js'
    ],


    // list of files to exclude
    exclude: [

    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'app/**/*.js': ['coverage']
    },

    coverageReporter: {
        type: 'lcov',
        dir: 'spec/coverage/'
    },

    proxies: {
        '/templates/': '/base/templates/',
        '/assets/images/': '/base/assets/images/'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    browserNoActivityTimeout: 300000
  })
}

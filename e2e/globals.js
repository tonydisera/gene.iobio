module.exports = {

  // default timeout value in milliseconds for waitFor commands and implicit waitFor value for
  // expect assertions
  waitForConditionTimeout : 10000,

  // this will cause waitFor commands on elements to throw an error if multiple
  // elements are found using the given locate strategy and selector
  throwOnMultipleElementsReturned : true,

  // controls the timeout time for async hooks. Expects the done() callback to be invoked within this time
  // or an error is thrown
  asyncHookTimeout : 10000,

  variantFileUrl: 'http://s3.amazonaws.com/iobio/samples/vcf/platinum-exome.vcf.gz',
  NA12877SampleFileUrl: 'http://s3.amazonaws.com/iobio/samples/bam/NA12877.exome.bam',
  NA12878SampleFileUrl: 'http://s3.amazonaws.com/iobio/samples/bam/NA12878.exome.bam',
  NA12891SampleFileUrl: 'http://s3.amazonaws.com/iobio/samples/bam/NA12891.exome.bam',
  NA12892SampleFileUrl: 'http://s3.amazonaws.com/iobio/samples/bam/NA12892.exome.bam'
};
describe('bam.iobio', function() {
  var bam;

  beforeEach(function() {
    bam = new Bam();
  });

  describe('#reducePoints', function() {

    it('reduces the number of points in the array by a given factor', function() {
      var bamDataCoverage = [[1, 2], [3, 6], [5, 2], [7, 0], [9, 10], [11, 8], [13, 6]];
      var factor = 2;
      var xvalue = function(d) { return d[0]; };
      var yvalue = function(d) { return d[1]; };
      var points = bam.reducePoints(bamDataCoverage, factor, xvalue, yvalue);
      expect(points).toEqual([[1, 4], [5, 1], [9, 9], [13, 6]]);
    });

    it('returns the original data when the factor is less than or equal to 1', function() {
      var bamDataCoverage = [[80, 0], [90, 1]];
      var factor = 1;
      var xvalue = function(d) { return d[0]; };
      var yvalue = function(d) { return d[1]; };
      expect(bam.reducePoints(bamDataCoverage, factor, xvalue, yvalue)).toEqual([[80, 0], [90, 1]]);
    })
  });
});

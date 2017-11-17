describe('vcf.iobio', function() {
  var vcf, variants;

  beforeEach(function() {
    vcf = new vcfiobio();
    variants = [
      { start: 100, len: 1 },
      { start: 200, len: 1 },
      { start: 250, len: 1 },
      { start: 280, len: 1 },
      { start: 120, len: 1 },
      { start: 340, len: 1 },
      { start: 350, len: 1 },
      { start: 390, len: 1 }
    ];
  });

  describe('#pileupVcfRecords', function() {

    it('returns the correct max level', function() {
      var regionStart = 100;
      var posToPixelFactor = 5;
      var widthFactor = 10;
      expect(vcf.pileupVcfRecords(variants, regionStart, posToPixelFactor, widthFactor)).toBe(2);
    });

    it('modifies the variants so that they have the correct level', function() {
      var regionStart = 100;
      var posToPixelFactor = 5;
      var widthFactor = 10;
      vcf.pileupVcfRecords(variants, regionStart, posToPixelFactor, widthFactor);
      expect(variants).toEqual([
        { start: 100, len: 1, level: 0 },
        { start: 200, len: 1, level: 0 },
        { start: 250, len: 1, level: 1 },
        { start: 280, len: 1, level: 0 },
        { start: 120, len: 1, level: 1 },
        { start: 340, len: 1, level: 0 },
        { start: 350, len: 1, level: 1 },
        { start: 390, len: 1, level: 2 }
      ]);
    });
  });
});

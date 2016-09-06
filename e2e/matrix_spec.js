var indexPage, appTitleSection, dataCard, matrixTrack;

module.exports = {
  tags: [],
  beforeEach: function(client) {
    client.resizeWindow(1280, 800);
  },

  before: function(client) {
    indexPage = client.page.index();
    appTitleSection = indexPage.section.appTitleSection;
    dataCard = indexPage.section.dataCard;
    matrixTrack = indexPage.section.matrixTrack;
  },

  'Should not be able to x out a gene badge for the gene you are currently viewing': function(client) {
    indexPage.load();
    appTitleSection.openDataMenu();
    dataCard.selectSingle();
    dataCard.section.probandData.selectPlatinumTrio();
    dataCard.clickLoad();

    appTitleSection.selectGene('BRCA1');
    matrixTrack.waitForElementVisible('@featureMatrix');

    matrixTrack.assertSymbolsPresent('Pathogenicity - ClinVar', ['snp 41244435', 'snp 41223094', 'snp 41244000', 'snp 41244936', 'snp 41234470']);
    matrixTrack.assertSymbolsNotPresent('Pathogenicity - ClinVar', ['complex 41204842', 'ins 41275081']);
    client.end();
  }
}


// <div id="feature-matrix">
//   <svg>
//     <g class="colhdr">
//       <g><text>snp 41244435</text></g>
//       <g><text>snp 41244436</text></g>
//       <g><text>snp 41244437</text></g>
//     </g>
//     <g class="group">
//       <g class="col">
//         <g class="cell"><rect></rect><text>benign</text><g><use href="#clinvar-symbol"></use></g></g>
//         <g class="cell"><rect></rect><text>benign</text><g><use href="#danger-symbol"></use></g></g>
//       </g>
//       <g class="col">
//         <g class="cell"><rect></rect><text>benign</text><g><use href="#clinvar-symbol"></use></g></g>
//         <g class="cell"><rect></rect><text>benign</text><g><use href="#danger-symbol"></use></g></g>
//       </g>
//       <g class="col">
//         <g class="cell"><rect></rect><text></text></g>
//         <g class="cell"><rect></rect><text></text></g>
//       </g>
//     </g>
//     <g class="y axis">
//       <g class="tick"><line></line><text>Pathogenicity - ClinVar</text></g>
//       <g class="tick"><line></line><text>Pathogenicity - SIFT</text></g>
//       <g class="tick"><line></line><text>Pathogenicity - PolyPhen</text></g>
//     </g>
//   </svg>
// </div>


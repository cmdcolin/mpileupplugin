define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'JBrowse/Store/SeqFeature',
    'JBrowse/Util',
    'JBrowse/Model/CoverageFeature',
    'JBrowse/Model/NestedFrequencyTable',
    'JBrowse/Store/SeqFeature/BEDTabix'
],
function (
    declare,
    array,
    SeqFeatureStore,
    Util,
    CoverageFeature,
    NestedFrequencyTable,
    BEDTabix,
) {
    return declare(BEDTabix, {
        lineToFeature(columnNum, line) {
            const fields = line.split('\t');
            const start = +fields[1];
            const end = +fields[1] + 1;
            // const refBase = fields[2];
            const depth = +fields[3] + 1;
            const A = +fields[4];
            const C = +fields[5];
            const G = +fields[6];
            const T = +fields[7];
            // const strands = fields[8]
            const bin = new NestedFrequencyTable();
            bin.increment('A', A);
            bin.increment('C', C);
            bin.increment('G', G);
            bin.increment('T', T);
            bin.increment('reference', depth - A - C - G - T);
            console.log(bin);
            return new CoverageFeature({start, end, score: bin});
        }
    });
});

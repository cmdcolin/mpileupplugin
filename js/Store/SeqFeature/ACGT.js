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
            const refBase = fields[2];

            const A = +fields[4];
            const C = +fields[5];
            const G = +fields[6];
            const T = +fields[7];
            // const strands = fields[8]
            const bin = new NestedFrequencyTable();
            if (A && refBase !== 'A')bin.increment('A', A);
            if (C && refBase !== 'C')bin.increment('C', C);
            if (G && refBase !== 'G')bin.increment('G', G);
            if (T && refBase !== 'T')bin.increment('T', T);
            bin.increment('reference', {'A': A, 'C': C, 'G': G, 'T': T}[refBase]);
            return new CoverageFeature({start, end, score: bin});
        }
    });
});

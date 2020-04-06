define([
    'dojo/_base/declare',
    'JBrowse/Model/CoverageFeature',
    'JBrowse/Model/NestedFrequencyTable',
    'JBrowse/Store/SeqFeature/BEDTabix'
],
function (
    declare,
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
            const N = +fields[8];
            // const strands = fields[8]
            const bin = new NestedFrequencyTable();
            if (A && refBase !== 'A')bin.increment('A', A);
            if (C && refBase !== 'C')bin.increment('C', C);
            if (G && refBase !== 'G')bin.increment('G', G);
            if (T && refBase !== 'T')bin.increment('T', T);
            if (N && !Number.isNaN(N) && refBase !== 'N')bin.increment('N', N);
            bin.increment('reference', {'N': N, 'A': A, 'C': C, 'G': G, 'T': T}[refBase]);
            bin.snpsCounted = true;
            return new CoverageFeature({start, end, score: bin});
        }
    });
});

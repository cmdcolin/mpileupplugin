define([
    'dojo/_base/declare',
    'JBrowse/Store/SeqFeature',
    'JBrowse/Model/CoverageFeature',
    'JBrowse/Model/NestedFrequencyTable',
    'JBrowse/Store/SeqFeature/BigWig'
],
function (
    declare,
    SeqFeatureStore,
    CoverageFeature,
    NestedFrequencyTable,
    BigWig,
    VCFTabix
) {
    return declare([SeqFeatureStore], {
        constructor(args) {
            this.bigwigStore = new BigWig(args.bigWig);
            this.vcfStore = new VCFTabix(args.vcf);
        },
        async getFeatures(query, featureCallback, finishCallback, errorCallback) {
            try {
                const coverageFeats = await new Promise((resolve, reject) => {
                    const features = [];
                    this.bigwigStore.getFeatures(query,
                        f => features.push(f),
                        () => { resolve(features); },
                        reject
                    );
                });
                const vcfFeats = await new Promise((resolve, reject) => {
                    const features = [];
                    this.vcfStore.getFeatures(query,
                        f => features.push(f),
                        () => { resolve(features); },
                        reject
                    );
                });
                let currVariant = 0;
                for (let i = 0; i < coverageFeats.length; i++) {
                    let feat = coverageFeats[i];
                    const bin = new NestedFrequencyTable();
                    const alleles = vcfFeats[currVariant].get('alternative_alleles');
                    bin.increment('reference', feat.get('score'));
                    featureCallback(new CoverageFeature({start: feat.get('start'), end: feat.get('end'), score: bin}));
                }
                finishCallback();
            } catch (e) {
                errorCallback(e);
            }
        }
    });
});

define([
    'dojo/_base/declare',
    'JBrowse/Util',
    'JBrowse/Store/SeqFeature',
    'JBrowse/Model/CoverageFeature',
    'JBrowse/Model/NestedFrequencyTable',
    'JBrowse/Store/SeqFeature/RegionStatsMixin'
],
function (
    declare,
    Util,
    SeqFeatureStore,
    CoverageFeature,
    NestedFrequencyTable,
    RegionStatsMixin,
) {
    return declare([SeqFeatureStore, RegionStatsMixin], {
        constructor(args) {
            if (args.bigwig) {
                const conf = args.bigwig;
                const CLASS = dojo.global.require(conf.storeClass);
                const newConf = Object.assign({}, args, conf);
                newConf.config = Object.assign({}, args.config, conf);
                this.bigwig = new CLASS(newConf);
            }
            if (args.vcf) {
                const conf = args.vcf;
                const CLASS = dojo.global.require(conf.storeClass);
                const newConf = Object.assign({}, args, conf);
                newConf.config = Object.assign({}, args.config, conf);
                this.vcf = new CLASS(newConf);
            }
        },

        async getFeatures(query, featureCallback, finishCallback, errorCallback) {
            try {
                const coverageFeats = await new Promise((resolve, reject) => {
                    const features = [];
                    this.bigwig.getFeatures(query,
                        f => features.push(f),
                        () => { resolve(features); },
                        reject
                    );
                });
                const vcfFeats = await new Promise((resolve, reject) => {
                    const features = [];
                    this.vcf.getFeatures(query,
                        f => features.push(f),
                        () => { resolve(features); },
                        reject
                    );
                });
                const val = vcfFeats.length ? [[vcfFeats[0].get('id'), vcfFeats[0]]] : [];
                let currentVcfFeats = new Map(val);
                let curr = 1;
                for (let i = 0; i < coverageFeats.length; i++) {
                    let feat = coverageFeats[i];
                    const rstart = feat.get('start');
                    const rend = feat.get('end');
                    for (let start = rstart; start < rend; start++) {
                        const end = start + 1;
                        const bin = new NestedFrequencyTable();
                        bin.snpsCounted = true;
                        let score = feat.get('score');
                        for (const f of currentVcfFeats.values()) {
                            if (Util.intersect0(f.get('start'), f.get('end'), start, end)) {
                                console.log(start, end);
                                const genotypes = f.get('genotypes');
                                const genotypeOfInterest = genotypes[Object.keys(genotypes)[0]];
                                const AD = (genotypeOfInterest.AD || {}).values || [];

                                const alleles = f.get('alternative_alleles');
                                console.log(alleles);
                                alleles.values.forEach((allele, index) => {
                                    score -= AD[index + 1];
                                    bin.increment(allele, AD[index + 1] || 0);
                                });
                                // const alt = r[2] + r[3];
                                // score -= alt;

                            // bin.increment(allele, alt);
                            }
                            if (start > f.get('end')) {
                                currentVcfFeats.delete(f.get('id'));
                                if (curr < vcfFeats.length) {
                                    currentVcfFeats.set(vcfFeats[curr].get('id'), vcfFeats[curr]);
                                    curr++;
                                }
                            }
                        }
                        bin.increment('reference', score);

                        featureCallback(new CoverageFeature({start, end, score: bin}));
                    }
                }
                finishCallback();
            } catch (e) {
                errorCallback(e);
            }
        }
    });
});

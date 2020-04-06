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
            // Promise.all([this.bigwig._deferred.features, this.vcf._deferred.features]).then(() => this._deferred.features.resolve({success: true}));
            // Promise.all([this.bigwig._deferred.stats, this.vcf._deferred.stats]).then(() => this._deferred.stats({success: true}));
        },

        _getGlobalStats: function (successCallback, errorCallback) {
            var s = this.bigwig._globalStats || {};

            // calc mean and standard deviation if necessary
            if (!('scoreMean' in s)) {s.scoreMean = s.basesCovered ? s.scoreSum / s.basesCovered : 0;}
            if (!('scoreStdDev' in s)) {s.scoreStdDev = this.bigwig._calcStdFromSums(s.scoreSum, s.scoreSumSquares, s.basesCovered);}

            successCallback(s);
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
                for (let i = 0; i < coverageFeats.length; i++) {
                    let feat = coverageFeats[i];
                    const bin = new NestedFrequencyTable();
                    const start = feat.get('start');
                    const end = feat.get('end');
                    let score = Math.ceil(feat.get('score'));
                    for (let j = 0; j < vcfFeats.length; j++) {
                        const f = vcfFeats[j];
                        if (Util.intersect(f.get('start'), f.get('end'), start + 1, end - 1)) {
                            const allele = f.get('alternative_alleles').values[0];
                            const r = f.get('DP4').values;
                            const alt = r[2] + r[3];
                            score -= alt;

                            bin.increment(allele, alt);
                        }
                    }
                    bin.increment('reference', score);

                    featureCallback(new CoverageFeature({start, end, score: bin}));
                }
                finishCallback();
            } catch (e) {
                errorCallback(e);
            }
        }
    });
});

define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'JBrowse/Store/SeqFeature',
    'JBrowse/Util',
    'JBrowse/Model/CoverageFeature'
],
function (
    declare,
    array,
    SeqFeatureStore,
    Util,
    CoverageFeature
) {
    return declare(SeqFeatureStore, {
        constructor: function (args) {
            this.store = args.store;
        },

        getGlobalStats: function (callback /* , errorCallback */) {
            callback({});
        },

        getFeatures: function (query, featureCallback, finishCallback, errorCallback) {
            console.log(query);
            this.store.getFeatures(query, function (res) {
                finishCallback();
            },
            finishCallback,
            errorCallback
            );
        }
    });
});

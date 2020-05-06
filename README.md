# mpilupplugin

This plugin offers some alternative ways to visualize SNPCoverage track types with alternate data sources

This plugin is basically experimental. If it finds a use for you let me know! It is not really guaranteed to match up the depths called by your depth caller of choice and your VCF though.

See https://gist.github.com/cmdcolin/9f677eca28448d8a7c5d6e9917fc56af for some context on how coverage calculations can end up being calculated different across different tools.

These are called ACGT for a simepl BED tabixed table of ACGT counts

The other is a BigWig and VCF combo store

## Screenshot

![](img/1.png)

## Example setup for ACGT


    samtools mpileup -f volvox.fa -q 20 volvox-sorted.bam  |  sequenza-utils pileup2acgt -p - > out.txt
    # now comment out the header line, don't have the sed 1 liner for this
    bgzip out.txt
    # start and end are same column
    tabix  -s 1 -b 2 -e 2 out.txt.gz -f

The data from this program looks like this

```
#chr    n_base  ref_base        read.depth      A       C       G       T       strand
ctgA    3       T       1       0       0       0       1       0:0:0:1

```


The config is as follows


    {
      "type": "MPileupPlugin/View/Track/SNPCoverage",
      "storeClass": "MPileupPlugin/Store/SeqFeature/ACGT",
      "label": "SNPCoverage with ACGT table",
      "urlTemplate": "out.bed.gz"
    }

This track type is not really optimized well because bedtabix for numerical data is slow

## Example setup for BigWigVcf


This assumes that the DP4 tag in the VCF info field exists and it assumes that DP4 is for a single alternative allele, no support for multiple alleles yet. It also doesn't handle multiple overlapping alleles properly and probably should not be used with structural variant calls in the VCF at the time being

    {
      "type": "MPileupPlugin/View/Track/SNPCoverage",
      "storeClass": "MPileupPlugin/Store/SeqFeature/BigWigVcf",
      "label": "SNPCoverage with BigWig+VCF",
      "bigwig": {
        "storeClass": "JBrowse/Store/SeqFeature/BigWig",
        "urlTemplate": "volvox-sorted.bam.coverage.bw"
      },
      "vcf": {
        "storeClass": "JBrowse/Store/SeqFeature/VCFTabix",
        "urlTemplate": "volvox.filtered.vcf.gz"
      }
    }


### Example for BigWigVcfAdDp

Same as above, but uses the first sample in the VCF's AD and DP field for it's genotype and supports alternative alleles

    {
      "type": "MPileupPlugin/View/Track/SNPCoverage",
      "storeClass": "MPileupPlugin/Store/SeqFeature/BigWigVcf",
      "label": "SNPCoverage with BigWig+VCF",
      "bigwig": {
        "storeClass": "JBrowse/Store/SeqFeature/BigWig",
        "urlTemplate": "volvox-sorted.bam.coverage.bw"
      },
      "vcf": {
        "storeClass": "JBrowse/Store/SeqFeature/VCFTabix",
        "urlTemplate": "volvox.filtered.vcf.gz"
      }
    }

## Intallation

Clone the repository to the jbrowse plugins subdirectory and name it MPileupPlugin

    git clone https://github.com/cmdcolin/mpilupplugin MPileupPlugin

Then add the plugin to your configuration, e.g. "plugins": ["MPileupPlugin"]

See http://gmod.org/wiki/JBrowse_FAQ#How_do_I_install_a_plugin for details

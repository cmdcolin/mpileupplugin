# mpilupplugin


## Example setup


    samtools mpileup -f volvox.fa -q 20 volvox-sorted.bam  |  sequenza-utils pileup2acgt -p - > out.txt
    bgzip out.txt
    # start and end are same column
    tabix  -s 1 -b 2 -e 2 out.txt.gz -f


## Intallation

Clone the repository to the jbrowse plugins subdirectory and name it MPilupPlugin

    git clone https://github.com/cmdcolin/mpilupplugin MPilupPlugin

Then add the plugin to your configuration, e.g. "plugins": ["MPilupPlugin"]

See http://gmod.org/wiki/JBrowse_FAQ#How_do_I_install_a_plugin for details

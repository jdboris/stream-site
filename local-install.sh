#!/bin/bash
originalDir=$(pwd)
repoDir=C:/Users/Joe/Source/Repos

for packagePath in "$@"
do
    cd $packagePath || { exec bash; }
    packageName=$(cut -d "=" -f 2 <<< $(npm run env | grep "npm_package_name")) || { exec bash; }
    npm run build || { exec bash; }
    mkdir --parents $repoDir/@local/$packageName
    mv $repoDir/@local/$(npm pack --pack-destination=$repoDir/@local) $repoDir/@local/$packageName.tgz
    cd $originalDir || { exec bash; }
    # npm remove $packageName
    npm i --save-dev -f $repoDir/@local/$packageName.tgz
done

exec bash
originalDir=$(pwd)
repoDir=C:/Users/Joe/Source/Repos

for packagePath in "$@"
do
    cd $packagePath
    packageName=$(cut -d "=" -f 2 <<< $(npm run env | grep "npm_package_name"))
    npm run build
    mkdir --parents $repoDir/@local/$packageName
    mv $repoDir/@local/$(npm pack --pack-destination=$repoDir/@local) $repoDir/@local/$packageName.tgz
    cd $originalDir
    # npm remove $packageName
    npm i --save-dev $repoDir/@local/$packageName.tgz
done
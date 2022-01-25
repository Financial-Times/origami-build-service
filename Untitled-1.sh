
for component in `node /Users/jake.champion/Code/repo-data-cli/index.js list repos | jq -c '.[] | select( .origamiVersion == "2.0")' | jq -r '.name'`
do
 for version in `node /Users/jake.champion/Code/repo-data-cli/index.js list versions $component | jq -c '.[] | select( .origamiVersion == "2.0")' | jq -r '.version'`
 do
  echo 'cache=./cache' > .npmrc
  echo "$component@$version";
  npm install --save --production --offline "@financial-times/$component@$version" || npm install --save --production --prefer-offline "@financial-times/$component@$version";
  npm uninstall --save --production "@financial-times/$component@$version";
  rm .npmrc
 done
done

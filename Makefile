start:
	supervisor -- --debug --harmony app.js

publish:
	git archive master | tar -x -C  ~/Dropbox/Apps/Heroku/iecss/

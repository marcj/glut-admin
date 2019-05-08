.PHONY: server

fresh-install:
	rm -rf packages/*/node_modules
	npm run bootstrap

docker-image:
	docker build -t glut/server .

docker-push:
	docker push glut/server

local-development:
	node ~/bude/sync-local-package/dist/index.js lerna

frontend-watch:
	cd packages/frontend && ./node_modules/.bin/ng build --watch

frontend-prod:
	cd packages/frontend && ./node_modules/.bin/ng build --prod

server:
	cd packages/server && ./node_modules/.bin/webpack

server-run:
	cd packages/server && node dist/main.js

server-watch:
	cd packages/server && ./node_modules/.bin/webpack --watch

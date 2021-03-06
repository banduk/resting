VERSION=$$(git rev-parse --short HEAD)

setup-hooks:
	@cd .git/hooks && ln -sf ../../hooks/pre-commit.sh pre-commit

setup: setup-hooks
	@yarn

start:
	@./node_modules/.bin/nodemon index.js | ./node_modules/.bin/bunyan -o short

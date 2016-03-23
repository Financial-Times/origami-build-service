.PHONY: test

export PATH := ./node_modules/.bin:$(PATH)
export DOCKER_REGISTRY_ENDPOINT_QA := registry.heroku.com/origami-buildservice-qa/web
export DOCKER_REGISTRY_ENDPOINT_PROD := registry.heroku.com/origami-buildservice-eu/web

install:
	npm install

clean:
	git clean -fxd


# Lint targets

lint:
	eslint .


# Test targets

test: test-unit-coverage test-integration test-old

test-unit:
	NODE_ENV=test mocha test/unit --recursive

test-unit-coverage: test-unit-instrument
	istanbul check-coverage --statement 90 --branch 90 --function 90

test-unit-instrument:
	NODE_ENV=test istanbul cover node_modules/.bin/_mocha -- test/unit --recursive

test-integration:
	NODE_ENV=test mocha test/integration

test-old:
	NODE_ENV=test mocha test


# Deploy targets

deploy: build
	docker push ${DOCKER_REGISTRY_ENDPOINT_QA}

build:
	docker build -t ${DOCKER_REGISTRY_ENDPOINT_QA} .

promote:
	docker pull ${DOCKER_REGISTRY_ENDPOINT_QA}
	docker tag ${DOCKER_REGISTRY_ENDPOINT_QA} ${DOCKER_REGISTRY_ENDPOINT_PROD}
	docker push ${DOCKER_REGISTRY_ENDPOINT_PROD}

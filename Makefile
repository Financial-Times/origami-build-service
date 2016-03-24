include n.Makefile


# Environment variables
# ---------------------

EXPECTED_COVERAGE = 90

export PATH := ./node_modules/.bin:$(PATH)

export DOCKER_REGISTRY_ENDPOINT_QA := registry.heroku.com/origami-buildservice-qa/web
export DOCKER_REGISTRY_ENDPOINT_PROD := registry.heroku.com/origami-buildservice-eu/web


# Verify tasks
# ------------

verify-coverage:
	@istanbul check-coverage --statement $(EXPECTED_COVERAGE) --branch $(EXPECTED_COVERAGE) --function $(EXPECTED_COVERAGE)
	@$(DONE)


# Test tasks
# ----------

test: test-unit-coverage verify-coverage test-integration test-old
	@$(DONE)

test-unit:
	@NODE_ENV=test mocha test/unit --recursive
	@$(DONE)

test-unit-coverage:
	@NODE_ENV=test istanbul cover node_modules/.bin/_mocha -- test/unit --recursive
	@$(DONE)

test-integration:
	@NODE_ENV=test mocha test/integration
	@$(DONE)

test-old:
	@NODE_ENV=test mocha test
	@$(DONE)


# Deploy tasks
# ------------

deploy: build
	@docker push ${DOCKER_REGISTRY_ENDPOINT_QA}
	@$(DONE)

build:
	@docker build -t ${DOCKER_REGISTRY_ENDPOINT_QA} .
	@$(DONE)

build-dev:
	@docker-compose build

promote:
	@docker pull ${DOCKER_REGISTRY_ENDPOINT_QA}
	@docker tag ${DOCKER_REGISTRY_ENDPOINT_QA} ${DOCKER_REGISTRY_ENDPOINT_PROD}
	@docker push ${DOCKER_REGISTRY_ENDPOINT_PROD}
	@$(DONE)


# Run tasks
# ---------

run:
	@docker run -t ${DOCKER_REGISTRY_ENDPOINT_QA}

run-dev:
	@docker-compose up

attach-dev:
	@docker exec -it origami-buildservice-dev sh

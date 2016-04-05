include n.Makefile


# Environment variables
# ---------------------

EXPECTED_COVERAGE = 90

DOCKER_REGISTRY_ENDPOINT_QA = registry.heroku.com/origami-buildservice-qa/web
DOCKER_REGISTRY_ENDPOINT_PROD = registry.heroku.com/origami-buildservice-eu/web


# Verify tasks
# ------------

hello:
	@echo $(DOCKER_REGISTRY_ENDPOINT_QA)

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
	@docker push $(DOCKER_REGISTRY_ENDPOINT_QA)
	@$(DONE)

build:
	@docker build -t $(DOCKER_REGISTRY_ENDPOINT_QA) .
	@$(DONE)

build-dev:
	@docker-compose build
	@$(DONE)

promote:
	@docker pull $(DOCKER_REGISTRY_ENDPOINT_QA)
	@docker tag $(DOCKER_REGISTRY_ENDPOINT_QA) $(DOCKER_REGISTRY_ENDPOINT_PROD)
	@docker push $(DOCKER_REGISTRY_ENDPOINT_PROD)
	@$(DONE)

ci-docker-cache-load:
	@if [ -e ~/docker/obs-qa.tar ]; then docker load -i ~/docker/obs-qa.tar; fi
	@$(DONE)

ci-docker-cache-save:
	@mkdir -p ~/docker; docker save $(DOCKER_REGISTRY_ENDPOINT_QA) > ~/docker/obs-qa.tar
	@$(DONE)


# Run tasks
# ---------

run:
	@docker run -t $(DOCKER_REGISTRY_ENDPOINT_QA)

run-dev:
	@docker-compose up

attach-dev:
	@docker exec -it origami-buildservice-dev sh

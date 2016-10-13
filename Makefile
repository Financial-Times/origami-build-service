include n.Makefile


# Environment variables
# ---------------------

EXPECTED_COVERAGE = 90

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

deploy:
	@git push https://git.heroku.com/origami-buildservice-qa.git
	fastly deploy -e --service OdsPyPDTqDc8mVdDKln8y --vars SERVICEID --main main.vcl --backends ./cdn/backends/production.js ./cdn/vcl/
	@make change-request-qa
	@$(DONE)

deploy-ci:
	@git push git@heroku.com:origami-buildservice-qa.git
	fastly deploy --service OdsPyPDTqDc8mVdDKln8y --vars SERVICEID --main main.vcl --backends ./cdn/backends/production.js ./cdn/vcl/
	@make change-request-qa
	@$(DONE)

promote:
	@heroku pipelines:promote --app origami-buildservice-qa
	fastly deploy -e --service 4kUyjWYbCqkUHQZ7mBwMzl --vars SERVICEID --main main.vcl --backends ./cdn/backends/production.js ./cdn/vcl/
	@make change-request-prod
	@$(DONE)

change-request-qa:
	@./tools/change-request.js --environment Test --gateway konstructor || true
	@$(DONE)

change-request-prod:
	@./tools/change-request.js --environment Production --gateway internal || true
	@$(DONE)


# Run tasks
# ---------

run:
	@npm start

run-dev:
	@nodemon index.js | ./node_modules/.bin/bunyan -o short

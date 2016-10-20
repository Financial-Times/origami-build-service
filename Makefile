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

test-vcl-ci:
	mocha test-vcl/ -t 30000 -s 500 --ci

test-vcl-qa:
	mocha test-vcl/ -t 30000 -s 500 --qa

test-vcl-prod:
	mocha test-vcl/ -t 30000 -s 500 --prod

# Deploy tasks
# ------------

deploy:
	@git push https://git.heroku.com/origami-buildservice-qa.git
	@fastly deploy -e --service OdsPyPDTqDc8mVdDKln8y --vars SERVICEID --main main.vcl --backends ./cdn/backends/production.js ./cdn/vcl/
	@sleep 30
	@make test-vcl-qa
	@make change-request-qa
	@$(DONE)

deploy-ci:
	@fastly deploy --service 3RKFss27d33H2h36qIEMSM --vars SERVICEID --main main.vcl --backends ./cdn/backends/production.js ./cdn/vcl/

deploy-qa:
	@git push git@heroku.com:origami-buildservice-qa.git
	@fastly deploy --service OdsPyPDTqDc8mVdDKln8y --vars SERVICEID --main main.vcl --backends ./cdn/backends/production.js ./cdn/vcl/
	@sleep 30
	@make test-vcl-qa
	@make change-request-qa
	@$(DONE)

deploy-vcl-then-test-ci:
	make deploy-ci && sleep 30 && make test-vcl-ci

promote:
ifndef CR_API_KEY
	$(error CR_API_KEY is not set, change requests cannot be created. You can find the key in LastPass)
endif
	@heroku pipelines:promote --app origami-buildservice-qa
	fastly deploy -e --service 4kUyjWYbCqkUHQZ7mBwMzl --vars SERVICEID --main main.vcl --backends ./cdn/backends/production.js ./cdn/vcl/
	@make change-request-prod
	@$(DONE)


# Change Request tasks
# --------------------

CR_EMAIL=rowan.manning@ft.com
CR_APPNAME=Origami Build Service
CR_DESCRIPTION=Release triggered by CI
CR_SERVICE_ID=origami-buildservice ServiceModule
CR_NOTIFY_CHANNEL=origami-deploys

change-request-qa:
ifndef CR_API_KEY
	$(error CR_API_KEY is not set, change requests cannot be created. You can find the key in LastPass)
endif
	@change-request \
		--environment "Test" \
		--api-key "$(CR_API_KEY)" \
		--summary "Releasing $(CR_APPNAME) to QA" \
		--description "$(CR_DESCRIPTION)" \
		--owner-email "$(CR_EMAIL)" \
		--service "$(CR_SERVICE_ID)" \
		--notify-channel "$(CR_NOTIFY_CHANNEL)" \
		|| true
	@$(DONE)

change-request-prod:
ifndef CR_API_KEY
	$(error CR_API_KEY is not set, change requests cannot be created. You can find the key in LastPass)
endif
	@change-request \
		--environment "Production" \
		--api-key "$(CR_API_KEY)" \
		--summary "Releasing $(CR_APPNAME) to production" \
		--description "$(CR_DESCRIPTION)" \
		--owner-email "$(CR_EMAIL)" \
		--service "$(CR_SERVICE_ID)" \
		--notify-channel "$(CR_NOTIFY_CHANNEL)" \
		|| true
	@$(DONE)


# Run tasks
# ---------

run:
	@npm start

run-dev:
	@nodemon index.js | ./node_modules/.bin/bunyan -o short

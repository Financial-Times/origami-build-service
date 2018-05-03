# Origami Service Makefile
# ------------------------
# This section of the Makefile should not be modified, it includes
# commands from the Origami service Makefile.
# https://github.com/Financial-Times/origami-service-makefile
include node_modules/@financial-times/origami-service-makefile/index.mk
# [edit below this line]
# ------------------------


# Configuration
# -------------

INTEGRATION_TIMEOUT = 10000
INTEGRATION_SLOW = 2000

SERVICE_NAME = Origami Build Service
SERVICE_SYSTEM_CODE = build-service
SERVICE_SALESFORCE_ID = origami-buildservice ServiceModule

HEROKU_APP_QA = origami-build-service-qa
HEROKU_APP_EU = origami-build-service-eu
HEROKU_APP_US = origami-build-service-us
GRAFANA_DASHBOARD = origami-build-service

export GITHUB_RELEASE_REPO := Financial-Times/origami-build-service


# Additional test tasks
# ---------------------

test-old:
	@NODE_ENV=test mocha test
	@$(DONE)

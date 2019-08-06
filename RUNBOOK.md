# Origami Build Service

Performs all the build steps in the Installing modules manually on a central build server and then serves your requested bundles directly to your user’s browser.

## Service Tier

Gold

## Lifecycle Stage

Production

## Primary URL

https://www.ft.com/__origami/service/build/

## Host Platform

Heroku

## Contains Personal Data

no

## Contains Sensitive Data

no

## Delivered By

origami-team

## Supported By

origami-team

## Known About By

* lee.moody
* jake.champion
* rowan.manning

## Dependencies

* github
* origami-bower-registry

## Healthchecks

* origami-build-service-eu.herokuapp.com-https
* origami-build-service-us.herokuapp.com-https

## Failover Architecture Type

ActiveActive

## Failover Process Type

FullyAutomated

## Failback Process Type

FullyAutomated

## Data Recovery Process Type

NotApplicable

## Release Process Type

PartiallyAutomated

## Rollback Process Type

PartiallyAutomated

## Key Management Process Type

Manual

## Architecture Diagram

[Build Service architecture diagram on Google Drive](https://docs.google.com/a/ft.com/drawings/d/1khB3K5pwVPRMW5DcLB0o3bMkh__-896mS4hcVQS72f4/edit)
                                                                                
## Architecture

This is mostly a Node.js application, but it relies on GitHub and the Origami Bower Registry.

When a user makes a request for a bundle:

1. the Build Service uses Bower to install those dependencies in a temporary folder
2. Origami Build Tools is used to create the JavaScript or CSS bundle
3. The bundle is served

## More Information

More information can be found on the live service documentation.

## First Line Troubleshooting

There are a few things you can try before contacting the Origami team:

1. Verify that GitHub and the Origami Bower Registry are up. Either of these being down could cause downtime for this application. See [GitHub's status page](https://www.githubstatus.com/) and the [the Bower Registry's `__health` endpoint](https://origami-bower-registry.ft.com/__health).
2. Restart all of the dynos across the production EU and US Heroku apps ([pipeline here](https://dashboard.heroku.com/pipelines/9cd9033e-fa9d-42af-bfe9-b9d0aa6f4a50))

## Second Line Troubleshooting

If the application is failing entirely, you'll need to check a couple of things:

1. Did a deployment just happen? If so, roll it back to bring the service back up (hopefully)
2. Check the Heroku metrics page for both EU and US apps, to see what CPU and memory usage is like ([pipeline here](https://dashboard.heroku.com/pipelines/9cd9033e-fa9d-42af-bfe9-b9d0aa6f4a50))
2. Check the Splunk logs (see the monitoring section of this runbook for the link)

If only a few things aren't working, the Splunk logs (see monitoring) are the best place to start debugging. Always roll back a deploy if one happened just before the thing stopped working – this gives you the chance to debug in the relative calm of QA.

## Monitoring

* [Grafana dashboard][grafana]: graph memory, load, and number of requests
* [Pingdom check (Production EU)][pingdom-eu]: checks that the EU production app is responding
* [Sentry dashboard (Production)][sentry-production]: records application errors in the production app
* [Sentry dashboard (QA)][sentry-qa]: records application errors in the QA app
* [Splunk (Production)][splunk]: query application logs


[grafana]: http://grafana.ft.com/dashboard/db/origami-build-service
[pingdom-eu]: https://my.pingdom.com/newchecks/checks#check=1791038
[sentry-production]: https://sentry.io/nextftcom/build-service-prod/
[sentry-qa]: https://sentry.io/nextftcom/build-service-dev/
[splunk]: https://financialtimes.splunkcloud.com/en-US/app/search/search?q=search index%3Dheroku source%3D%2Fvar%2Flog%2Fapps%2Fheroku%2Forigami-build-service-*

## Failover Details

Our Fastly config automatically routes requests between the production EU and US Heroku applications. If one of those regions is down, Fastly will route all requests to the other region.

## Data Recovery Details

There is no data to recover.

## Release Details

The application is deployed to QA whenever a new commit is pushed to the `master` branch of this repo on GitHub. To release to production, the QA application must be [manually promoted through the Heroku interface](https://dashboard.heroku.com/pipelines/9cd9033e-fa9d-42af-bfe9-b9d0aa6f4a50).

## Key Management Details

The Build Service does not rely on any keys.


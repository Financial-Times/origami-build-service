# Archive Script

A script to store Origami Build Service responses to an AWS S3 archive.

Environment variables, as documented in the [main README](../../README.md):
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `ARCHIVE_BUCKET_NAME`

Example usage:
```bash
ARCHIVE_BUCKET_NAME=origami-build-service-bundles-archive-test cat scripts/archive/example-input.txt | scripts/archive/crawl-build.bash | node scripts/archive/index.js
```

- `cat scripts/archive/example-input.txt`: Outputs the content of a file to stdout.
- `scripts/archive/crawl-build.bash`: Accepts a list of Origami Build Service urls via stdin. Returns via stdout a list of the same Origami Build Service urls plus any v1/v2 urls which they depend on.
- `node scripts/archive/index.js`: Accepts a list of Origami Build Service urls via stdin. Sends a GET request to each URL and stores the response to an AWS S3 archive.
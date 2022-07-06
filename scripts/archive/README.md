# Archive Script

A script to store Origami Build Service responses to an AWS S3 archive.

Environment variables:
- `AWS_ACCESS_KEY_ID`: An AWS key with write access to the AWS S3 bucket which stores archived responses.
- `AWS_SECRET_ACCESS_KEY`: An AWS secret with write access to the AWS S3 bucket which stores archived responses.
- `ARCHIVE_BUCKET_NAME`: As documented in the [main README](../../README.md).

Example usage:
```bash
ARCHIVE_BUCKET_NAME=origami-build-service-archive-test cat scripts/archive/example-input.txt | scripts/archive/crawl-build.bash | node scripts/archive/index.js
```

- `cat scripts/archive/example-input.txt`: Outputs the content of a file to stdout.
- `scripts/archive/crawl-build.bash`: Accepts a list of Origami Build Service urls via stdin. Returns via stdout a list of the same Origami Build Service urls plus any v1/v2 urls which they depend on.
- `node scripts/archive/index.js`: Accepts a list of Origami Build Service urls via stdin. Sends a GET request to each URL and stores the response to an AWS S3 archive.

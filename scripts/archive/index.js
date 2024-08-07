'use strict';

const readline = require('node:readline');
const dotenv = require('dotenv');
const { stdin: input } = require('node:process');
const axios = require('axios').default;
const { Upload } = require('@aws-sdk/lib-storage');
const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
const pathToFilename = require('../../lib/path-to-archive-filename');

const batchLimit = 50;
const totalLimit = 0;

dotenv.config();
const s3BundleArchiveClient = new S3Client({ region: 'eu-west-1' });
const s3BucketName = process.env.ARCHIVE_BUCKET_NAME || 'origami-build-service-archive-prod';

const checkBuild = async path => {
	try {
		await axios.head(path);
		return true;
	} catch (error) {
		throw new Error(`failed head request (${error.response.status})`);
	}
};

const getBundle = async path => {
	try {
		const response = await axios.get(path, {
			responseType: 'stream'
		});
		return {
			data: response.data,
			headers: response.headers
		};
	} catch (error) {
		throw new Error(`failed get request (${error.response.status})`);
	}
};

const pushBundleToAws = async (filename, bundle) => {
	try {
		const s3upload = new Upload({
			client: s3BundleArchiveClient,
			params: {
				Bucket: s3BucketName,
				Key: filename,
				Body: bundle.data,
				ContentType: bundle.headers['content-type'],
				ACL: 'public-read'
			},
			tags: [],
			queueSize: 4, // optional concurrency configuration
			partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
			leavePartsOnError: false, // optional manually handle dropped parts
		  });

  		await s3upload.done();

	} catch (error) {
		throw new Error(`failed push to s3 (${error.message})`);
	}
};

const archiveExists = async (filename) => {
	try {
		await s3BundleArchiveClient.send(new HeadObjectCommand({
			Bucket: s3BucketName,
			Key: filename
		}));
		return true;
	} catch (error) {
		if (error.name !== 'NotFound') {
			throw new Error(`failed to check s3 for existing archive (${error.message})`);
		}
		return false;
	}
};

const archive = async path => {
	try {
		console.log(`archive attempt: ${path}`);
		const filename = pathToFilename(path);

		const archiveExistResult = await archiveExists(filename);
		if(archiveExistResult) {
			console.log(`archive exists: ${path} (${filename})`);
			return;
		}

		await checkBuild(path);

		const bundle = await getBundle(path);
		await pushBundleToAws(filename, bundle);

		console.log(`archive complete: ${path} (${filename})`);
	} catch (error) {
		console.log(`archive failed: ${path} – ${error.message}`);
	}
};

const rl = readline.createInterface({ input });

const queue = [];
let processing = false;
const processQueue = async () => {
	if(processing){
		return;
	}
	processing = true;
	const jobs = queue.splice(0, batchLimit);
	console.log(`queue: processing ${jobs.length} jobs`);
	await Promise.all(jobs.map(job => job()));
	processing = false;
	if(queue.length > 0) {
		await processQueue();
	}
};

let count = 0;
rl.on('line', async (line) => {
	count ++;
	if(totalLimit && (count > totalLimit)) {
		return;
	}
	const job = archive.bind(null, line);
	queue.push(job);
	// To handle requests via ft.con-cdn as well as direct to the backend: Also
	// archive a version of the url with sorted query params and and no trailing
	// ? where no query params are given. Optimising for reduced Build Service
	// complexity here, not archive size.
	// https://github.com/Financial-Times/ft.com-cdn/blob/da01b97de677f74606f7ed76533905255c536cdd/src/vcl/req-boltsort.vcl#L4
	try {
		const lineURL = new URL(line);
		lineURL.searchParams.sort();
		const jobOrderedQueryParam = archive.bind(null, lineURL.toString());
		queue.push(jobOrderedQueryParam);
	} catch (error) {}
	await processQueue();
});


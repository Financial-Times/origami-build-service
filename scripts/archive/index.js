'use strict';

const readline = require('node:readline');
const crypto = require('node:crypto');
const dotenv = require('dotenv');
const { stdin: input } = require('node:process');
const axios = require('axios').default;
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

const batchLimit = 3;
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
		const response = await axios.get(path);
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
		await s3BundleArchiveClient.send(new PutObjectCommand({
			Bucket: s3BucketName,
			Key: filename,
			Body: bundle.data.toString(),
			ContentType: bundle.headers['content-type'],
			ACL:'public-read'
		}));
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

const pathToFilename = path => {
	const removeOrigin = path => {
		const url = new URL(path);
		return path.replace(url.origin, '');
	};
	// Same name regardless of host.
	// https://origami-build.ft.com/[...]
	// https://www.ft.com/__origami/service/build/[...]
	const pathWithoutOrigin = removeOrigin(path).replace(/^\/?__origami\/service\/build\/?/, '').replace(/^\//, '');
	const decodedPathWithoutOrigin = decodeURIComponent(pathWithoutOrigin);
	// Decode for human readability.
	return decodedPathWithoutOrigin
		// Responses for one endpoint under one directory.
		// File for query param combination.
		.replace(/\?/, '/?')
		// Sanitise url. Keep select special characters for
		// human readability.
		.replace(/[^a-zA-Z0-9-_^,&?/]/g, '_')
		// Remove any slash from a query param (we decoded the url, and don't want
		// someone to manipulate the structure of our s3 bucket with a query param).
		.replace(/(?:[?])(?:.+)?[/]/g, '_')
		// Append hash to avoid conflicts having crudely sanitised the url.
		+ '-' +
		crypto.createHash('md5').update(decodedPathWithoutOrigin).digest('hex');
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

		const bundleResult = await getBundle(path);

		await pushBundleToAws(filename, bundleResult);

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
	await processQueue();
});


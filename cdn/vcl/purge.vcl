# This enables API key authentication for URL purge requests
sub vcl_recv {
	if (req.request == "FASTLYPURGE") {
		set req.http.Fastly-Purge-Requires-Auth = "1";
	}
}

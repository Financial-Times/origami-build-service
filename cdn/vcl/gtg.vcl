# This provides the /__gtg endpoint for the fastly service itself.
# It is a way to sanity-check that our Fastly service is functioning.
sub vcl_recv {
	if (req.request == "GET" && req.url ~ "^\/__gtg") {
		error 755;
	}
}

sub vcl_error {
	if (obj.status == 755) {
		set obj.status = 200;
		synthetic {"FASTLY OK"};
		return(deliver);
	}
}
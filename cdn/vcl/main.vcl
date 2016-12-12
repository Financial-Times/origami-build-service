# Comments which begin with `#FASTLY` are macro lines and are used by fastly
#  https://docs.fastly.com/guides/vcl/mixing-and-matching-fastly-vcl-with-custom-vcl#inserting-custom-vcl-in-fastly-39-s-vcl-boilerplate

sub vcl_recv {
#FASTLY recv
	set req.http.X-Original-Host = req.http.Host;
	set req.http.Host = "origami-build-service-eu.herokuapp.com";
}

sub vcl_fetch {
#FASTLY fetch
}

sub vcl_hit {
#FASTLY hit
}

sub vcl_miss {
#FASTLY miss
}

sub vcl_deliver {
#FASTLY deliver
}

sub vcl_error {
#FASTLY error
}

sub vcl_pass {
#FASTLY pass
}

include "log.vcl";
include "purge.vcl";
include "gtg.vcl";
include "fin.vcl";

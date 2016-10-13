sub vcl_recv {
  # Only log 25% of Fastly requests.
  if (randombool(1, 4)) {
    set req.http.log = "1";
  }

  # Attach a unique id to each request, can be useful when investigating logs
  if (!req.http.request-id) {
		set req.http.request-id =
			randomstr(8, "0123456789abcdef") "-"
			randomstr(4, "0123456789abcdef") "-4"
			randomstr(3, "0123456789abcdef") "-"
			randomstr(1, "89ab") randomstr(3, "0123456789abcdef") "-"
			randomstr(12, "0123456789abcdef");
	}
}

sub vcl_deliver {
  # vcl_deliver is called for all vcl_hit and vcl_miss calls
  call splunk_syslog;

  # If we are debugging, it is useful to know what the request-id will be so
  # that we can look at the logs for our requests
  if (req.http.FT-Debug) {
		set resp.http.request-id = req.http.request-id;
	}
}

sub vcl_error {
  # The reason vcl_error is different from splunk_syslog is because when
  # vcl_error is entered, there will be no resp object which is used inside
  # splunk_syslog to log information about the response we are sending

  # We log all vcl_error calls as these are probably exceptional circumstances
  log {"syslog ${SERVICEID} Fastly :: serviceid=${SERVICEID}"}
    {" timestamp="} time.start.sec
    {" event="} {"REQUEST"}
    {" host="} req.http.host
    {" request-id="} req.http.request-id
    {" client_ip="} req.http.Fastly-Client-IP
    {" method="} req.request
    {" url=""} req.url {"""}
    if(geoip.city,{" geoip_city=""} geoip.city {"""},{""})
    if(geoip.region,{" geoip_region=""} geoip.region {"""},{""})
    if(geoip.country_code,{" geoip_country="} geoip.country_code,{""})
    if(geoip.continent_code,{" geoip_continent="} geoip.continent_code,{""})
    {" fastly_region="} server.region
    {" fastly_datacenter="} server.datacenter
    {" fastly_node="} server.identity
    {" fastly_state="} fastly_info.state
    {" duration_ms="} time.elapsed.msec;
}

sub splunk_syslog {
  # The log function will only be called if the request is one of the 25%
  # which we labelled as having logging enabled
  if (req.http.log) {
    log {"syslog ${SERVICEID} Fastly :: serviceid=${SERVICEID}"}
      {" timestamp="} time.start.sec
      {" event="} {"REQUEST"}
      {" host="} req.http.host
      {" request-id="} req.http.request-id
      {" bytes="} resp.http.content-length
      {" client_ip="} req.http.Fastly-Client-IP
      {" method="} req.request
      {" url=""} req.url {"""}
      {" content_type=""} resp.http.Content-Type {"""}
      {" status="} resp.status
      {" content-length="} resp.http.content-length
      if(geoip.city,{" geoip_city=""} geoip.city {"""},{""})
      if(geoip.region,{" geoip_region=""} geoip.region {"""},{""})
      if(geoip.country_code,{" geoip_country="} geoip.country_code,{""})
      if(geoip.continent_code,{" geoip_continent="} geoip.continent_code,{""})
      {" fastly_region="} server.region
      {" fastly_datacenter="} server.datacenter
      {" fastly_node="} server.identity
      {" fastly_state="} fastly_info.state
      {" duration_ms="} time.elapsed.msec;
  }
}

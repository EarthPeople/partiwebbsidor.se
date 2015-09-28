
var plugins = {};

var getPluginInfoBySlug = function(slug, callback) {

	$.ajax({
		url: "https://api.wordpress.org/plugins/info/1.0/" + slug +".jsonp=?",
		jsonp: "callback",
		dataType: "jsonp",
		cache: true,
		data: {
		},
		success: callback
	});
};

var getPluginInfoByName = function(name, callback) {

	// Find slug of plugin
	if ( plugins.plugins[name] ) {
		var slug = plugins.plugins[name].slug;
		if ( slug ) {
			getPluginInfoBySlug( plugins.plugins[name].slug, callback );
		}
	} else {
		return false;
	}

};

var onLoadJSON = function(d) {

	// console.log("Done loading plugins.json");

	plugins = d;

	/*
	var allPlugins = [];
	plugins.partys.forEach(function(party) {
		allPlugins = allPlugins.concat(party.plugins);
	});

	allPlugins.sort();

	// Skapa object istället, kommer använda för att manuellt lägga in i JSON sen
	var allPluginsObjects = {};
	allPlugins.forEach(function(pluginName) {
		allPluginsObjects[ pluginName ] = {
			"slug": "",
			"url": ""
		};
	});

	plugins.allPlugins = allPlugins;
	plugins.allPluginsObjects = allPluginsObjects;

	console.log("allPlugins", allPlugins);
	console.log("allPluginsObjects", allPluginsObjects);
	*/

	// Leta plugins som används på fler än en sajt
	Object.keys(plugins.plugins).forEach(function(pluginName) {

	  if ( typeof plugins.plugins[pluginName].count == "undefined" ) {
	    plugins.plugins[pluginName].count = 0;
	    plugins.plugins[pluginName].name = pluginName;
	  }

	});

	  // Räkna hur ofta en plugin finns
	  plugins.partys.forEach( function(party) {

	  	if ( ! party.plugins ) {
	  		return;
	  	}

	    party.plugins.forEach( function(partyPlugin) {

	      plugins.plugins[partyPlugin].count++;

	    } );

	});

	// Kan inte sortera object så gör array av det istället och sortera den
	plugins.pluginsAsArray = [];
	Object.keys(plugins.plugins).forEach(function(pluginName) {

		plugins.pluginsAsArray.push( plugins.plugins[pluginName] );

	});

	// Sortera plugins efter antal förekomster
	plugins.pluginsAsArray.sort( function(a, b) {
		return b.count - a.count;
	} );

	// Hämta alla plugins som finns på fler än 1 sajt
	plugins.pluginsMany = plugins.pluginsAsArray.filter(function(plugin) {
		return plugin.count > 1;
	});

	// Sortera plugins alfabetiskt
	plugins.pluginsAsArray.sort( function(a, b) {
		return a.name.localeCompare(b.name);
	} );

	// Sortera partierna alfabetiskt
	plugins.partys.sort(function(a, b) {
		return a.party.localeCompare(b.party);
	});

	var html = "";

	// Skriv ut tabell med alla partier och deras cms/serverteknik
	html += '<table class="table table-hover">';
	html += '<thead>' +
				'<tr>' +
					'<th data-sort="string" scope="col">Parti/Webbplats</th>' +
					'<th data-sort="string">CMS</th>' +
					'<th data-sort="string">Server</th>' +
					'<th data-sort="string">SSL</th>' +
					'<th data-sort="string">Cookies</th>' +
					'<th data-sort="int">PageSpeed mobile</th>' +
					'<th data-sort="int">PageSpeed desktop</th>' +
				'</tr>' +
			'</thead>' +
			'<tbody>';

	plugins.partys.forEach(function(party) {

		var str_cookies = "";
		if ( "yes" == party.features.cookies ) {
			str_cookies = "Sätter cookies";
		} else if ( "no" == party.features.cookies ) {
			str_cookies = "Sätter inte cookie";
		}

		var str_https = "";
		if ( "yes" == party.features.https ) {
			str_https = "HTTPS";
		} else if ( "no" == party.features.https ) {
			str_https = "HTTP";
		}

		var pagespeedURLMobile = "https://developers.google.com/speed/pagespeed/insights/?tab=mobile&url=" + party.url;
		var pagespeedURLDesktop = "https://developers.google.com/speed/pagespeed/insights/?tab=desktop&url=" + party.url;

		html += '' +
			'<tr>' +
				'<th scope="row" class="party-name">' +
					'<i class="logga ' + party.icon + '"></i> ' +
					'<a href="' + party.url + '">' + party.party + '</a></td>' +
				'<td class="feature-cms">' + party.features.cms + '</td>' +
				'<td class="feature-server">' + party.features.server + '</td>' +
				'<td class="feature-https">' + str_https + '</td>' +
				'<td class="feature-cookies">' + str_cookies + '</td>' +
				'<td class="feature-insights_mobile"><a href="' + pagespeedURLMobile + '">' + party.features.insights_mobile + '</a></td>' +
				'<td class="feature-insights_desktop"><a href="' + pagespeedURLDesktop +'">' + party.features.insights_desktop + '</a></td>' +
			'</tr>';

	});

	html += '</tbody';
	html += '</table>';

	$("#partier-serverteknik").html(html);

	// Skriv ut wp-plugins som finns på flera sajter
	html = "";
	html += "<p>Vid en genomsökning av webbplatserna så hittade vi totalt ";
	html += "<span class='plugins-total-count'>" + Object.keys(plugins.plugins).length + "";
	html += " olika plugins</span>.</p>";

	html += "<p><span class='plugins-more-one-site'>" + plugins.pluginsMany.length + " plugins</span> är extra populära och används på fler av partiernas webbplatser. ";

	html += '<div class="table-responsive">';
	html += "<table class='table table-hover table-plugins-popular'>";
	html += "<tr><th>Antal sajter</th><th>Plugin</th><th>Beskrivning</th></tr>";
	plugins.pluginsMany.forEach(function(plugin) {

		html += "<tr>";

		html += "<td>";
		html += plugin.count;
		html += "</td>";

		html += "<td>";
		html += plugin.name;
		html += "</td>";

		html += "<td>";
		html += "<div data-plugin-name='" + plugin.name + "'></div>";
		html += "</td>";

		html += "</tr>";

	});
	html += "</table>";
	html += '</div>';

	$("#plugins-popular").html(html);

	// Skriv ut partierna och deras wp-plugins
	html = "";
	plugins.partys.forEach(function(party) {

		if (!party.plugins) {
			return;
		}

		html += "<div class='party-plugins'>";

		html += "<h3 class='sticky' id='" + party.icon + "'><i class='logga " + party.icon + "'></i> " + party.party + "</h3>";

		html += "<p><span class='party-plugins-count'>" + party.plugins.length + " WordPress-plugins</span> hittade vi på " + party.party + "s webbplats.</p>";

		html += '<div class="table-responsive">';
		html += "<table class='table table-hover table-plugins-parties'>";
		html += "<tr><th>Plugin</th><th>Beskrivning</th></tr>";

		party.plugins.forEach(function(plugin) {

			html += "<tr>";

			html += "<td>";
			html += plugin;
			html += "</td>";

			html += "<td>";
			html += "<div data-plugin-name='" + plugin + "'></div>";
			html += "</td>";

			html += "</tr>";

		});

		html += "</table>";
		html += '</div>';

		html += "</div>";

	});

	$("#plugins-parties").html(html);

	// Fetch plugin info for all plugins
	$("[data-plugin-name]").each(function() {
		var $this = $(this);
		getPluginInfoByName( $this.data("plugin-name"), function(d) {

			if ( ! d ) {
				return;
			}

			var pluginHTML = "";
			if ( d.short_description ) {
				pluginHTML += "<p class='plugin-description'>" + d.short_description + "</p>";
			}
			pluginHTML += "<p class='plugin-author'>By " + d.author;
			if ( d.homepage ) {
				pluginHTML += " | <a href='" + d.homepage + "'>Homepage</a>";
			}
			pluginHTML += "</p>";
			$this.html(pluginHTML);

		});
	});

	// Make tables sortable
	$("table").stupidtable();

};

var onLoadJSONError = function() {
	console.log("Failed to load JSON");
};

$.getJSON("partier.json")
	.done(onLoadJSON)
	.fail(onLoadJSONError);

$(function() {

	setTimeout(function() {
		$('.sticky').Stickyfill();
	}, 1000);

});

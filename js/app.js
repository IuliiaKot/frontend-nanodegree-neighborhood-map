
var map;
var allMarkers = [];

// create google map

function initialize() {
// starting point
  var center = new google.maps.LatLng(40.767,  -73.991);

  var mapOptions = {
    zoom: 12,
    center: center,
  };

// create new map object
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

// Functuion which create and add markers on google map.


function addGoogleMapsMarkers(m){

  var infoWindow = new google.maps.InfoWindow();

  //Function to crate info window for marker.
  function makeInfoWindow(mk){

    //Create the DOM element
    // Display name, phoneone number, address, street view,  review and reviewr's picture
		var infoWindowBody = '<div class="info">';
		infoWindowBody += '<h4>' + mk.title + '</h4>';
    infoWindowBody += '<p>' + mk.address + '</p>';
		infoWindowBody += '<p>' + mk.phone + '</p>';
      img = '<img class="street" src="http://maps.googleapis.com/maps/api/streetview?size={size}&location={location}"><br>';
      img = img.replace('{size}', '150x120');
      //img = img.replace('{location}', [mk.position.j, mk.position.C].join(','));
      img = img.replace('{location}', mk.address);
    infoWindowBody += img + '<br>';
    infoWindowBody += '<p class="review">Review by Yelp</p>'
    infoWindowBody += '<p class="review"><img src="' + mk.pic + '">' + mk.blurb + '</p>';
    infoWindowBody += '</div>';

		// Google Map V3 method to set the content
  	infoWindow.setContent(String(infoWindowBody));
  	infoWindow.open(map, mk);
  }


  //Function delete all markers on the map
	function deleteAllMarkers(){
    for(var i = 0; i < allMarkers.length; i++)
    {
      allMarkers[i].setMap(null);
    }

	  allMarkers = [];
  }

  if(allMarkers.length > 0){
	  deleteAllMarkers();
  }

  // loop through all markrs and put each on the map
  for(var i = 0, max=m.length; i < max; i++ ) {

    var position = new google.maps.LatLng(m[i][2], m[i][3]);
    var mkr = new google.maps.Marker({
	        position: position,
	        map: map,
					animation: google.maps.Animation.DROP,
	        title: m[i][0],
          address: m[i][6],
	        phone: m[i][1],
	        pic: m[i][4],
	        blurb: m[i][5]

		    });
    // update allMarkers array variable with mkr object
    allMarkers.push(mkr);


	  google.maps.event
	  .addListener(mkr, 'mouseover', (function(mk, i) {
      return function() {
        makeInfoWindow(mk);
      }
	  })(mkr, i));


	  google.maps.event
	  .addListener(mkr, 'click', (function(mk, i){
			return function(){
	      makeInfoWindow(mk);
				toggleBounce(mk, i);
			}
		})(mkr, i));
  }

// animate marker
	function toggleBounce(mk, i) {

	  var yelpMarkerUl =  $('.yelp-list').find('ul'),
	  		yelpMarker = yelpMarkerUl.find('li'),
	  		yelpMarkerPos = 200 * i,
	  		activeYelpMarker = yelpMarker.eq(i);

    // delete ani atr if markr has animation atr. and also delete className
	  if (mk.getAnimation() != null) {
		  mk.setAnimation(null);
	    yelpMarkerUl.removeClass('show');
	    activeYelpMarker.removeClass('active');

	  } else {
			for(am in allMarkers){
					var isMoving = allMarkers[am].getAnimation();

				if(isMoving && am !== i){
					allMarkers[am].setAnimation(null);
				}
			}

	    mk.setAnimation(google.maps.Animation.BOUNCE);
	    yelpMarkerUl.addClass('show').animate({
		    scrollTop: yelpMarkerPos
		  }, 300);
		  yelpMarkerUl.find('.active').removeClass('active');
	    activeYelpMarker.addClass('active');
	  }
	}
 //add click event to yelp list

	$('.results').find('li').click(function(){
		var pos = $(this).index();
		for(am in allMarkers){
			var isMoving = allMarkers[am].getAnimation();
					if(isMoving && am !== pos){
				allMarkers[am].setAnimation(null);
			}
		}


		allMarkers[pos].setAnimation(google.maps.Animation.BOUNCE);
		makeInfoWindow(allMarkers[pos]);
		// $('.results').find('.active').removeClass('active');
		// $(this).addClass('active');
	});
}

 // Function that calls to yelp and update the knockout data binds
function yelpAjax(searchNear, searchFor) {

	var auth = {
    consumerKey : "Ofjn2v1uDdNfu93l9iOvFQ",
    consumerSecret : "LMtJoXMM5q5fCIW5gCcrws5rA7Q",
    accessToken : "KW_R9-rPtBEyYnPKAX_6jbfOt3jJC3Ci",
    accessTokenSecret : "EvigJk1P_tiwoeaS_ua4l_4y4cQ",
    serviceProvider : {
      signaturrMethod : "HMAC-SHA1"
    }
	};
	 //	Create a variable "accessor" to pass on to OAuth.SignatureMethod
	var accessor = {
	    consumerSecret : auth.consumerSecret,
	    tokenSecret : auth.accessTokenSecret
	};

	 //	Create a array object "parameter" to pass on "message" JSON object
	var parameters = [];
	parameters.push(['term', searchFor]);
	parameters.push(['location', searchNear]);
	parameters.push(['callback', 'cb']);
	parameters.push(['oauth_consumer_key', auth.consumerKey]);
	parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
	parameters.push(['oauth_token', auth.accessToken]);
	parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

	var message = {
	    'action' : 'http://api.yelp.com/v2/search',
	    'method' : 'GET',
	    'parameters' : parameters
	};

	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, accessor);

	var parameterMap = OAuth.getParameterMap(message.parameters);
	yJax(message.action, parameterMap);
}

 //	ajax method to get yelp data

function yJax(url, ydata){
	$.ajax({
		'url' : url,
		'data' : ydata,
		'dataType' : 'jsonp',
		'global' : true,
		'jsonpCallback' : 'cb',
		'success' : function(data){
			makeYelpList(data);
		}
	});
}


 // Function whit return data using yelp's api
function makeYelpList(d){

	var $yelpList = $('.results');
			results = d.businesses,
			el = '';
	$yelpList.empty();

	// create markers for locations
	var markers = [];
  var art = [];

	if(results.length > 0){
    // loop throug all dates
		for (result in results){
			var business = results[result],
					name = business.name,
					img = business.image_url,
					phone = business.display_phone,
					url = business.url,
					stars = business.rating_img_url_small,
					rate = business.rating,
					loc = {
						lat: business.location.coordinate.latitude,
						lon: business.location.coordinate.longitude,
						address: business.location.display_address[0] + '<br>' + business.location.display_address[business.location.display_address.length - 1]
					},
          //adr = business.location.display_address[0] + '<br>' + business.location.display_address[business.location.display_address.length - 1],
					review = {
						img: business.snippet_image_url,
						txt: business.snippet_text
					};

			/*
			 *	create the Dom object
			 */
			var makeEl = '<li><div class="heading row"><p class="col-sm-3 img-container">';
			makeEl += '<img src="' + img + '" height=100 width=100 class="img-thumbnail">';
			makeEl += '<img src="' + stars + '" height=17 width=84 alt="Yelp Rating">';
			makeEl += '</p><div class="col-sm-9">';
			makeEl += '<h3>' + name + '</h3><p>';
			makeEl += '<span>' + loc.address + '</span></p>';
			makeEl += '<p><strong>' + phone + '</strong></p>';
			makeEl += '<p><a class="btn btn-default btn-small" href="' + url + '" target="_blank">Yelp!</a></p>';
			makeEl += '</div></div></li>';

			el += makeEl;

      // create the marker array object and add merker to the marker array obj
	    var marker = [name, phone, loc.lat, loc.lon, review.img, review.txt, loc.address, url];
	    markers.push(marker);
		}

		$yelpList.append(el);

		//Use google map api to create the markers  on the map
		google.maps.event.addDomListener(window, 'load', addGoogleMapsMarkers(markers));

	} else {
		var searchedFor = $('input').val();
		$yelpList.addClass('open').append('<li><h3>Sorry, we can not find anything <span>' + searchedFor + '</span>.</h3><p>Trying searching something else.</p></li>');

		google.maps.event.addDomListener(window, 'load', addGoogleMapsMarkers(markers));
	}
}

//initialize the google maps function

initialize();

//call the main yelp function

yelpAjax('10012', 'Italian food');

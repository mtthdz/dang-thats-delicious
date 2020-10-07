function autocomplete(input, latinput, lnginput) {
  // Google uses lat-lng, while mongoDB uses lng-lat
  // skip fn from running if no input on page
  if(!input) return;

  const dropdown = new google.maps.places.Autocomplete(input);

}

export default autocomplete;
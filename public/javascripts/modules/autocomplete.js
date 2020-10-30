function autocomplete(input, latinput, lnginput) {
  // Google uses lat-lng, while mongoDB uses lng-lat
  // the !input conditional will skip fn from running if no input on page
  // Remember to enable both Maps & places API
  // consider adding an IP address restriction once live
  if(!input) return;

  const dropdown = new google.maps.places.Autocomplete(input);
  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    latinput.value = place.geometry.location.lat();
    lnginput.value = place.geometry.location.lng();
  });

  // if someone hits enter on the address field, don't submit the forms
  input.on('keydown', (e) => {
    if(e.keyCode === 13) e.preventDefault();
  })
}

export default autocomplete;
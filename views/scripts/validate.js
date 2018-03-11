module.exports = function(field, validity) {
  if (field.matches('.fixture-name input')) {
    var manufacturerName;
    var newManufacturerField = document.querySelector('.new-manufacturer-name input');
    if (newManufacturerField) {
      if (newManufacturerField.value === '') {
        return null;
      }

      manufacturerName = newManufacturerField.value.toLowerCase();
    }
    else {
      var manufacturerSelect = document.querySelector('.manufacturer select');
      var selectedIndex = manufacturerSelect.selectedIndex;
      if (selectedIndex === 0) {
        return null;
      }

      manufacturerName = manufacturerSelect[selectedIndex].textContent.toLowerCase();
    }

    if (field.value.toLowerCase().indexOf(manufacturerName) === 0) {
      return 'Please don\'t include the manufacturer name.';
    }
  }

  return null;
};

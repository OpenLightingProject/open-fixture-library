module.exports = (function() {
  /**
   * Test additional constraints that a field has to fulfill. Those constraints
   * are not specified in HTML, but imperatively in this function.
   * @private
   * @param {!Node} field The field or group to validate
   * @param {?ValidityState} validity the Validity State of the field or null
   * @returns {?string} The error message or null
   */
  var checkCustomError = function(field, validity) {
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

    if (field.matches('.capability:first-child .rangeStart') && (validity.valueMissing || validity.rangeUnderflow)) {
      return 'The first range has to start at 0.';
    }

    if (field.matches('.capability:last-child .rangeEnd') && (validity.valueMissing || validity.rangeOverflow)) {
      return 'The last range has to end at ' + field.getAttribute('max') + '.';
    }

    if ((field.matches('.capability .rangeStart') && validity.rangeUnderflow)
      || (field.matches('.capability .rangeEnd') && validity.rangeOverflow)) {
      return 'Ranges must not overlap.';
    }

    return null;
  };
})();

/* eslint no-var: off */
/* eslint prefer-arrow-callback: off */
/* eslint prefer-template: off */
/* eslint-env browser */

var scrollIntoView = require('scroll-into-view');

module.exports = (function() {

  var validate = {}; // Object for public APIs

  var settings = {
    // Classes and Selectors
    selector: '[data-validate]',
    groupSelector: '.validate-group',
    fieldSelector: 'input, select, textarea',
    messageSelector: '.error-message',
    errorClass: 'error',

    // Messages
    messageValueMissing: 'Please fill out this field.',
    messageValueMissingSelect: 'Please select a value.',
    messageValueMissingSelectMulti: 'Please select at least one value.',
    messageTypeMismatchEmail: 'Please enter an email address.',
    messageTypeMismatchURL: 'Please enter a URL.',
    messageTooShort: 'Please lengthen this text to {minLength} characters or more. You are currently using {length} characters.',
    messageTooLong: 'Please shorten this text to no more than {maxLength} characters. You are currently using {length} characters.',
    messagePatternMismatch: 'Please match the requested format.',
    messageBadInput: 'Please enter a number.',
    messageStepMismatch: 'Please enter a valid value.',
    messageRangeOverflow: 'Please enter a value that is no more than {max}.',
    messageRangeUnderflow: 'Please enter a value that is no less than {min}.',
    messageGeneric: 'The value you entered for this field is invalid.',

    onSubmit: function(form) {}
  };


  /**
   * Test additional constraints that a field has to fulfill. Those constraints
   * are not specified in HTML, but imperatively in this function.
   * @private
   * @param {!Node} field The field or group to validate
   * @param {?ValidityState} validity the Validity State of the field or null
   * @return {?String} The error message or null
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

    if (field.matches('.physical-lens-degrees') || field.matches('.capability')) {
      var range = field.querySelectorAll('input');
      if (range[0].value !== '' && range[1].value !== '' && Number(range[0].value) > Number(range[1].value)) {
        return 'The start value of a range must not be greater than its end.';
      }
    }

    if (field.matches('.channelName')) {
      if (/\bfine\b|\d+(?:\s|-|_)*bit|\bMSB\b|\bLSB\b/i.test(field.value)) {
        return 'Please don\'t create fine channels here, set its resolution below instead.';
      }

      if (/^[^A-Z0-9]/.test(field.value)) {
        return 'Please start with an uppercase letter or a number.';
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

  /**
   * Validate a form field
   * @public
   * @param {!Node} field The field or group to validate
   * @return {?String} The error message or null
   */
  validate.hasError = function(field) {
    if (field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') {
      return null;
    }

    var validity = field.validity;

    var customError = checkCustomError(field, validity);
    if (customError) {
      return customError;
    }

    if (validity.valid) {
      return null;
    }

    // If field is required and empty
    if (validity.valueMissing) {
      if (field.type === 'select-multiple') {
        return settings.messageValueMissingSelectMulti;
      }

      if (field.type === 'select-one') {
        return settings.messageValueMissingSelect;
      }

      return settings.messageValueMissing;
    }

    // If not the right type
    if (validity.typeMismatch) {
      if (field.type === 'email') {
        return settings.messageTypeMismatchEmail;
      }

      if (field.type === 'url') {
        return settings.messageTypeMismatchURL;
      }
    }

    if (validity.tooShort) {
      return settings.messageTooShort.replace('{minLength}', field.getAttribute('minLength')).replace('{length}', field.value.length);
    }

    if (validity.tooLong) {
      return settings.messageTooLong.replace('{minLength}', field.getAttribute('maxLength')).replace('{length}', field.value.length);
    }

    // If number input isn't a number
    if (validity.badInput) {
      return settings.messageBadInput;
    }

    if (validity.stepMismatch) {
      return settings.messageStepMismatch;
    }

    if (validity.rangeOverflow) {
      return settings.messageRangeOverflow.replace('{max}', field.getAttribute('max'));
    }

    if (validity.rangeUnderflow) {
      return settings.messageRangeUnderflow.replace('{min}', field.getAttribute('min'));
    }

    if (validity.patternMismatch) {
      if (field.hasAttribute('title')) {
        return field.getAttribute('title');
      }

      return settings.messagePatternMismatch;
    }

    // If all else fails, return a generic catchall error
    return settings.messageGeneric;
  };

  /**
   * Mark a field if it has an error
   * @public
   * @param {!Node} field The field to show an error message for
   * @param {?Boolean} error True if the field should be marked
   */
  validate.markError = function(field, error) {
    field.classList[error ? 'add' : 'remove'](settings.errorClass);
  };

  /**
   * Show an error message on a field
   * @public
   * @param {!Node} field The field or group to show an error message for
   * @param {?String} error The error message to show, null to remove the error
   */
  validate.showError = function(field, error) {
    var errorMsg = field.closest(settings.groupSelector).querySelector(settings.messageSelector);

    errorMsg.textContent = error ? error : '';
    field.classList[error ? 'add' : 'remove'](settings.errorClass);
  };

  /**
   * Show an error message on a field
   * @public
   * @param {!Node} group The group to check for errors
   * @param {?Boolean} removeErrors true to remove all errors instead of checking
   * @return {?String} The error message to show or null
   */
  validate.validateGroup = function(group, removeErrors) {
    var errors = [];
    var customError = checkCustomError(group);

    [].forEach.call(group.querySelectorAll(settings.fieldSelector), function(groupField) {
      var error = removeErrors ? null : customError || validate.hasError(groupField);

      validate.markError(groupField, error);
      if (error && errors.indexOf(error) === -1) {
        errors.push(error);
      }
    });

    validate.showError(group, errors.join(' '));

    return errors.length > 0 ? errors : null;
  };

  /**
   * Add the `novalidate` attribute to all forms
   * @private
   * @param {?Boolean} remove If true, remove the `novalidate` attribute
   */
  var addNoValidate = function(remove) {
    var forms = document.querySelectorAll(settings.selector);
    for (var i = 0; i < forms.length; i++) {
      if (remove) {
        forms[i].removeAttribute('novalidate');
      }
      else {
        forms[i].setAttribute('novalidate', true);
      }
    }
  };



  /**
   * Check field or group validity when it loses focus
   * @private
   * @param {!Event} event The blur event
   */
  var blurHandler = function(event) {
    // give the browser and Vue time to update form fields, focus, etc.
    window.setTimeout(function() {
      // skip if event was triggered by document blur etc.
      if (!(event.target instanceof Element)) {
        return;
      }

      var group = event.target.closest(settings.groupSelector);
      if (!group) {
        return;
      }

      // skip if focus is still in the same group, but only if there is not already an error
      if (document.activeElement.closest(settings.groupSelector) === group
        && !event.target.classList.contains(settings.errorClass)) {
        return;
      }

      validate.validateGroup(group);
    }, 10);
  };

  /**
   * Check field validity immediately after a change if it had an error before.
   * @private
   * @param {!Event} event The change or keypress event
   */
  var changeHandler = function(event) {
    if (!(event.target instanceof Element) || !event.target.classList.contains(settings.errorClass)) {
      return;
    }

    // give the browser and Vue time to update form fields, focus, etc.
    window.setTimeout(function() {
      var group = event.target.closest(settings.groupSelector);
      if (!group) {
        return;
      }

      validate.validateGroup(group);
    }, 10);
  };

  /**
   * Check all fields on submit
   * @private
   * @param {Event} event The submit event
   */
  var submitHandler = function(event) {
    var form = event.target;

    // Only run on forms flagged for validation
    if (!form.matches(settings.selector)) {
      return;
    }

    event.preventDefault();

    var firstErrorField;

    [].forEach.call(form.querySelectorAll(settings.groupSelector), function(group) {
      var error = validate.validateGroup(group);
      if (error && !firstErrorField) {
        firstErrorField = group.querySelector(settings.fieldSelector);
      }
    });

    // If there are errors, focus on first element with error
    if (firstErrorField) {
      var scrollContainer = firstErrorField.closest('.dialog') || window;
      scrollIntoView(firstErrorField, {
        time: 300,
        align: {
          top: 0,
          left: 0,
          topOffset: 100
        },
        isScrollable: function(target, defaultIsScrollable) {
          return target === scrollContainer;
        }
      }, function() {
        firstErrorField.focus();
      });

      return;
    }

    // Otherwise, submit the form
    settings.onSubmit(form);
  };

  /**
   * Remove all errors.
   * @private
   * @param {Event} event The submit event
   */
  var resetHandler = function(event) {
    var form = event.target;

    // Only run on forms flagged for validation
    if (!form.matches(settings.selector)) {
      return;
    }

    console.log(form);

    // Remove all errors
    var groups = document.querySelectorAll(settings.groupSelector);
    for (var i = 0; i < groups.length; i++) {
      validate.validateGroup(groups[i], true);
    }
  };

  /**
   * Destroy the current initialization.
   * @public
   */
  validate.destroy = function() {
    // Remove event listeners
    document.removeEventListener('blur', blurHandler, false);
    document.removeEventListener('submit', submitHandler, false);
    document.removeEventListener('change', changeHandler, false);
    document.removeEventListener('keypress', changeHandler, false);
    document.removeEventListener('reset', resetHandler, false);

    // Remove all errors
    var groups = document.querySelectorAll(settings.groupSelector);
    for (var i = 0; i < groups.length; i++) {
      validate.validateGroup(groups[i], true);
    }

    // Remove `novalidate` from forms
    addNoValidate(true);
  };

  /**
   * Initialize Validate
   * @public
   * @param {Function(form)} onSubmit function to call after successful validation
   */
  validate.init = function(onSubmit) {
    // Destroy any existing initializations
    validate.destroy();

    settings.onSubmit = onSubmit;

    // Add the `novalidate` attribute to all forms
    addNoValidate();

    // Event listeners
    document.addEventListener('blur', blurHandler, true);
    document.addEventListener('submit', submitHandler, false);
    document.addEventListener('change', changeHandler, false);
    document.addEventListener('keypress', changeHandler, false);
    document.addEventListener('reset', resetHandler, false);
  };


  //
  // Public APIs
  //

  return validate;

})();

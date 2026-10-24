// Litora form (module form-card). The same HTML and this same file serve the HubSpot theme, the Webflow Code Embed and
// the Framer code component: validation written in text next to each field, then a fetch to the HubSpot Forms API v3,
// which takes cross-origin requests without a key.
//   POST https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}
// Every text comes from the page (labels in the markup, messages in data-error-* and data-submit-error), so nothing
// here is in a visitor's language, and every hook is a data attribute, never a class. While data-portal-id or
// data-form-guid is empty, the submission is simulated and the visitor goes straight to the thank you page.
// Without this file the browser checks the required fields on its own.
(function () {
  'use strict';

  var ENDPOINT = 'https://api.hsforms.com/submissions/v3/integration/submit/';
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function digits(value) {
    return value.replace(/\D/g, '');
  }
  // the country code and the area code: a leading + and 10 to 15 digits (E.164 allows 15)
  function validPhone(value) {
    var n = digits(value).length;
    return /^\s*\+/.test(value) && n >= 10 && n <= 15;
  }

  function show(controls, errorEl, message) {
    errorEl.textContent = message || '';
    controls.forEach(function (c) {
      if (message) c.setAttribute('aria-invalid', 'true');
      else c.removeAttribute('aria-invalid');
    });
    return !message;
  }

  function checkText(input) {
    var value = input.value.trim();
    var message = '';
    if (!value) message = input.dataset.errorRequired;
    else if (input.type === 'email' && !EMAIL.test(value)) message = input.dataset.errorInvalid;
    else if (input.type === 'tel' && !validPhone(value)) message = input.dataset.errorInvalid;
    return show([input], document.getElementById(input.id + '-error'), message);
  }

  function checkBox(box) {
    return show([box], document.getElementById(box.id + '-error'), box.checked ? '' : box.dataset.errorRequired);
  }

  function checkGroup(group) {
    var radios = Array.prototype.slice.call(group.querySelectorAll('input[type="radio"]'));
    var chosen = radios.some(function (r) {
      return r.checked;
    });
    return show(radios, group.querySelector('[data-form-error]'), chosen ? '' : group.dataset.errorRequired);
  }

  // each check with the control that takes the focus when it fails, in the order of the page
  function checks(form) {
    var list = [];
    form.querySelectorAll('[data-form-text], [data-form-group], [data-form-check]').forEach(function (el) {
      if (el.hasAttribute('data-form-group'))
        list.push({
          run: function () {
            return checkGroup(el);
          },
          focus: el.querySelector('input'),
          watch: el,
        });
      else if (el.hasAttribute('data-form-check'))
        list.push({
          run: function () {
            return checkBox(el);
          },
          focus: el,
          watch: el,
        });
      else
        list.push({
          run: function () {
            return checkText(el);
          },
          focus: el,
          watch: el,
        });
    });
    return list;
  }

  function cookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : '';
  }

  function payload(form) {
    var fields = [];
    var consent = null;
    form.querySelectorAll('[data-form-text]').forEach(function (input) {
      fields.push({ name: input.name, value: input.value.trim() });
    });
    form.querySelectorAll('input[type="radio"]:checked').forEach(function (radio) {
      fields.push({ name: radio.name, value: radio.value });
    });
    form.querySelectorAll('[data-form-check]').forEach(function (box) {
      if (box.hasAttribute('data-consent-text'))
        consent = { consentToProcess: box.checked, text: box.dataset.consentText };
      else fields.push({ name: box.name, value: box.checked ? 'true' : 'false' });
    });
    // the title the browser shows: the attribute came escaped twice in HubSpot ("S&atilde;o Paulo" in the CRM)
    var data = {
      fields: fields,
      context: { pageUri: window.location.href, pageName: document.title || form.dataset.pageName },
    };
    var hutk = cookie('hubspotutk');
    if (hutk) data.context.hutk = hutk;
    if (consent) data.legalConsentOptions = { consent: consent };
    return data;
  }

  function init(form) {
    var list = checks(form);
    var button = form.querySelector('button[type="submit"]');
    var status = form.querySelector('[data-form-status]');
    var tried = false;
    // the messages of this file replace the bubbles of the browser
    form.noValidate = true;

    // after the first attempt, each field checks itself again as the visitor fixes it
    list.forEach(function (item) {
      ['input', 'change'].forEach(function (type) {
        item.watch.addEventListener(type, function () {
          if (tried) item.run();
        });
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      tried = true;
      status.textContent = '';
      var firstInvalid = null;
      list.forEach(function (item) {
        if (!item.run() && !firstInvalid) firstInvalid = item.focus;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var redirect = new URL(form.dataset.redirect, window.location.href).href;
      var portalId = form.dataset.portalId;
      var formGuid = form.dataset.formGuid;
      if (!portalId || !formGuid) {
        window.location.assign(redirect);
        return;
      }

      button.disabled = true;
      form.setAttribute('aria-busy', 'true');
      fetch(ENDPOINT + encodeURIComponent(portalId) + '/' + encodeURIComponent(formGuid), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload(form)),
      })
        .then(function (response) {
          if (!response.ok) throw new Error('HubSpot answered ' + response.status);
          window.location.assign(redirect);
        })
        .catch(function () {
          status.textContent = status.dataset.submitError;
          button.disabled = false;
          form.removeAttribute('aria-busy');
        });
    });
  }

  document.querySelectorAll('form[data-hubspot-form]').forEach(init);
})();

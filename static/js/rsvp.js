(function () {
  var form = document.getElementById('rsvp-form');
  var fullName = document.getElementById('full-name');
  var partySize = document.getElementById('party-size');
  var error = document.getElementById('form-error');
  var back = document.getElementById('step-back');
  var next = document.getElementById('step-next');
  var step = 1;
  var sending = false;
  function showStep(value) {
    step = value;
    document.getElementById('name-step').hidden = step !== 1;
    document.getElementById('party-step').hidden = step !== 2;
    document.getElementById('invitation-back').hidden = step !== 1;
    back.hidden = step !== 2;
    document.getElementById('step-indicator').textContent = 'Question ' + step + ' of 2';
    next.textContent = step === 1 ? 'Next →' : 'Submit';
    error.textContent = '';
    fullName.removeAttribute('aria-invalid');
    partySize.removeAttribute('aria-invalid');
    (step === 1 ? fullName : partySize).focus();
  }
  function invalid(input, message) {
    error.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  }
  back.addEventListener('click', function () { if (!sending) showStep(1); });
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (sending) return;
    if (!fullName.value.trim()) { showStep(1); invalid(fullName, 'Please enter your full name.'); return; }
    if (step === 1) { showStep(2); return; }
    var count = Number(partySize.value);
    if (!partySize.value || !Number.isSafeInteger(count) || count < 1) {
      invalid(partySize, 'Please enter a whole number of at least 1, including yourself.'); return;
    }
    var submit = window.RSVP_CONFIG && window.RSVP_CONFIG.submit;
    sending = true;
    back.disabled = next.disabled = true;
    fullName.disabled = partySize.disabled = true;
    error.textContent = '';
    try {
      if (typeof submit === 'function') {
        next.textContent = 'Submitting…';
        await submit({ fullName: fullName.value.trim(), partySize: count });
        document.getElementById('response-message').textContent = 'Your RSVP has been received. We look forward to celebrating with you.';
      }
      document.getElementById('rsvp-questions').hidden = true;
      document.getElementById('rsvp-complete').hidden = false;
      document.getElementById('thank-you-title').focus();
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (e) {
      error.textContent = 'Your response could not be sent. Please try again.';
      next.textContent = 'Submit';
    } finally {
      sending = false;
      back.disabled = next.disabled = false;
      fullName.disabled = partySize.disabled = false;
    }
  });
  if (window.RSVP_CONFIG && typeof window.RSVP_CONFIG.submit === 'function') {
    document.querySelector('.preview-note').hidden = true;
  }
})();

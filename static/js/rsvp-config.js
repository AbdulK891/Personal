(function () {
  var endpoint = 'https://script.google.com/macros/s/AKfycbyOzK22d5IDlGxxXLdK5rdGMDn6D8NkXp5aahTVPmWFbYcg8v7i5iI6ZPS65C0X8J4e/exec';
  var pendingId;
  try { pendingId = sessionStorage.getItem('reception-rsvp-pending-id'); } catch (e) {}
  if (!pendingId) pendingId = crypto.randomUUID();
  try { sessionStorage.setItem('reception-rsvp-pending-id', pendingId); } catch (e) {}

  window.RSVP_CONFIG = {
    submit: async function (answer) {
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, 45000);
      try {
        var response = await fetch(endpoint, {
          method: 'POST',
          // A simple content type avoids an unsupported preflight request.
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          redirect: 'follow',
          credentials: 'omit',
          signal: controller.signal,
          body: JSON.stringify({
            fullName: answer.fullName,
            partySize: answer.partySize,
            submissionId: pendingId
          })
        });
        if (!response.ok) throw new Error('RSVP service unavailable');
        var result = await response.json();
        if (result.ok !== true) throw new Error('RSVP was not saved');
        // Keep the same ID on failure so a retry cannot create another row.
        try { sessionStorage.removeItem('reception-rsvp-pending-id'); } catch (e) {}
        pendingId = crypto.randomUUID();
        console.info('RSVP saved. Notification: ' +
          (result.duplicate ? 'previously processed' :
           result.notificationSent === true ? 'sent' : 'not sent'));
        return result;
      } finally {
        clearTimeout(timer);
      }
    }
  };
})();

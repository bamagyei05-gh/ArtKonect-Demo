// Shared handler for "complete lesson" buttons
document.addEventListener('DOMContentLoaded', function() {
  function normalizeLessonId(name) {
    return (name || window.location.pathname.split('/').pop() || 'unknown')
      .toString()
      .toLowerCase()
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-z0-9]+/g, '-');
  }

  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch (e) { return null; }
  }

  function saveCurrentUser(user) {
    try { localStorage.setItem('currentUser', JSON.stringify(user));
      // also update users[] list when present
      try {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const idx = users.findIndex(u => u && user && ((u.id && user.id && u.id === user.id) || (u.email && user.email && u.email === user.email)));
        if (idx !== -1) { users[idx] = user; } else { users.push(user); }
        localStorage.setItem('users', JSON.stringify(users));
      } catch(e){}
    } catch (e) { console.error('Failed to save currentUser', e); }
  }

  function markLessonDone(lessonId, button) {
    if (!lessonId) lessonId = normalizeLessonId();
    // ensure canonical normalized id
    lessonId = normalizeLessonId(lessonId);
    let user = getCurrentUser();
    if (!user) {
      alert('Please log in to record your progress.');
      return;
    }
    if (!user.progress) user.progress = {};
    if (!Array.isArray(user.progress.lessonsCompleted)) user.progress.lessonsCompleted = [];
    // normalize entries already stored and dedupe before saving
    user.progress.lessonsCompleted = Array.from(new Set((user.progress.lessonsCompleted || []).map(normalizeLessonId).filter(Boolean)));
    if (!user.progress.lessonsCompleted.includes(lessonId)) {
      user.progress.lessonsCompleted.push(lessonId);
      // ensure dedupe again
      user.progress.lessonsCompleted = Array.from(new Set(user.progress.lessonsCompleted.map(normalizeLessonId).filter(Boolean)));
      saveCurrentUser(user);
    }
    // update button UI
    try {
      if (button) {
        button.disabled = true;
        // try to toggle text and show check icon
        const text = button.querySelector('.complete-lesson-text'); if (text) text.textContent = 'Done';
        const check = button.querySelector('.complete-lesson-check'); if (check) check.classList.remove('hidden');
      }
    } catch(e){}

    // write a timestamp to localStorage to trigger cross-tab storage events for dashboards
    try {
      const payload = { lesson: lessonId, ts: Date.now() };
      localStorage.setItem('lessonProgressUpdated', JSON.stringify(payload));
      console.debug('complete-lesson: set lessonProgressUpdated', payload);
    } catch(e){ console.error('complete-lesson: failed to write lessonProgressUpdated', e); }

    // dispatch an in-page event so single-page dashboards can listen
    try {
      window.dispatchEvent(new CustomEvent('lessonCompleted', { detail: { lesson: lessonId } }));
      console.debug('complete-lesson: dispatched lessonCompleted for', lessonId);
    } catch(e){ console.error('complete-lesson: failed to dispatch lessonCompleted', e); }
  }

  // Wire all buttons
  const buttons = Array.from(document.querySelectorAll('.complete-lesson-btn'));
  buttons.forEach(btn => {
    if (btn.dataset.completeWired) return;
    btn.dataset.completeWired = '1';
    // determine lesson id: prefer data-lesson-id, else data-lesson, else derive from filename
    let lid = btn.dataset.lessonId || btn.dataset.lesson || normalizeLessonId();
    lid = normalizeLessonId(lid);
    // initialize state from currentUser
    const user = getCurrentUser();
    if (user && user.progress && Array.isArray(user.progress.lessonsCompleted) && user.progress.lessonsCompleted.map(normalizeLessonId).includes(lid)) {
      btn.disabled = true;
      const text = btn.querySelector('.complete-lesson-text'); if (text) text.textContent = 'Done';
      const check = btn.querySelector('.complete-lesson-check'); if (check) check.classList.remove('hidden');
    }

    btn.addEventListener('click', function() { markLessonDone(lid, btn); });
    // keyboard activation (space/enter) handled by native button behavior
  });
});

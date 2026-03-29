// JS for Ama's Design Challenge page
// Accessibility: All drag/drop and buttons are keyboard accessible

document.addEventListener('DOMContentLoaded', function() {
  // --- Colour Clinic Drag and Drop ---
  const draggables = document.querySelectorAll('.draggable[data-brief]');
  const dropzones = document.querySelectorAll('.dropzone[data-scheme]');
  const colorFeedback = document.getElementById('colorFeedback');
  let colorMatches = {};

  draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', draggable.dataset.brief);
      draggable.classList.add('opacity-50');
    });
    draggable.addEventListener('dragend', () => {
      draggable.classList.remove('opacity-50');
    });
    // Keyboard accessibility
    draggable.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        draggable.setAttribute('aria-grabbed', 'true');
        draggable.classList.add('ring-2', 'ring-orange-400');
      }
    });
    draggable.addEventListener('blur', () => {
      draggable.setAttribute('aria-grabbed', 'false');
      draggable.classList.remove('ring-2', 'ring-orange-400');
    });
  });

  dropzones.forEach(dropzone => {
    dropzone.addEventListener('dragover', e => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over');
    });
    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      const brief = e.dataTransfer.getData('text/plain');
      colorMatches[brief] = dropzone.dataset.scheme;
      // Move the brief visually
      const briefElem = document.querySelector('.draggable[data-brief="' + brief + '"]');
      dropzone.appendChild(briefElem);
    });
    // Keyboard accessibility: allow Enter/Space to drop
    dropzone.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.classList.contains('draggable')) {
        const brief = document.activeElement.dataset.brief;
        colorMatches[brief] = dropzone.dataset.scheme;
        dropzone.appendChild(document.activeElement);
      }
    });
  });

  document.getElementById('checkColor').addEventListener('click', function() {
    // The briefs in the HTML use keys: fun, trust, premium
    // Map those to the expected palette schemes here.
    const correct = {
      fun: 'triadic',         // Fun/playful -> triadic (bright, lively)
      trust: 'analogous',     // Trust/natural -> analogous (harmonious)
      premium: 'complementary'// Premium/elegant -> complementary (standout contrast)
    };
    let score = 0;
    const wrong = [];
    for (const [brief, scheme] of Object.entries(correct)) {
      if (colorMatches[brief] === scheme) {
        score++;
      } else {
        wrong.push({ brief, expected: scheme, got: colorMatches[brief] || null });
      }
    }
    if (score === 3) {
      colorFeedback.textContent = '✓ All correct! Great job matching moods to palettes.';
      colorFeedback.className = 'mt-2 text-green-700 font-bold';
    } else {
      // Provide friendly guidance about which briefs are incorrect
      let msg = '✗ Not quite. Check these:';
      wrong.forEach(w => {
        msg += ` \n• ${w.brief}: expected ${w.expected}` + (w.got ? `, but placed on ${w.got}` : ', not placed');
      });
      colorFeedback.textContent = msg;
      colorFeedback.className = 'mt-2 text-red-700 font-bold whitespace-pre-line';
    }
    updateProgress('color', score === 3 ? 1 : 0);
  });

  // --- Balance Builder ---
  let balanceScore = 0;
  document.getElementById('checkBalance').addEventListener('click', function() {
    const selected = document.querySelector('input[name="balance"]:checked');
    let gridCorrect = false;
    // Check grid: at least two shapes in different cells
    const gridCells = document.querySelectorAll('#balanceGrid .dropzone');
    let filled = 0;
    gridCells.forEach(cell => { if (cell.children.length > 0) filled++; });
    if (filled >= 2) gridCorrect = true;
    if ((selected && selected.value === 'symmetrical') || gridCorrect) {
      document.getElementById('balanceFeedback').textContent = '✓ Well done! You identified or created balance.';
      document.getElementById('balanceFeedback').className = 'mt-2 text-green-700 font-bold';
      balanceScore = 1;
    } else {
      document.getElementById('balanceFeedback').textContent = '✗ Not quite. Try again!';
      document.getElementById('balanceFeedback').className = 'mt-2 text-red-700 font-bold';
      balanceScore = 0;
    }
    updateProgress('balance', balanceScore);
  });

  // Drag and drop for shapes
  const shapeDraggables = document.querySelectorAll('#shapes .draggable');
  const gridDropzones = document.querySelectorAll('#balanceGrid .dropzone');
  shapeDraggables.forEach(shape => {
    shape.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', shape.dataset.shape);
      shape.classList.add('opacity-50');
    });
    shape.addEventListener('dragend', () => {
      shape.classList.remove('opacity-50');
    });
  });
  gridDropzones.forEach(cell => {
    cell.addEventListener('dragover', e => {
      e.preventDefault();
      cell.classList.add('drag-over');
    });
    cell.addEventListener('dragleave', () => {
      cell.classList.remove('drag-over');
    });
    cell.addEventListener('drop', e => {
      e.preventDefault();
      cell.classList.remove('drag-over');
      const shapeType = e.dataTransfer.getData('text/plain');
      const shapeElem = document.querySelector('#shapes .draggable[data-shape="' + shapeType + '"]');
      if (shapeElem) cell.appendChild(shapeElem);
    });
  });

  // --- Emphasis Check ---
  document.getElementById('checkEmphasis').addEventListener('click', function() {
    const selected = document.querySelector('input[name="emphasis"]:checked');
    const reason = document.getElementById('emphasisReason').value.trim();
    if (selected && reason.length > 5) {
      if (selected.value === 'good') {
        document.getElementById('emphasisFeedback').textContent = '✓ Correct! Good emphasis makes the message clear.';
        document.getElementById('emphasisFeedback').className = 'mt-2 text-green-700 font-bold';
        updateProgress('emphasis', 1);
      } else {
        document.getElementById('emphasisFeedback').textContent = '✗ Not quite. The other poster has better emphasis.';
        document.getElementById('emphasisFeedback').className = 'mt-2 text-red-700 font-bold';
        updateProgress('emphasis', 0);
      }
    } else {
      document.getElementById('emphasisFeedback').textContent = 'Please select a poster and explain your choice.';
      document.getElementById('emphasisFeedback').className = 'mt-2 text-orange-700 font-bold';
      updateProgress('emphasis', 0);
    }
  });

  // --- Reflection Download ---
  document.getElementById('downloadReflection').addEventListener('click', function() {
    const text = document.getElementById('reflectionBox').value.trim();
    if (!text) return alert('Please type your reflection first.');
    const blob = new Blob([text], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ama-reflection.txt';
    a.click();
  });

  // --- Progress Summary & Navigation ---
  function updateProgress(task, score) {
    let progress = JSON.parse(localStorage.getItem('amaChallengeProgress') || '{}');
    progress[task] = score;
    localStorage.setItem('amaChallengeProgress', JSON.stringify(progress));
    // Update summary: compute percent from all numeric task scores recorded
    try {
      const values = Object.values(progress).filter(v => typeof v === 'number');
      const sum = values.reduce((a, b) => a + b, 0);
      const denom = values.length || 1; // avoid divide by zero
      const percent = Math.round((sum / denom) * 100);
      document.getElementById('progressSummary').textContent = `You scored ${percent}% on Ama’s Challenge`;
    } catch (e) {
      // fallback
      document.getElementById('progressSummary').textContent = `You scored 0% on Ama’s Challenge`;
    }
  }

  // Expose to global so other inline scripts can call updateProgress (e.g. suggestion submit handler)
  try { window.updateProgress = updateProgress; } catch (e) {}

  // Dashboard button
  document.getElementById('toDashboard').addEventListener('click', function() {
    // Optionally update user record in localStorage
    let user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (user && user.progress) {
      user.progress.amaChallenge = true;
      // persist currentUser and update users[] for persistence across logins
      localStorage.setItem('currentUser', JSON.stringify(user));
      try {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const uidx = users.findIndex(u => (u.id && user.id && u.id === user.id) || (u.email && user.email && u.email === user.email) || (u.contact && user.contact && u.contact === user.contact));
        if (uidx !== -1) {
          users[uidx] = user;
          localStorage.setItem('users', JSON.stringify(users));
        }
      } catch (e) {}
    }
  window.location.href = 'dashboard_new.html';
  });
  document.getElementById('toOffline').addEventListener('click', function() {
    alert('Download the offline redesign activity or continue on paper!');
  });
});

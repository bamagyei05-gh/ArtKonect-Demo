// Helper to persist currentUser and update users[] consistently across the app
function saveCurrentUser(user) {
  if (!user) return;
  try {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } catch (e) {
    // ignore
  }
  try {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const uidx = users.findIndex(u => (u.id && user.id && u.id === user.id) || (u.email && user.email && u.email === user.email) || (u.contact && user.contact && u.contact === user.contact));
    if (uidx !== -1) {
      users[uidx] = user;
    } else {
      // if user not found, push as new
      users.push(user);
    }
    localStorage.setItem('users', JSON.stringify(users));
  } catch (e) {
    // ignore
  }
}

// Expose for modules that expect a global
window.saveCurrentUser = saveCurrentUser;

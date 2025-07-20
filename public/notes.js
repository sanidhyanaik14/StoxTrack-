document.addEventListener('DOMContentLoaded', () => {
  const noteArea = document.getElementById('noteArea');
  const saveBtn = document.getElementById('saveBtn');
  const statusMessage = document.getElementById('statusMessage');
  const currentDate = document.getElementById('currentDate');

  //current date
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  currentDate.textContent = today;

  //Save note
  saveBtn.addEventListener('click', async () => {
    const content = noteArea.value.trim();

    if (!content) {
      statusMessage.textContent = "Please write something before saving.";
      statusMessage.style.color = "red";
      return;
    }

    try {
      const response = await fetch('/api/save-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      const result = await response.json();

      if (response.ok) {
        statusMessage.textContent = result.message;
        statusMessage.style.color = "green";
        noteArea.value = ""; // clear textarea after saving
      } else {
        statusMessage.textContent = result.message || "Error saving note.";
        statusMessage.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      statusMessage.textContent = "Server error. Try again later.";
      statusMessage.style.color = "red";
    }
  });
});

// for viewing notes
const viewNotesBtn = document.getElementById('viewNotesBtn');
const savedNotesContainer = document.getElementById('savedNotesContainer');

viewNotesBtn.addEventListener('click', async () => {
  try {
    const res = await fetch('/api/notes');
    const data = await res.json();

    savedNotesContainer.innerHTML = ''; // clear old

    if (data.length === 0) {
      savedNotesContainer.innerHTML = '<p>No notes found.</p>';
      return;
    }

    data.forEach(note => {
      const noteDiv = document.createElement('div');
      noteDiv.className = 'note-card';
      noteDiv.innerHTML = `
        <p>${note.content}</p>
        <small>${new Date(note.created_at).toLocaleString()}</small>
        <hr/>
      `;
      savedNotesContainer.appendChild(noteDiv);
    });
  } catch (err) {
    savedNotesContainer.innerHTML = '<p>Please login to get your notes.</p>';
    console.error(err);
  }
});

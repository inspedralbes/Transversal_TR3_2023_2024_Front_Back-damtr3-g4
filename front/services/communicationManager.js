export async function authoritzationLogin(mail, password) {
  const response = await fetch("http://localhost:3789/authoritzationLogin/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mail: mail,
      password: password,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Error en la solicitud: ${response.status} - ${response.statusText}`
    );
  }
  const data = await response.json();
  return { ...data };
}
export async function insertUser(name, mail, password) {
  const response = await fetch("http://localhost:3789/insertUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      mail: mail,
      password: password,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Error en la solicitud: ${response.status} - ${response.statusText}`
    );
  }
  const data = await response.json();
  return { ...data };
}

export async function getData() {
  const response = await fetch("http://localhost:3789/getData")
  const personatges = await response.json();
  console.log(personatges);
  return personatges;
}

export async function selectCharacter(id, isActive) {
  console.log(isActive);
  try {
    await fetch(`http://localhost:3789/selectCharacter/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isActive: isActive })

    });
    console.log(`Character with ID ${id} has been selected.`);
  } catch (error) {
    console.error('Error selecting character:', error);
    // Manejar el error según sea necesario
    throw error;
  }
}

export async function getBroadcast() {
  const response = await fetch("http://localhost:3789/getBroadcast")
  const phrase = await response.json();
  console.log(phrase);
  return phrase;
}

export async function editMessage(id, newMessage) {
  console.log(id,newMessage);
  const response = await fetch(`http://localhost:3789/updateMessage/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: newMessage })
  });
}

export async function getAudios() {
  const response = await fetch("http://localhost:3789/audios")
  const audio = await response.json();
  console.log(audio);
  return audio;
}

export async function sendAudio(selectedAudio) {
  console.log(selectedAudio);
  const response = await fetch("http://localhost:3789/returnAudio", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ audioUrl: selectedAudio })
  });
}

export async function procesOdoo(isActive) {
  console.log(isActive);
  try {
    await fetch(`http://localhost:3789/procesOdoo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isActive: isActive })

    });
  } catch (error) {
    console.error('Error:', error);
    // Manejar el error según sea necesario
    throw error;
  }
}




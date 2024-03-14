export async function authoritzationLogin(mail, password){
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
return { ...data};
}
export async function insertUser(name, mail, password){
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
return { ...data};
}
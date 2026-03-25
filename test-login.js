import fetch from "node-fetch";

async function testLogin() {
  const res = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "CCNWBPHN250000", password: "250000" }) 
  });
  const data = await res.json();
  console.log(data);
}

testLogin();

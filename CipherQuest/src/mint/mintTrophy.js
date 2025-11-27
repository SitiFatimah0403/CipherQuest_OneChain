export async function mintTrophy(playerAddress, score) {
  const res = await fetch("http://localhost:5000/api/trophy/mint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet: playerAddress, score }),
  });

  return await res.json();
}

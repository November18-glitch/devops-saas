export default async function handler(req, res) {
  console.log("🔥 ACCEPT INVITE FUNCTION REACHED");

  console.log("METHOD:", req.method);

  console.log("BODY:", req.body);

  console.log(
    "AUTH HEADER:",
    req.headers.authorization
      ? "PRESENT"
      : "MISSING"
  );

  return res.status(200).json({
    success: true,
    reached: true,
    method: req.method,
  });
}
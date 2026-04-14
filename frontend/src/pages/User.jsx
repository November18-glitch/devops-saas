export default function User() {
  const handleCheckout = async () => {
    const res = await fetch("/api/createCheckoutSession", {
      method: "POST",
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Stripe error");
    }
  };

  return (
    <div>
      <h1>DeployAlly 🚀</h1>
      <p>CI/CD + monitoring + team collaboration</p>

      <button onClick={handleCheckout}>
        Upgrade to Pro
      </button>
    </div>
  );
}
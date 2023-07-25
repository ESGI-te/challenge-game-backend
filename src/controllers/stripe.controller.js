module.exports = (options = {}) => {
  const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

  return {
    async createCheckoutSession(req, res) {
      try {
        const items = [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: req.body.product.name,
              },
              unit_amount: req.body.product.price,
            },
            quantity: req.body.product.quantity,
          },
        ];

        
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: items,
          mode: "payment",
          success_url: req.body.product.successUrl,
          cancel_url: req.body.product.cancelUrl,
        });
        
        // res.json({ id: session.id });
        res.json(session);

      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    },
  };
};

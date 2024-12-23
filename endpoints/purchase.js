const {stripe, getSession, findPlanData, createServer} = require("../shared");
require("dotenv").config();

async function purchase(req, res) {
    const {
        token,
        plan_id
    } = req.body;

    if(!token || !plan_id) {
        return res.status(400).json({
            success: false,
            error: "Invalid payload (missing data)"
        });
    }

    const session = getSession(token);
    if(!session) {
        return res.status(404).json({
            success: false,
            error: "Invalid session"
        });
    }

    const plan = await findPlanData(plan_id);
    if(!plan) {
        return res.status(404).json({
            success: false,
            error: "Invalid plan"
        });
    }

    let existingCustomer = await stripe.customers.list({email: session.email});
    if(existingCustomer.data.length === 0) {
        existingCustomer = await stripe.customers.create({
            email: session.email
        });
    }

    const customerSession = await stripe.checkout.sessions.create({
        success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}/cancel`,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        line_items: [
            {
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: "Server subscription",
                        description: "NexusHosting server subscription - " + plan.name,
                    },
                    unit_amount: parseFloat(plan.price) * 100,
                    recurring: {
                        interval: "month"
                    },
                },
                quantity: 1
            },
        ],
        metadata: {
            plan_id: plan.id,
        },
        customer_email: session.email
    });

    return res.json({
        success: true,
        url: customerSession.url
    });
}

async function success(req, res) {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    if(session.payment_status === "paid") {
        const plan = await findPlanData(session.metadata.plan_id);
        const customer = session.customer_email;
        console.log(session);

        await createServer(customer, plan);

        // Redirect
        res.redirect("https://hostnexus.cloud/dashboard.html");
    } else {
        return res.status(400).json({
            success: false,
            error: "Payment not completed"
        });
    }
}

module.exports = { purchase, success };
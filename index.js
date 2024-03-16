const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());


function jsonToBase64(object) {
    const json = JSON.stringify(object);
    return Buffer.from(json).toString('base64');
}

app.post('/handle-payment', async (req, res) => {
    const { description, price } = req.body;

    const data = {
        Transaction: {
            Version: "3.16",
            Username: "Your UserName",
            Password: "Your Password ",
            Destination: "UCFURL",
            Submission: {
                Number: 1,
                Stamp: "123456789",
            },
            Identifier: "987654321",
            Alias: "Your Alias",
            Currency: "USD",
            TransactionID: "",
            Order: {
                Products: [
                    {
                        ID: 1,
                        Code: "code",
                        Description: description,
                        Price: price,
                        Quantity: 1,
                        VAT: 0,
                        SubTotal: price
                    }],
                Delivery: {
                    Auto: true
                },
                ProductTotal: price
            },
            UCF: {
                TransactionType: "03",
                PostBackSuccessUrl: "Success Url ",
                PostBackFailureUrl: "failure Url",
            },
        },
    };
    try {
        let objJsonB64 = jsonToBase64(data);
        const response = await fetch(
            "https://dev.coralcommerce.com/Payserver/Service/Execute",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: "json64=" + encodeURIComponent(objJsonB64)
            }
        );
        const responseData = await response.json();
        console.log(responseData);
        if (responseData.Result && responseData.Result.RedirectUrl) {
            res.redirect(responseData.Result.RedirectUrl);
        } else {
            res.send(responseData);
        }
    } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).send("Error processing payment");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

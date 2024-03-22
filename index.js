// const express = require('express');

// const app = express();
// const port = 3000;

// app.use(express.json());


// function jsonToBase64(object) {
//     const json = JSON.stringify(object);
//     return Buffer.from(json).toString('base64');
// }

// app.post('/handle-payment', async (req, res) => {
//     const { description, price } = req.body;

//     const data = {
//         Transaction: {
//             Version: "3.16",
//             Username: "Your UserName",
//             Password: "Your Password ",
//             Destination: "UCFURL",
//             Submission: {
//                 Number: 1,
//                 Stamp: "123456789",
//             },
//             Identifier: "987654321",
//             Alias: "Your Alias",
//             Currency: "USD",
//             TransactionID: "",
//             Order: {
//                 Products: [
//                     {
//                         ID: 1,
//                         Code: "code",
//                         Description: description,
//                         Price: price,
//                         Quantity: 1,
//                         VAT: 0,
//                         SubTotal: price
//                     }],
//                 Delivery: {
//                     Auto: true
//                 },
//                 ProductTotal: price
//             },
//             UCF: {
//                 TransactionType: "03",
//                 PostBackSuccessUrl: "Success Url ",
//                 PostBackFailureUrl: "failure Url",
//             },
//         },
//     };
//     try {
//         let objJsonB64 = jsonToBase64(data);
//         const response = await fetch(
//             "https://dev.coralcommerce.com/Payserver/Service/Execute",
//             {
//                 method: "POST",
//                 headers: { "Content-Type": "application/x-www-form-urlencoded" },
//                 body: "json64=" + encodeURIComponent(objJsonB64)
//             }
//         );
//         const responseData = await response.json();
//         console.log(responseData);
//         if (responseData.Result && responseData.Result.RedirectUrl) {
//             res.redirect(responseData.Result.RedirectUrl);
//         } else {
//             res.send(responseData);
//         }
//     } catch (error) {
//         console.error("Error processing payment:", error);
//         res.status(500).send("Error processing payment");
//     }
// });

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });


const express = require("express");
const crypto = require('crypto')
const app = express();
const port = 3000;
app.use(express.json())
app.use(express.urlencoded({ extended: false }));


app.post("/postback", async (req, res) => {
    try {
        console.log(req.body, "PostBack")
        const encryptedResponse = req.body.UCFResponse;
        console.log("Received PostBack response:", encryptedResponse);

        const decryptedResponse = decryptBlowfish(encryptedResponse, '6d6e627663787a6d6e627663787a6d6e627663787a6d6e627663787a');
        console.log("Decrypted response:", decryptedResponse);

        res.status(200).send("Postback response handled successfully.");
    } catch (error) {
        console.error("Error handling postback response:", error);
        res.status(500).send("Error handling postback response.");
    }
});


app.post("/callback", async (req, res) => {
    try {
        console.log(req.body, 'Callback Response In Body')
        res.status(200).send("Postback response handled successfully.");
    } catch (error) {
        console.error("Error handling postback response:", error);
        res.status(500).send("Error handling postback response.");
    }
});

app.post("/store", async (req, res) => {
    const { description, price } = req.body;
    console.log(req.body)
    const data = {
        Transaction: {
            Version: "3.16",
            Username: "backroom01",
            Password: "T3st1ng@2024",
            Destination: "UCFURL",
            Submission: {
                Number: (Date.now() + Math.floor(Math.random() * 1000)) | 0,
                Stamp: Date.now().toString(),
            },
            Identifier: "987654321",
            Alias: "backroom1",
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
                        SubTotal: price,
                    },
                ],
                Delivery: {
                    Auto: true,
                },
                ProductTotal: price,
            },
            UCF: {
                CallbackUrl: "https://35c5-149-102-244-68.ngrok-free.app/callback",
                CallbackFormat: "json",
                CallbackMethod: "post",
                CallbackVar: "response",
                DisplayOrderSummary: "true",
                TransactionType: "03",
                PostBackSuccessUrl: "https://35c5-149-102-244-68.ngrok-free.app/postback",
                PostBackFailureUrl: "https://bkrm.games/#/staking/stakes-in-play",
            },
        },
    };

    try {
        const objJsonB64 = jsonToBase64(data);
        const response = await fetch(
            "https://dev.coralcommerce.com/Payserver/Service/Execute",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: "json64=" + encodeURIComponent(objJsonB64),
            }
        );
        const responseData = await response.json();
        console.log(responseData, "responseData");
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

function jsonToBase64(object) {
    const json = JSON.stringify(object);
    return Buffer.from(json).toString("base64");
}

function decryptBlowfish(encryptedData, key) {
    const decipher = crypto.createDecipheriv('bf-ctr', Buffer.from(key), null); 
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});

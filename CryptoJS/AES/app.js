var base64Encode = function base64Encode(data) {
    var wordArray = CryptoJS.enc.Utf8.parse(data);
    var base64 = CryptoJS.enc.Base64.stringify(wordArray);
    return base64;
};

var base64Decode = function base64Decode(data) {
    var parsedWordArray = CryptoJS.enc.Base64.parse(data);
    return parsedWordArray;
};

// payway - bank response string
var EncryptedParameters = base64Decode(decodeURIComponent("wqCV8%2FNQovQ0GIeGfzowjJxLvW%2F2hZfaOdl5pZXRp5FlAshLerT%2BYlgswU%2FVBwMlUP9Qp2M3DJ7dVs7V8PgIMNqJBjE%2FVJEoQTx3pKT%2Fur%2Fmt3i96CnS2yNds%2Bsewy%2F34iZaZHxlK%2FC%2F44NrhaijevjpHct3jVSXLt7MscnbVYF7X71n1Ayqm%2Fs0unYZuJae08iLsFllaF%2BHxqrlu2L7qCZbR0pHqMNkFvVF83zIzaAA5epg2mrffXz0y0rkmHM8RTX4jX1mLBriRuTBBrY3EhQKtz5oXGyZ5lnOhzAmovzMAPd3aztMFb9h6MJ5YS64oiQG033rNbjjVM4wGdVtYTTXfPIMwRLB1zOpOWjij3rP0peaJRjHy2gTwTtR6CSJvDg8P2Ib9WxiEcxaQem5pg%3D%3D"));

var Signature = base64Decode(decodeURIComponent("dEbSy2mRrnRR5zYaNbB4ejko2Xct2rOWcoQQ4z%2BM1yY%3D"));

var EncryptionKey = base64Decode("JYdf1Va95wOySPmzpscG6A=="); // to be stored in server

var decryptedData = CryptoJS.AES.decrypt(
    {
        ciphertext: EncryptedParameters
    },
    EncryptionKey,
    {
        iv: CryptoJS.enc.Hex.parse('00000000000000000000000000000000'), // 16 byte zero filled initialization vector
        mode: CryptoJS.mode.CBC, // Cipher Block Chaining
        padding: CryptoJS.pad.Pkcs7 // PKCS-7 Padding
    }
);

var decryptedSignature = CryptoJS.AES.decrypt(
    {
        ciphertext: Signature
    },
    EncryptionKey,
    {
        iv: CryptoJS.enc.Hex.parse('00000000000000000000000000000000'), // 16 byte zero filled initialization vector
        mode: CryptoJS.mode.CBC, // Cipher Block Chaining
        padding: CryptoJS.pad.Pkcs7 // PKCS-7 Padding
    }
);

var decryptedString = decryptedData.toString(CryptoJS.enc.Utf8);
var decryptedSignatureString = decryptedSignature.toString();

var signatureHashOfActualData = CryptoJS.MD5(decryptedString).toString();

var queryParams = decryptedString.split("&");

var queryParamsHtml = "<table>";

queryParams.forEach(function (param) {
    var splitData = param.split("=");
    queryParamsHtml += "<tr>";
    queryParamsHtml += "<td style='border:1px solid #B0B0B0;font-weight:bold;padding:10px;'>";
    queryParamsHtml += splitData[0];
    queryParamsHtml += "</td>";
    queryParamsHtml += "<td style='padding-left:30px;padding-right:30px;border:1px solid #B0B0B0;'>";
    queryParamsHtml += decodeURIComponent(splitData[1]);
    queryParamsHtml += "</td>";
    queryParamsHtml += "</tr>";
});

queryParamsHtml += "<table>";

queryParamsHtml += "<p><b>Signature Hash of Data : </b>" + signatureHashOfActualData + "</p>";
queryParamsHtml += "<p><b>Signature Hash from URL : </b>" + decryptedSignatureString + "</p>";
queryParamsHtml += "<p><b>Is Signature Valid? : " + (signatureHashOfActualData === decryptedSignatureString ? "<span style='color:darkGreen'>YES</span>" : "<span style='color:red'>NO</span>")     + "</b></p>";

document.write(queryParamsHtml);


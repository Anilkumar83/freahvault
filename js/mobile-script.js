import QrScanner from "./qr-scanner.min.js"; 

document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("scanner-preview");
    const scanResult = document.getElementById("scan-result");

    async function startScanner() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            video.srcObject = stream;

            const scanner = new QrScanner(video, result => {
                console.log("✅ QR Code Detected:", result);

                try {
                    const jsonData = JSON.parse(result); // Parse JSON from QR
                    scanResult.textContent = `✅ ${jsonData.productName} - Expiry: ${jsonData.expiryDate}`;

                    // Send scanned data to server
                    fetch("/save-scan", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ qrData: jsonData })
                    });

                } catch (error) {
                    console.error("❌ JSON Parsing Error:", error);
                }
            });

            scanner.start();
        } catch (error) {
            console.error("❌ Camera Error:", error);
            alert("Please allow camera access.");
        }
    }

    startScanner();
});

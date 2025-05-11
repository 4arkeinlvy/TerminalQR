// DOM Elements
const wrapper = document.querySelector(".wrapper");
const qrInput = wrapper.querySelector(".form input");
const genBtn = wrapper.querySelector(".generate-btn");
const qrImage = wrapper.querySelector(".qr-code img");
const downloadBtn = wrapper.querySelector(".download-btn");
const processingText = wrapper.querySelector(".processing");
const successText = wrapper.querySelector(".success");
const commandBlinker = wrapper.querySelector(".command-blinker");

// Terminal typing effect
function typeTerminal(element, text, delay = 50) {
    let i = 0;
    element.textContent = "";
    
    function typeCharacter() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typeCharacter, delay);
        }
    }
    
    typeCharacter();
}

// Initialize terminal effect
document.addEventListener('DOMContentLoaded', () => {
    // Add animation delay to terminal lines
    const terminalLines = document.querySelectorAll(".terminal-line");
    terminalLines.forEach((line, index) => {
        line.style.animationDelay = `${index * 150}ms`;
    });
    
    // Simulate terminal typing effect for command
    const commandElements = document.querySelectorAll(".command");
    commandElements.forEach((cmd, index) => {
        const originalText = cmd.textContent;
        setTimeout(() => {
            typeTerminal(cmd, originalText);
        }, 800 + index * 500);
    });
    
    // Blink the cursor in footer
    setInterval(() => {
        commandBlinker.style.opacity = commandBlinker.style.opacity === "0" ? "1" : "0";
    }, 600);
});

// Function to generate QR code
function generateQR() {
    let qrValue = qrInput.value.trim();
    if (!qrValue) {
        // Add shake animation if empty
        qrInput.parentElement.classList.add("shake");
        setTimeout(() => {
            qrInput.parentElement.classList.remove("shake");
        }, 500);
        return;
    }
    
    // Show processing state
    wrapper.classList.add("processing");
    wrapper.classList.remove("success");
    
    // Change button state
    genBtn.disabled = true;
    genBtn.style.opacity = "0.7";
    genBtn.textContent = "GENERATING...";
    
    // Make wrapper active to show QR section
    wrapper.classList.add("active");
    
    // Simulate terminal processing
    setTimeout(() => {
        // Generate QR code using API
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrValue)}`;
        
        // Handle image loading
        qrImage.addEventListener("load", () => {
            // Change from processing to success state
            wrapper.classList.remove("processing");
            wrapper.classList.add("success");
            
            // Reset button state
            genBtn.disabled = false;
            genBtn.style.opacity = "1";
            genBtn.textContent = "GENERATE";
            
            // Terminal command effect for success message
            const successCmd = document.querySelector(".success span");
            typeTerminal(successCmd, "QR code successfully generated");
        });
    }, 1200);
}

// Generate QR on button click
genBtn.addEventListener("click", generateQR);

// Generate QR on Enter key press
qrInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        generateQR();
    }
});

// Hide QR code section if input is empty
qrInput.addEventListener("keyup", () => {
    if (!qrInput.value.trim() && wrapper.classList.contains("active")) {
        // Add closing animation
        wrapper.classList.add("closing");
        
        setTimeout(() => {
            wrapper.classList.remove("active");
            wrapper.classList.remove("processing");
            wrapper.classList.remove("success");
            wrapper.classList.remove("closing");
        }, 300);
    }
});

// Download QR code functionality
downloadBtn.addEventListener("click", () => {
    if (!qrImage.src || qrImage.src.includes("data:,")) {
        return;
    }
    
    // Change button state
    const originalText = downloadBtn.querySelector(".text").textContent;
    downloadBtn.querySelector(".text").textContent = "DOWNLOADING...";
    downloadBtn.disabled = true;
    
    // Create a temporary link
    const link = document.createElement("a");
    
    // Get the QR code image
    const qrUrl = qrImage.src;
    
    // Fetch the image and convert to blob
    fetch(qrUrl)
        .then(response => response.blob())
        .then(blob => {
            // Create object URL
            const objectUrl = URL.createObjectURL(blob);
            
            // Set link attributes
            link.href = objectUrl;
            link.download = `terminal-qr_${new Date().getTime()}.png`;
            
            // Add "downloading" class to button for animation
            downloadBtn.classList.add("downloading");
            
            // Simulate process with terminal-like progress
            setTimeout(() => {
                // Click the link to trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up
                URL.revokeObjectURL(objectUrl);
                downloadBtn.querySelector(".text").textContent = "DOWNLOADED!";
                
                setTimeout(() => {
                    downloadBtn.querySelector(".text").textContent = originalText;
                    downloadBtn.disabled = false;
                    downloadBtn.classList.remove("downloading");
                }, 1500);
            }, 800);
        })
        .catch(error => {
            console.error("Error downloading QR code:", error);
            downloadBtn.querySelector(".text").textContent = "DOWNLOAD FAILED";
            
            setTimeout(() => {
                downloadBtn.querySelector(".text").textContent = originalText;
                downloadBtn.disabled = false;
            }, 2000);
        });
});

// Add shake animation
document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
        
        .shake {
            animation: shake 0.5s ease;
            border: 1px solid #f7768e !important;
        }
        
        .downloading {
            position: relative;
            overflow: hidden;
        }
        
        .downloading::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(122, 162, 247, 0.2), transparent);
            animation: downloadProgress 1.5s infinite;
        }
        
        @keyframes downloadProgress {
            0% { left: -100%; }
            100% { left: 100%; }
        }
    </style>
`);
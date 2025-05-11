// DOM Elements
const elements = {
    wrapper: document.querySelector(".wrapper"),
    form: {
        input: document.querySelector(".form input"),
        generateBtn: document.querySelector(".generate-btn"),
        inputWrapper: document.querySelector(".input-wrapper")
    },
    qrCode: {
        section: document.querySelector(".qr-code"),
        container: document.querySelector(".qr-container"),
        downloadBtn: document.querySelector(".download-btn")
    },
    terminal: {
        lines: document.querySelectorAll(".terminal-line"),
        commands: document.querySelectorAll(".command"),
        blinker: document.querySelector(".command-blinker"),
        processingText: document.querySelector(".processing"),
        successText: document.querySelector(".success")
    }
};

/**
 * Terminal typing effect
 * @param {HTMLElement} element - Element to apply typing effect to
 * @param {string} text - Text to type
 * @param {number} delay - Delay between each character in ms
 */
function typeTerminal(element, text, delay = 50) {
    let index = 0;
    element.textContent = "";
    
    function typeCharacter() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(typeCharacter, delay);
        }
    }
    
    typeCharacter();
}

/**
 * Generate QR code based on input value
 */
function generateQR() {
    const inputValue = elements.form.input.value.trim();
    
    // Validate input
    if (!inputValue) {
        elements.form.inputWrapper.classList.add("shake");
        setTimeout(() => {
            elements.form.inputWrapper.classList.remove("shake");
        }, 500);
        return;
    }
    
    // Update UI to processing state
    elements.wrapper.classList.add("processing");
    elements.wrapper.classList.remove("success");
    elements.form.generateBtn.disabled = true;
    elements.form.generateBtn.textContent = "GENERATING...";
    
    // Make QR code section visible
    elements.wrapper.classList.add("active");
    elements.qrCode.section.style.display = "block";
    
    // Simulate processing delay (for UX)
    setTimeout(() => {
        // Generate QR code using API
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inputValue)}`;
        
        // Create new image element
        const qrImage = new Image();
        
        // Set up image load event
        qrImage.onload = function() {
            // Update UI to success state
            elements.wrapper.classList.remove("processing");
            elements.wrapper.classList.add("success");
            elements.form.generateBtn.disabled = false;
            elements.form.generateBtn.textContent = "GENERATE";
            
            // Type success message with terminal effect
            const successMessage = document.querySelector(".success span");
            typeTerminal(successMessage, "QR code successfully generated");
        };
        
        // Set up image error event
        qrImage.onerror = function() {
            elements.form.generateBtn.disabled = false;
            elements.form.generateBtn.textContent = "RETRY";
            alert("Failed to generate QR code. Please try again.");
        };
        
        // Set image source to load the QR code
        qrImage.src = qrUrl;
        qrImage.alt = "QR code for: " + inputValue;
        
        // Replace any existing image in container
        elements.qrCode.container.innerHTML = '';
        elements.qrCode.container.appendChild(qrImage);
    }, 1000);
}

/**
 * Download the generated QR code
 */
function downloadQR() {
    const currentImage = elements.qrCode.container.querySelector("img");
    
    // Check if QR image exists
    if (!currentImage || !currentImage.src || currentImage.src.includes("data:,")) {
        return;
    }
    
    // Update download button state
    const downloadBtn = elements.qrCode.downloadBtn;
    const originalText = downloadBtn.querySelector(".text").textContent;
    downloadBtn.querySelector(".text").textContent = "DOWNLOADING...";
    downloadBtn.disabled = true;
    downloadBtn.classList.add("downloading");
    
    // Fetch QR image and convert to blob
    fetch(currentImage.src)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            // Create object URL for download
            const objectUrl = URL.createObjectURL(blob);
            
            // Create download link
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = `terminal-qr_${new Date().getTime()}.png`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up and reset button
            URL.revokeObjectURL(objectUrl);
            downloadBtn.querySelector(".text").textContent = "DOWNLOADED!";
            
            setTimeout(() => {
                downloadBtn.querySelector(".text").textContent = originalText;
                downloadBtn.disabled = false;
                downloadBtn.classList.remove("downloading");
            }, 1500);
        })
        .catch(error => {
            console.error("Error downloading QR code:", error);
            downloadBtn.querySelector(".text").textContent = "DOWNLOAD FAILED";
            
            setTimeout(() => {
                downloadBtn.querySelector(".text").textContent = originalText;
                downloadBtn.disabled = false;
                downloadBtn.classList.remove("downloading");
            }, 2000);
        });
}

/**
 * Close QR code section when input is empty
 */
function checkEmptyInput() {
    if (!elements.form.input.value.trim() && elements.wrapper.classList.contains("active")) {
        elements.wrapper.classList.add("closing");
        
        setTimeout(() => {
            elements.wrapper.classList.remove("active", "processing", "success", "closing");
        }, 300);
    }
}

/**
 * Initialize terminal effects and event listeners
 */
function initTerminal() {
    // Add animation delay to terminal lines
    elements.terminal.lines.forEach((line, index) => {
        line.style.setProperty('--delay', `${index * 150}ms`);
    });
    
    // Terminal typing effect for commands
    elements.terminal.commands.forEach((cmd, index) => {
        const originalText = cmd.textContent;
        
        // Clear the content initially
        cmd.textContent = '';
        
        // Apply typing effect after a delay
        setTimeout(() => {
            typeTerminal(cmd, originalText);
        }, 800 + index * 500);
    });
    
    // Set up the blinking cursor
    setInterval(() => {
        elements.terminal.blinker.style.opacity = 
            elements.terminal.blinker.style.opacity === "0" ? "1" : "0";
    }, 600);
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Generate QR on button click
    elements.form.generateBtn.addEventListener("click", generateQR);
    
    // Generate QR on Enter key press
    elements.form.input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            generateQR();
        }
    });
    
    // Check for empty input to hide QR section
    elements.form.input.addEventListener("keyup", checkEmptyInput);
    
    // Download QR code
    elements.qrCode.downloadBtn.addEventListener("click", downloadQR);
}

/**
 * Initialize the application
 */
function init() {
    // Initialize terminal effects
    initTerminal();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initially hide QR section properly
    if (elements.qrCode.section) {
        elements.qrCode.section.style.display = "none";
    }
}

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
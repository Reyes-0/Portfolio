document.addEventListener("DOMContentLoaded", () => {
  // Select all modals, "Learn More" buttons, and close buttons
  const modals = document.querySelectorAll(".modal");
  const buttons = document.querySelectorAll(".learn-more");
  const closeButtons = document.querySelectorAll(".close-popup");
  const gridImages = document.querySelectorAll(".grid-image");
  const expandedImageOverlay = document.getElementById("expanded-image-overlay");
  const expandedImage = document.getElementById("expanded-image");
  const closeExpandedImage = document.querySelector(".close-expanded-image");

  // Open modal when "Learn More" button is clicked
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const modalId = button.getAttribute("data-modal"); // Get the modal ID from the button's data-modal attribute
      const modal = document.getElementById(modalId); // Find the corresponding modal

      if (modal) {
        modal.style.display = "flex"; // Display the modal
        document.body.classList.add("overflow-hidden"); // Disable scrolling on the body
      }
    });
  });

  // Close modal when "Close" button is clicked
  closeButtons.forEach((close) => {
    close.addEventListener("click", () => {
      const modal = close.closest(".modal"); // Find the closest modal to the close button

      if (modal) {
        modal.style.display = "none"; // Hide the modal
        document.body.classList.remove("overflow-hidden"); // Re-enable scrolling on the body
      }
    });
  });

  // Close modal when clicking outside the modal content
  modals.forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) { // Check if the click is outside the modal content
        modal.style.display = "none"; // Hide the modal
        document.body.classList.remove("overflow-hidden"); // Re-enable scrolling on the body
      }
    });
  });

  // Expand image on click
  if (gridImages && expandedImageOverlay && expandedImage) {
    gridImages.forEach((image) => {
      image.addEventListener("click", () => {
        expandedImage.src = image.src; // Set the expanded image source
        expandedImageOverlay.style.display = "flex"; // Show the overlay
      });
    });

    // Close expanded image when clicking the close button
    if (closeExpandedImage) {
      closeExpandedImage.addEventListener("click", () => {
        expandedImageOverlay.style.display = "none"; // Hide the overlay
      });
    }

    // Close expanded image when clicking outside the image
    expandedImageOverlay.addEventListener("click", (event) => {
      if (event.target === expandedImageOverlay) {
        expandedImageOverlay.style.display = "none"; // Hide the overlay
      }
    });
  }

  // Smooth scrolling for navbar links
  document.querySelectorAll('.navbar a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault(); // Prevent default anchor behavior

      const targetId = this.getAttribute('href'); // Get the target section ID
      const targetElement = document.querySelector(targetId); // Find the target section

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop, // Scroll to the target section's position
          behavior: 'smooth' // Enable smooth scrolling
        });
      }
    });
  });

  // Highlight the active section in the navbar based on scroll position
  const sections = document.querySelectorAll(".section");
  const navLinks = document.querySelectorAll(".navbar a");

  const updateActiveLink = () => {
    let index = sections.length;

    // Loop through sections in reverse order to find the one currently in view
    while (--index && window.scrollY + 50 < sections[index].offsetTop) {}

    // Remove 'active' class from all links
    navLinks.forEach((link) => link.classList.remove("active"));

    // Add 'active' class to the corresponding link
    if (navLinks[index]) {
      navLinks[index].classList.add("active");
    }
  };

  // Attach the scroll event listener
  window.addEventListener("scroll", updateActiveLink);

  // Initialize the active link on page load
  updateActiveLink();

  // Handle Google Form Submission
  const form = document.getElementById("custom-form");
  const popup = document.getElementById("popup");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // Prevent default form submission

      // Get form inputs
      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const messageInput = document.getElementById("message");

      // Validation flags
      let isValid = true;

      // Clear previous error messages
      clearErrors();

      // Validate Name
      if (!nameInput.value.trim()) {
        showError(nameInput, "Name is required.");
        isValid = false;
      }

      // Validate Email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailPattern.test(emailInput.value)) {
        showError(emailInput, "Please enter a valid email address.");
        isValid = false;
      }

      // Validate Message
      if (!messageInput.value.trim() || messageInput.value.trim().length < 1) {
        showError(messageInput, "Please enter a message.");
        isValid = false;
      }

      // If validation fails, stop submission
      if (!isValid) return;

      // Collect form data
      const formData = new FormData(form);
      const formObject = {};
      formData.forEach((value, key) => {
        formObject[key] = value || "Not Provided"; // Replace empty values with "Not Provided"
      });

      // Mapping of entry.XXXXXXXXX to human-readable labels
      const fieldLabels = {
        "entry.1451674361": "Name",
        "entry.1568809211": "Email",
        "entry.1770796330": "Message",
      };

      // Google Forms endpoint
      const googleFormsEndpoint =
        "https://docs.google.com/forms/d/e/1FAIpQLSdabOoukpL3ONlZQNKw7hBBYMFDw8RRxm6wTfH5MjTk3anuSw/formResponse";

      try {
        // Send data to Google Forms using fetch
        await fetch(googleFormsEndpoint, {
          method: "POST",
          mode: "no-cors", // Required for cross-origin requests
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(formObject).toString(),
        });

        // Generate dynamic content for the popup
        const popupContent = `
          <div class="popup-content">
            <h3>Thank You for reaching out!</h3>
            <h3>I'll get back to you soon.</h3>
            <p>Here is the information you submitted:</p>
            <div class="data-table">
              ${Object.entries(formObject)
                .map(
                  ([key, value]) =>
                    `<div class="data-row">
                      <span class="label">${fieldLabels[key] || "Unknown Field"}:</span>
                      <span class="value">${value}</span>
                    </div>`
                )
                .join("")}
            </div>
            <button class="close-popup">Close</button>
          </div>
        `;

        // Update the popup's inner HTML with the generated content
        popup.innerHTML = popupContent;

        // Reattach the close button functionality
        const closeButton = popup.querySelector(".close-popup");
        closeButton.addEventListener("click", () => {
          popup.classList.add("hidden");
          popup.style.display = "none";
        });

        // Show custom popup
        popup.classList.remove("hidden");
        popup.style.display = "flex";

        // Reset the form
        form.reset();
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("There was an error submitting your message. Please try again.");
      }
    });
  }

  // Close popup when clicking outside the content
  if (popup) {
    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        popup.classList.add("hidden");
        popup.style.display = "none";
      }
    });
  }
});

// Function to display error messages
function showError(inputElement, message) {
  const parent = inputElement.parentElement;
  const errorElement = document.createElement("small");
  errorElement.className = "error-message";
  errorElement.textContent = message;
  errorElement.style.color = "red";
  errorElement.style.fontSize = "0.9rem";
  errorElement.style.marginTop = "5px";
  parent.appendChild(errorElement);
}

// Function to clear error messages
function clearErrors() {
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((error) => error.remove());
}

function showTab(lang) {
  document.querySelectorAll('.code-content pre').forEach(pre => {
      pre.style.display = 'none';
  });
  document.getElementById(lang).parentNode.style.display = 'block';

  document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
  });
  document.querySelector(`.tab[onclick="showTab('${lang}')"]`).classList.add('active');
}
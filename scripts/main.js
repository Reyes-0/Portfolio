document.addEventListener("DOMContentLoaded", () => {
  // Select all modals, "Learn More" buttons, and close buttons
  const modals = document.querySelectorAll(".modal");
  const buttons = document.querySelectorAll(".learn-more");
  const closeButtons = document.querySelectorAll(".close-popup");
  const gridMedia = document.querySelectorAll(".grid-image, video.grid-image");
  const expandedImageOverlay = document.getElementById("expanded-image-overlay");
  const expandedImage = document.getElementById("expanded-image");
  const closeExpandedImage = document.querySelector(".close-expanded-image");

  // Open modal when "Learn More" button is clicked
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const modalId = button.getAttribute("data-modal");
      const modal = document.getElementById(modalId);

      if (modal) {
        modal.style.display = "flex";
        document.body.classList.add("overflow-hidden");
      }
    });
  });

  // Close modal when "Close" button is clicked
  closeButtons.forEach((close) => {
    close.addEventListener("click", () => {
      const modal = close.closest(".modal");

      if (modal) {
        modal.style.display = "none";
        document.body.classList.remove("overflow-hidden");
        // Stop any playing videos in the modal
        const videos = modal.querySelectorAll('video');
        videos.forEach(video => {
          video.pause();
          video.currentTime = 0;
        });
      }
    });
  });

  // Close modal when clicking outside the modal content
  modals.forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
        document.body.classList.remove("overflow-hidden");
        // Stop any playing videos in the modal
        const videos = modal.querySelectorAll('video');
        videos.forEach(video => {
          video.pause();
          video.currentTime = 0;
        });
      }
    });
  });

// Expand media (image or video) on click
if (gridMedia && expandedImageOverlay && expandedImage) {
  let currentScale = 1;
  let isDragging = false;
  let startX, startY, translateX = 0, translateY = 0;
  let initialDistance = 0;
  let initialScale = 1;

  gridMedia.forEach((media) => {
    media.addEventListener("click", (e) => {
      // If it's a video, pause the original video in the grid
      if (media.tagName === 'VIDEO') {
        e.preventDefault();
        e.stopPropagation();
        
        // Pause the original video
        media.pause();
        
        // Create a new video element for the expanded view
        const video = document.createElement('video');
        video.className = 'expanded-image';
        video.controls = true;
        video.src = media.querySelector('source').src;
        video.style.maxWidth = '90%';
        video.style.maxHeight = '90vh';
        video.style.borderRadius = '10px';
        video.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
        
        // Copy the current time from the original video
        video.currentTime = media.currentTime;
        
        // Replace the image with the video
        expandedImage.style.display = 'none';
        expandedImageOverlay.appendChild(video);
        
        // Play the expanded video
        video.play();
        
        expandedImageOverlay.style.display = "flex";
      } else {
        // Handle image expansion
        expandedImage.style.display = 'block';
        expandedImage.src = media.src;
        
        // Reset zoom and position
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        expandedImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
        expandedImage.style.cursor = 'zoom-in';
        expandedImage.classList.remove('zoomed');
        
        // Remove any existing video
        const existingVideo = expandedImageOverlay.querySelector('video');
        if (existingVideo) {
          existingVideo.pause();
          existingVideo.currentTime = 0;
          existingVideo.remove();
        }
        
        expandedImageOverlay.style.display = "flex";
      }
    });
  });

  // Handle mouse wheel zooming
  expandedImageOverlay.addEventListener('wheel', (e) => {
    if (expandedImage.tagName === 'IMG') {
      e.preventDefault();
      
      // Get mouse position relative to image
      const rect = expandedImage.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate zoom direction and factor
      const delta = e.deltaY;
      const zoomFactor = 0.1;
      const newScale = delta > 0 
        ? Math.max(1, currentScale - zoomFactor)
        : Math.min(4, currentScale + zoomFactor);
      
      if (newScale !== currentScale) {
        // Calculate new translate values to zoom at mouse position
        const scaleChange = newScale / currentScale;
        translateX = mouseX - scaleChange * (mouseX - translateX);
        translateY = mouseY - scaleChange * (mouseY - translateY);
        
        currentScale = newScale;
        expandedImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
        expandedImage.style.cursor = currentScale > 1 ? 'grab' : 'zoom-in';
        expandedImage.classList.toggle('zoomed', currentScale > 1);
      }
    }
  });

  // Handle mouse drag for panning
  expandedImage.addEventListener('mousedown', (e) => {
    if (expandedImage.tagName === 'IMG' && currentScale > 1) {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      expandedImage.style.cursor = 'grabbing';
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging && expandedImage.tagName === 'IMG') {
      e.preventDefault();
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      expandedImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (expandedImage.tagName === 'IMG') {
      isDragging = false;
      expandedImage.style.cursor = currentScale > 1 ? 'grab' : 'zoom-in';
    }
  });

  // Touch events for mobile
  expandedImage.addEventListener('touchstart', (e) => {
    if (expandedImage.tagName === 'IMG') {
      if (e.touches.length === 1 && currentScale > 1) {
        // Single touch - panning
        e.preventDefault();
        isDragging = true;
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
      } else if (e.touches.length === 2) {
        // Pinch zoom
        e.preventDefault();
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialScale = currentScale;
      }
    }
  });

  document.addEventListener('touchmove', (e) => {
    if (expandedImage.tagName === 'IMG') {
      if (isDragging && e.touches.length === 1) {
        // Panning
        e.preventDefault();
        translateX = e.touches[0].clientX - startX;
        translateY = e.touches[0].clientY - startY;
        expandedImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
      } else if (e.touches.length === 2) {
        // Pinch zoom
        e.preventDefault();
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        
        // Calculate new scale
        const newScale = Math.max(1, Math.min(4, initialScale * (currentDistance / initialDistance)));
        
        if (newScale !== currentScale) {
          // Calculate center point between two fingers
          const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          
          // Get image position
          const rect = expandedImage.getBoundingClientRect();
          const imageX = centerX - rect.left;
          const imageY = centerY - rect.top;
          
          // Calculate new translate values to zoom at center point
          const scaleChange = newScale / currentScale;
          translateX = imageX - scaleChange * (imageX - translateX);
          translateY = imageY - scaleChange * (imageY - translateY);
          
          currentScale = newScale;
          expandedImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
          expandedImage.classList.toggle('zoomed', currentScale > 1);
        }
      }
    }
  });

  document.addEventListener('touchend', () => {
    if (expandedImage.tagName === 'IMG') {
      isDragging = false;
    }
  });

  // Close expanded media when clicking the close button
  if (closeExpandedImage) {
    closeExpandedImage.addEventListener("click", () => {
      expandedImageOverlay.style.display = "none";
      // Stop and remove any playing video
      const video = expandedImageOverlay.querySelector('video');
      if (video) {
        video.pause();
        video.currentTime = 0;
        video.remove();
      }
      // Reset zoom and position
      currentScale = 1;
      translateX = 0;
      translateY = 0;
      expandedImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
      expandedImage.style.cursor = 'zoom-in';
      expandedImage.classList.remove('zoomed');
    });
  }

  // Close expanded media when clicking outside the media
  expandedImageOverlay.addEventListener("click", (event) => {
    if (event.target === expandedImageOverlay) {
      expandedImageOverlay.style.display = "none";
      // Stop and remove any playing video
      const video = expandedImageOverlay.querySelector('video');
      if (video) {
        video.pause();
        video.currentTime = 0;
        video.remove();
      }
      // Reset zoom and position
      currentScale = 1;
      translateX = 0;
      translateY = 0;
      expandedImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
      expandedImage.style.cursor = 'zoom-in';
      expandedImage.classList.remove('zoomed');
    }
  });
}

// Add zoom functions to window object for button onclick handlers
window.toggleZoom = function() {
  const expandedImage = document.querySelector('.expanded-image');
  if (expandedImage && expandedImage.tagName === 'IMG') {
    expandedImage.classList.toggle('zoomed');
  }
};

window.resetZoom = function() {
  const expandedImage = document.querySelector('.expanded-image');
  if (expandedImage && expandedImage.tagName === 'IMG') {
    expandedImage.classList.remove('zoomed');
  }
};

  // Smooth scrolling for navbar links
  document.querySelectorAll('.navbar a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // Highlight the active section in the navbar based on scroll position
  const sections = document.querySelectorAll(".section");
  const navLinks = document.querySelectorAll(".navbar a");

  const updateActiveLink = () => {
    let index = sections.length;

    while (--index && window.scrollY + 50 < sections[index].offsetTop) {}

    navLinks.forEach((link) => link.classList.remove("active"));

    if (navLinks[index]) {
      navLinks[index].classList.add("active");
    }
  };

  window.addEventListener("scroll", updateActiveLink);
  updateActiveLink();

  // Handle Google Form Submission
  const form = document.getElementById("custom-form");
  const popup = document.getElementById("popup");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const messageInput = document.getElementById("message");

      let isValid = true;
      clearErrors();

      if (!nameInput.value.trim()) {
        showError(nameInput, "Name is required.");
        isValid = false;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailPattern.test(emailInput.value)) {
        showError(emailInput, "Please enter a valid email address.");
        isValid = false;
      }

      if (!messageInput.value.trim() || messageInput.value.trim().length < 1) {
        showError(messageInput, "Please enter a message.");
        isValid = false;
      }

      if (!isValid) return;

      const formData = new FormData(form);
      const formObject = {};
      formData.forEach((value, key) => {
        formObject[key] = value || "Not Provided";
      });

      const fieldLabels = {
        "entry.1451674361": "Name",
        "entry.1568809211": "Email",
        "entry.1770796330": "Message",
      };

      const googleFormsEndpoint =
        "https://docs.google.com/forms/d/e/1FAIpQLSdabOoukpL3ONlZQNKw7hBBYMFDw8RRxm6wTfH5MjTk3anuSw/formResponse";

      try {
        await fetch(googleFormsEndpoint, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(formObject).toString(),
        });

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

        popup.innerHTML = popupContent;

        const closeButton = popup.querySelector(".close-popup");
        closeButton.addEventListener("click", () => {
          popup.classList.add("hidden");
          popup.style.display = "none";
        });

        popup.classList.remove("hidden");
        popup.style.display = "flex";

        form.reset();
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("There was an error submitting your message. Please try again.");
      }
    });
  }

  if (popup) {
    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        popup.classList.add("hidden");
        popup.style.display = "none";
      }
    });
  }
});

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

function clearErrors() {
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((error) => error.remove());
}

function showTab(lang) {
  // Get the current modal's code container
  const currentModal = document.querySelector('.modal[style*="display: flex"]');
  if (!currentModal) return;

  // Only affect code tabs within the current modal
  const codeContainer = currentModal.querySelector('.code-content');
  if (!codeContainer) return;

  // Hide all code blocks in the current modal
  codeContainer.querySelectorAll('pre').forEach(pre => {
    pre.style.display = 'none';
  });

  // Show the selected code block
  const selectedCode = codeContainer.querySelector(`#${lang}`);
  if (selectedCode) {
    selectedCode.style.display = 'block';
    // Ensure the parent pre element is also visible
    const parentPre = selectedCode.closest('pre');
    if (parentPre) {
      parentPre.style.display = 'block';
    }
  }

  // Update tab active states in the current modal
  const tabs = currentModal.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.classList.remove('active');
  });
  const activeTab = currentModal.querySelector(`.tab[onclick="showTab('${lang}')"]`);
  if (activeTab) {
    activeTab.classList.add('active');
  }
}
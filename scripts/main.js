document.addEventListener("DOMContentLoaded", () => {
  // Select all elements
  const modals = document.querySelectorAll(".modal");
  const buttons = document.querySelectorAll(".learn-more");
  const closeButtons = document.querySelectorAll(".close-popup");
  const gridMedia = document.querySelectorAll(".grid-image, video.grid-image");
  const expandedImageOverlay = document.getElementById("expanded-image-overlay");
  const expandedImage = document.getElementById("expanded-image");
  const closeExpandedImage = document.querySelector(".close-expanded-image");

  // Store original video HTML
  const originalVideos = new Map();

  // Handle ESC key press
  function handleKeyDown(e) {
    if (e.key === "Escape" || e.keyCode === 27) {
      // Close expanded media if open
      if (expandedImageOverlay.style.display === "flex") {
        closeExpandedMedia();
        return;
      }
      
      // Close modal if open
      const openModal = document.querySelector('.modal[style*="display: flex"]');
      if (openModal) {
        closeModal(openModal);
      }
    }
  }

  // Close modal function
  function closeModal(modal) {
    modal.style.display = "none";
    document.body.classList.remove("overflow-hidden");
    modal.setAttribute('aria-hidden', 'true');
    
    // Clean up videos
    modal.querySelectorAll('video').forEach(video => {
      video.pause();
      video.currentTime = 0;
      video.removeAttribute('src');
      while(video.firstChild) {
        video.removeChild(video.firstChild);
      }
      video.load();
    });
  }

  // Close expanded media function
  function closeExpandedMedia() {
    expandedImageOverlay.style.display = "none";
    expandedImageOverlay.setAttribute('aria-hidden', 'true');
    
    // Clean up video
    const video = expandedImageOverlay.querySelector('video');
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.remove();
    }
    
    // Reset image
    if (expandedImage.tagName === 'IMG') {
      expandedImage.style.transform = 'translate(0, 0) scale(1)';
      expandedImage.classList.remove('zoomed');
    }
    
    document.removeEventListener('keydown', handleKeyDown);
  }

  // Open modal
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const modalId = button.getAttribute("data-modal");
      const modal = document.getElementById(modalId);

      if (modal) {
        // Store original videos
        modal.querySelectorAll('video').forEach(video => {
          if (!originalVideos.has(video.id)) {
            originalVideos.set(video.id, video.innerHTML);
          }
        });

        modal.style.display = "flex";
        document.body.classList.add("overflow-hidden");
        modal.setAttribute('aria-hidden', 'false');
        
        // Restore videos
        modal.querySelectorAll('video').forEach(video => {
          if (video.innerHTML === '' && originalVideos.has(video.id)) {
            video.innerHTML = originalVideos.get(video.id);
            video.load();
          }
        });
      }
    });
  });

  // Close modal buttons
  closeButtons.forEach((close) => {
    close.addEventListener("click", () => {
      closeModal(close.closest(".modal"));
    });
  });

  // Close modal by clicking outside
  modals.forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Expand media
  if (gridMedia && expandedImageOverlay && expandedImage) {
    let currentScale = 1;
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;

    gridMedia.forEach((media) => {
      media.addEventListener("click", (e) => {
        if (media.tagName === 'VIDEO') {
          e.preventDefault();
          e.stopPropagation();
          
          media.pause();
          
          const video = document.createElement('video');
          video.className = 'expanded-image';
          video.controls = true;
          video.src = media.querySelector('source').src;
          video.setAttribute('aria-label', 'Expanded video player');
          video.style.maxWidth = '90%';
          video.style.maxHeight = '90vh';
          
          video.currentTime = media.currentTime;
          expandedImage.style.display = 'none';
          expandedImageOverlay.appendChild(video);
          video.play();
        } else {
          expandedImage.style.display = 'block';
          expandedImage.src = media.src;
          expandedImage.setAttribute('aria-label', 'Expanded image view');
          currentScale = 1;
          translateX = 0;
          translateY = 0;
          expandedImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
          expandedImage.style.cursor = 'zoom-in';
          
          const existingVideo = expandedImageOverlay.querySelector('video');
          if (existingVideo) {
            existingVideo.pause();
            existingVideo.currentTime = 0;
            existingVideo.remove();
          }
        }
        
        expandedImageOverlay.style.display = "flex";
        expandedImageOverlay.setAttribute('aria-hidden', 'false');
        document.addEventListener('keydown', handleKeyDown);
      });
    });

    // Zoom and pan functionality
    expandedImageOverlay.addEventListener('wheel', (e) => {
      if (expandedImage.tagName === 'IMG') {
        e.preventDefault();
        const rect = expandedImage.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const delta = e.deltaY;
        const zoomFactor = 0.1;
        const newScale = delta > 0 
          ? Math.max(1, currentScale - zoomFactor)
          : Math.min(4, currentScale + zoomFactor);
        
        if (newScale !== currentScale) {
          const scaleChange = newScale / currentScale;
          translateX = mouseX - scaleChange * (mouseX - translateX);
          translateY = mouseY - scaleChange * (mouseY - translateY);
          
          currentScale = newScale;
          expandedImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
          expandedImage.style.cursor = currentScale > 1 ? 'grab' : 'zoom-in';
        }
      }
    });

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

    // Close expanded media
    if (closeExpandedImage) {
      closeExpandedImage.addEventListener("click", closeExpandedMedia);
      closeExpandedImage.setAttribute('aria-label', 'Close expanded view');
    }

    expandedImageOverlay.addEventListener("click", (event) => {
      if (event.target === expandedImageOverlay) {
        closeExpandedMedia();
      }
    });
  }

  // Smooth scrolling
  document.querySelectorAll('.navbar a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetElement = document.querySelector(this.getAttribute('href'));
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // Active nav link highlighting
  const sections = document.querySelectorAll(".section");
  const navLinks = document.querySelectorAll(".navbar a");

  const updateActiveLink = () => {
    let index = sections.length;
    while (--index && window.scrollY + 50 < sections[index].offsetTop) {}
    
    navLinks.forEach(link => link.classList.remove("active"));
    if (navLinks[index]) navLinks[index].classList.add("active");
  };

  window.addEventListener("scroll", updateActiveLink);
  updateActiveLink();

  // Form submission
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

// Helper functions
function showError(inputElement, message) {
  const errorElement = document.createElement("small");
  errorElement.className = "error-message";
  errorElement.textContent = message;
  errorElement.style.color = "red";
  inputElement.parentElement.appendChild(errorElement);
}

function clearErrors() {
  document.querySelectorAll(".error-message").forEach(error => error.remove());
}

function showTab(lang) {
  const currentModal = document.querySelector('.modal[style*="display: flex"]');
  if (!currentModal) return;

  const codeContainer = currentModal.querySelector('.code-content');
  if (!codeContainer) return;

  codeContainer.querySelectorAll('pre').forEach(pre => {
    pre.style.display = 'none';
  });

  const selectedCode = codeContainer.querySelector(`#${lang}`);
  if (selectedCode) {
    selectedCode.style.display = 'block';
    const parentPre = selectedCode.closest('pre');
    if (parentPre) parentPre.style.display = 'block';
  }

  const tabs = currentModal.querySelectorAll('.tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  const activeTab = currentModal.querySelector(`.tab[onclick="showTab('${lang}')"]`);
  if (activeTab) activeTab.classList.add('active');
}
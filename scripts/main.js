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
      console.log("Learn More button clicked"); // <-- Add this
      const modalId = button.getAttribute("data-modal");
      console.log("Target modal ID:", modalId); // <-- Add this
      const modal = document.getElementById(modalId);
      console.log("Modal element found:", modal); // <-- Add this
      if (modal) {
        console.log("Displaying modal"); // <-- Add this
        // Store original videos
        modal.querySelectorAll('video').forEach(video => {
            // Consider adding try/catch here temporarily if you suspect issues
            if (!originalVideos.has(video.id)) {
                originalVideos.set(video.id, video.innerHTML);
            }
        });
        modal.style.display = "flex";
        document.body.classList.add("overflow-hidden");
      } else {
         console.warn("Modal not found for ID:", modalId); // <-- Add this
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

  // --- Animation Libraries Init ---
  if (window.AOS) {
    AOS.init({
      duration: 800,
      once: true,
      offset: 80,
      easing: 'ease-in-out',
    });
  }

  // --- Neural Network Canvas Background ---
const bgCanvas = document.getElementById('bg-network');
let ctx, nodes = [], mouse = { x: null, y: null };
let width = 0, height = 0;

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  bgCanvas.width = width * dpr;
  bgCanvas.height = height * dpr;
  bgCanvas.style.width = width + 'px';
  bgCanvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createNodes(count) {
  const nodesArr = [];
  for (let i = 0; i < count; i++) {
    nodesArr.push({
      x: randomBetween(0, width),
      y: randomBetween(0, height),
      vx: randomBetween(-0.3, 0.3),
      vy: randomBetween(-0.3, 0.3),
      r: randomBetween(1.5, 3.5),
    });
  }
  return nodesArr;
}

function drawNetwork() {
  ctx.clearRect(0, 0, width, height);
  const maxDist = 220; // <--- Increased connection distance (e.g., from 140)
  const baseOpacity = 0.18;
  // Draw lines between close nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        ctx.strokeStyle = `rgba(0,206,209,${baseOpacity * (1 - dist / maxDist)})`;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }

  // Draw nodes
  nodes.forEach((node) => {
    const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 2);
    grad.addColorStop(0, 'rgba(0,206,209,0.9)');
    grad.addColorStop(1, 'rgba(10,15,30,0.1)');
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();
  });
}

function animateNetwork() {
  nodes.forEach((node) => {
    node.x += node.vx;
    node.y += node.vy;

    // Bounce off edges
    if (node.x <= 0 || node.x >= width) node.vx *= -1;
    if (node.y <= 0 || node.y >= height) node.vy *= -1;

    // Mouse interaction
    if (mouse.x !== null && mouse.y !== null) { // Check if mouse position is known
      const dx = node.x - mouse.x;  // Calculate difference in X
      const dy = node.y - mouse.y;  // Calculate difference in Y
      const dist = Math.sqrt(dx * dx + dy * dy); // Calculate distance to mouse

      // If the node is within 80 pixels of the mouse cursor
      if (dist < 80) {
        // Apply a small force to the node, pushing it away from the cursor
        node.vx += dx / 1500; // Adjust velocity based on distance/direction
        node.vy += dy / 1500;
      }
    }
  });

  drawNetwork();
  requestAnimationFrame(animateNetwork);
}

function initNetwork() {
  if (!bgCanvas) return;
  ctx = bgCanvas.getContext('2d');
  resizeCanvas();
  
  // Scale nodes based on screen size for optimal performance and visual density
  let nodeCount;
  if (width >= 1440) {
    // Large Desktop - more nodes for rich visual effect
    nodeCount = 350;
  } else if (width >= 1024) {
    // Desktop - good balance of performance and visual appeal
    nodeCount = 250;
  } else if (width >= 768) {
    // Laptop - moderate number of nodes
    nodeCount = 180;
  } else if (width >= 481) {
    // Tablet - fewer nodes for better performance
    nodeCount = 120;
  } else if (width >= 375) {
    // Mobile Large - minimal nodes for smooth performance
    nodeCount = 80;
  } else {
    // Mobile Small - very few nodes to ensure smooth performance
    nodeCount = 50;
  }
  
  nodes = createNodes(nodeCount);
  animateNetwork();
}

window.addEventListener('resize', () => {
  resizeCanvas();
  
  // Recalculate nodes based on new screen size
  let nodeCount;
  if (width >= 1440) {
    nodeCount = 350;
  } else if (width >= 1024) {
    nodeCount = 250;
  } else if (width >= 768) {
    nodeCount = 180;
  } else if (width >= 481) {
    nodeCount = 120;
  } else if (width >= 375) {
    nodeCount = 80;
  } else {
    nodeCount = 50;
  }
  
  nodes = createNodes(nodeCount);
});

document.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

initNetwork();

  // --- Button Ripple Effect ---
  function addRippleEffect(e) {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    button.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }
  document.querySelectorAll('.learn-more, .github-repo, .view-code').forEach(btn => {
    btn.addEventListener('click', addRippleEffect);
  });

  // --- Typewriter Effect for Homepage Title (two lines) ---
  const typewriterText1 = document.getElementById('typewriter-text-1');
  const typewriterStr1 = "Hi there, I'm Arkar\nAI & Data Engineer | Tech Enthusiast";
  let typeIdx1 = 0;

  function typeWriter() {
    if (typeIdx1 <= typewriterStr1.length) {
      // Add cursor directly to the text (zero-width)
      typewriterText1.innerHTML = `
        ${typewriterStr1.slice(0, typeIdx1).replace(/\n/g, '<br>')}
        <span class="typewriter-cursor">|</span>
      `;
      typeIdx1++;
      setTimeout(typeWriter, 70);
    } else {
      // Final render without cursor
      typewriterText1.innerHTML = typewriterStr1.replace(/\n/g, '<br>');
    }
  }

  if (typewriterText1) typeWriter();

  // --- Navbar Sticky Fade-in/Out on Scroll Direction ---
  // --- Scroll Progress Bar ---
  const scrollProgress = document.getElementById('scroll-progress');
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = progress + '%';
  }
  window.addEventListener('scroll', updateScrollProgress);
  updateScrollProgress();

  // --- Page Load and Section Entrance Animations ---
  function animateNavbarOnHome() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.classList.add('navbar-animate-in');
      navbar.addEventListener('animationend', () => {
        navbar.classList.remove('navbar-animate-in');
      }, { once: true });
    }
  }
  function animateSection(section) {
    if (!section) return;
    section.classList.add('animate-in');
    section.addEventListener('animationend', () => {
      section.classList.remove('animate-in');
    }, { once: true });
    // Animate direct children (for staggered effect)
    Array.from(section.children).forEach((child, i) => {
      child.classList.add('animate-in');
      child.style.animationDelay = (0.1 + i * 0.08) + 's';
      child.addEventListener('animationend', () => {
        child.classList.remove('animate-in');
        child.style.animationDelay = '';
      }, { once: true });
    });
  }
  // On initial load
  window.addEventListener('DOMContentLoaded', () => {
    const homeSection = document.getElementById('home');
    if (window.scrollY < 100 && homeSection) {
      animateNavbarOnHome();
      animateSection(homeSection);
    }
  });
  // On nav click, animate target section
  document.querySelectorAll('.navbar a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        setTimeout(() => animateSection(targetSection), 350);
      }
    });
  });
  // On scroll, animate section when entering viewport (if not already animated)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animate-in')) {
        animateSection(entry.target);
      }
    });
  }, { threshold: 0.25 });
  document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
  });

// Navbar is now always visible - no hiding functionality
});

// Navbar is always visible - no initialization needed

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
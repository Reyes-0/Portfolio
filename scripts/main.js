document.addEventListener("DOMContentLoaded", () => {
  // Select all modals, "Learn More" buttons, and close buttons
  const modals = document.querySelectorAll(".modal");
  const buttons = document.querySelectorAll(".learn-more");
  const closeButtons = document.querySelectorAll(".close");

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
    navLinks[index].classList.add("active");
  };

  // Attach the scroll event listener
  window.addEventListener("scroll", updateActiveLink);

  // Initialize the active link on page load
  updateActiveLink();
});
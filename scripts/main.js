document.addEventListener("DOMContentLoaded", () => {
  const modals = document.querySelectorAll(".modal");
  const buttons = document.querySelectorAll(".learn-more");
  const closeButtons = document.querySelectorAll(".close");

  // Open modal when "Learn More" button is clicked
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const modalId = button.getAttribute("data-modal");
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = "flex";
        document.body.classList.add("overflow-hidden"); // Disable scrolling
      }
    });
  });

  // Close modal when "Close" button is clicked
  closeButtons.forEach((close) => {
    close.addEventListener("click", () => {
      const modal = close.closest(".modal");
      if (modal) {
        modal.style.display = "none";
        document.body.classList.remove("overflow-hidden"); // Enable scrolling
      }
    });
  });

  // Close modal when clicking outside the modal content
  modals.forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
        document.body.classList.remove("overflow-hidden");
      }
    });
  });

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
});
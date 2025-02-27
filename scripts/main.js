// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
  
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
  
      if (targetElement) {
        const navbarHeight = document.querySelector('.custom-navbar').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
  
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
  
        // Update active nav link
        document.querySelectorAll('.custom-navbar a').forEach(link => {
          link.classList.remove('active');
        });
        this.classList.add('active');
      }
    });
  });
  
  // Add active class to nav items on scroll
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const navbarHeight = document.querySelector('.custom-navbar').offsetHeight;
  
    document.querySelectorAll('section').forEach(section => {
      const sectionTop = section.offsetTop - navbarHeight - 50;
      const sectionBottom = sectionTop + section.offsetHeight;
  
      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        const currentId = section.getAttribute('id');
        document.querySelectorAll('.custom-navbar a').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${currentId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
  
  // Form validation and submission handling
  const contactForm = document.querySelector('#contact-me form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
  
      const name = document.querySelector('input[name="name"]').value.trim();
      const email = document.querySelector('input[name="email"]').value.trim();
      const message = document.querySelector('textarea[name="message"]').value.trim();
  
      if (!name || !email || !message) {
        alert('Please fill in all required fields');
        return;
      }
  
      // Simulate form submission
      setTimeout(() => {
        alert('Thank you for your message! I will get back to you soon.');
        contactForm.reset();
      }, 1000);
    });
  }
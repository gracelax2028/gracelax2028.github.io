document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("contactForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const templateParams = {
        from_name: document.getElementById("name").value,
        from_email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        subject: document.getElementById("subject").value,
        message: document.getElementById("message").value,
      };

      emailjs
        .send(
          "service_5nd03cm",
          "template_3hxlpfg",
          templateParams,
          "oD8SzfOhg7IhNM2Mh"
        )
        .then(
          function (response) {
            alert("Message sent successfully! I will get back to you soon.");
            document.getElementById("contactForm").reset();
          },
          function (error) {
            alert(
              "Failed to send message. Please try again or email me directly."
            );
          }
        );
    });
});

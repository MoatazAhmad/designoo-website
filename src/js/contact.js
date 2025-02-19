"use strict"; // Enforce strict mode for better error detection and cleaner code
/**
 * Custom validation logic for the contact form.
 * Validates required input and textarea fields and shows/hides error messages.
 * Uses the HTML5 Validity API for form validation.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict} for strict mode usage.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/validity} for the Validity API.
 */

// Get the contact form element
const form = document.getElementById("contactForm");
if (!form) {
  console.error("Contact form not found.");
}

// Select all required input and textarea fields if the form exists
const inputs = form
  ? form.querySelectorAll("input[required], textarea[required]")
  : [];

/**
 * Hides an error message element by adding the "hidden" class.
 *
 * @param {string} errorId - The ID of the error message element.
 */
function hideErrorMessage(errorId) {
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.classList.add("hidden");
  }
}

// Add submit event listener with improved error handling and validation logic
form &&
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let formIsValid = true;

    inputs.forEach((input) => {
      const errorElement = document.getElementById(`${input.id}Error`);

      // Reset error state if the error element exists
      if (errorElement) {
        errorElement.classList.add("hidden");
      }
      input.classList.remove("border-red-500");

      // Custom validation logic using HTML5 validity API
      if (!input.validity.valid) {
        // Show error message if the error element exists
        if (errorElement) {
          errorElement.classList.remove("hidden");
        }
        input.classList.add("border-red-500");
        formIsValid = false;
      }
    });

    if (formIsValid) {
      // Proceed with form submission (e.g., via AJAX)
      console.log("Form is valid!");
    }
  });

// Map of input field IDs to their corresponding error message IDs
const focusableFields = [
  { fieldId: "nameInput", errorId: "nameInputError" },
  { fieldId: "emailInput", errorId: "emailInputError" },
  { fieldId: "phoneInput", errorId: "phoneInputError" },
  { fieldId: "message", errorId: "messageError" },
];

// Add focus event listeners to hide error messages when the user focuses on the input fields
focusableFields.forEach(({ fieldId, errorId }) => {
  const field = document.getElementById(fieldId);
  if (field) {
    field.addEventListener("focus", () => hideErrorMessage(errorId));
  }
});

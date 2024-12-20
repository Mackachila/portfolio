
const courseregistrationForm = document.getElementById("courseregistration_form");
const loadingOverlay = document.getElementById("loading-overlay");
courseregistrationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const course = document.getElementById("course_selection").value;
  
  
  showLoadingSpinner();

  // Send data to server
  try {
    const response = await fetch('/register-course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        course: course,
        }),
    });

    const result = await response.json();
    
    if (response.ok) {
      displayFloatingCard(result.message, 'success');
      

      
      setTimeout(() => {
        const queryParams = new URLSearchParams({
          title: "MTS",
          appreciation: "Congratulations",
          message: "Your course registration was successful!"
        });
        window.location.href = `/coursesuccess?${queryParams.toString()}`;
      }, 2000); // Redirect after 10 seconds
    } else {
      displayFloatingCard(result.error, 'error');
    }

  } catch (error) {
    displayFloatingCard('An error occurred. Please try again later.', 'error');
  }
  hideLoadingSpinner();
});

// const courseregistrationForm = document.getElementById("courseregistration_form");
// const loadingOverlay = document.getElementById("loading-overlay");
// courseregistrationForm.addEventListener("submit", async (event) => {
//   event.preventDefault();

//   const course = document.getElementById("course_selection").value;

//   showLoadingSpinner();

//   // Send data to server
//   try {
//     const response = await fetch('/register-course', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         course: course,
//       }),
//     });

//     const result = await response.json();

//     if (response.ok) {
//       displayFloatingCard(result.message, 'success');

//       // Dynamically render success message instead of redirecting
//       setTimeout(() => {
//         renderSuccessCard(result.message);
//       }, 1000); // Render success card after 1 second
//     } else {
//       displayFloatingCard(result.error, 'error');
//     }

//   } catch (error) {
//     displayFloatingCard('An error occurred. Please try again later.', 'error');
//   }
//   hideLoadingSpinner();
// });

// // Function to render the success card dynamically
// function renderSuccessCard(message) {
//   const successCardHTML = `
//     <div class="card">
//       <img src="tick.png" alt="Success Icon">
//       <h1>Congratulations</h1>
//       <p>${message}</p>
//       <button onclick="window.location.href='/dashboard';">Back to account</button>
//     </div>
//   `;
  
//   // Append the success card to the page
//   const body = document.querySelector('body');
//   const existingCard = document.querySelector('.card');
//   if (existingCard) {
//     existingCard.remove(); // Remove existing card if any
//   }
//   body.insertAdjacentHTML('beforeend', successCardHTML); // Insert success card
// }



// loading spinner

function showLoadingSpinner() {
    loadingOverlay.classList.add('active');
  }
  
  function hideLoadingSpinner() {
    loadingOverlay.classList.remove('active');
  }

function displayFloatingCard(message, type) {
  const card = document.createElement('div');
  card.className = `floating-card ${type}`;
  
  const icon = document.createElement('img');
  icon.className = 'card-icon';
  
  if (type === 'error') {
    icon.src = 'error.png';  // Assuming error.png is in the same directory
  } else if (type === 'success') {
    icon.src = 'tick.png';  // Assuming success.png is in the same directory
  }

  const text = document.createElement('span');
  text.className = 'card-message';
  text.textContent = message;

  const closeBtn = document.createElement('span');
  closeBtn.className = 'close-btn';
  closeBtn.textContent = '✕';
  closeBtn.onclick = () => {
    card.remove();
  };

  card.appendChild(icon);
  card.appendChild(text);
  card.appendChild(closeBtn);
  
  document.body.appendChild(card);

  // Automatically remove the card after 3 seconds
  setTimeout(() => {
    card.remove();
  }, 4000);
}

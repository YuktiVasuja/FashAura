// Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();


  // UI Elements
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const profileDropdown = document.getElementById("profileDropdown");
const profilePic = document.getElementById("profilePic");
const dropdownMenu = document.getElementById("dropdownMenu");

// Toggle dropdown menu on profile pic click


// // Close dropdown if clicked outside
// window.addEventListener("click", (e) => {
//   if (!profileDropdown.contains(e.target)) {
//     dropdownMenu.style.display = "none";
//   }
// });


let dropdownVisible = false;

// Toggle dropdown on profile picture click
profilePic.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdownVisible = !dropdownVisible;
  dropdownMenu.style.display = dropdownVisible ? "block" : "none";
});

// Prevent dropdown from closing if clicked inside the dropdown
profileDropdown.addEventListener("click", (e) => {
  e.stopPropagation();
});

// Close dropdown when clicking anywhere outside
window.addEventListener("click", () => {
  dropdownVisible = false;
  dropdownMenu.style.display = "none";
});




// Auth state listener
auth.onAuthStateChanged((user) => {
  if (user) {
    // Hide auth buttons
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    profileDropdown.style.display = "block";

    const name = user.displayName || "User";
    const email = user.email;
    const avatar = user.photoURL || 'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg';

    profilePic.src = avatar;

    // ✅ Show email inside dropdown
    document.getElementById("userEmail").textContent = email;
  } else {
    // Logged out
    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
    profileDropdown.style.display = "none";
    dropdownMenu.style.display = "none";
  }
});



// Logout function
// function logout() {
//   auth.signOut().then(() => {
//     alert("Logged out successfully!");
//   }).catch((error) => {
//     alert("Logout error: " + error.message);
//   });
// }

function logout() {
  auth.signOut().then(() => {
    alert("Logged out successfully!");
  }).catch((error) => {
    alert("Logout error: " + error.message);
  });
}



    // Image carousel

    new Swiper(".mySwiper", {

      slidesPerView: "auto",

      spaceBetween: 30,

      loop: true,

      speed: 1200,

      autoplay: {

        delay: 3000,

        disableOnInteraction: false,

      },

    });



    // Testimonials carousel

    new Swiper(".testimonialSwiper", {

      slidesPerView: 1,

      loop: true,

      speed: 1000,

      autoplay: {

        delay: 5000,

        disableOnInteraction: false,

      },

    });



    // Modal functionality

    const modal = document.getElementById("authModal");

    const signinForm = document.getElementById("signinForm");

    const signupForm = document.getElementById("signupForm");



    function openModal(form) {

      modal.style.display = "block";

      signinForm.classList.remove("active");

      signupForm.classList.remove("active");

      if (form === "signin") {

        signinForm.classList.add("active");

      } else {

        signupForm.classList.add("active");

      }

    }



    function closeModal() {

      modal.style.display = "none";

    }



    window.onclick = function(event) {

      if (event.target === modal) {

        modal.style.display = "none";

      }

    };


//     signupForm.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const email = document.getElementById("signupEmail").value;
//     const password = document.getElementById("signupPassword").value;

//     try {
//       await auth.createUserWithEmailAndPassword(email, password);
//       alert("Account created successfully!");
//       closeModal();
//     } catch (error) {
//       alert("Signup error: " + error.message);
//     }
//   });


signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    await user.updateProfile({
      displayName: name,
      photoURL: 'https://i.pravatar.cc/150?u=${email}' // default avatar
    });

    alert("Account created successfully!");
    closeModal();
  } catch (error) {
    alert("Signup error: " + error.message);
  }
});


  // Handle Login
  signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      await auth.signInWithEmailAndPassword(email, password);
      alert("Logged in successfully!");
      closeModal();
    } catch (error) {
      alert("Login error: " + error.message);
    }
  });

  // Google Sign In
  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await auth.signInWithPopup(provider);
      alert("Signed in with Google!");
      closeModal();
    } catch (error) {
      alert("Google sign-in error: " + error.message);
    }
  }


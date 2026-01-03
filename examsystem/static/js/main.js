// Main JavaScript file for additional functionality

// Prevent right-click during exam
if (window.location.pathname.includes("exam.html")) {
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault()
  })

  // Prevent common keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
      (e.ctrlKey && e.key === "u")
    ) {
      e.preventDefault()
    }
  })
}

// Add visibility change detection
document.addEventListener("visibilitychange", () => {
  if (window.location.pathname.includes("exam.html")) {
    if (document.hidden) {
      // You could log this event to the server
      console.log("User left the exam page")
    }
  }
})

document.addEventListener('DOMContentLoaded', function() {
    const tutorFileInput = document.getElementById('tutorFileInput');
    const startTutoringBtn = document.getElementById('startTutoringBtn');
    const tutorChatArea = document.getElementById('tutor-chat-area');
    const chatMessages = document.getElementById('chat-messages');
    const userMessageInput = document.getElementById('userMessageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatLoadingSpinner = document.getElementById('chat-loading-spinner');

    let uploadedFileContent = null; // To store the content of the uploaded TXT file

    // Function to append a message to the chat
    function appendMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.innerHTML = `<p>${message}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
    }

    // Handle file selection
    tutorFileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedFileContent = e.target.result;
                console.log("File content loaded:", uploadedFileContent.substring(0, 100) + "..."); // Log first 100 chars
                startTutoringBtn.disabled = false; // Enable button once file is loaded
            };
            reader.readAsText(file);
        } else {
            uploadedFileContent = null;
            startTutoringBtn.disabled = true;
        }
    });

    // Handle Start Tutoring button click
    startTutoringBtn.addEventListener('click', async function() {
        if (!uploadedFileContent) {
            alert('Please select a .txt file first.');
            return;
        }

        // Show the chat area and disable file upload
        tutorChatArea.classList.remove('d-none');
        tutorFileInput.disabled = true;
        startTutoringBtn.disabled = true;
        userMessageInput.disabled = false;
        sendMessageBtn.disabled = false;

        // Clear previous messages except the initial AI welcome message
        chatMessages.innerHTML = `
            <div class="message ai-message">
                <p>Hello! Upload your analysis text file to begin our learning session.</p>
            </div>
        `;
        appendMessage('ai', 'File received! Let\'s start. I\'m generating your first question...');
        chatLoadingSpinner.classList.remove('d-none');

        // --- PHASE 2: Send content to backend to generate first question ---
        try {
            const response = await fetch('/api/tutor/start', { // New API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ file_content: uploadedFileContent })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            chatLoadingSpinner.classList.add('d-none');
            appendMessage('ai', data.question); // Display the first question from AI
        } catch (error) {
            console.error('Error starting tutoring session:', error);
            chatLoadingSpinner.classList.add('d-none');
            appendMessage('ai', 'Oops! Something went wrong while starting the session. Please try again.');
            // Re-enable file upload for user to retry
            tutorFileInput.disabled = false;
            startTutoringBtn.disabled = false;
        }
    });

    // Handle Send Message button click (for user answers)
    sendMessageBtn.addEventListener('click', async function() {
        const userMessage = userMessageInput.value.trim();
        if (userMessage === '') return;

        appendMessage('user', userMessage);
        userMessageInput.value = ''; // Clear input
        userMessageInput.disabled = true;
        sendMessageBtn.disabled = true;
        chatLoadingSpinner.classList.remove('d-none');

        // --- PHASE 3: Send user answer to backend for evaluation & next question ---
        try {
            const response = await fetch('/api/tutor/answer', { // New API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    user_answer: userMessage,
                    file_content: uploadedFileContent // Re-send content or use session ID
                    // In a real implementation, you'd send a session_id here
                    // to avoid sending the whole file_content repeatedly
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            chatLoadingSpinner.classList.add('d-none');
            appendMessage('ai', data.feedback); // Display AI's feedback/next question
            userMessageInput.disabled = false;
            sendMessageBtn.disabled = false;
        } catch (error) {
            console.error('Error sending message:', error);
            chatLoadingSpinner.classList.add('d-none');
            appendMessage('ai', 'Oops! There was an issue processing your answer. Please try again.');
            userMessageInput.disabled = false;
            sendMessageBtn.disabled = false;
        }
    });

    // Allow sending message with Enter key
    userMessageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { // Allow Shift+Enter for new line
            e.preventDefault(); // Prevent default form submission
            sendMessageBtn.click();
        }
    });
});

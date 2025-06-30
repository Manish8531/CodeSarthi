document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing tutor script...');
    
    const tutorFileInput = document.getElementById('tutorFileInput');
    const startTutoringBtn = document.getElementById('startTutoringBtn');
    const uploadSection = document.getElementById('upload-section');
    const chatSection = document.getElementById('chat-section');
    const chatMessages = document.getElementById('chat-messages');
    const userMessageInput = document.getElementById('userMessageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatLoadingSpinner = document.getElementById('chat-loading-spinner');

    console.log('Elements found:', {
        tutorFileInput: !!tutorFileInput,
        startTutoringBtn: !!startTutoringBtn,
        uploadSection: !!uploadSection,
        chatSection: !!chatSection,
        chatMessages: !!chatMessages,
        userMessageInput: !!userMessageInput,
        sendMessageBtn: !!sendMessageBtn,
        chatLoadingSpinner: !!chatLoadingSpinner
    });

    let uploadedFileContent = null;

    // Function to append a message to the chat with proper structure
    function appendMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (sender === 'ai') {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">
                        <p>${message}</p>
                    </div>
                    <div class="message-time">${currentTime}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">
                        <p>${message}</p>
                    </div>
                    <div class="message-time">${currentTime}</div>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Handle file selection
    if (tutorFileInput) {
        tutorFileInput.addEventListener('change', function(event) {
            console.log('File input changed:', event.target.files[0]);
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    uploadedFileContent = e.target.result;
                    console.log("File content loaded:", uploadedFileContent.substring(0, 100) + "...");
                    if (startTutoringBtn) {
                        startTutoringBtn.disabled = false;
                        console.log('Start tutoring button enabled');
                    }
                };
                reader.readAsText(file);
            } else {
                uploadedFileContent = null;
                if (startTutoringBtn) {
                    startTutoringBtn.disabled = true;
                    console.log('Start tutoring button disabled');
                }
            }
        });
    }

    // Handle Start Tutoring button click
    if (startTutoringBtn) {
        startTutoringBtn.addEventListener('click', async function() {
            console.log('Start tutoring button clicked!');
            
            const file = tutorFileInput ? tutorFileInput.files[0] : null;
            console.log('Selected file:', file);
            
            if (!file) {
                alert('Please select a .txt file first.');
                return;
            }

            console.log('Starting tutoring session...');

            // Switch from upload to chat interface
            if (uploadSection) uploadSection.classList.add('d-none');
            if (chatSection) chatSection.classList.remove('d-none');
            if (userMessageInput) userMessageInput.disabled = false;
            if (sendMessageBtn) sendMessageBtn.disabled = false;

            // Clear previous messages and add welcome message
            if (chatMessages) {
                chatMessages.innerHTML = `
                    <div class="message ai-message">
                        <div class="message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <div class="message-text">
                                <p>Hello! I'm your AI coding tutor. I've received your analysis file. Let's start learning!</p>
                            </div>
                            <div class="message-time">Just now</div>
                        </div>
                    </div>
                `;
            }
            
            appendMessage('ai', 'Processing your file and preparing questions...');
            if (chatLoadingSpinner) chatLoadingSpinner.classList.remove('d-none');

            // Send file to backend
            try {
                console.log('Sending file to backend...');
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch('/upload-analysis', {
                    method: 'POST',
                    body: formData
                });

                console.log('Backend response status:', response.status);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Backend response data:', data);
                if (chatLoadingSpinner) chatLoadingSpinner.classList.add('d-none');
                appendMessage('ai', data.start_message);
            } catch (error) {
                console.error('Error starting tutoring session:', error);
                if (chatLoadingSpinner) chatLoadingSpinner.classList.add('d-none');
                appendMessage('ai', 'Oops! Something went wrong while starting the session. Please try again.');
                // Re-enable upload section for retry
                if (uploadSection) uploadSection.classList.remove('d-none');
                if (chatSection) chatSection.classList.add('d-none');
            }
        });
    }

    // Handle Send Message button click
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', async function() {
            const userMessage = userMessageInput ? userMessageInput.value.trim() : '';
            if (userMessage === '') return;

            appendMessage('user', userMessage);
            if (userMessageInput) userMessageInput.value = '';
            if (userMessageInput) userMessageInput.disabled = true;
            if (sendMessageBtn) sendMessageBtn.disabled = true;
            if (chatLoadingSpinner) chatLoadingSpinner.classList.remove('d-none');

            // Send user message to backend
            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: userMessage })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (chatLoadingSpinner) chatLoadingSpinner.classList.add('d-none');
                appendMessage('ai', data.response);
                if (userMessageInput) userMessageInput.disabled = false;
                if (sendMessageBtn) sendMessageBtn.disabled = false;
            } catch (error) {
                console.error('Error sending message:', error);
                if (chatLoadingSpinner) chatLoadingSpinner.classList.add('d-none');
                appendMessage('ai', 'Oops! There was an issue processing your answer. Please try again.');
                if (userMessageInput) userMessageInput.disabled = false;
                if (sendMessageBtn) sendMessageBtn.disabled = false;
            }
        });
    }

    // Allow sending message with Enter key
    if (userMessageInput) {
        userMessageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (sendMessageBtn) sendMessageBtn.click();
            }
        });
    }

    console.log('Tutor script initialization complete!');
});

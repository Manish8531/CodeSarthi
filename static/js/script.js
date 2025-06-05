document.addEventListener('DOMContentLoaded', function() {
    const codeForm = document.getElementById('code-form');
    const loadingSpinner = document.getElementById('loading-spinner');
    const analysisResultsContainer = document.getElementById('analysis-results-container');
    const resultsDisplaySection = document.getElementById('results-display-section');

    // New elements for the step-by-step concept explanation
    const conceptStepWhy = document.getElementById('concept-step-why');
    //const conceptStepWhat = document.getElementById('concept-step-what');
    const conceptStepHow = document.getElementById('concept-step-how');
    const conceptStepWhere = document.getElementById('concept-step-where');
    const conceptContentWhy = document.getElementById('concept-why-content');
    const conceptContentHow = document.getElementById('concept-how-content');
    const conceptContentWhere = document.getElementById('concept-where-content');
    const prevConceptBtn = document.getElementById('prev-concept-btn');
    const nextConceptBtn = document.getElementById('next-concept-btn');
    const conceptSteps = [conceptStepWhy,  conceptStepHow, conceptStepWhere];
    let currentConceptStepIndex = 0; // Start with WHY

    // Elements for other sections
    const mnemonicsList = document.getElementById('mnemonics-list');
    const coreConceptsList = document.getElementById('core-concepts-list');

    // Function to show a specific concept step
    function showConceptStep(index) {
        // Hide all steps with a fade-out effect
        conceptSteps.forEach(step => {
            if (!step.classList.contains('d-none')) { // Only animate if currently visible
                step.classList.remove('animate__fadeIn');
                step.classList.add('animate__animated', 'animate__fadeOut');
            }
        });

        // Use a small timeout to allow fadeOut to complete before fadeIn starts
        // Then hide the element fully and remove fadeOut, then show with fadeIn
        setTimeout(() => {
            conceptSteps.forEach(step => {
                step.classList.add('d-none'); // Hide all after animation
                step.classList.remove('animate__fadeOut'); // Remove fadeOut class
            });

            // Show the current step with a fade-in effect
            conceptSteps[index].classList.remove('d-none');
            conceptSteps[index].classList.add('animate__animated', 'animate__fadeIn');

            // Update button states
            prevConceptBtn.disabled = (index === 0);
            nextConceptBtn.disabled = (index === conceptSteps.length - 1);
            currentConceptStepIndex = index; // Update the global index
        }, 300); // This delay should match your CSS transition duration
    }

    // Event listeners for navigation buttons
    if (prevConceptBtn) {
        prevConceptBtn.addEventListener('click', function() {
            if (currentConceptStepIndex > 0) {
                showConceptStep(currentConceptStepIndex - 1);
            }
        });
    }

    if (nextConceptBtn) {
        nextConceptBtn.addEventListener('click', function() {
            if (currentConceptStepIndex < conceptSteps.length - 1) {
                showConceptStep(currentConceptStepIndex + 1);
            }
        });
    }


    if (codeForm) {
        codeForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent default form submission

            const userCode = document.getElementById('user_code').value.trim();

            // Clear previous results and hide container
            analysisResultsContainer.classList.add('d-none');
            resultsDisplaySection.classList.add('d-none');


            if (!userCode) {
                alert('Please paste some code to analyze.');
                return;
            }

            loadingSpinner.classList.remove('d-none'); // Show spinner

            // Reset concept steps to initial state and show the first one
            currentConceptStepIndex = 0;
            // The showConceptStep function will be called after successful analysis
            // to populate and display the initial 'WHY' section.
            // No need to call it here initially, as the section will be hidden by default
            // until data is available.

            try {
                // Fetch to your Flask '/analyze_code' route
                const response = await fetch('/analyze_code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `user_code=${encodeURIComponent(userCode)}`
                });

                const data = await response.json(); // Try to parse JSON even if response.ok is false

                if (response.ok && data.success) { // Check for both HTTP OK and custom 'success' flag
                    const analysis = data.analysis; // Access the 'analysis' key

                    console.log('DEBUG: Received analysis data:', analysis);

                    // Populate Concept Explanation content
                    conceptContentWhy.innerHTML = analysis.concept_explanation.why + 
                                                   "<br><br><strong>What it does:</strong> " + 
                                                   analysis.concept_explanation.what;
                    conceptContentHow.innerHTML = analysis.concept_explanation.how;
                    conceptContentWhere.innerHTML = analysis.concept_explanation.where;

                    // Show the first concept step (WHY)
                    showConceptStep(0);

                    // Populate Mnemonics
                    mnemonicsList.innerHTML = ''; // Clear previous
                    if (analysis.mnemonics && analysis.mnemonics.length > 0) {
                        analysis.mnemonics.forEach(mnemonic => {
                            const li = document.createElement('li');
                            li.innerHTML = `<i class="fas fa-brain me-2"></i>${mnemonic.trim()}`;
                            mnemonicsList.appendChild(li);
                        });
                    } else {
                        mnemonicsList.innerHTML = '<li><i class="fas fa-times-circle me-2"></i>No mnemonics generated.</li>';
                    }

                    // Populate Core 20% Concepts
                    coreConceptsList.innerHTML = ''; // Clear previous
                    if (analysis.core_concepts_20_percent && analysis.core_concepts_20_percent.length > 0) {
                        analysis.core_concepts_20_percent.forEach(concept => {
                            const li = document.createElement('li');
                            li.innerHTML = `<i class="fas fa-code-branch me-2"></i>${concept.trim()}`;
                            coreConceptsList.appendChild(li);
                        });
                    } else {
                        coreConceptsList.innerHTML = '<li><i class="fas fa-times-circle me-2"></i>No core concepts identified.</li>';
                    }

                    // Show the results section and its container with animation
                    resultsDisplaySection.classList.remove('d-none');
                    analysisResultsContainer.classList.remove('d-none');
                    analysisResultsContainer.classList.add('animate__animated', 'animate__fadeInUp');

                    // Scroll to results section for better UX
                    resultsDisplaySection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                } else {
                    // Handle API errors (e.g., LLM generation failed, invalid code)
                    const errorMessage = data.error || 'An unknown error occurred during analysis from the server.';
                    alert(`Error: ${errorMessage}`);
                    console.error('Analysis failed:', data);
                    // Hide results if there's an error
                    analysisResultsContainer.classList.add('d-none');
                    resultsDisplaySection.classList.add('d-none');
                }

            } catch (error) {
                console.error('Network or parsing error:', error);
                let userMessage = 'An unexpected error occurred. Please try again.';
                if (error instanceof TypeError) {
                    userMessage = 'Network connection issue or server not reachable. Please check your internet connection and ensure the Flask server is running.';
                } else if (error instanceof SyntaxError) {
                    userMessage = 'The server sent an invalid response (JSON parsing error). Please check Flask server logs for errors.';
                }
                alert(userMessage);
            } finally {
                loadingSpinner.classList.add('d-none'); // Hide spinner
            }
        });
    }
});

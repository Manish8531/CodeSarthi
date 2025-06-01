document.addEventListener('DOMContentLoaded', function() {
    const codeForm = document.getElementById('code-form');
    const loadingSpinner = document.getElementById('loading-spinner');
    const analysisResultsContainer = document.getElementById('analysis-results-container');
    const conceptWhy = document.getElementById('concept-why');
    const conceptWhat = document.getElementById('concept-what');
    const conceptHow = document.getElementById('concept-how');
    const conceptWhere = document.getElementById('concept-where');
    const mnemonicsList = document.getElementById('mnemonics-list');
    const coreConceptsList = document.getElementById('core-concepts-list');
    const resultsDisplaySection = document.getElementById('results-display-section'); // The new section itself

    if (codeForm) {
        codeForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent default form submission

            const userCode = document.getElementById('user_code').value.trim();

            // Clear previous results and hide container
            analysisResultsContainer.classList.add('d-none');
            // Ensure the main results section is also hidden initially if it was shown
            resultsDisplaySection.classList.add('d-none');


            if (!userCode) {
                // Instead of alert, you might want to flash a message via Flask or show a custom modal
                // For now, using alert for immediate feedback
                alert('Please paste some code to analyze.');
                return;
            }

            loadingSpinner.classList.remove('d-none'); // Show spinner

            try {
                const response = await fetch('/analyze_code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `user_code=${encodeURIComponent(userCode)}`
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    const analysis = data.analysis;

                    // DEBUG: Log the received analysis data to the browser console
                    console.log('DEBUG: Received analysis data:', analysis);

                    // Populate Concept Explanation
                    conceptWhy.textContent = analysis.concept_explanation.why || 'N/A';
                    conceptWhat.textContent = analysis.concept_explanation.what || 'N/A';
                    conceptHow.textContent = analysis.concept_explanation.how || 'N/A';
                    conceptWhere.textContent = analysis.concept_explanation.where || 'N/A';

                    // Populate Mnemonics
                    mnemonicsList.innerHTML = ''; // Clear previous
                    if (analysis.mnemonics && analysis.mnemonics.length > 0) {
                        analysis.mnemonics.forEach(mnemonic => {
                            const li = document.createElement('li');
                            li.textContent = mnemonic;
                            mnemonicsList.appendChild(li);
                        });
                    } else {
                        mnemonicsList.innerHTML = '<li>No mnemonics generated.</li>';
                    }

                    // Populate Core 20% Concepts
                    coreConceptsList.innerHTML = ''; // Clear previous
                    if (analysis.core_concepts_20_percent && analysis.core_concepts_20_percent.length > 0) {
                        analysis.core_concepts_20_percent.forEach(concept => {
                            const li = document.createElement('li');
                            li.textContent = concept;
                            coreConceptsList.appendChild(li);
                        });
                    } else {
                        coreConceptsList.innerHTML = '<li>No core concepts identified.</li>';
                    }

                    // Show the results section and its container
                    resultsDisplaySection.classList.remove('d-none'); // Make the main section visible
                    analysisResultsContainer.classList.remove('d-none'); // Make the container visible

                    // Optional: Add animation classes after making visible
                    analysisResultsContainer.classList.add('animate__animated', 'animate__fadeInUp');
                    resultsDisplaySection.classList.add('animate__animated', 'animate__fadeIn');


                    // Scroll to results section for better UX
                    resultsDisplaySection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                } else {
                    // Handle API errors (e.g., LLM generation failed, invalid code)
                    const errorMessage = data.error || 'An unknown error occurred during analysis.';
                    alert(`Error: ${errorMessage}`);
                    console.error('Analysis failed:', data);
                }

            } catch (error) {
                console.error('Fetch error:', error);
                alert('An error occurred. Please check your internet connection or try again later.');
            } finally {
                loadingSpinner.classList.add('d-none'); // Hide spinner
            }
        });
    }
});

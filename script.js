
// Global variables
let currentRole = '';
let questions = [];
let currentQuiz = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with sample questions
    initializeSampleQuestions();
    
    // Add form event listener
    document.getElementById('questionForm').addEventListener('submit', handleQuestionSubmit);
});

// Initialize with some sample questions
function initializeSampleQuestions() {
    const sampleQuestions = [
        {
            difficulty: 'easy',
            question: 'What is the capital of France?',
            options: ['London', 'Berlin', 'Paris', 'Madrid'],
            correct: 'C'
        },
        {
            difficulty: 'easy',
            question: 'What is 2 + 2?',
            options: ['3', '4', '5', '6'],
            correct: 'B'
        },
        {
            difficulty: 'medium',
            question: 'Which planet is known as the Red Planet?',
            options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
            correct: 'B'
        },
        {
            difficulty: 'medium',
            question: 'Who painted the Mona Lisa?',
            options: ['Van Gogh', 'Picasso', 'Leonardo da Vinci', 'Michelangelo'],
            correct: 'C'
        },
        {
            difficulty: 'hard',
            question: 'What is the chemical symbol for gold?',
            options: ['Go', 'Gd', 'Au', 'Ag'],
            correct: 'C'
        },
        {
            difficulty: 'hard',
            question: 'In which year did World War II end?',
            options: ['1944', '1945', '1946', '1947'],
            correct: 'B'
        }
    ];
    
    questions = sampleQuestions;
    saveQuestionsToStorage();
}

// Role selection
function selectRole(role) {
    currentRole = role;
    hideAllScreens();
    
    if (role === 'admin') {
        document.getElementById('adminDashboard').classList.add('active');
    } else {
        document.getElementById('userDashboard').classList.add('active');
    }
}

// Navigation functions
function goBack() {
    hideAllScreens();
    document.getElementById('roleSelection').classList.add('active');
    currentRole = '';
}

function goToUserDashboard() {
    hideAllScreens();
    document.getElementById('userDashboard').classList.add('active');
}

function hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
}

// Admin functions
function showCreateQuestion() {
    document.getElementById('createQuestionForm').classList.remove('hidden');
    document.getElementById('questionsList').classList.add('hidden');
}

function hideCreateQuestion() {
    document.getElementById('createQuestionForm').classList.add('hidden');
    document.getElementById('questionForm').reset();
}

function showQuestions() {
    loadQuestionsFromStorage();
    document.getElementById('createQuestionForm').classList.add('hidden');
    document.getElementById('questionsList').classList.remove('hidden');
    displayQuestions();
}

function handleQuestionSubmit(e) {
    e.preventDefault();
    
    const difficulty = document.getElementById('difficulty').value;
    const questionText = document.getElementById('question').value;
    const option1 = document.getElementById('option1').value;
    const option2 = document.getElementById('option2').value;
    const option3 = document.getElementById('option3').value;
    const option4 = document.getElementById('option4').value;
    const correctAnswer = document.getElementById('correctAnswer').value;
    
    const newQuestion = {
        difficulty: difficulty,
        question: questionText,
        options: [option1, option2, option3, option4],
        correct: correctAnswer
    };
    
    questions.push(newQuestion);
    saveQuestionsToStorage();
    
    // Show success message
    alert('Question added successfully!');
    
    // Reset form and hide it
    document.getElementById('questionForm').reset();
    hideCreateQuestion();
}

function displayQuestions() {
    const container = document.getElementById('questionsContent');
    
    if (questions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No questions available. Create some questions first!</p>';
        return;
    }
    
    let html = '';
    questions.forEach((q, index) => {
        html += `
            <div class="question-item">
                <span class="difficulty-badge ${q.difficulty}">${q.difficulty.toUpperCase()}</span>
                <h4>Q${index + 1}: ${q.question}</h4>
                <div style="margin-left: 20px; color: #666;">
                    <p>A) ${q.options[0]}</p>
                    <p>B) ${q.options[1]}</p>
                    <p>C) ${q.options[2]}</p>
                    <p>D) ${q.options[3]}</p>
                    <p style="font-weight: bold; color: #28a745;">Correct Answer: ${q.correct}</p>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function exportQuestions() {
    if (questions.length === 0) {
        alert('No questions to export!');
        return;
    }
    
    const dataStr = JSON.stringify(questions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'text/plain' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'quiz_questions.txt';
    link.click();
    
    alert('Questions exported successfully!');
}

function importQuestions(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuestions = JSON.parse(e.target.result);
            
            // Validate the imported data
            if (Array.isArray(importedQuestions)) {
                questions = questions.concat(importedQuestions);
                saveQuestionsToStorage();
                alert(`Successfully imported ${importedQuestions.length} questions!`);
            } else {
                alert('Invalid file format!');
            }
        } catch (error) {
            alert('Error reading file: ' + error.message);
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
}

// User/Quiz functions
function startQuiz(difficulty) {
    loadQuestionsFromStorage();
    
    // Filter questions by difficulty
    const filteredQuestions = questions.filter(q => q.difficulty === difficulty);
    
    if (filteredQuestions.length === 0) {
        alert(`No ${difficulty} questions available! Please ask admin to add some questions.`);
        return;
    }
    
    // Shuffle and select up to 10 questions
    currentQuiz = shuffleArray(filteredQuestions).slice(0, Math.min(10, filteredQuestions.length));
    currentQuestionIndex = 0;
    score = 0;
    
    hideAllScreens();
    document.getElementById('quizScreen').classList.add('active');
    
    displayQuestion();
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function displayQuestion() {
    if (currentQuestionIndex >= currentQuiz.length) {
        showResults();
        return;
    }
    
    const question = currentQuiz[currentQuestionIndex];
    
    // Update progress
    const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('questionCounter').textContent = 
        `Question ${currentQuestionIndex + 1} of ${currentQuiz.length}`;
    
    // Display question
    document.getElementById('currentQuestion').textContent = question.question;
    
    // Display options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = `${String.fromCharCode(65 + index)}) ${option}`;
        optionElement.onclick = () => selectOption(String.fromCharCode(65 + index), optionElement);
        optionsContainer.appendChild(optionElement);
    });
    
    // Hide next button initially
    document.getElementById('nextBtn').classList.add('hidden');
    selectedAnswer = '';
}

function selectOption(answer, element) {
    // Remove previous selections
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected', 'correct', 'incorrect');
    });
    
    // Mark selected option
    element.classList.add('selected');
    selectedAnswer = answer;
    
    // Show correct/incorrect after selection
    setTimeout(() => {
        const question = currentQuiz[currentQuestionIndex];
        
        document.querySelectorAll('.option').forEach((opt, index) => {
            const optionLetter = String.fromCharCode(65 + index);
            if (optionLetter === question.correct) {
                opt.classList.add('correct');
                opt.classList.remove('selected');
            } else if (optionLetter === selectedAnswer && optionLetter !== question.correct) {
                opt.classList.add('incorrect');
                opt.classList.remove('selected');
            }
        });
        
        // Update score
        if (selectedAnswer === question.correct) {
            score++;
        }
        
        // Show next button
        document.getElementById('nextBtn').classList.remove('hidden');
        
        // Disable further clicking
        document.querySelectorAll('.option').forEach(opt => {
            opt.style.pointerEvents = 'none';
        });
    }, 500);
}

function nextQuestion() {
    currentQuestionIndex++;
    
    // Re-enable option clicking
    document.querySelectorAll('.option').forEach(opt => {
        opt.style.pointerEvents = 'auto';
    });
    
    displayQuestion();
}

function endQuiz() {
    if (confirm('Are you sure you want to end the quiz?')) {
        goToUserDashboard();
    }
}

function showResults() {
    hideAllScreens();
    document.getElementById('resultsScreen').classList.add('active');
    
    const percentage = Math.round((score / currentQuiz.length) * 100);
    const scoreText = `${score}/${currentQuiz.length}`;
    
    document.getElementById('scoreText').textContent = scoreText;
    
    let resultsIcon = '🎉';
    let resultsTitle = 'Congratulations!';
    let resultsMessage = 'Outstanding performance!';
    
    if (percentage >= 80) {
        resultsIcon = '🏆';
        resultsTitle = 'Excellent!';
        resultsMessage = 'You\'re a quiz master!';
    } else if (percentage >= 60) {
        resultsIcon = '👍';
        resultsTitle = 'Good Job!';
        resultsMessage = 'Keep up the good work!';
    } else if (percentage >= 40) {
        resultsIcon = '📚';
        resultsTitle = 'Not Bad!';
        resultsMessage = 'Room for improvement!';
    } else {
        resultsIcon = '💪';
        resultsTitle = 'Keep Trying!';
        resultsMessage = 'Practice makes perfect!';
    }
    
    document.getElementById('resultsIcon').textContent = resultsIcon;
    document.getElementById('resultsTitle').textContent = resultsTitle;
    document.getElementById('resultsMessage').textContent = resultsMessage;
}

// Storage functions (using memory since no localStorage allowed)
function saveQuestionsToStorage() {
    // In a real scenario without localStorage, we would use the Blob API
    // For now, questions are stored in the global variable
    console.log('Questions saved to memory:', questions.length);
}

function loadQuestionsFromStorage() {
    // Questions are already in the global variable
    console.log('Questions loaded from memory:', questions.length);
}

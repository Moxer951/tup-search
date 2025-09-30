document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results');
    const resultsCountElement = document.getElementById('results-count');
    let questionsData = [];

    // مرحله ۱: دریافت داده‌ها از فایل JSON
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                // این خطا به دلیل سیاست CORS هنگام اجرای محلی رخ می دهد.
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            questionsData = data;
            displayResults(questionsData); // نمایش تمام سوالات در ابتدا
            // گوش دادن به تغییرات ورودی برای جستجوی لحظه ای
            searchInput.addEventListener('input', handleSearch); 
        })
        .catch(error => {
            console.error('Error loading data:', error);
            resultsContainer.innerHTML = '<p style="color: #ff6060; text-align: center;">خطا در بارگذاری داده‌ها. لطفاً مطمئن شوید فایل data.json در دسترس است و در یک سرور محلی یا محیط وب اجرا می‌کنید.</p>';
        });

    // تابع اصلی جستجو
    function handleSearch() {
        // حذف فاصله های اضافی و تبدیل به حروف کوچک
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm.length === 0) {
            displayResults(questionsData); // نمایش همه اگر کادر خالی باشد
            return;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        // فیلتر کردن سوالات
        const filteredQuestions = questionsData.filter(item => {
            const questionText = item.question.toLowerCase();
            const answerText = item.correct_answer_text.toLowerCase();

            // جستجو در متن سوال و پاسخ صحیح
            if (questionText.includes(lowerCaseSearchTerm) || answerText.includes(lowerCaseSearchTerm)) {
                return true;
            }
            
            // جستجو برای گزینه صحیح (الف، ب، ج، د) - اگر کاربر فقط الف یا ب را جستجو کرد.
            if (['الف', 'ب', 'ج', 'د'].includes(lowerCaseSearchTerm) && item.correct_option_key.toLowerCase() === lowerCaseSearchTerm) {
                return true;
            }

            return false;
        });

        displayResults(filteredQuestions);
    }

    // تابع نمایش نتایج
    function displayResults(results) {
        resultsContainer.innerHTML = ''; // پاک کردن نتایج قبلی
        
        // به‌روزرسانی شمارنده نتایج
        resultsCountElement.textContent = `تعداد ${results.length} سوال یافت شد.`;
        
        if (results.length === 0 && searchInput.value.trim().length > 0) {
            resultsContainer.innerHTML = `<p style="text-align: center; color: var(--color-text-secondary);">برای عبارت "${searchInput.value.trim()}" نتیجه‌ای یافت نشد.</p>`;
            return;
        }

        results.forEach(item => {
            const card = document.createElement('div');
            card.className = 'question-card';
            
            const questionTitle = document.createElement('h2');
            questionTitle.textContent = `${item.number}. ${item.question}`;
            
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options';

            // نمایش گزینه‌ها
            for (const key in item.options) {
                if (item.options.hasOwnProperty(key)) {
                    const optionP = document.createElement('p');
                    optionP.textContent = `${key}) ${item.options[key]}`;
                    
                    // مشخص کردن پاسخ صحیح با استایل
                    if (key === item.correct_option_key) {
                        optionP.classList.add('correct');
                    }
                    optionsDiv.appendChild(optionP);
                }
            }

            // نمایش پاسخ صحیح در کادر جداگانه
            const answerDiv = document.createElement('div');
            answerDiv.className = 'answer';
            answerDiv.textContent = `پاسخ صحیح: ${item.correct_option_key} (${item.correct_answer_text})`;

            card.appendChild(questionTitle);
            card.appendChild(optionsDiv);
            card.appendChild(answerDiv);
            resultsContainer.appendChild(card);
        });
    }

});
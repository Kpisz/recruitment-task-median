// Dane wejściowe (przykładowe)
const expenses = {
    "2023-01": {
        "01": {
            "food": [22.11, 43, 11.72, 2.2, 36.29, 2.5, 19],
            "fuel": [210.22]
        },
        "09": {
            "food": [11.9],
            "fuel": [190.22]
        }
    },
    "2023-03": {
        "07": {
            "food": [20, 11.9, 30.20, 11.9]
        },
        "04": {
            "food": [10.20, 11.50, 2.5],
            "fuel": []
        }
    },
    "2023-04": {}
};

// Funkcja do znalezienia pierwszej niedzieli
function getFirstSunday(year, month) {
    const firstDay = new Date(year, month - 1, 1); // Pierwszy dzień miesiąca
    while (firstDay.getDay() !== 0) { // 0 = niedziela
        firstDay.setDate(firstDay.getDate() + 1);
    }
    return firstDay.getDate(); // Zwracamy numer dnia (1-31)
}

// Funkcja generująca losowe dane na dany rok
function generateExpensesForYear(year, maxDays = 1000000) {
    const expenses = {};
    for (let month = 1; month <= 12; month++) {
        const monthKey = `${year}-${String(month).padStart(2, "0")}`;
        expenses[monthKey] = {};

        const daysInMonth = new Date(year, month, 0).getDate(); // Liczba dni w miesiącu
        for (let day = 1; day <= Math.min(daysInMonth, maxDays); day++) {
            const dayKey = String(day).padStart(2, "0");

            expenses[monthKey][dayKey] = {
                food: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, 
                    () => +(Math.random() * 1000000 + 0.01).toFixed(2)
                ), // Losowe wartości w zakresie 0.01 - 1,000,000
                fuel: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, 
                    () => +(Math.random() * 1000000 + 0.01).toFixed(2)
                )  // Losowe wartości w zakresie 0.01 - 1,000,000
            };
        }
    }
    return expenses;
}

// Rozwiązanie 1: Niezoptymalizowane
function solution1(expenses) {
    const results = [];

    for (let [month, data] of Object.entries(expenses)) {
        const [year, monthNumber] = month.split("-").map(Number);
        const firstSunday = getFirstSunday(year, monthNumber);

        const daysToSunday = Array.from({ length: firstSunday }, (_, i) => String(i + 1).padStart(2, "0"));
        const totalExpenses = [];

        for (let day of daysToSunday) {
            if (data[day]) {
                const { food = [], fuel = [] } = data[day];
                totalExpenses.push(...food, ...fuel);
            }
        }

        totalExpenses.sort((a, b) => a - b);
        const mid = Math.floor(totalExpenses.length / 2);
        const median = totalExpenses.length % 2 !== 0
            ? totalExpenses[mid]
            : (totalExpenses[mid - 1] + totalExpenses[mid]) / 2;

        results.push({ month, days: daysToSunday, firstSunday, median });
    }

    return results;
}

// Rozwiązanie 2: Zoptymalizowane (Quick Select dla mediany)
function solution2(expenses) {
    function quickSelect(arr, k) {
        if (arr.length <= 1) return arr[0];

        const pivot = arr[Math.floor(Math.random() * arr.length)];
        const lows = arr.filter(x => x < pivot);
        const highs = arr.filter(x => x > pivot);
        const pivots = arr.filter(x => x === pivot);

        if (k < lows.length) return quickSelect(lows, k);
        else if (k < lows.length + pivots.length) return pivot;
        else return quickSelect(highs, k - lows.length - pivots.length);
    }

    const results = [];

    for (let [month, data] of Object.entries(expenses)) {
        const [year, monthNumber] = month.split("-").map(Number);
        const firstSunday = getFirstSunday(year, monthNumber);

        const daysToSunday = Array.from({ length: firstSunday }, (_, i) => String(i + 1).padStart(2, "0"));
        const totalExpenses = [];

        for (let day of daysToSunday) {
            if (data[day]) {
                const { food = [], fuel = [] } = data[day];
                totalExpenses.push(...food, ...fuel);
            }
        }

        const k = Math.floor(totalExpenses.length / 2);
        const median = totalExpenses.length % 2 !== 0
            ? quickSelect(totalExpenses, k)
            : (quickSelect(totalExpenses, k - 1) + quickSelect(totalExpenses, k)) / 2;

        results.push({ month, days: daysToSunday, firstSunday, median });
    }

    return results;
}

// Funkcja wyświetlająca wyniki w tabeli
function displayResults(expenses, resultsContainer) {
    const start1 = performance.now();
    const results1 = solution1(expenses);
    const end1 = performance.now();

    const start2 = performance.now();
    const results2 = solution2(expenses);
    const end2 = performance.now();

    let html = `<table>
        <thead>
            <tr>
                <th>Miesiąc</th>
                <th>Dni</th>
                <th>Pierwsza niedziela</th>
                <th>Mediana (solution1)</th>
                <th>Mediana (solution2)</th>
            </tr>
        </thead>
        <tbody>`;

    results1.forEach((r, i) => {
        html += `<tr>
            <td>${r.month}</td>
            <td>${r.days.join(", ")}</td>
            <td>${r.firstSunday}</td>
            <td>${r.median} zł</td>
            <td>${results2[i].median} zł</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    html += `<p class="time">Rozwiązanie 1: ${(end1 - start1)} ms<br>Rozwiązanie 2: ${(end2 - start2)} ms</p>`;

    resultsContainer.innerHTML = html;
}

// Obsługa przycisków
document.getElementById("calculate-example").addEventListener("click", () => {
    const resultsContainer = document.getElementById("results");
    displayResults(expenses, resultsContainer);
});

document.getElementById("calculate-random").addEventListener("click", () => {
    const year = parseInt(document.getElementById("year").value) || new Date().getFullYear();
    const generatedExpenses = generateExpensesForYear(year, 1000000);
    const resultsContainer = document.getElementById("results");
    displayResults(generatedExpenses, resultsContainer);
});

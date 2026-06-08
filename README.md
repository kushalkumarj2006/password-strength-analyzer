# 🔐 Password Strength Analyzer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A professional, client-side password strength testing tool that checks passwords against **100,000+ real breached passwords** from the xato-net database. Built for cybersecurity professionals and everyday users who want to understand password security.

**Live Demo:** [https://kushalkumarj2006.github.io/password-strength-analyzer/](https://kushalkumarj2006.github.io/password-strength-analyzer/)

## 🚀 Live Demo

> **Note:** To run this tool locally, you need to serve it via a local web server (see [Quick Start](#quick-start) below).

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔴 **Breach Detection** | Checks against 100,000+ real leaked passwords from xato-net database |
| 📊 **Entropy Calculation** | Measures password randomness in bits (industry standard) |
| ⏱️ **Crack Time Estimation** | Estimates brute-force time at 1 billion guesses/second |
| 💡 **Smart Alternatives** | Generates 4-5 stronger password suggestions |
| 📋 **Password Criteria** | Length, case, digits, special chars, pattern detection |
| 💾 **Password History** | Prevents password reuse with SHA-256 hashing |
| 🎨 **Visual Feedback** | Color-coded strength meter + entropy doughnut chart |
| 🚀 **IndexedDB Caching** | Loads 764KB wordlist once, caches for instant subsequent loads |
| 🔒 **100% Client-Side** | Your passwords never leave your browser |

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic structure |
| CSS3 | Responsive design, animations, flexbox/grid |
| JavaScript (ES6+) | Core logic, async/await, modules |
| Chart.js | Entropy visualization (doughnut chart) |
| Lodash | Debouncing for real-time input |
| IndexedDB | Local caching of breach database |
| Web Crypto API | SHA-256 hashing for password history |

## 📂 Project Structure

```
password-strength-analyzer/
│
├── index.html                          # Main entry point
├── xato-net-10-million-passwords-100000.txt  # Breach database (100k passwords)
│
├── css/
│   └── style.css                       # All styling + responsive design
│
└── js/
    ├── app.js                          # DOM controller, event handling
    ├── strength.js                     # Core password logic (entropy, patterns)
    └── wordlist.js                     # Breach DB loader + IndexedDB caching
```

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Local web server (required for loading the wordlist file)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kushalkumarj2006/password-strength-analyzer.git
   cd password-strength-analyzer
   ```

2. **Download the breach database** (already included in repo)
   - File: `xato-net-10-million-passwords-100000.txt`
   - Size: 764 KB
   - Contains: 100,000 real breached passwords from xato-net

3. **Run a local web server**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # OR using Node.js
   npx serve .
   
   # OR using VS Code Live Server extension
   ```

4. **Open your browser**
   ```
   http://localhost:8000
   ```

## 📊 How It Works

### 1. Breach Detection
- Loads `xato-net-10-million-passwords-100000.txt` on first visit
- Stores passwords in JavaScript Set for O(1) lookup
- Caches in IndexedDB for instant loading on subsequent visits

### 2. Entropy Calculation
```
Entropy (bits) = Password Length × log₂(Character Set Size)
```
- Character set includes: lowercase (26), uppercase (26), digits (10), specials (33)
- Higher entropy = harder to crack

### 3. Crack Time Estimation
```
Combinations = Character Set Size ^ Password Length
Seconds = Combinations / 1,000,000,000 (modern GPU guesses/sec)
```

### 4. Password Criteria Scoring

| Criteria | Requirement | Points |
|----------|-------------|--------|
| Length | ≥ 8 characters | 1 |
| Lowercase | a-z | 1 |
| Uppercase | A-Z | 1 |
| Digits | 0-9 | 1 |
| Special | !@#$%^&* | 1 |
| No Patterns | No "123", "qwerty", etc. | 1 |

**Scoring Scale:**
- 80-100%: 🟢 STRONG
- 60-80%: 🟡 MEDIUM
- 20-60%: 🟠 WEAK
- 0-20%: 🔴 CRITICAL (Breached)

## 🎯 Example Results

| Password | Strength | Score | Reason |
|----------|----------|-------|--------|
| `123456` | 🔴 CRITICAL | 0% | Found in breach database |
| `password` | 🔴 CRITICAL | 5% | Breached + common pattern |
| `MyDog123` | 🟠 WEAK | 35% | Missing special characters |
| `MyDog@123` | 🟡 MEDIUM | 65% | Decent, could be longer |
| `BlueJazz$42!Running` | 🟢 STRONG | 92% | 78 bits entropy, centuries to crack |

## 🔒 Security Features

- ✅ **No backend** - Everything runs in your browser
- ✅ **No tracking** - No analytics, no external requests (except CDNs)
- ✅ **Hashed storage** - Password history stored as SHA-256 hashes only
- ✅ **Local only** - Never sends passwords anywhere
- ✅ **Open source** - Fully auditable code

## 🧪 Testing

Test the tool with these known breached passwords (all should show CRITICAL):

```
123456
password
qwerty
admin
welcome
iloveyou
sunshine
```

## 📈 Performance Metrics

| Metric | Value |
|--------|-------|
| First load (cold cache) | ~1-2 seconds (764KB download) |
| Subsequent loads | <100ms (from IndexedDB) |
| Memory usage | ~50-80 MB (100k passwords in Set) |
| Analysis time | <10ms per password |

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` file for more information.

## 🙏 Acknowledgments

- [SecLists](https://github.com/danielmiessler/SecLists) - For the xato-net breach database
- [Chart.js](https://www.chartjs.org/) - For entropy visualization
- [Lodash](https://lodash.com/) - For utility functions
- [HaveIBeenPwned](https://haveibeenpwned.com) - Inspiration for breach checking

## 📧 Contact

Kushal Kumar J - [@kushalkumarj2006](https://github.com/kushalkumarj2006/) - kushalkumarj2006+github@gmail.com

Project Link: [https://github.com/kushalkumarj2006/password-strength-analyzer](https://github.com/kushalkumarj2006/password-strength-analyzer)

## ⭐ Show Your Support

If you found this tool helpful, please give it a ⭐ on GitHub!

---

## 📚 Additional Resources

- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [How to Choose a Password - Computerphile](https://www.youtube.com/watch?v=3NjQ9b3pgIg)

---

**Built with 🔐 for cybersecurity awareness**

# 🚀 Adaptive Learning Assessment Platform

An intelligent, personalized knowledge assessment tool powered by AI to enhance learning experiences through adaptive questioning and skill evaluation.

## ✨ Features

- 🧠 **AI-Powered Question Generation**: Automatically generates domain-specific questions
- 📊 **Skill Assessment**: Evaluates coding skills with detailed feedback
- 🎯 **Adaptive Difficulty**: Adjusts question difficulty based on user performance
- 📝 **Multi-Domain Support**: Supports various programming languages and domains
- 🔄 **Real-time Feedback**: Immediate evaluation and personalized recommendations
- 📈 **Progress Tracking**: Monitors learning progress over time
- 🛡️ **Secure Authentication**: Firebase-based user authentication

## 🛠️ Tech Stack

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase
- **AI Integration**: GLHF Chat API
- **State Management**: Context API
- **API Client**: Fetch/Axios
- **AI Model**: Qwen2.5-Coder-32B-Instruct

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- GLHF Chat API key
- Firebase project credentials

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # GLHF Chat API Configuration
   VITE_GLHF_API_KEY=your_glhf_api_key_here
   VITE_GLHF_API_URL=https://glhf.chat/api/openai/v1

   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 🏗️ Project Structure

```
project/
├── src/
│   ├── api/              # API endpoints
│   ├── components/       # Reusable components
│   ├── config/          # Configuration files
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Page components
│   ├── services/        # Business logic and API calls
│   ├── styles/          # Global styles
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
└── ...config files
```

## 🔑 Key Components

1. **Knowledge Assessment**
   - Domain-specific question generation
   - Multiple choice questions
   - Immediate feedback
   - Progress tracking

2. **Skills Assessment**
   - Code quality analysis
   - Performance evaluation
   - Security assessment
   - Best practices review

3. **Learning Resources**
   - Personalized recommendations
   - Strength/weakness analysis
   - Next-step guidance

## 🧪 Testing

Run the test suite:
```bash
npm test
# or
yarn test
```

## 🔒 Security

- All API keys are stored in environment variables
- Firebase authentication for user management
- Secure API key handling
- Input validation and sanitization

## 🐛 Known Issues

- Requires stable internet connection
- Occasional AI response parsing issues
- Dependent on external AI service reliability

## 🔮 Future Improvements

1. Advanced AI prompt engineering
2. Enhanced difficulty level selection
3. More nuanced assessment feedback
4. Question caching system
5. Improved error recovery
6. Comprehensive user progress tracking

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 Authors

- Your Name - *Initial work*

## 🙏 Acknowledgments

- GLHF Chat for AI capabilities
- Firebase for authentication and database
- React and TypeScript communities

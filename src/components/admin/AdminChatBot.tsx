import React, { useState, useRef, useEffect } from 'react';
import { vectorDB } from '../../services/VectorDBService';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ADMIN_EMAIL = 'naik97059@gmail.com';

export const AdminChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Check if current user is admin
        const userEmail = localStorage.getItem('userEmail');
        const isAdminUser = userEmail === ADMIN_EMAIL;
        setIsAdmin(isAdminUser);

        if (isAdminUser) {
          // Add welcome message
          setMessages([{
            text: `Welcome to the Admin Assistant! I can help you with:
- Student information and progress
- Teacher information
- Course statistics
- Platform usage
- Assessment statistics
- Add domain (try "add domain [name]" or "add domain [name] [description]")
- Delete domain (try "delete domain [name]")
- Delete user (try "delete user [email]")
Just ask me what you'd like to know!`,
            isUser: false,
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processQuery = async (query: string): Promise<string> => {
    const normalizedQuery = query.toLowerCase().trim();

    try {
      // Help command
      if (normalizedQuery === 'help') {
        return `I can help you with:
- View all users (try "show all users" or "list users")
- View user statistics (try "show statistics")
- View domains (try "show domains" or "list domains")
- View assessments (try "show assessments" or "assessment stats")
- View assessment results (try "show results" or "result stats")
- View user results (try "show results for [userId]")
- Add domain (try "add domain [name]" or "add domain [name] [description]")
- Delete domain (try "delete domain [name]")
- Delete user (try "delete user [email]")
Just ask what you'd like to know!`;
      }

      // Handle add domain command
      const addDomainMatch = normalizedQuery.match(/^add domain\s+(\w+)(?:\s+(.+))?$/);
      if (addDomainMatch) {
        const [_, name, description = ''] = addDomainMatch;
        const success = await vectorDB.addDomain(name, description);
        if (success) {
          return `Successfully added domain: ${name}${description ? ` with description: ${description}` : ''}`;
        }
        return `Failed to add domain: ${name}`;
      }

      // Handle delete domain command
      const deleteDomainMatch = normalizedQuery.match(/^delete domain\s+(\w+)$/);
      if (deleteDomainMatch) {
        const [_, name] = deleteDomainMatch;
        const success = await vectorDB.deleteDomain(name);
        if (success) {
          return `Successfully deleted domain: ${name}`;
        }
        return `Failed to delete domain: ${name}. Domain not found.`;
      }

      // Handle delete user command
      const deleteUserMatch = normalizedQuery.match(/^delete user\s+(.+@.+)$/);
      if (deleteUserMatch) {
        const [_, email] = deleteUserMatch;
        const success = await vectorDB.deleteUser(email);
        if (success) {
          return `Successfully deleted user: ${email}`;
        }
        return `Failed to delete user: ${email}. User not found.`;
      }

      // Handle assessment result queries
      if (normalizedQuery.includes('result')) {
        // Check for user-specific results
        const userMatch = normalizedQuery.match(/results? for (\w+)/i);
        if (userMatch) {
          const userId = userMatch[1];
          const summary = await vectorDB.getUserAssessmentSummary(userId);
          return formatUserAssessmentSummary(userId, summary);
        }

        // Check for general result statistics
        if (normalizedQuery.includes('stats') || normalizedQuery.includes('statistics')) {
          const stats = await vectorDB.getAssessmentResultStatistics();
          return formatResultStatistics(stats);
        }
        
        // Show all results
        const results = await vectorDB.getAssessmentResults();
        return formatResultsList(results);
      }

      // Handle assessment queries
      if (normalizedQuery.includes('assessment')) {
        if (normalizedQuery.includes('stats') || normalizedQuery.includes('statistics')) {
          const stats = await vectorDB.getAssessmentStatistics();
          return formatAssessmentStatistics(stats);
        }
        
        const assessments = await vectorDB.getAssessments();
        return formatAssessmentList(assessments);
      }

      // Handle domain queries
      if (normalizedQuery.includes('domain')) {
        const domains = await vectorDB.getDomains();
        
        if (!domains || domains.length === 0) {
          return 'No domains found in the system.';
        }
        
        return formatDomainList(domains);
      }

      // Handle user listing and searching
      if (normalizedQuery.includes('user') || normalizedQuery.includes('list') || normalizedQuery.includes('show')) {
        const users = await vectorDB.getAllUsers();
        console.log('Retrieved users for listing:', users);
        
        if (!users || users.length === 0) {
          return 'No users found in the system.';
        }
        
        return formatUserList('All Users', users);
      }

      // Handle content and domain queries
      if (normalizedQuery.includes('content') || normalizedQuery.includes('domain')) {
        const users = await vectorDB.getAllUsers();
        const domains = new Set(users.map(user => user.email?.split('@')[1]).filter(Boolean));
        const roles = new Set(users.map(user => user.role).filter(Boolean));
        
        return `Platform Overview:

Domains: ${domains.size > 0 ? Array.from(domains).join(', ') : 'No domains found'}

User Types: ${roles.size > 0 ? Array.from(roles).join(', ') : 'No user types found'}

Total Users: ${users.length}`;
      }

      // Handle statistics
      if (normalizedQuery.includes('statistics') || normalizedQuery.includes('stats')) {
        const stats = await vectorDB.getUserStatistics();
        return formatStatistics(stats);
      }

      // Default to user search
      const searchResults = await vectorDB.searchSimilar(query, 5);
      if (searchResults && searchResults.length > 0) {
        return formatUserList('Search Results', searchResults);
      }

      return 'No matching results found. Try "help" to see available commands.';
    } catch (error) {
      console.error('Error processing query:', error);
      return 'Sorry, there was an error processing your request. Please try again.';
    }
  };

  const formatUserList = (title: string, users: any[]): string => {
    return `${title}:
${users.map((user, index) => formatUserEntry(user, index + 1)).join('\n\n')}`;
  };

  const formatUserEntry = (user: any, index: number): string => {
    const details = [];
    details.push(`${index}. ${user.name}`);
    details.push(`   Role: ${user.role}`);
    
    if (user.email && user.email !== 'No email provided') {
      details.push(`   Email: ${user.email}`);
    }

    if (user.metadata.lastActive !== 'Never') {
      details.push(`   Last Active: ${user.metadata.lastActive}`);
    }

    if (user.metadata.joinDate !== 'Unknown') {
      details.push(`   Joined: ${user.metadata.joinDate}`);
    }

    // Add notification preferences if they exist
    const emailPrefs = user.metadata.notifications?.email;
    if (emailPrefs && Object.keys(emailPrefs).length > 0) {
      details.push('   Email Notifications:');
      if (emailPrefs.courseUpdates) details.push('     • Course Updates');
      if (emailPrefs.newFeatures) details.push('     • New Features');
      if (emailPrefs.progressReports) details.push('     • Progress Reports');
    }

    return details.join('\n');
  };

  const formatDomainList = (domains: any[]): string => {
    if (domains.length === 0) return 'No domains available.';

    return `Available Domains:
${domains.map((domain, index) => {
  const description = domain.description && domain.description.trim() 
    ? domain.description 
    : 'No description available';
  
  return `${index + 1}. ${domain.name.toLowerCase()}
   Description: ${description}`;
}).join('\n\n')}`;
  };

  const formatAssessmentList = (assessments: any[]): string => {
    if (assessments.length === 0) return 'No assessments available.';

    return `Recent Assessments:
${assessments.map((assessment, index) => 
`${index + 1}. ${assessment.type}
   Score: ${assessment.score}
   Improvement: ${assessment.improvement}
   Completed: ${assessment.completedAt}
   Created: ${assessment.createdAt}`
).join('\n\n')}`;
  };

  const formatAssessmentStatistics = (stats: any): string => {
    const completionRate = Math.round((stats.completed / stats.total) * 100);
    
    let response = `Assessment Statistics:

Overview:
• Total Assessments: ${stats.total}
• Completed: ${stats.completed} (${completionRate}%)
• Average Score: ${Math.round(stats.averageScore * 10) / 10}

Improvements:
• Positive: ${stats.improvements.positive}
• No Change: ${stats.improvements.noChange}
• Negative: ${stats.improvements.negative}

By Type:`;

    Object.entries(stats.byType).forEach(([type, data]: [string, any]) => {
      response += `\n• ${type}:
  - Count: ${data.count}
  - Average Score: ${Math.round(data.avgScore * 10) / 10}`;
    });

    return response;
  };

  const formatStatistics = (stats: any): string => {
    const total = stats.total || 0;
    const percentages = {
      active: total > 0 ? Math.round((stats.active / total) * 100) : 0,
      students: total > 0 ? Math.round((stats.students / total) * 100) : 0,
      teachers: total > 0 ? Math.round((stats.teachers / total) * 100) : 0,
      admins: total > 0 ? Math.round((stats.admins / total) * 100) : 0,
      users: total > 0 ? Math.round((stats.users / total) * 100) : 0
    };

    return `Platform Statistics:

Total Users: ${total}
Active Users (last 30 days): ${stats.active} (${percentages.active}%)

User Breakdown:
• Students: ${stats.students} (${percentages.students}%)
• Teachers: ${stats.teachers} (${percentages.teachers}%)
• Admins: ${stats.admins} (${percentages.admins}%)
• Regular Users: ${stats.users} (${percentages.users}%)`;
  };

  const formatResultsList = (results: any[]): string => {
    if (results.length === 0) return 'No assessment results available.';

    return `Recent Assessment Results:
${results.map((result, index) => 
`${index + 1}. Assessment ID: ${result.assessmentId}
   Language: ${result.language}
   Score: ${result.score}
   Completed: ${result.completedAt}
   User ID: ${result.userId}`
).join('\n\n')}`;
  };

  const formatUserAssessmentSummary = (userId: string, summary: any): string => {
    let response = `Assessment Summary for User ${userId}:

Overview:
• Total Assessments: ${summary.totalAssessments}
• Average Score: ${Math.round(summary.averageScore * 10) / 10}

Performance by Language:`;

    Object.entries(summary.byLanguage).forEach(([lang, data]: [string, any]) => {
      response += `\n• ${lang}:
  - Assessments: ${data.count}
  - Average Score: ${Math.round(data.averageScore * 10) / 10}`;
    });

    response += '\n\nRecent Results:';
    summary.recentResults.forEach((result: any, index: number) => {
      response += `\n${index + 1}. ${result.language} Assessment
   Score: ${result.score}
   Completed: ${result.completedAt}`;
    });

    return response;
  };

  const formatResultStatistics = (stats: any): string => {
    let response = `Assessment Result Statistics:

Overview:
• Total Results: ${stats.total}
• Average Score: ${Math.round(stats.averageScore * 10) / 10}

Score Distribution:
• Excellent (>90%): ${stats.scoreDistribution.excellent}
• Good (70-90%): ${stats.scoreDistribution.good}
• Average (50-70%): ${stats.scoreDistribution.average}
• Poor (<50%): ${stats.scoreDistribution.poor}

Performance by Language:`;

    Object.entries(stats.byLanguage).forEach(([lang, data]: [string, any]) => {
      response += `\n• ${lang}:
  - Total Attempts: ${data.count}
  - Average Score: ${Math.round(data.averageScore * 10) / 10}
  - Highest Score: ${data.highestScore}`;
    });

    return response;
  };

  const handleSend = async () => {
    if (!input.trim() || !isAdmin) return;

    const userMessage: Message = {
      text: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await processQuery(input);
      
      const botMessage: Message = {
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error handling message:', error);
      const errorMessage: Message = {
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin || !isInitialized) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl w-96 h-[600px] flex flex-col">
          <div className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Admin Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p>Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about the platform..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center w-16 h-16"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

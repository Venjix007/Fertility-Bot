import { Heart, Calendar, Activity, Users } from 'lucide-react';

const starterPrompts = [
  {
    icon: Heart,
    title: "Fertility Assessment",
    prompt: "What basic fertility health indicators should we be aware of?",
    color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
  },
  {
    icon: Calendar,
    title: "Cycle Tracking",
    prompt: "How can I accurately track my menstrual cycle for conception?",
    color: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800"
  },
  {
    icon: Activity,
    title: "Testing Options",
    prompt: "What fertility tests are available and when should we consider them?",
    color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
  },
  {
    icon: Users,
    title: "Partner Support",
    prompt: "How can partners best support each other during fertility treatments?",
    color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
  }
];

interface StarterPromptsProps {
  onPromptClick: (prompt: string) => void;
}

export function StarterPrompts({ onPromptClick }: StarterPromptsProps) {
  return (
    <div className="w-full max-w-2xl">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
        Popular Questions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {starterPrompts.map((prompt, index) => {
          const IconComponent = prompt.icon;
          return (
            <button
              key={index}
              onClick={() => onPromptClick(prompt.prompt)}
              className={`p-4 border rounded-xl text-left hover:shadow-md transition-all duration-200 hover:scale-105 ${prompt.color}`}
            >
              <div className="flex items-center mb-2">
                <IconComponent className="w-5 h-5 mr-2" />
                <span className="font-medium">{prompt.title}</span>
              </div>
              <p className="text-sm opacity-80 line-clamp-2">
                {prompt.prompt}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
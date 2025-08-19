import { Heart, Calendar, Activity, Users } from 'lucide-react';

const starterPrompts = [
  {
    icon: Heart,
    title: "Fertility Assessment",
    prompt: "What basic fertility health indicators should we be aware of?",
    color: "from-primary-50 to-primary-100 dark:from-primary-900/50 dark:to-primary-900/70 border-primary-200 dark:border-primary-600/60",
    textColor: "text-primary-800 dark:text-primary-100"
  },
  {
    icon: Calendar,
    title: "Cycle Tracking",
    prompt: "How can I accurately track my menstrual cycle for conception?",
    color: "from-secondary-50 to-secondary-100 dark:from-secondary-900/50 dark:to-secondary-900/70 border-secondary-200 dark:border-secondary-600/60",
    textColor: "text-secondary-800 dark:text-secondary-100"
  },
  {
    icon: Activity,
    title: "Testing Options",
    prompt: "What fertility tests are available and when should we consider them?",
    color: "from-accent-50 to-accent-100 dark:from-accent-900/50 dark:to-accent-900/70 border-accent-200 dark:border-accent-600/60",
    textColor: "text-accent-800 dark:text-accent-100"
  },
  {
    icon: Users,
    title: "Partner Support",
    prompt: "How can partners best support each other during fertility treatments?",
    color: "from-neutral-50 to-neutral-100 dark:from-neutral-800/50 dark:to-neutral-800/70 border-neutral-200 dark:border-neutral-600/60",
    textColor: "text-neutral-800 dark:text-neutral-100"
  }
];

interface StarterPromptsProps {
  onSelect: (prompt: string) => void;
}

export function StarterPrompts({ onSelect }: StarterPromptsProps) {
  return (
    <div className="w-full max-w-2xl">
      <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-4 text-center tracking-wide uppercase">
        Quick Start Questions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {starterPrompts.map((prompt, index) => {
          const IconComponent = prompt.icon;
          return (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect(prompt.prompt);
              }}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${prompt.color} hover:border-primary-300 dark:hover:border-primary-400/70`}
            >
              <div className="flex items-center mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${prompt.color.split(' ')[0].replace('from-', 'bg-')} bg-opacity-20 dark:bg-opacity-30`}>
                  <IconComponent className={`w-4 h-4 ${prompt.textColor.replace('text-', 'text-').replace('dark:text-', 'dark:text-')}`} strokeWidth={2} />
                </div>
                <span className={`font-medium ${prompt.textColor}`}>{prompt.title}</span>
              </div>
              <p className={`text-sm line-clamp-2 ${prompt.textColor} opacity-90`}>
                {prompt.prompt}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}